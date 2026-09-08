import { describe, it, expect } from 'vitest';
import { normalizeUrl, isAllowedDomain } from '../src/core/crawler/urlUtils.ts';
import { CrawlQueue } from '../src/core/crawler/queue.ts';
import { fetchPage } from '../src/core/crawler/crawlerCLI.ts';
import { detectRuleConflicts, extractRawStatements, buildReviewQueue, sourceRank } from '../src/core/pipeline/ruleExtractor.ts';
import { validateAllFirms } from '../src/core/validation/validate.ts';
import { findDuplicateIds, getCanonicalStats, getTrustStateForRule } from '../src/core/canonical/store.ts';
import { searchAll } from '../src/core/search/search.ts';
import { matchesFilters } from '../src/core/filters/filters.ts';
import { scoreAccountFit } from '../src/core/compare/compare.ts';
import { PROP_FIRMS_DATA } from '../src/data/propFirmsData.ts';

describe('Canonical & validation', () => {
  it('has no duplicate canonical IDs', () => {
    expect(findDuplicateIds()).toEqual([]);
  });
  it('validates all canonical firms', () => {
    const { valid, issues } = validateAllFirms(PROP_FIRMS_DATA);
    expect(issues).toEqual([]);
    expect(valid).toBe(true);
  });
  it('derives stats from real data', () => {
    const s = getCanonicalStats();
    expect(s.firms).toBe(PROP_FIRMS_DATA.length);
    expect(s.rules).toBeGreaterThan(0);
  });
  it('marks rules without sources as Unknown', () => {
    const st = getTrustStateForRule({ sources: [], lastVerified: '2026-09-06' } as never);
    expect(st).toBe('UNKNOWN');
  });
});

describe('Real crawler primitives', () => {
  it('rejects non-http schemes and enforces domain allowlist', () => {
    expect(normalizeUrl('ftp://example.com/x')).toBeNull();
    expect(isAllowedDomain('https://help.goatfundedtrader.com/a', ['goatfundedtrader.com'])).toBe(true);
    expect(isAllowedDomain('https://evil.com/a', ['goatfundedtrader.com'])).toBe(false);
  });
  it('queue prevents duplicates and respects depth', () => {
    const q = new CrawlQueue(1);
    expect(q.enqueue('https://a.com/1', 'https://a.com/1', 'HOME', 0)).toBe(true);
    expect(q.enqueue('https://a.com/1', 'https://a.com/1', 'HOME', 0)).toBe(false);
    expect(q.enqueue('https://a.com/2', 'https://a.com/2', 'HOME', 5)).toBe(false);
  });
  it('fetchPage classifies errors instead of fake success', async () => {
    const r = await fetchPage('https://127.0.0.1:9/nope', { timeoutMs: 1500, maxRetries: 0 });
    expect(r.error).toBeTruthy();
    expect(r.hash).toMatch(/^[a-f0-9]{64}$/);
  }, 10000);
});

describe('Generic extraction & conflicts', () => {
  it('detects generic conflicts beyond two hardcoded ones', () => {
    const c = detectRuleConflicts([
      { topic: 'Max Loss', rawText: '8% max loss', sourceUrl: 'https://a', sourceTitle: 'A', sourceType: 'OFFICIAL' },
      { topic: 'Max Loss', rawText: '6% max loss', sourceUrl: 'https://b', sourceTitle: 'B', sourceType: 'OFFICIAL_SUPPORT' },
      { topic: 'Payout Split', rawText: '80% split', sourceUrl: 'https://a', sourceTitle: 'A', sourceType: 'OFFICIAL' },
      { topic: 'Payout Split', rawText: '90% split', sourceUrl: 'https://b', sourceTitle: 'B', sourceType: 'OFFICIAL_TERMS' },
    ]);
    expect(c.length).toBe(2);
    // terms outrank support
    expect(sourceRank('OFFICIAL_TERMS')).toBeLessThan(sourceRank('OFFICIAL_SUPPORT'));
  });
  it('extracts statements and flags ambiguous language for review', () => {
    const facts = extractRawStatements('https://a', 'A', 'Daily drawdown is 4% of balance. Payouts may be subject to review at our discretion.', 'OFFICIAL');
    expect(facts.length).toBeGreaterThan(0);
    const q = buildReviewQueue(facts, []);
    expect(q.length).toBeGreaterThan(0);
  });
});

describe('Search / filters / compare honesty', () => {
  it('returns alternatives instead of empty dead-end', () => {
    const { results, alternatives } = searchAll('zzz-no-such-firm-zzz');
    expect(results).toEqual([]);
    expect(alternatives.length).toBeGreaterThan(0);
  });
  it('never treats unknown EA as allowed', () => {
    const acc = { eaAllowed: undefined, newsTradingRule: 'Allowed', overnightHolding: true, weekendHolding: true, copyTradingAllowed: false, discountedPrice: 100, price: 100, nominalSize: 100000, drawdownType: 'static', profitSplit: 80, sources: [] };
    expect(matchesFilters(acc as never, { ea: 'allowed' }).pass).toBe(false);
    expect(matchesFilters(acc as never, { ea: 'unknown' }).pass).toBe(true);
  });
  it('scores fit with warnings and never claims universal best', () => {
    const firm = PROP_FIRMS_DATA[0];
    const account = firm.programs[0]!.accounts[0]!;
    const fit = scoreAccountFit(firm, account, { needEA: true, maxPrice: 100 });
    expect(fit.score).toBeGreaterThanOrEqual(0);
    expect(fit.warnings.length).toBeGreaterThan(0);
  });
});
