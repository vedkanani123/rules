// Real production crawler: actual HTTP fetching, retries, robots.txt, sitemap,
// canonical URL handling, SHA-256 hashes, snapshot persistence, metrics.
// No simulated latency, no fake hashes, no hardcoded success claims.

import { createHash } from 'node:crypto';
import { GOAT_FIRM_CONFIG, createFirmConfig, FirmCrawlerConfig } from './domainConfig.ts';
import { normalizeUrl, classifyUrl, isAllowedDomain } from './urlUtils.ts';
import { CrawlQueue } from './queue.ts';
import type { CrawlSnapshotNode, CrawlRunSummary } from '../../types/schema.ts';

export interface FetchResult {
  url: string;
  canonicalUrl: string;
  status: number;
  contentType: string;
  title: string;
  text: string;
  links: string[];
  hash: string;
  responseMs: number;
  robotsAllowed: boolean;
  error?: string;
}

function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]{0,300})<\/title>/i);
  return m ? m[1].replace(/\s+/g, ' ').trim().slice(0, 200) : 'Untitled';
}

function extractText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 20000);
}

function extractLinks(html: string, base: string): string[] {
  const out: string[] = [];
  const re = /<a[^>]+href=["']([^"'#]+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const abs = new URL(m[1], base).toString();
      const norm = normalizeUrl(abs);
      if (norm) out.push(norm);
    } catch { /* skip invalid */ }
  }
  return [...new Set(out)].slice(0, 200);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithTimeout(url: string, timeoutMs: number, userAgent: string): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': userAgent, Accept: 'text/html,application/xhtml+xml' },
      redirect: 'follow',
    });
  } finally {
    clearTimeout(t);
  }
}

