import { UrlCategory, EvidenceClass } from '../../src/types';

export interface DomainPolicy {
  primaryDomain: string;
  allowedSubdomains: string[];
  blockedPaths: string[];
  priorityPaths: string[];
}

export class UrlIntelligence {
  /**
   * Normalizes a URL:
   * - standardizes protocol & hostname (lowercase)
   * - trims trailing slash (except root)
   * - removes tracking parameters (utm_*, gclid, fbclid, etc.)
   * - strips hash fragments
   * - handles relative and protocol-relative links
   */
  static normalizeUrl(rawUrl: string, baseUrl?: string): string | null {
    try {
      if (!rawUrl || typeof rawUrl !== 'string') return null;
      const cleanRaw = rawUrl.trim();
      if (cleanRaw.startsWith('javascript:') || cleanRaw.startsWith('mailto:') || cleanRaw.startsWith('tel:')) {
        return null;
      }

      const parsed = new URL(cleanRaw, baseUrl);

      // Only allow http and https
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return null;
      }

      // Lowercase hostname
      parsed.hostname = parsed.hostname.toLowerCase();

      // Remove default ports
      if ((parsed.protocol === 'http:' && parsed.port === '80') || (parsed.protocol === 'https:' && parsed.port === '443')) {
        parsed.port = '';
      }

      // Remove tracking query parameters, but retain meaningful routing/page params
      const trackingParams = new Set([
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        'fbclid', 'gclid', 'msclkid', '_ga', '_gl', 'ref', 'aff', 'affiliate',
        'vgo_ee', 'mc_cid', 'mc_eid'
      ]);

      const searchParams = new URLSearchParams(parsed.search);
      const cleanedParams = new URLSearchParams();
      for (const [key, val] of searchParams.entries()) {
        if (!trackingParams.has(key.toLowerCase())) {
          cleanedParams.append(key, val);
        }
      }

      const queryString = cleanedParams.toString();
      parsed.search = queryString ? `?${queryString}` : '';
      parsed.hash = ''; // Remove fragments

      let pathname = parsed.pathname;
      if (pathname.length > 1 && pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
      }
      parsed.pathname = pathname;

      return parsed.toString();
    } catch {
      return null;
    }
  }

  /**
   * Categorizes a URL based on path, domain, and keyword heuristics
   */
  static classifyUrl(urlStr: string): UrlCategory {
    try {
      const url = new URL(urlStr);
      const path = url.pathname.toLowerCase();
      const host = url.hostname.toLowerCase();

      if (path === '' || path === '/') return 'HOME';

      if (path.includes('faq') || path.includes('frequently-asked')) return 'FAQ';
      if (host.startsWith('help.') || path.includes('/help') || path.includes('/support') || path.includes('/knowledgebase')) return 'HELP';
      if (path.includes('rule') || path.includes('guidelines') || path.includes('trading-rules') || path.includes('drawdown')) return 'RULES';
      if (path.includes('payout') || path.includes('withdrawal') || path.includes('reward') || path.includes('profit-split')) return 'PAYOUT';
      if (path.includes('model') || path.includes('evaluation') || path.includes('challenge') || path.includes('program') || path.includes('1-step') || path.includes('2-step') || path.includes('instant')) return 'MODEL';
      if (path.includes('price') || path.includes('pricing') || path.includes('plans') || path.includes('buy') || path.includes('account')) return 'PRICING';
      if (path.includes('terms') || path.includes('tos') || path.includes('legal') || path.includes('agreement') || path.includes('conditions')) return 'TERMS';
      if (path.includes('refund') || path.includes('cancellation')) return 'REFUND';
      if (path.includes('complaint') || path.includes('dispute') || path.includes('appeal')) return 'COMPLAINTS';
      if (path.includes('privacy')) return 'PRIVACY';
      if (path.includes('disclaimer')) return 'DISCLAIMER';
      if (path.includes('blog') || path.includes('article') || path.includes('insights')) return 'BLOG';
      if (path.includes('news') || path.includes('announcement') || path.includes('press') || path.includes('update')) return 'NEWS';
      if (path.includes('contact') || path.includes('reach-us')) return 'CONTACT';
      if (path.includes('affiliate') || path.includes('partner')) return 'AFFILIATE';
      if (path.includes('review') || path.includes('testimonial') || path.includes('feedback')) return 'REVIEW';
      if (path.includes('trading') || path.includes('instruments') || path.includes('spreads') || path.includes('leverage')) return 'TRADING';
      if (path.includes('platform') || path.includes('mt5') || path.includes('mt4') || path.includes('ctrader') || path.includes('dxtrade')) return 'PLATFORM';
      if (path.includes('about') || path.includes('our-story') || path.includes('team') || path.includes('who-we-are')) return 'ABOUT';

      return 'UNKNOWN';
    } catch {
      return 'UNKNOWN';
    }
  }

  /**
   * Determine evidence classification based on host and path
   */
  static classifyEvidence(urlStr: string, primaryHost: string): EvidenceClass {
    try {
      const url = new URL(urlStr);
      const host = url.hostname.toLowerCase();
      const path = url.pathname.toLowerCase();

      if (host.includes('trustpilot.com') || host.includes('propfirmmatch.com') || host.includes('forexpeacearmy.com')) {
        return 'REVIEW_PLATFORM';
      }

      if (!host.includes(primaryHost.replace('www.', ''))) {
        return 'THIRD_PARTY_ANALYSIS';
      }

      if (path.includes('terms') || path.includes('legal') || path.includes('policy') || path.includes('disclaimer')) {
        return 'OFFICIAL_TERMS';
      }

      if (host.startsWith('help.') || path.includes('help') || path.includes('faq') || path.includes('support')) {
        return 'OFFICIAL_SUPPORT';
      }

      if (path.includes('promo') || path.includes('offer') || path === '/' || path.includes('landing')) {
        return 'OFFICIAL_PROMOTIONAL';
      }

      return 'OFFICIAL';
    } catch {
      return 'UNVERIFIED';
    }
  }

  /**
   * Assign crawl priority score (higher is prioritized in queue)
   */
  static calculatePriority(category: UrlCategory, depth: number): number {
    let base = 50;
    switch (category) {
      case 'HOME': base = 100; break;
      case 'RULES': base = 95; break;
      case 'MODEL': base = 90; break;
      case 'FAQ': base = 88; break;
      case 'HELP': base = 85; break;
      case 'PAYOUT': base = 85; break;
      case 'TERMS': base = 80; break;
      case 'PRICING': base = 75; break;
      case 'REFUND': base = 70; break;
      case 'COMPLAINTS': base = 70; break;
      case 'TRADING': base = 65; break;
      case 'PLATFORM': base = 60; break;
      case 'ABOUT': base = 50; break;
      case 'NEWS': base = 45; break;
      case 'BLOG': base = 40; break;
      default: base = 30; break;
    }
    // Penalize deep URLs slightly
    return Math.max(1, base - (depth * 5));
  }

  /**
   * Checks if URL belongs to primary domain or permitted public subdomains
   */
  static isAllowedCrawlDomain(urlStr: string, primaryDomain: string, allowedSubdomains: string[] = []): boolean {
    try {
      const url = new URL(urlStr);
      const host = url.hostname.toLowerCase();
      const cleanPrimary = primaryDomain.toLowerCase().replace('www.', '');

      if (host === cleanPrimary || host === `www.${cleanPrimary}`) return true;

      for (const sub of allowedSubdomains) {
        if (host === sub.toLowerCase() || host.endsWith(`.${sub.toLowerCase()}`)) {
          return true;
        }
      }

      // Check if it's any valid subdomain of the primary domain (e.g. help.goatfundedtrader.com)
      if (host.endsWith(`.${cleanPrimary}`)) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }
}
