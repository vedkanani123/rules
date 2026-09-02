import { describe, it, expect } from 'vitest';
import { normalizeUrl, classifyUrl } from '../src/core/crawler/urlUtils.ts';
import { CrawlQueue } from '../src/core/crawler/queue.ts';

describe('Crawler URL Engine', () => {
  it('normalizes URLs by stripping trailing slashes, fragments, and tracking params', () => {
    const raw = 'https://www.goatfundedtrader.com/model/?utm_source=twitter&ref=affiliate123#pricing';
    const normalized = normalizeUrl(raw);
    expect(normalized).toBe('https://www.goatfundedtrader.com/model');
  });

  it('classifies internal sections into categories', () => {
    const domain = 'goatfundedtrader.com';
    expect(classifyUrl('https://www.goatfundedtrader.com/', domain)).toBe('HOME');
    expect(classifyUrl('https://www.goatfundedtrader.com/model', domain)).toBe('MODEL');
    expect(classifyUrl('https://help.goatfundedtrader.com/articles/daily-drawdown', domain)).toBe('FAQ');
    expect(classifyUrl('https://www.goatfundedtrader.com/rewards', domain)).toBe('PAYOUT');
    expect(classifyUrl('https://www.goatfundedtrader.com/legal/terms-and-conditions', domain)).toBe('TERMS');
    expect(classifyUrl('https://www.trustpilot.com/review/goatfundedtrader.com', domain)).toBe('REVIEW');
  });

  it('prioritizes queue items properly', () => {
    const queue = new CrawlQueue(3);
    queue.enqueue('https://www.goatfundedtrader.com/blog', 'https://www.goatfundedtrader.com/blog', 'BLOG', 1);
    queue.enqueue('https://www.goatfundedtrader.com/rules', 'https://www.goatfundedtrader.com/rules', 'RULES', 1);

    const first = queue.getNextItem();
    expect(first?.category).toBe('RULES'); // RULES priority > BLOG priority
  });

  it('prevents duplicate enqueuing of already queued URLs', () => {
    const queue = new CrawlQueue(3);
    const added1 = queue.enqueue('https://www.goatfundedtrader.com/model', 'https://www.goatfundedtrader.com/model', 'MODEL', 1);
    const added2 = queue.enqueue('https://www.goatfundedtrader.com/model', 'https://www.goatfundedtrader.com/model', 'MODEL', 1);
    expect(added1).toBe(true);
    expect(added2).toBe(false);
  });
});