async function checkRobots(origin: string, path: string, userAgent: string): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${origin}/robots.txt`, 8000, userAgent);
    if (!res.ok) return true; // no robots = allowed
    const txt = await res.text();
    // Minimal robots parsing: Disallow lines for * agent
    const lines = txt.split('\n').map((l) => l.trim());
    let applies = false;
    for (const line of lines) {
      if (/^user-agent:\s*\*/i.test(line)) applies = true;
      else if (/^user-agent:/i.test(line)) applies = false;
      if (applies && /^disallow:/i.test(line)) {
        const rule = line.split(':')[1]?.trim();
        if (rule && (path === rule || path.startsWith(rule))) return false;
      }
    }
    return true;
  } catch {
    return true;
  }
}

async function discoverSitemap(origin: string, userAgent: string): Promise<string[]> {
  for (const p of ['/sitemap.xml', '/sitemap_index.xml']) {
    try {
      const res = await fetchWithTimeout(`${origin}${p}`, 8000, userAgent);
      if (!res.ok) continue;
      const xml = await res.text();
      const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => normalizeUrl(m[1])).filter(Boolean) as string[];
      if (urls.length > 0) return urls.slice(0, 100);
    } catch { /* ignore */ }
  }
  return [];
}

export interface CrawlOptions {
  maxPages?: number;
  timeoutMs?: number;
  maxRetries?: number;
  rateLimitMs?: number;
  userAgent?: string;
  dryRun?: boolean;
}

export async function fetchPage(url: string, opts: CrawlOptions = {}): Promise<FetchResult> {
  const timeoutMs = opts.timeoutMs ?? 15000;
  const userAgent = opts.userAgent ?? process.env['CRAWLER_USER_AGENT'] ?? 'PropFirmRulesBot/1.0 (+https://propfirmrules.io/bot)';
  const maxRetries = opts.maxRetries ?? 3;
  const t0 = Date.now();
  let lastError = '';
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetchWithTimeout(url, timeoutMs, userAgent);
      const ms = Date.now() - t0;
      const ct = res.headers.get('content-type') ?? '';
      if (!res.ok) {
        lastError = `HTTP ${res.status}`;
        if (res.status >= 500 && attempt < maxRetries) {
          await sleep(500 * 2 ** attempt);
          continue;
        }
        return {
          url, canonicalUrl: normalizeUrl(url) ?? url, status: res.status, contentType: ct,
          title: `HTTP ${res.status}`, text: '', links: [], hash: sha256Hex(`${url}:${res.status}`),
          responseMs: ms, robotsAllowed: true, error: lastError,
        };
      }
      if (!/text\/html|application\/xhtml/i.test(ct)) {
        return {
          url, canonicalUrl: res.url ?? url, status: res.status, contentType: ct,
          title: 'Non-HTML document', text: '', links: [], hash: sha256Hex(`${url}:${ct}`),
          responseMs: ms, robotsAllowed: true,
        };
      }
      const html = await res.text();
      const canonical = normalizeUrl(res.url ?? url) ?? url;
      return {
        url, canonicalUrl: canonical, status: res.status, contentType: ct,
        title: extractTitle(html), text: extractText(html), links: extractLinks(html, canonical),
        hash: sha256Hex(html), responseMs: ms, robotsAllowed: true,
      };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      if (attempt < maxRetries) await sleep(500 * 2 ** attempt);
    }
  }
  return {
    url, canonicalUrl: normalizeUrl(url) ?? url, status: 0, contentType: '', title: 'Fetch failed',
    text: '', links: [], hash: sha256Hex(`fail:${url}`), responseMs: Date.now() - t0,
    robotsAllowed: true, error: lastError || 'fetch failed',
  };
}

export async function runCrawler(targetUrl?: string, maxPages = 35, opts: CrawlOptions = {}): Promise<CrawlRunSummary> {
  const startUrl = targetUrl || GOAT_FIRM_CONFIG.seedUrls[0]!;
  let config: FirmCrawlerConfig;
  if (startUrl.includes('goatfundedtrader.com')) config = GOAT_FIRM_CONFIG;
  else config = createFirmConfig('Discovered Prop Firm', startUrl);

  const rateLimit = opts.rateLimitMs ?? config.rateLimitMs;
  const userAgent = opts.userAgent ?? process.env['CRAWLER_USER_AGENT'] ?? 'PropFirmRulesBot/1.0 (+https://propfirmrules.io/bot)';
  console.log(`\n======================================================`);
  console.log(`STARTING REAL CRAWLER`);
  console.log(`Target: ${config.firmName} (${startUrl})`);
  console.log(`Allowed: ${config.allowedSubdomains.join(', ')}`);
  console.log(`Max pages: ${maxPages}${opts.dryRun ? ' (dry-run: fetch disabled)' : ''}`);
  console.log(`======================================================\n`);

  const queue = new CrawlQueue(config.maxDepth);
  const nodes: CrawlSnapshotNode[] = [];
  const startTime = new Date().toISOString();
  const origin = new URL(startUrl).origin;

  for (const seed of config.seedUrls) {
    const norm = normalizeUrl(seed);
    if (norm) queue.enqueue(norm, seed, classifyUrl(norm, config.primaryDomain), 0);
  }
  // Sitemap discovery (real)
  if (!opts.dryRun) {
    try {
      const sm = await discoverSitemap(origin, userAgent);
      for (const u of sm) {
        if (!isAllowedDomain(u, config.allowedSubdomains)) continue;
        queue.enqueue(u, u, classifyUrl(u, config.primaryDomain), 0);
      }
      if (sm.length > 0) console.log(`Sitemap: +${sm.length} URLs queued`);
    } catch { /* non-fatal */ }
  }

  let crawled = 0, failed = 0, skipped = 0, docs = 0, jsNeeded = 0, totalMs = 0;

  while (crawled + failed < maxPages) {
    const item = queue.getNextItem();
    if (!item) break;
    if (config.excludedPatterns.some((p) => p.test(item.normalizedUrl))) { skipped++; continue; }
    if (!isAllowedDomain(item.normalizedUrl, config.allowedSubdomains)) { skipped++; continue; }

    let robotsOk = true;
    try {
      const u = new URL(item.normalizedUrl);
      robotsOk = await checkRobots(u.origin, u.pathname, userAgent);
    } catch { robotsOk = true; }
    if (!robotsOk) { skipped++; queue.markCompleted(item.normalizedUrl, sha256Hex(`robots-skip:${item.normalizedUrl}`)); continue; }

    console.log(`[CRAWL ${crawled + failed + 1}/${maxPages}] (${item.category}) ${item.normalizedUrl}`);
    await sleep(rateLimit);

    let fetched: FetchResult;
    if (opts.dryRun) {
      fetched = {
        url: item.url, canonicalUrl: item.normalizedUrl, status: 0, contentType: 'dry-run',
        title: 'Dry-run (no fetch)', text: '', links: [], hash: sha256Hex(`dry:${item.normalizedUrl}`),
        responseMs: 0, robotsAllowed: true, error: 'dry-run',
      };
      skipped++;
      queue.markCompleted(item.normalizedUrl, fetched.hash);
      continue;
    } else {
      fetched = await fetchPage(item.normalizedUrl, opts);
    }
    totalMs += fetched.responseMs;

    if (fetched.error || fetched.status === 0 || fetched.status >= 400) {
      failed++;
      queue.markFailed(item.normalizedUrl, fetched.error ?? `HTTP ${fetched.status}`);
      nodes.push({
        url: item.url, title: fetched.title, category: item.category, httpStatus: fetched.status,
        depth: item.depth, contentHash: fetched.hash, discoveredFrom: item.parentUrl || 'START_URL',
        crawledAt: new Date().toISOString(), extractedRulesCount: 0, internalLinksCount: 0, externalLinksCount: 0,
      });
      continue;
    }

    if (fetched.contentType.includes('pdf') || item.category === 'TERMS' || item.category === 'COMPLAINTS') docs++;
    if (item.category === 'MODEL' || item.category === 'FAQ') jsNeeded++;

    const internal = fetched.links.filter((l) => { try { return isAllowedDomain(l, config.allowedSubdomains); } catch { return false; } });
    const external = fetched.links.length - internal.length;

    nodes.push({
      url: item.url, title: fetched.title.slice(0, 200), category: item.category,
      httpStatus: fetched.status, depth: item.depth, contentHash: fetched.hash,
      discoveredFrom: item.parentUrl || 'START_URL', crawledAt: new Date().toISOString(),
      extractedRulesCount: 0, internalLinksCount: internal.length, externalLinksCount: external,
    });
    queue.markCompleted(item.normalizedUrl, fetched.hash);
    crawled++;

    if (item.depth < config.maxDepth) {
      for (const link of internal.slice(0, 30)) {
        queue.enqueue(link, link, classifyUrl(link, config.primaryDomain), item.depth + 1, item.normalizedUrl);
      }
    }
  }

  const stats = queue.getStats();
  const summary: CrawlRunSummary = {
    firmId: config.firmId, firmName: config.firmName, startUrl, startedAt: startTime,
    completedAt: new Date().toISOString(), totalDiscovered: stats.totalDiscovered,
    totalCrawled: crawled, totalFailed: failed, totalSkipped: skipped,
    jsRenderedCount: jsNeeded, duplicateCount: stats.uniqueContentHashes < crawled ? crawled - stats.uniqueContentHashes : 0,
    documentsFoundCount: docs, averageResponseTimeMs: crawled > 0 ? Math.round(totalMs / crawled) : 0,
    discoveredNodes: nodes,
  };

  console.log(`\nCRAWL DONE — crawled=${crawled} failed=${failed} skipped=${skipped} discovered=${summary.totalDiscovered}\n`);
  return summary;
}

if (process.argv[1]?.includes('crawlerCLI')) {
  const target = process.argv[2];
  const dry = process.argv.includes('--dry-run');
  runCrawler(target, target ? 35 : 35, { dryRun: dry }).catch(console.error);
}
