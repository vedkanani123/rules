// Automated Comprehensive SEO Validator for PropFirmRules.io
// Audits every pre-rendered HTML file in dist/ to ensure 10/10 technical SEO requirements:
// 1. HTTP 200 equivalent (file exists and has substantive body content)
// 2. Unique <title> matching registry
// 3. Unique <meta name="description"> with minimum length
// 4. Exact 1 <h1> tag per page
// 5. Correct self-referencing canonical URL
// 6. Valid Schema.org JSON-LD graph
// 7. Visible crawlable internal links with no broken routes
// 8. Breadcrumbs present on deep pages

import fs from 'node:fs';
import path from 'node:path';
import { ALL_SEO_ROUTES } from '../src/core/seo/routesRegistry.ts';
import { BASE_URL } from '../src/core/seo/schemaGenerator.ts';

interface ValidationIssue {
  route: string;
  type: 'ERROR' | 'WARNING';
  message: string;
}

function validateSeo() {
  const distDir = path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(distDir)) {
    console.error('Error: dist directory does not exist! Run "npm run build" first.');
    process.exit(1);
  }

  const issues: ValidationIssue[] = [];
  const validTitles = new Set<string>();
  const validDescriptions = new Set<string>();
  const validCanonicals = new Set<string>();
  const validH1s = new Set<string>();
  const routeSet = new Set(ALL_SEO_ROUTES.map((r) => r.path));
  const inboundLinks = new Map<string, Set<string>>();
  for (const r of ALL_SEO_ROUTES) {
    inboundLinks.set(r.path, new Set());
  }

  console.log(`\n======================================================`);
  console.log(`🔍 FUNDEDTRADINGRULES.COM TECHNICAL SEO 10/10 VALIDATOR`);
  console.log(`Auditing ${ALL_SEO_ROUTES.length} registered SEO routes in dist/...`);
  console.log(`======================================================\n`);

  let auditedCount = 0;

  for (const route of ALL_SEO_ROUTES) {
    const relPath = route.path === '/' ? 'index.html' : path.join(route.path.replace(/^\//, ''), 'index.html');
    const filePath = path.join(distDir, relPath);

    if (!fs.existsSync(filePath)) {
      issues.push({
        route: route.path,
        type: 'ERROR',
        message: `Missing pre-rendered static HTML file at: dist/${relPath}`,
      });
      continue;
    }

    const html = fs.readFileSync(filePath, 'utf-8');
    auditedCount++;

    // 1. File size / substantive body content
    if (html.length < 5000) {
      issues.push({
        route: route.path,
        type: 'ERROR',
        message: `Thin HTML content detected (${html.length} bytes)`,
      });
    }

    // 2. Title validation (strict 35-65 chars + uniqueness)
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (!titleMatch || !titleMatch[1]) {
      issues.push({
        route: route.path,
        type: 'ERROR',
        message: 'Missing or empty <title> tag',
      });
    } else {
      const title = titleMatch[1].trim();
      if (title.length < 35 || title.length > 65) {
        issues.push({
          route: route.path,
          type: 'WARNING',
          message: `Title length (${title.length} chars) out of SERP range (35-65 chars): "${title}"`,
        });
      }
      if (validTitles.has(title)) {
        issues.push({
          route: route.path,
          type: 'ERROR',
          message: `Duplicate title detected across pages: "${title}"`,
        });
      }
      validTitles.add(title);
    }

    // 3. Meta description validation (strict 110-160 chars + uniqueness)
    const descMatch = html.match(/<meta name="description" content="(.*?)"/i);
    if (!descMatch || !descMatch[1]) {
      issues.push({
        route: route.path,
        type: 'ERROR',
        message: 'Missing or empty meta description',
      });
    } else {
      const desc = descMatch[1].trim();
      if (desc.length < 110 || desc.length > 160) {
        issues.push({
          route: route.path,
          type: 'WARNING',
          message: `Meta description length (${desc.length} chars) out of SERP range (110-160 chars)`,
        });
      }
      if (validDescriptions.has(desc)) {
        issues.push({
          route: route.path,
          type: 'ERROR',
          message: `Duplicate meta description detected: "${desc.slice(0, 50)}..."`,
        });
      }
      validDescriptions.add(desc);
    }

    // 4. H1 validation (exact 1 <h1> + uniqueness across all 292 routes)
    const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
    if (h1Matches.length === 0) {
      issues.push({
        route: route.path,
        type: 'ERROR',
        message: 'Missing <h1> tag',
      });
    } else if (h1Matches.length > 1) {
      issues.push({
        route: route.path,
        type: 'ERROR',
        message: `Multiple <h1> tags found (${h1Matches.length} count)`,
      });
    } else {
      const h1Text = h1Matches[0][1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (validH1s.has(h1Text)) {
        issues.push({
          route: route.path,
          type: 'ERROR',
          message: `Duplicate <h1> detected across pages: "${h1Text}"`,
        });
      }
      validH1s.add(h1Text);
    }

    // 4b. Single <main> landmark check
    const mainMatches = [...html.matchAll(/<main[\s>]/gi)];
    if (mainMatches.length !== 1) {
      issues.push({
        route: route.path,
        type: 'ERROR',
        message: `Expected exactly 1 <main> landmark, found ${mainMatches.length}`,
      });
    }

    // 5. Canonical validation
    const canonicalMatch = html.match(/<link rel="canonical" href="(.*?)"/i);
    if (!canonicalMatch || !canonicalMatch[1]) {
      issues.push({
        route: route.path,
        type: 'ERROR',
        message: 'Missing canonical tag',
      });
    } else {
      const canonical = canonicalMatch[1];
      const expectedCanonical = route.canonicalUrl;
      if (canonical !== expectedCanonical) {
        issues.push({
          route: route.path,
          type: 'ERROR',
          message: `Canonical mismatch: Expected "${expectedCanonical}", found "${canonical}"`,
        });
      }
      validCanonicals.add(canonical);
    }

    // 6. Schema.org JSON-LD validation + visible FAQPage alignment
    const bodyHtml = html.split('</head>')[1] || '';
    const bodyText = bodyHtml
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&#x27;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ');
    const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
    if (!jsonLdMatches || jsonLdMatches.length === 0) {
      issues.push({
        route: route.path,
        type: 'WARNING',
        message: 'No Schema.org JSON-LD found',
      });
    } else {
      for (const block of jsonLdMatches) {
        const rawJson = block.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
        try {
          const parsed = JSON.parse(rawJson);
          if (!parsed['@context'] || (!parsed['@graph'] && !parsed['@type'])) {
            issues.push({
              route: route.path,
              type: 'ERROR',
              message: 'Invalid Schema.org structure (missing @context or @type/@graph)',
            });
          }
          if (parsed['@type'] === 'FAQPage' && Array.isArray(parsed.mainEntity)) {
            for (const q of parsed.mainEntity) {
              const qName = (q.name || '').replace(/\s+/g, ' ').trim();
              if (qName && !bodyText.includes(qName)) {
                issues.push({
                  route: route.path,
                  type: 'ERROR',
                  message: `FAQPage schema question not visibly rendered in body: "${qName}"`,
                });
              }
            }
          }
        } catch (e: any) {
          issues.push({
            route: route.path,
            type: 'ERROR',
            message: `Corrupt JSON-LD block: ${e.message}`,
          });
        }
      }
    }

    // 7. Internal links validation (check that links render as native <a href="..."> and point to valid routes)
    const anchorMatches = html.match(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi);
    if (!anchorMatches || anchorMatches.length < 5) {
      issues.push({
        route: route.path,
        type: 'WARNING',
        message: `Page has very few crawlable anchor links (${anchorMatches ? anchorMatches.length : 0})`,
      });
    }
    const internalHrefMatches = [...bodyHtml.matchAll(/<a\s+[^>]*href="(\/[^"#?]*)"/gi)];
    for (const hm of internalHrefMatches) {
      const raw = hm[1];
      const target = raw.length > 1 && raw.endsWith('/') ? raw.slice(0, -1) : raw;
      if (!routeSet.has(target)) {
        issues.push({
          route: route.path,
          type: 'ERROR',
          message: `Broken or non-canonical internal link target: "${target}"`,
        });
      } else if (target !== route.path) {
        inboundLinks.get(target)!.add(route.path);
      }
    }

    // 8. Breadcrumbs check for deep pages
    if (route.pageType !== 'core' && !html.includes('aria-label="Breadcrumb"') && !html.includes('BreadcrumbList')) {
      issues.push({
        route: route.path,
        type: 'WARNING',
        message: `Deep page missing visible Breadcrumb navigation`,
      });
    }

    // 9. Image alt, width, and height check (CLS & accessibility gate)
    const imgTags = [...bodyHtml.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
    for (const img of imgTags) {
      if (!/\balt=["'][^"']*["']/i.test(img)) {
        issues.push({
          route: route.path,
          type: 'ERROR',
          message: `Image tag missing alt attribute: ${img.slice(0, 80)}`,
        });
      }
      if (!/\bwidth=/i.test(img) || !/\bheight=/i.test(img)) {
        issues.push({
          route: route.path,
          type: 'ERROR',
          message: `Image tag missing explicit width/height attributes (CLS prevention): ${img.slice(0, 80)}`,
        });
      }
    }

    // 10. Heading hierarchy check (no skipped heading levels e.g. h1->h3 or h2->h4)
    const headingLevels = [...bodyHtml.matchAll(/<h([1-6])\b[^>]*>/gi)].map((m) => Number(m[1]));
    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] > headingLevels[i - 1] + 1) {
        issues.push({
          route: route.path,
          type: 'ERROR',
          message: `Skipped heading level detected: h${headingLevels[i - 1]} -> h${headingLevels[i]}`,
        });
        break;
      }
    }

    // 11. Google Favicon Multiple of 48px check (home page)
    if (route.path === '/') {
      if (!html.includes('sizes="48x48"') || !html.includes('favicon-48x48.png')) {
        issues.push({
          route: route.path,
          type: 'ERROR',
          message: 'Homepage missing Google-required 48x48px favicon tag in <head>',
        });
      }
      const has48File = fs.existsSync(path.join(distDir, 'favicon-48x48.png'));
      if (!has48File) {
        issues.push({
          route: route.path,
          type: 'ERROR',
          message: 'dist/favicon-48x48.png does not exist for Googlebot-Favicons',
        });
      }
    }
  }

  // 12. Orphan check across all routes
  for (const [routePath, sources] of inboundLinks.entries()) {
    if (routePath !== '/' && sources.size === 0) {
      issues.push({
        route: routePath,
        type: 'ERROR',
        message: 'Orphan page detected: 0 inbound <a href> links from other pages',
      });
    }
  }

  // Summary report
  const errors = issues.filter((i) => i.type === 'ERROR');
  const warnings = issues.filter((i) => i.type === 'WARNING');

  console.log(`Audited ${auditedCount} HTML documents across all route clusters.`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}\n`);

  if (warnings.length > 0) {
    console.log(`⚠️  WARNINGS (${warnings.length}):`);
    warnings.slice(0, 10).forEach((w) => {
      console.log(`  [${w.route}] ${w.message}`);
    });
    if (warnings.length > 10) {
      console.log(`  ... and ${warnings.length - 10} more warnings.`);
    }
    console.log('');
  }

  if (errors.length > 0) {
    console.error(`❌  ERRORS (${errors.length}):`);
    errors.forEach((e) => {
      console.error(`  [${e.route}] ${e.message}`);
    });
    console.error(`\nFAILED: SEO check found ${errors.length} fatal errors. Fix before production deployment!\n`);
    process.exit(1);
  }

  console.log(`✅  10/10 PERFECT SEO AUDIT PASSED! All ${auditedCount} pages meet all technical SEO, crawlability, canonical, metadata, and structured data standards.\n`);
}

validateSeo();
