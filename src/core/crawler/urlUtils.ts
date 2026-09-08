// URL Normalization, Classification, and Safety Engine
// Ensures recursive crawler handles any domain without loop traps or query pollution.

import { URLCategory } from '../../types/schema.ts';

// Tracking parameters that do not affect page content
const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'ref',
  'r',
  'aff',
  'affiliate',
  'gclid',
  'fbclid',
  'mc_cid',
  'mc_eid',
  '_ga',
  '_gl',
]);

/**
 * Normalizes a URL for deduplication and canonical indexing.
 */
export function normalizeUrl(rawUrl: string, baseUrl?: string): string | null {
  try {
    let parsed: URL;
    if (baseUrl) {
      parsed = new URL(rawUrl, baseUrl);
    } else {
      parsed = new URL(rawUrl);
    }

    // Only allow http and https schemes
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }

    // Lowercase hostname
    parsed.hostname = parsed.hostname.toLowerCase();

    // Remove default ports
    if (
      (parsed.protocol === 'http:' && parsed.port === '80') ||
      (parsed.protocol === 'https:' && parsed.port === '443')
    ) {
      parsed.port = '';
    }

    // Remove fragment / anchor
    parsed.hash = '';

    // Filter tracking query params but retain meaningful content params
    const searchParams = new URLSearchParams(parsed.search);
    const keysToDelete: string[] = [];
    for (const key of searchParams.keys()) {
      if (TRACKING_PARAMS.has(key.toLowerCase()) || key.startsWith('utm_')) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((k) => searchParams.delete(k));
    searchParams.sort();
    parsed.search = searchParams.toString() ? `?${searchParams.toString()}` : '';

    // Remove trailing slash for path normalization (unless it's just root '/')
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Categorizes a URL based on path patterns and query parameters.
 */
export function classifyUrl(url: string, mainDomain: string): URLCategory {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase();
    const host = parsed.hostname.toLowerCase();

    // External check
    if (!host.includes(mainDomain.toLowerCase().replace('www.', ''))) {
      if (host.includes('trustpilot') || host.includes('tradingpilot') || host.includes('propfirmmatch')) {
        return 'REVIEW';
      }
      if (host.includes('twitter') || host.includes('x.com') || host.includes('discord') || host.includes('instagram') || host.includes('youtube')) {
        return 'SOCIAL';
      }
      return 'EXTERNAL';
    }

    if (path === '' || path === '/') return 'HOME';

    if (path.includes('how-it-works') || path.includes('overview')) return 'PRODUCT';
    if (path.includes('model') || path.includes('challenge') || path.includes('program')) return 'MODEL';
    if (path.includes('pricing') || path.includes('checkout') || path.includes('plans')) return 'PRICING';
    if (path.includes('account')) return 'ACCOUNT';
    if (path.includes('rules') || path.includes('trading-rules')) return 'RULES';
    if (path.includes('faq') || path.includes('help') || host.startsWith('help.')) return 'FAQ';
    if (path.includes('reward') || path.includes('payout')) return 'PAYOUT';
    if (path.includes('trading-competition') || path.includes('competition')) return 'TRADING';
    if (path.includes('platform') || path.includes('metatrader') || path.includes('tradelocker')) return 'PLATFORM';
    if (path.includes('about') || path.includes('who-we-are')) return 'ABOUT';
    if (path.includes('blog') || path.includes('articles')) return 'BLOG';
    if (path.includes('news') || path.includes('announcement')) return 'ANNOUNCEMENT';
    if (path.includes('complaints') || path.includes('complaints-policy')) return 'COMPLAINTS';
    if (path.includes('refund') || path.includes('refund-policy')) return 'REFUND';
    if (path.includes('privacy') || path.includes('privacy-policy')) return 'PRIVACY';
    if (path.includes('disclaimer') || path.includes('funded-account-disclaimer')) return 'DISCLAIMER';
    if (path.includes('terms') || path.includes('terms-and-conditions')) return 'TERMS';
    if (path.includes('contact') || path.includes('support')) return 'CONTACT';
    if (path.includes('affiliate') || path.includes('partner')) return 'AFFILIATE';
    if (path.includes('reviews')) return 'REVIEW';

    return 'UNKNOWN';
  } catch {
    return 'UNKNOWN';
  }
}

/**
 * Returns true when a URL belongs to an allowed crawl domain list.
 */
export function isAllowedDomain(url: string, allowed: string[]): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return allowed.some((a) => {
      const norm = a.toLowerCase().replace(/^www\./, '');
      return host === norm || host === `www.${norm}` || host.endsWith(`.${norm}`);
    });
  } catch {
    return false;
  }
}

/**
 * Calculates priority weight for crawl ordering.
 */
export function getUrlCrawlPriority(category: URLCategory): number {
  switch (category) {
    case 'HOME': return 100;
    case 'RULES': return 95;
    case 'MODEL': return 90;
    case 'FAQ': return 88;
    case 'HELP': return 88;
    case 'PAYOUT': return 85;
    case 'PRICING': return 80;
    case 'TERMS': return 78;
    case 'COMPLAINTS': return 75;
    case 'REFUND': return 75;
    case 'DISCLAIMER': return 75;
    case 'ACCOUNT': return 70;
    case 'PLATFORM': return 65;
    case 'ABOUT': return 60;
    case 'PRODUCT': return 55;
    case 'BLOG': return 30;
    case 'AFFILIATE': return 25;
    default: return 20;
  }
}
