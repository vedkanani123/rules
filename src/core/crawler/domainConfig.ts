// Domain & Firm Crawler Configuration System
// Agnostic architecture allowing any prop firm domain to be plugged in seamlessly.

export interface FirmCrawlerConfig {
  firmId: string;
  firmName: string;
  primaryDomain: string;
  allowedSubdomains: string[];
  seedUrls: string[];
  maxDepth: number;
  rateLimitMs: number;
  excludedPatterns: RegExp[];
  priorityPathKeywords: string[];
  helpCenterDomain?: string;
}

export const GOAT_FIRM_CONFIG: FirmCrawlerConfig = {
  firmId: 'goat-funded-trader',
  firmName: 'Goat Funded Trader',
  primaryDomain: 'goatfundedtrader.com',
  allowedSubdomains: ['www.goatfundedtrader.com', 'help.goatfundedtrader.com', 'app.goatfundedtrader.com'],
  seedUrls: [
    'https://www.goatfundedtrader.com/',
    'https://www.goatfundedtrader.com/model',
    'https://www.goatfundedtrader.com/rewards',
    'https://www.goatfundedtrader.com/how-it-works',
    'https://www.goatfundedtrader.com/legal/terms-and-conditions',
    'https://www.goatfundedtrader.com/legal/refund-policy',
    'https://www.goatfundedtrader.com/legal/complaints-policy',
    'https://www.goatfundedtrader.com/legal/funded-account-disclaimer',
    'https://help.goatfundedtrader.com/en/',
  ],
  maxDepth: 4,
  rateLimitMs: 250,
  excludedPatterns: [
    /\/cdn-cgi\//i,
    /\/wp-json\//i,
    /\/login/i,
    /\/register/i,
    /\/cart/i,
    /\/checkout/i,
    /\.png$/i,
    /\.jpg$/i,
    /\.jpeg$/i,
    /\.webp$/i,
    /\.svg$/i,
  ],
  priorityPathKeywords: [
    'model',
    'rule',
    'drawdown',
    'loss',
    'faq',
    'payout',
    'reward',
    'terms',
    'refund',
    'complaints',
    'consistency',
    'news',
  ],
  helpCenterDomain: 'help.goatfundedtrader.com',
};

/**
 * Creates a generic config for any new prop firm input URL.
 */
export function createFirmConfig(firmName: string, startUrl: string): FirmCrawlerConfig {
  const parsed = new URL(startUrl);
  const domain = parsed.hostname.replace(/^www\./, '');
  return {
    firmId: firmName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    firmName,
    primaryDomain: domain,
    allowedSubdomains: [parsed.hostname, `help.${domain}`, `support.${domain}`],
    seedUrls: [startUrl],
    maxDepth: 3,
    rateLimitMs: 300,
    excludedPatterns: [
      /\/cdn-cgi\//i,
      /\/login/i,
      /\/checkout/i,
      /\.(jpg|png|svg|webp|gif|mp4|zip)$/i,
    ],
    priorityPathKeywords: ['rules', 'faq', 'payout', 'models', 'terms', 'drawdown'],
  };
}
