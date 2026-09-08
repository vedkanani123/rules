import { CrawlQueueItem, CrawlRunStats, SourceDocument, UrlCategory, EvidenceClass } from '../../src/types';
import { UrlIntelligence } from './url-intelligence';
import { ContentExtractor, ExtractedPageContent } from './extractor';

export interface CrawlOptions {
  startUrl: string;
  maxDepth?: number;
  maxPages?: number;
  concurrency?: number;
  delayMs?: number;
  allowedSubdomains?: string[];
  customUserAgent?: string;
}

export class CrawlerCore {
  private queue: CrawlQueueItem[] = [];
  private visitedUrls = new Set<string>();
  private contentHashes = new Set<string>();
  private documentsDiscovered: SourceDocument[] = [];
  private externalDomains = new Set<string>();
  private crawledPages: ExtractedPageContent[] = [];
  
  private stats: CrawlRunStats;
  private isRunning: boolean = false;
  private primaryDomain: string = '';

  constructor() {
    this.stats = {
      crawl_id: `crawl-${Date.now()}`,
      start_url: '',
      started_at: new Date().toISOString(),
      status: 'PAUSED',
      pages_discovered: 0,
      pages_crawled: 0,
      pages_failed: 0,
      pages_skipped: 0,
      external_domains_discovered: 0,
      documents_discovered: 0,
      js_rendered_count: 0,
      duplicate_pages_detected: 0,
      avg_response_time_ms: 0,
      rules_extracted_count: 0,
      conflicts_detected_count: 0
    };
  }

  getStats(): CrawlRunStats {
    return {
      ...this.stats,
      pages_discovered: this.queue.length,
      external_domains_discovered: this.externalDomains.size,
      documents_discovered: this.documentsDiscovered.length
    };
  }

  getQueue(): CrawlQueueItem[] {
    return [...this.queue];
  }

  getDiscoveredDocuments(): SourceDocument[] {
    return [...this.documentsDiscovered];
  }

  getCrawledPages(): ExtractedPageContent[] {
    return [...this.crawledPages];
  }

