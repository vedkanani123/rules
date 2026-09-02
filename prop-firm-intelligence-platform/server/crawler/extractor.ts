import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { UrlIntelligence } from './url-intelligence';

export interface ExtractedTable {
  title?: string;
  headers: string[];
  rows: string[][];
  source_section?: string;
}

export interface ExtractedLink {
  raw: string;
  normalized: string | null;
  text: string;
  isExternal: boolean;
  rel?: string;
}

export interface ExtractedDocument {
  url: string;
  type: 'PDF' | 'DOC' | 'CSV' | 'XLSX' | 'OTHER';
  label: string;
  discovered_from: string;
}

export interface ExtractedPageContent {
  url: string;
  title: string;
  meta_description: string;
  canonical_url: string;
  h1: string[];
  h2: string[];
  h3: string[];
  clean_text: string;
  raw_html_snippet: string;
  content_hash: string;
  text_hash: string;
  tables: ExtractedTable[];
  documents: ExtractedDocument[];
  links: ExtractedLink[];
  structured_data: any[];
  images: Array<{ src: string; alt: string }>;
  published_date?: string;
  modified_date?: string;
}

export class ContentExtractor {
  /**
   * Computes SHA-256 hash
   */
  static hash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Extracts comprehensive structured data from HTML
   */
  static extract(html: string, currentUrl: string, primaryDomain: string): ExtractedPageContent {
    const $ = cheerio.load(html);

    // Remove noise scripts, styles, SVG icons, noscript
    const title = $('title').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      $('h1').first().text().trim() || 'Untitled Page';

    const meta_description = $('meta[name="description"]').attr('content')?.trim() ||
      $('meta[property="og:description"]').attr('content')?.trim() || '';

    const canonical_url = $('link[rel="canonical"]').attr('href')?.trim() || currentUrl;

    const h1: string[] = [];
    $('h1').each((_, el) => {
      const text = $(el).text().trim();
      if (text && !h1.includes(text)) h1.push(text);
    });

    const h2: string[] = [];
    $('h2').each((_, el) => {
      const text = $(el).text().trim();
      if (text && !h2.includes(text)) h2.push(text);
    });

    const h3: string[] = [];
    $('h3').each((_, el) => {
      const text = $(el).text().trim();
      if (text && !h3.includes(text)) h3.push(text);
    });

    // Extract structured data JSON-LD
    const structured_data: any[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const jsonContent = $(el).html();
        if (jsonContent) {
          structured_data.push(JSON.parse(jsonContent));
        }
      } catch {
        // Ignore parse error
      }
    });

    // Extract Tables
    const tables: ExtractedTable[] = [];
    $('table').each((tableIdx, tableEl) => {
      const $table = $(tableEl);
      const headers: string[] = [];
      const rows: string[][] = [];

      $table.find('thead th, tr:first-child th, tr:first-child td').each((_, th) => {
        headers.push($(th).text().trim());
      });

      $table.find('tbody tr, tr').each((rowIdx, tr) => {
        if (rowIdx === 0 && headers.length > 0 && $table.find('thead').length === 0) return;
        const rowData: string[] = [];
        $(tr).find('td, th').each((_, td) => {
          rowData.push($(td).text().trim());
        });
        if (rowData.length > 0) {
          rows.push(rowData);
        }
      });

      const sectionHeading = $table.prevAll('h1, h2, h3, h4').first().text().trim();
      tables.push({
        title: $table.attr('aria-label') || $table.find('caption').text().trim() || sectionHeading || `Table ${tableIdx + 1}`,
        headers,
        rows,
        source_section: sectionHeading
      });
    });

    // Extract Documents
    const documents: ExtractedDocument[] = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      const lower = href.toLowerCase();
      let docType: ExtractedDocument['type'] | null = null;
      if (lower.endsWith('.pdf') || lower.includes('.pdf?')) docType = 'PDF';
      else if (lower.endsWith('.docx') || lower.endsWith('.doc')) docType = 'DOC';
      else if (lower.endsWith('.csv')) docType = 'CSV';
      else if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) docType = 'XLSX';

      if (docType) {
        const fullDocUrl = UrlIntelligence.normalizeUrl(href, currentUrl);
        if (fullDocUrl) {
          documents.push({
            url: fullDocUrl,
            type: docType,
            label: $(el).text().trim() || 'Document Download',
            discovered_from: currentUrl
          });
        }
      }
    });

    // Extract Links
    const links: ExtractedLink[] = [];
    const seenLinks = new Set<string>();

    $('a[href]').each((_, el) => {
      const rawHref = $(el).attr('href')?.trim();
      if (!rawHref) return;

      const normalized = UrlIntelligence.normalizeUrl(rawHref, currentUrl);
      const linkText = $(el).text().replace(/\s+/g, ' ').trim();
      const rel = $(el).attr('rel');

      if (normalized && !seenLinks.has(normalized)) {
        seenLinks.add(normalized);
        const isExternal = !UrlIntelligence.isAllowedCrawlDomain(normalized, primaryDomain);
        links.push({
          raw: rawHref,
          normalized,
          text: linkText,
          isExternal,
          rel
        });
      }
    });

    // Extract images
    const images: Array<{ src: string; alt: string }> = [];
    $('img[src]').each((_, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt') || '';
      if (src) {
        const normalizedSrc = UrlIntelligence.normalizeUrl(src, currentUrl);
        if (normalizedSrc) images.push({ src: normalizedSrc, alt });
      }
    });

    // Clean text extraction
    $('script, style, noscript, svg, nav, footer').remove();
    const clean_text = $('body').text().replace(/\s+/g, ' ').trim();

    const content_hash = this.hash(html);
    const text_hash = this.hash(clean_text);

    const raw_html_snippet = html.length > 3000 ? html.substring(0, 3000) + '...' : html;

    return {
      url: currentUrl,
      title,
      meta_description,
      canonical_url,
      h1,
      h2,
      h3,
      clean_text,
      raw_html_snippet,
      content_hash,
      text_hash,
      tables,
      documents,
      links,
      structured_data,
      images: images.slice(0, 15)
    };
  }
}