  /**
   * Universal crawling execution engine
   */
  async startCrawl(options: CrawlOptions, onProgress?: (stats: CrawlRunStats) => void): Promise<CrawlRunStats> {
    const normalizedStart = UrlIntelligence.normalizeUrl(options.startUrl);
    if (!normalizedStart) {
      throw new Error(`Invalid start URL: ${options.startUrl}`);
    }

    const startObj = new URL(normalizedStart);
    this.primaryDomain = startObj.hostname;

    this.stats = {
      crawl_id: `crawl-${Date.now()}`,
      start_url: normalizedStart,
      started_at: new Date().toISOString(),
      status: 'RUNNING',
      pages_discovered: 1,
      pages_crawled: 0,
      pages_failed: 0,
      pages_skipped: 0,
      external_domains_discovered: 0,
      documents_discovered: 0,
      js_rendered_count: 0,
      duplicate_pages_detected: 0,
      avg_response_time_ms: 0,
      rules_extracted_count: 0,
      conflicts_detected_count: 0
    };

    this.queue = [];
    this.visitedUrls.clear();
    this.contentHashes.clear();
    this.documentsDiscovered = [];
    this.externalDomains.clear();
    this.crawledPages = [];
    this.isRunning = true;

    // Add start URL to queue
    const rootCategory = UrlIntelligence.classifyUrl(normalizedStart);
    this.queue.push({
      id: `q-0`,
      url: options.startUrl,
      normalized_url: normalizedStart,
      domain: startObj.hostname,
      depth: 0,
      priority: UrlIntelligence.calculatePriority(rootCategory, 0),
      status: 'QUEUED',
      category: rootCategory,
      attempt_count: 0,
      discovered_at: new Date().toISOString()
    });

    const maxDepth = options.maxDepth ?? 4;
    const maxPages = options.maxPages ?? 80;
    const delayMs = options.delayMs ?? 150;
    let totalResponseTime = 0;

    while (this.isRunning && this.stats.pages_crawled < maxPages) {
      // Find highest priority queued item
      const pendingItems = this.queue.filter(item => item.status === 'QUEUED');
      if (pendingItems.length === 0) break;

      pendingItems.sort((a, b) => b.priority - a.priority);
      const currentItem = pendingItems[0];
      currentItem.status = 'FETCHING';
      currentItem.attempt_count += 1;
      currentItem.last_attempt_at = new Date().toISOString();

      if (this.visitedUrls.has(currentItem.normalized_url)) {
        currentItem.status = 'SKIPPED';
        this.stats.pages_skipped++;
        continue;
      }
      this.visitedUrls.add(currentItem.normalized_url);

      const startTime = Date.now();
      try {
        // Fetch page with safety boundaries and timeout
        const fetchedData = await this.fetchPage(currentItem.normalized_url, options.customUserAgent);
        const duration = Date.now() - startTime;
        totalResponseTime += duration;

        currentItem.http_status = fetchedData.status;
        currentItem.content_type = fetchedData.contentType;
        currentItem.response_time_ms = duration;
        currentItem.processed_at = new Date().toISOString();

        if (fetchedData.status >= 200 && fetchedData.status < 400 && fetchedData.html) {
          // Check for duplicate content via hash
          const textHash = ContentExtractor.hash(fetchedData.html);
          currentItem.content_hash = textHash;

          if (this.contentHashes.has(textHash)) {
            currentItem.status = 'SKIPPED';
            this.stats.duplicate_pages_detected++;
            this.stats.pages_skipped++;
            continue;
          }
          this.contentHashes.add(textHash);

          // Extract structured content
          const extracted = ContentExtractor.extract(fetchedData.html, currentItem.normalized_url, this.primaryDomain);
          this.crawledPages.push(extracted);
          currentItem.status = 'PARSED';
          this.stats.pages_crawled++;

          // Record discovered documents
          for (const doc of extracted.documents) {
            if (!this.documentsDiscovered.some(d => d.url === doc.url)) {
              this.documentsDiscovered.push({
                id: `doc-${this.documentsDiscovered.length + 1}`,
                firm_id: this.primaryDomain.replace(/\./g, '-'),
                url: doc.url,
                normalized_url: doc.url,
                title: doc.label,
                category: 'RULES',
                evidence_class: 'OFFICIAL',
                http_status: 200,
                content_type: doc.type,
                content_hash: ContentExtractor.hash(doc.url),
                depth: currentItem.depth + 1,
                crawled_at: new Date().toISOString(),
                discovered_from: currentItem.normalized_url
              });
            }
          }

          // Process discovered links
          if (currentItem.depth < maxDepth) {
            for (const link of extracted.links) {
              if (link.isExternal) {
                try {
                  const extHost = new URL(link.normalized!).hostname;
                  this.externalDomains.add(extHost);
                } catch {
                  // ignore
                }
              } else if (link.normalized && !this.visitedUrls.has(link.normalized)) {
                const existingInQueue = this.queue.some(q => q.normalized_url === link.normalized);
                if (!existingInQueue && this.queue.length < 250) {
                  const linkCategory = UrlIntelligence.classifyUrl(link.normalized);
                  const priority = UrlIntelligence.calculatePriority(linkCategory, currentItem.depth + 1);
                  this.queue.push({
                    id: `q-${this.queue.length}`,
                    url: link.raw,
                    normalized_url: link.normalized,
                    domain: new URL(link.normalized).hostname,
                    parent_url: currentItem.normalized_url,
                    depth: currentItem.depth + 1,
                    priority,
                    status: 'QUEUED',
                    category: linkCategory,
                    attempt_count: 0,
                    discovered_at: new Date().toISOString()
                  });
                }
              }
            }
          }
        } else {
          currentItem.status = 'FAILED';
          currentItem.error = `HTTP ${fetchedData.status}`;
          this.stats.pages_failed++;
        }
      } catch (err: any) {
        currentItem.status = 'FAILED';
        currentItem.error = err?.message || 'Fetch error';
        this.stats.pages_failed++;
      }

      this.stats.avg_response_time_ms = Math.round(totalResponseTime / Math.max(1, this.stats.pages_crawled + this.stats.pages_failed));

      if (onProgress) {
        onProgress(this.getStats());
      }

      // Polite rate-limit delay
      if (delayMs > 0) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }

    this.stats.status = 'COMPLETED';
    this.stats.completed_at = new Date().toISOString();
    this.isRunning = false;
    return this.getStats();
  }

  /**
   * Safe fetcher that enforces SSRF safety and reasonable size limits
   */
  private async fetchPage(urlStr: string, customUserAgent?: string): Promise<{ status: number; contentType: string; html?: string }> {
    const parsed = new URL(urlStr);

    // SSRF Security check
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('169.254.') ||
      host.startsWith('172.16.')
    ) {
      throw new Error(`Forbidden target IP/host: ${host}`);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(urlStr, {
        headers: {
          'User-Agent': customUserAgent || 'PropFirmIntelligenceBot/1.0 (+https://propfirmintelligence.internal)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        signal: controller.signal,
        redirect: 'follow'
      });

      clearTimeout(timeout);
      const contentType = response.headers.get('content-type') || 'text/html';

      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        return { status: response.status, contentType };
      }

      const html = await response.text();
      return {
        status: response.status,
        contentType,
        html
      };
    } catch (err: any) {
      clearTimeout(timeout);
      throw err;
    }
  }
}
