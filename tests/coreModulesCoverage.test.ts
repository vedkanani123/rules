import { describe, expect, it, vi } from 'vitest';
import {
  getCanonicalFirms,
  getFirmBySlug,
  getAccountById,
  getProgramBySlug,
  getAllCanonicalAccounts,
  getDirectoryFirms,
  findDuplicateIds,
  displayPrice,
  getCanonicalStats,
  getTrustStateForRule,
} from '../src/core/canonical/store.ts';
import { scoreAccountFit, labelForFit, AFFILIATE_DISCLOSURE } from '../src/core/compare/compare.ts';
import { newsStateOf, boolStateOf, matchesFilters } from '../src/core/filters/filters.ts';
import { detectIntents, searchAll } from '../src/core/search/search.ts';
import {
  validateEvidence,
  validateRule,
  validateAccount,
  validateFirm,
  validateAllFirms,
  validateSnapshot,
} from '../src/core/validation/validate.ts';
import { normalizeUrl, classifyUrl, isAllowedDomain, getUrlCrawlPriority } from '../src/core/crawler/urlUtils.ts';
import { CrawlQueue } from '../src/core/crawler/queue.ts';
import { GOAT_FIRM_CONFIG, createFirmConfig } from '../src/core/crawler/domainConfig.ts';
import {
  sourceRank,
  calculateEasyToMissRisk,
  evaluateRuleImportance,
  detectRuleConflicts,
  extractRawStatements,
  buildReviewQueue,
  assignConfidence,
  evidenceForVerification,
} from '../src/core/pipeline/ruleExtractor.ts';
import { detectRuleChanges } from '../src/core/pipeline/changeDetector.ts';
import { ruleAppliesToProgram, buildParameterRules } from '../src/core/pipeline/parameterRules.ts';
import {
  getCanonicalCompareSlug,
  CURATED_COMPARISONS,
  getComparisonPairData,
} from '../src/core/seo/comparisonData.ts';
import {
  roundCurrency,
  calculateDailyLossFloor,
  calculateMaxLossFloor,
  calculateProfitTarget,
  calculateProfitSplit,
  simulateAccountState,
  calculateAllInCost,
  checkPayoutEligibility,
  describeAssumptions,
  toPublicEligibility,
  calculateConsistencyImpact,
} from '../src/core/calculator/engine.ts';
import {
  ATTRIBUTE_PAGES,
} from '../src/core/seo/attributePagesData.ts';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateFirmSchema,
  generateRuleArticleSchema,
  generateItemListSchema,
} from '../src/core/seo/schemaGenerator.ts';
import { ALL_SEO_ROUTES, getRouteSEOData } from '../src/core/seo/routesRegistry.ts';
import {
  getFirmCategoriesWithCounts as getAllFirmsCategoriesWithCounts,
  getFirmModelsByCategory as getAllFirmsModelsByCategory,
  getFirmModelById as getAllFirmsModelById,
  getFirmAllPricingForModel as getAllFirmsPricingForModel,
  getFirmWarningsForModel,
  getFirmReviewsForModel,
  getFirmChangeHistoryForModel,
} from '../src/data/allFirmsSelectors.ts';
import {
  getFirmCategoriesWithCounts,
  getFirmModelsByCategory,
  getFirmModelById,
  getFirmAllPricingForModel,
  getFirmRulesForModel,
  getFirmDecisionRecommendations,
} from '../src/data/firmSelectors.ts';
import {
  getCategoriesWithCounts,
  getModelsByCategory,
  getModelById,
  getPricingForModel,
  getAllPricingForModel,
  getRulesForModel,
  getWarningsForModel,
  getChangeHistoryForModel,
  getReviewsForModel,
  getAllDecisionRecommendations,
  getAllFuturesModels,
  calculateSuitability,
  runModelRiskSimulation,
} from '../src/data/goatSelectors.ts';
import { GFT_CANONICAL_MODELS, GFT_CANONICAL_RULES } from '../src/data/goatCanonicalData.ts';
import { fetchPage, runCrawler } from '../src/core/crawler/crawlerCLI.ts';
import { getStatusBadgeInfo, buildCanonicalSelectedRules } from '../src/data/goatCanonicalContext.ts';
import {
  calculatePercentageAmount,
  calculateBreachFloor,
  calculateProfitTargetAmount,
  calculateDailyLossAmount,
  calculateFloatingLossAmount,
  calculatePayoutAmount,
  calculateScalingAmount,
  formatCurrency,
  buildPhaseAwareRuleTable,
  validateModelPhaseRules,
} from '../src/data/goatPhaseAwareRules.ts';
import {
  CANONICAL_FIRMS_REGISTRY,
  normalizeFirmSlug as normalizeRegistrySlug,
  getOrCreateFirmCanonicalProfile,
} from '../src/data/firmsCanonicalRegistry.ts';
import {
  ALL_FIRMS_CANONICAL_DATA,
  normalizeFirmSlug as normalizeCanonicalSlug,
  getFirmCanonicalProfile,
} from '../src/data/allFirmsCanonicalData.ts';
import { getFirmLogoUrl, getCountryFlag, FIRM_COUNTRIES } from '../src/utils/firmLogos.ts';
import { trackEvent, trackConversion, trackOutboundClick } from '../src/utils/analytics.ts';
import type { Rule, AccountTier, PropFirm } from '../src/types/schema.ts';

describe('Canonical Store (src/core/canonical/store.ts)', () => {
  it('retrieves canonical firms, accounts, programs, and stats', () => {
    const firms = getCanonicalFirms();
    expect(firms.length).toBeGreaterThan(0);

    const ftmo = getFirmBySlug('ftmo');
    expect(ftmo).toBeDefined();
    expect(getFirmBySlug('nonexistent-slug')).toBeUndefined();

    if (ftmo) {
      const firstProg = ftmo.programs[0];
      expect(getProgramBySlug(ftmo, firstProg.slug)).toBeDefined();
      expect(getProgramBySlug(ftmo, 'nonexistent-prog')).toBeUndefined();

      const firstAcc = firstProg.accounts[0];
      expect(getAccountById(ftmo, firstAcc.id)).toBeDefined();
      expect(getAccountById(ftmo, 'nonexistent-acc')).toBeUndefined();
    }

    const allAccounts = getAllCanonicalAccounts();
    expect(allAccounts.length).toBeGreaterThan(10);

    const directoryFirms = getDirectoryFirms();
    expect(directoryFirms.length).toBeGreaterThan(0);
    expect(directoryFirms[0].verificationState).toBe('UNKNOWN');

    const dups = findDuplicateIds();
    expect(Array.isArray(dups)).toBe(true);

    expect(displayPrice({ price: 500, priceUnknown: true })).toBe('Unknown');
    expect(displayPrice({ price: 500, discountedPrice: 400 })).toBe('$400');
    expect(displayPrice({ price: 500 })).toBe('$500');

    const stats = getCanonicalStats();
    expect(stats.firms).toBe(firms.length);
    expect(stats.tiers).toBeGreaterThan(0);
    expect(stats.rules).toBeGreaterThan(0);
  });

  it('evaluates getTrustStateForRule across all branches', () => {
    const recentDate = new Date().toISOString().slice(0, 10);
    const baseRule: Rule = {
      id: 'r1',
      category: 'RISK',
      name: 'Test Rule',
      slug: 'test-rule',
      headlineValue: '5%',
      stageScope: 'ALL',
      importance: 'HIGH',
      importanceReason: 'reason',
      visibilityScore: 1,
      impactScore: 80,
      easyToMissRisk: 80,
      isEasyToMiss: false,
      officialWording: 'wording',
      plainEnglish: 'plain',
      howTradersViolate: 'violate',
      primaryRiskRating: 'HIGH',
      sources: [],
      lastVerified: recentDate,
    };

    expect(getTrustStateForRule({ ...baseRule, sources: [] })).toBe('UNKNOWN');
    expect(
      getTrustStateForRule({
        ...baseRule,
        sources: [
          {
            id: 's1',
            sourceUrl: 'https://example.com',
            sourceTitle: 'T',
            sourceType: 'OFFICIAL',
            sourceExcerpt: 'E',
            retrievedAt: recentDate,
            confidence: 'A',
            verificationStatus: 'CONFLICTING',
          },
        ],
      })
    ).toBe('CONFLICTING');

    expect(
      getTrustStateForRule({
        ...baseRule,
        lastVerified: '2020-01-01',
        sources: [
          {
            id: 's1',
            sourceUrl: 'https://example.com',
            sourceTitle: 'T',
            sourceType: 'OFFICIAL',
            sourceExcerpt: 'E',
            retrievedAt: '2020-01-01',
            confidence: 'A',
            verificationStatus: 'VERIFIED',
          },
        ],
      })
    ).toBe('OUTDATED');

    expect(
      getTrustStateForRule({
        ...baseRule,
        lastVerified: 'invalid-date',
        sources: [
          {
            id: 's1',
            sourceUrl: 'https://example.com',
            sourceTitle: 'T',
            sourceType: 'OFFICIAL',
            sourceExcerpt: 'E',
            retrievedAt: recentDate,
            confidence: 'A',
            verificationStatus: 'VERIFIED',
          },
        ],
      })
    ).toBe('OUTDATED');

    expect(
      getTrustStateForRule({
        ...baseRule,
        sources: [
          {
            id: 's1',
            sourceUrl: 'https://example.com',
            sourceTitle: 'T',
            sourceType: 'OFFICIAL',
            sourceExcerpt: 'E',
            retrievedAt: recentDate,
            confidence: 'A',
            verificationStatus: 'VERIFIED',
          },
        ],
      })
    ).toBe('VERIFIED');

    expect(
      getTrustStateForRule({
        ...baseRule,
        sources: [
          {
            id: 's1',
            sourceUrl: 'https://example.com',
            sourceTitle: 'T',
            sourceType: 'OFFICIAL',
            sourceExcerpt: 'E',
            retrievedAt: recentDate,
            confidence: 'B',
            verificationStatus: 'PARTIALLY_VERIFIED',
          },
        ],
      })
    ).toBe('PARTIALLY_VERIFIED');

    expect(
      getTrustStateForRule({
        ...baseRule,
        sources: [
          {
            id: 's1',
            sourceUrl: 'https://example.com',
            sourceTitle: 'T',
            sourceType: 'OFFICIAL',
            sourceExcerpt: 'E',
            retrievedAt: recentDate,
            confidence: 'C',
            verificationStatus: 'UNVERIFIED',
          },
        ],
      })
    ).toBe('NEEDS_REVIEW');
  });
});

describe('Comparison & Fit Scoring (src/core/compare/compare.ts)', () => {
  it('scores account fit across all trader requirements and edge cases', () => {
    const ftmo = getFirmBySlug('ftmo')!;
    const acc = ftmo.programs[0].accounts[0];

    const scoreHigh = scoreAccountFit(
      ftmo,
      {
        ...acc,
        newsTradingRule: 'Allowed',
        overnightHolding: true,
        weekendHolding: true,
        eaAllowed: true,
        price: 400,
        discountedPrice: 350,
        priceUnknown: false,
        consistencyRule: 'None',
        refundableFee: true,
        sources: [
          {
            id: 's1',
            sourceUrl: 'https://ftmo.com',
            sourceTitle: 'T',
            sourceType: 'OFFICIAL',
            sourceExcerpt: 'E',
            retrievedAt: '2026-09-01',
            confidence: 'A',
            verificationStatus: 'VERIFIED',
          },
        ],
      },
      {
        needNews: 'allowed',
        needOvernight: true,
        needWeekend: true,
        needEA: true,
        maxPrice: 500,
        needNoConsistency: true,
      }
    );
    expect(scoreHigh.score).toBeGreaterThan(80);
    expect(scoreHigh.evidenceQuality).toBe('high');

    const emptyFirm: PropFirm = { ...ftmo, rules: [] };
    const scoreLow = scoreAccountFit(
      emptyFirm,
      {
        ...acc,
        newsTradingRule: 'Prohibited',
        overnightHolding: false,
        weekendHolding: false,
        eaAllowed: false,
        price: 900,
        discountedPrice: undefined,
        priceUnknown: false,
        consistencyRule: '30% daily cap',
        refundableFee: false,
        sources: [],
      },
      {
        needNews: 'allowed',
        needOvernight: true,
        needWeekend: true,
        needEA: true,
        maxPrice: 500,
        needNoConsistency: true,
      }
    );
    expect(scoreLow.score).toBeLessThan(30);
    expect(scoreLow.evidenceQuality).toBe('low');

    const scoreRestricted = scoreAccountFit(
      ftmo,
      {
        ...acc,
        newsTradingRule: 'Restricted',
        priceUnknown: true,
        sources: [],
      },
      {
        needNews: 'allowed',
        maxPrice: 500,
      }
    );
    expect(scoreRestricted.evidenceQuality).toBe('medium');
    expect(scoreRestricted.warnings.some((w) => w.includes('Price not publicly verified'))).toBe(true);

    expect(labelForFit(85, 'Swing Trading')).toContain('85/100');
    expect(AFFILIATE_DISCLOSURE).toContain('Rankings use verified rule data only');
  });
});

describe('Account Filters (src/core/filters/filters.ts)', () => {
  it('evaluates newsStateOf, boolStateOf, and matchesFilters across all filter reasons', () => {
    const ftmo = getFirmBySlug('ftmo')!;
    const baseAcc: AccountTier = {
      ...ftmo.programs[0].accounts[0],
      price: 500,
      discountedPrice: undefined,
      priceUnknown: false,
      nominalSize: 100000,
      drawdownType: 'static',
      newsTradingRule: 'Allowed',
      overnightHolding: true,
      weekendHolding: false,
      eaAllowed: true,
      copyTradingAllowed: false,
      profitSplit: 80,
      sources: [],
    };

    expect(newsStateOf({ ...baseAcc, newsTradingRule: 'Allowed' })).toBe('allowed');
    expect(newsStateOf({ ...baseAcc, newsTradingRule: 'Prohibited' })).toBe('prohibited');
    expect(newsStateOf({ ...baseAcc, newsTradingRule: 'Restricted' })).toBe('conditional');

    expect(boolStateOf(true)).toBe('allowed');
    expect(boolStateOf(false)).toBe('prohibited');
    expect(boolStateOf(undefined)).toBe('unknown');

    expect(matchesFilters(baseAcc, { maxPrice: 300 })).toEqual({ pass: false, excludedReason: 'price' });
    expect(matchesFilters(baseAcc, { minSize: 200000 })).toEqual({ pass: false, excludedReason: 'size' });
    expect(matchesFilters(baseAcc, { drawdownType: 'trailing_equity' })).toEqual({ pass: false, excludedReason: 'drawdownType' });
    expect(matchesFilters(baseAcc, { news: 'prohibited' })).toEqual({ pass: false, excludedReason: 'news' });
    expect(matchesFilters(baseAcc, { overnight: 'prohibited' })).toEqual({ pass: false, excludedReason: 'overnight' });
    expect(matchesFilters(baseAcc, { weekend: 'allowed' })).toEqual({ pass: false, excludedReason: 'weekend' });
    expect(matchesFilters(baseAcc, { ea: 'prohibited' })).toEqual({ pass: false, excludedReason: 'ea' });
    expect(matchesFilters(baseAcc, { copyTrading: 'allowed' })).toEqual({ pass: false, excludedReason: 'copy' });
    expect(matchesFilters(baseAcc, { minSplit: 90 })).toEqual({ pass: false, excludedReason: 'split' });
    expect(matchesFilters(baseAcc, { verificationOnly: true })).toEqual({ pass: false, excludedReason: 'verification' });
    expect(matchesFilters(baseAcc, { maxPrice: 600, minSize: 50000, drawdownType: 'static', news: 'allowed', ea: 'allowed' })).toEqual({ pass: true });
  });
});

describe('Search Engine (src/core/search/search.ts)', () => {
  it('detects intents and searches across firms, accounts, rules, sizes, prices, and fallbacks', () => {
    expect(searchAll('   ').results).toHaveLength(0);

    const intents = detectIntents('news overnight weekend ea copy consistency trailing instant payout min day inactive under $500');
    expect(intents).toContain('news');
    expect(intents).toContain('overnight');
    expect(intents).toContain('weekend');
    expect(intents).toContain('ea');
    expect(intents).toContain('copy');
    expect(intents).toContain('consistency');
    expect(intents).toContain('trailing');
    expect(intents).toContain('instant');
    expect(intents).toContain('payout');
    expect(intents).toContain('minimum trading days');
    expect(intents).toContain('inactivity');
    expect(intents).toContain('price');

    expect(searchAll('ftmo').results.length).toBeGreaterThan(0);
    expect(searchAll('100k').results.length).toBeGreaterThan(0);
    expect(searchAll('under $500').results.length).toBeGreaterThan(0);
    expect(searchAll('ea allow').results).toBeDefined();
    expect(searchAll('news trading').results.length).toBeGreaterThan(0);

    const noMatch = searchAll('zzzz_nonexistent_query_xyz');
    expect(noMatch.results).toHaveLength(0);
    expect(noMatch.alternatives.length).toBeGreaterThan(0);
  });
});

describe('Runtime Validation (src/core/validation/validate.ts)', () => {
  it('validates canonical firms and catches invalid evidence, rules, accounts, firms, and snapshots', () => {
    const firms = getCanonicalFirms();
    const res = validateAllFirms(firms.slice(0, 3));
    expect(res).toBeDefined();

    const badEvIssues = validateEvidence(
      {
        id: '',
        sourceUrl: 'ftp://bad-url',
        sourceTitle: '',
        sourceType: 'OFFICIAL',
        sourceExcerpt: '',
        retrievedAt: 'not-a-date',
        confidence: 'Z' as any,
        verificationStatus: 'BAD' as any,
      },
      'ev'
    );
    expect(badEvIssues.length).toBeGreaterThanOrEqual(7);

    const badRuleIssues = validateRule(
      {
        id: '',
        category: 'RISK',
        name: '',
        slug: '',
        headlineValue: '',
        stageScope: 'ALL',
        importance: 'HIGH',
        importanceReason: '',
        visibilityScore: 9,
        impactScore: 150,
        easyToMissRisk: 100,
        isEasyToMiss: false,
        officialWording: '',
        plainEnglish: '',
        howTradersViolate: '',
        primaryRiskRating: 'HIGH',
        sources: [],
        lastVerified: 'bad-date',
      },
      'rule'
    );
    expect(badRuleIssues.length).toBeGreaterThanOrEqual(10);

    const badAccIssues = validateAccount(
      {
        id: '',
        programId: '',
        name: 'Bad',
        nominalSize: -100,
        price: -10,
        currency: 'USD',
        dailyLossLimit: 150,
        dailyLossCalculation: 'balance',
        maxTotalLoss: -5,
        drawdownType: 'static',
        profitTargetPhase1: 200,
        minimumTradingDays: 0,
        maximumTradingDays: 'Unlimited',
        payoutFrequency: '14d',
        firstPayoutConditions: 'none',
        profitSplit: 120,
        refundableFee: false,
        inactivityLimitDays: 30,
        leverage: '',
        instruments: [],
        platforms: [],
        weekendHolding: false,
        overnightHolding: false,
        newsTradingRule: 'Allowed',
        newsTradingDetail: '',
        eaAllowed: false,
        copyTradingAllowed: false,
        hedgingAllowed: false,
        reverseTradingAllowed: false,
        lastVerified: '2026-09-01',
        rules: [],
        sources: [],
      },
      'acc'
    );
    expect(badAccIssues.length).toBeGreaterThanOrEqual(8);

    const badFirmIssues = validateFirm({
      id: '',
      name: '',
      slug: '',
      website: 'invalid',
      country: 'US',
      headquarters: 'NY',
      foundedYear: 2020,
      status: 'ACTIVE',
      confidenceRating: 'A',
      lastVerified: 'bad-date',
      tagline: '',
      summary: '',
      platforms: [],
      instruments: [],
      programs: [],
      rules: [],
      ruleChanges: [],
      traps: [],
      disputes: [],
      sources: [],
    });
    expect(badFirmIssues.length).toBeGreaterThanOrEqual(6);

    const snapIssues = validateSnapshot({
      url: 'not-a-url',
      normalizedUrl: 'not-a-url',
      category: 'HOME',
      httpStatus: 999,
      title: 'T',
      contentHash: '',
      crawledAt: 'bad-date',
      depth: 0,
      linksFound: 0,
    });
    expect(snapIssues).toHaveLength(4);
  });
});

describe('Crawler Utilities, Queue & Domain Config', () => {
  it('normalizes, classifies, checks allowed domains, and prioritizes URLs', () => {
    expect(normalizeUrl('https://WWW.Example.com:443/path/?utm_source=x&b=2&a=1#frag')).toBe(
      'https://www.example.com/path?a=1&b=2'
    );
    expect(normalizeUrl('http://example.com:80/')).toBe('http://example.com/');
    expect(normalizeUrl('/rules/', 'https://ftmo.com')).toBe('https://ftmo.com/rules');
    expect(normalizeUrl('mailto:test@example.com')).toBeNull();
    expect(normalizeUrl(':::bad-url:::')).toBeNull();

    const domain = 'goatfundedtrader.com';
    expect(classifyUrl('https://www.goatfundedtrader.com/', domain)).toBe('HOME');
    expect(classifyUrl('https://www.goatfundedtrader.com/how-it-works', domain)).toBe('PRODUCT');
    expect(classifyUrl('https://www.goatfundedtrader.com/models', domain)).toBe('MODEL');
    expect(classifyUrl('https://www.goatfundedtrader.com/pricing', domain)).toBe('PRICING');
    expect(classifyUrl('https://www.goatfundedtrader.com/account-types', domain)).toBe('ACCOUNT');
    expect(classifyUrl('https://www.goatfundedtrader.com/trading-rules', domain)).toBe('RULES');
    expect(classifyUrl('https://help.goatfundedtrader.com/en/articles', domain)).toBe('FAQ');
    expect(classifyUrl('https://www.goatfundedtrader.com/payouts', domain)).toBe('PAYOUT');
    expect(classifyUrl('https://www.goatfundedtrader.com/trading-competition', domain)).toBe('TRADING');
    expect(classifyUrl('https://www.goatfundedtrader.com/platform-mt5', domain)).toBe('PLATFORM');
    expect(classifyUrl('https://www.goatfundedtrader.com/about-us', domain)).toBe('ABOUT');
    expect(classifyUrl('https://www.goatfundedtrader.com/blog/post', domain)).toBe('BLOG');
    expect(classifyUrl('https://www.goatfundedtrader.com/news-update', domain)).toBe('ANNOUNCEMENT');
    expect(classifyUrl('https://www.goatfundedtrader.com/complaints-policy', domain)).toBe('COMPLAINTS');
    expect(classifyUrl('https://www.goatfundedtrader.com/refund-policy', domain)).toBe('REFUND');
    expect(classifyUrl('https://www.goatfundedtrader.com/privacy-policy', domain)).toBe('PRIVACY');
    expect(classifyUrl('https://www.goatfundedtrader.com/risk-disclaimer', domain)).toBe('DISCLAIMER');
    expect(classifyUrl('https://www.goatfundedtrader.com/terms-and-conditions', domain)).toBe('TERMS');
    expect(classifyUrl('https://www.goatfundedtrader.com/contact', domain)).toBe('CONTACT');
    expect(classifyUrl('https://www.goatfundedtrader.com/affiliate', domain)).toBe('AFFILIATE');
    expect(classifyUrl('https://www.goatfundedtrader.com/reviews', domain)).toBe('REVIEW');
    expect(classifyUrl('https://www.goatfundedtrader.com/random-xyz', domain)).toBe('UNKNOWN');
    expect(classifyUrl('https://trustpilot.com/review/goatfundedtrader.com', domain)).toBe('REVIEW');
    expect(classifyUrl('https://twitter.com/goatfunded', domain)).toBe('SOCIAL');
    expect(classifyUrl('https://otherdomain.com/page', domain)).toBe('EXTERNAL');
    expect(classifyUrl(':::bad:::', domain)).toBe('UNKNOWN');

    expect(isAllowedDomain('https://help.ftmo.com/faq', ['ftmo.com'])).toBe(true);
    expect(isAllowedDomain('https://evil.com', ['ftmo.com'])).toBe(false);
    expect(isAllowedDomain('bad-url', ['ftmo.com'])).toBe(false);

    const categories = [
      'HOME', 'RULES', 'MODEL', 'FAQ', 'HELP', 'PAYOUT', 'PRICING',
      'TERMS', 'COMPLAINTS', 'REFUND', 'DISCLAIMER', 'ACCOUNT',
      'PLATFORM', 'ABOUT', 'PRODUCT', 'BLOG', 'AFFILIATE', 'UNKNOWN',
    ] as const;
    for (const c of categories) {
      expect(getUrlCrawlPriority(c as any)).toBeGreaterThan(0);
    }
  });

  it('manages CrawlQueue lifecycle and FirmCrawlerConfig', () => {
    const q = new CrawlQueue(2);
    expect(q.enqueue('https://a.com/blog', 'https://a.com/blog', 'BLOG', 1)).toBe(true);
    expect(q.enqueue('https://a.com/rules', 'https://a.com/rules', 'RULES', 1)).toBe(true);
    expect(q.enqueue('https://a.com/rules', 'https://a.com/rules', 'RULES', 1)).toBe(false);
    expect(q.enqueue('https://a.com/deep', 'https://a.com/deep', 'HOME', 5)).toBe(false);

    const next = q.getNextItem();
    expect(next?.normalizedUrl).toBe('https://a.com/rules');
    q.markCompleted('https://a.com/rules', 'hash-1');
    expect(q.isContentDuplicate('hash-1')).toBe(true);

    const blogItem = q.getNextItem()!;
    expect(blogItem.normalizedUrl).toBe('https://a.com/blog');
    q.markFailed('https://a.com/blog', 'Timeout 1');
    q.getNextItem();
    q.markFailed('https://a.com/blog', 'Timeout 2');
    q.getNextItem();
    q.markFailed('https://a.com/blog', 'Timeout 3');

    const stats = q.getStats();
    expect(stats.completed).toBe(1);
    expect(stats.failed).toBe(1);
    expect(q.getAllItems()).toHaveLength(2);

    expect(GOAT_FIRM_CONFIG.firmId).toBe('goat-funded-trader');
    const customCfg = createFirmConfig('Alpha Capital', 'https://www.alphacapital.uk/start');
    expect(customCfg.firmId).toBe('alpha-capital');
    expect(customCfg.primaryDomain).toBe('alphacapital.uk');
  });
});

describe('Pipeline Modules (ruleExtractor, changeDetector, parameterRules)', () => {
  it('extracts statements, detects conflicts, builds review queue, and assigns confidence', () => {
    expect(sourceRank('OFFICIAL_TERMS')).toBe(0);
    expect(sourceRank('UNKNOWN_TYPE' as any)).toBe(99);

    expect(calculateEasyToMissRisk(4, 80).severity).toBe('CRITICAL');
    expect(calculateEasyToMissRisk(3, 70).severity).toBe('HIGH');
    expect(calculateEasyToMissRisk(2, 60).severity).toBe('MEDIUM');
    expect(calculateEasyToMissRisk(1, 50).severity).toBe('LOW');

    expect(evaluateRuleImportance('RISK', 'Daily Drawdown Limit').importance).toBe('CRITICAL');
    expect(evaluateRuleImportance('PAYOUT', 'Payout Split & News').importance).toBe('HIGH');
    expect(evaluateRuleImportance('EVALUATION', 'Consistency & Minimum Trading Days').importance).toBe('MEDIUM');
    expect(evaluateRuleImportance('COMMERCIAL', 'Platform Fee').importance).toBe('LOW');

    const text = [
      'The maximum daily drawdown limit is strictly 5% of starting balance per trading day.',
      'News trading is prohibited within 2 minutes of high-impact macroeconomic releases.',
      'Payouts are processed bi-weekly and may be subject to consistency review at our discretion.',
      'Traders must complete a minimum trading day count of 4 days before passing.',
      'Inactivity for 30 days will result in automatic deactivation of the trading account.',
      'Copy trading between own accounts is permitted, and Expert Advisor usage is allowed.',
      'Consistency rule requires no single day to exceed 30% of total profit.',
    ].join(' ');

    const facts = extractRawStatements('https://firm.com/rules', 'Rules', text, 'OFFICIAL_TERMS');
    expect(facts.length).toBeGreaterThanOrEqual(6);

    const conflictingFacts = [
      ...facts,
      {
        topic: 'News Trading',
        rawText: 'News trading is 100% allowed without any buffer during all stages.',
        sourceUrl: 'https://firm.com/faq',
        sourceTitle: 'FAQ',
        sourceType: 'OFFICIAL_SUPPORT' as const,
      },
    ];
    const conflicts = detectRuleConflicts(conflictingFacts);
    expect(conflicts.length).toBe(1);

    const queue = buildReviewQueue(conflictingFacts, conflicts);
    expect(queue.length).toBeGreaterThanOrEqual(2);

    expect(assignConfidence('OFFICIAL_TERMS', true)).toBe('A');
    expect(assignConfidence('OFFICIAL_TERMS', false)).toBe('B');
    expect(assignConfidence('OFFICIAL_SUPPORT', false)).toBe('B');
    expect(assignConfidence('FIRM_RESPONSE', false)).toBe('B');
    expect(assignConfidence('REVIEW_PLATFORM', false)).toBe('C');
    expect(assignConfidence('TRADER_REPORT', false)).toBe('D');
    expect(assignConfidence('UNVERIFIED', false)).toBe('E');

    const ev = evidenceForVerification('id-1', 'https://firm.com', 'Title', 'Excerpt', 'OFFICIAL', '2026-09-01');
    expect(ev.verificationStatus).toBe('PARTIALLY_VERIFIED');
  });

  it('detects rule changes (ADDED, MODIFIED, REMOVED) and builds parameter rules', () => {
    const ftmo = getFirmBySlug('ftmo')!;
    const r1 = ftmo.rules[0];
    const r2 = ftmo.rules[1];

    const prev = [r1, r2];
    const curr = [
      { ...r1, headlineValue: '99% Changed Value' },
      { ...r2, id: 'brand-new-rule-id', name: 'New Rule' },
    ];
    const changes = detectRuleChanges('ftmo', 'FTMO', prev, curr);
    expect(changes.some((c) => c.changeType === 'MODIFIED')).toBe(true);
    expect(changes.some((c) => c.changeType === 'REMOVED')).toBe(true);
    expect(changes.some((c) => c.changeType === 'ADDED')).toBe(true);

    expect(ruleAppliesToProgram({ ...r1, accountModelScope: [] }, '2-Step', 'two-step')).toBe(true);
    expect(ruleAppliesToProgram({ ...r1, accountModelScope: ['2-Step'] }, '2-Step', 'two-step')).toBe(true);
    expect(ruleAppliesToProgram({ ...r1, accountModelScope: ['1-Step'] }, '2-Step', 'two-step')).toBe(false);

    const paramRules = buildParameterRules(ftmo);
    expect(paramRules.length).toBeGreaterThanOrEqual(8);

    const topstep = getFirmBySlug('topstep')!;
    const topstepRules = buildParameterRules(topstep);
    expect(topstepRules.length).toBeGreaterThanOrEqual(8);
  });
});

describe('Calculator Engine & SEO Modules', () => {
  it('runs deterministic calculator engine functions across all drawdown types and scenarios', () => {
    expect(roundCurrency(10.555)).toBe(10.56);
    expect(calculateDailyLossFloor(100000, 5)).toEqual({ floor: 95000, maxAllowedLossDollars: 5000 });

    expect(calculateMaxLossFloor(100000, 105000, 10, 'static').floor).toBe(90000);
    expect(calculateMaxLossFloor(100000, 105000, 10, 'trailing_equity').floor).toBe(95000);
    expect(calculateMaxLossFloor(100000, 115000, 10, 'trailing_balance').floor).toBe(100000);
    expect(calculateMaxLossFloor(100000, 106000, 10, 'end_of_day', { eodHighWater: 103000 }).floor).toBe(93000);

    expect(calculateProfitTarget(100000, 105000, 10)).toEqual({
      targetBalance: 110000,
      targetDollars: 10000,
      remainingDollars: 5000,
      percentProgress: 50,
    });

    expect(calculateProfitSplit(10000, 80)).toEqual({ traderShare: 8000, firmShare: 2000 });

    const safeSim = simulateAccountState({
      nominalSize: 100000,
      startingBalance: 100000,
      todayStartEquity: 100000,
      currentBalance: 101000,
      currentEquity: 101000,
      highWaterEquityToday: 101000,
      dailyLossLimitPct: 5,
      maxLossLimitPct: 10,
      drawdownType: 'static',
      tradeRiskPercent: 1,
    });
    expect(safeSim.overallStatus).toBe('SAFE');

    const warnSim = simulateAccountState({
      nominalSize: 100000,
      startingBalance: 100000,
      todayStartEquity: 100000,
      currentBalance: 96000,
      currentEquity: 96000,
      highWaterEquityToday: 100000,
      dailyLossLimitPct: 5,
      maxLossLimitPct: 10,
      drawdownType: 'static',
      tradeRiskPercent: 3.5,
    });
    expect(warnSim.overallStatus).toBe('WARNING');

    const breachSim = simulateAccountState({
      nominalSize: 100000,
      startingBalance: 100000,
      todayStartEquity: 100000,
      currentBalance: 89000,
      currentEquity: 89000,
      highWaterEquityToday: 100000,
      dailyLossLimitPct: 5,
      maxLossLimitPct: 10,
      drawdownType: 'static',
      tradeRiskPercent: 2,
    });
    expect(breachSim.overallStatus).toBe('BREACH');

    const cost = calculateAllInCost({
      challengeFee: 500,
      expectedResets: 1,
      resetFee: 400,
      activationFee: 100,
      dataFeeMonthly: 50,
      monthsToPayout: 2,
      addOnCost: 50,
      refundableOnFirstPayout: true,
    });
    expect(cost.totalPaidBeforePayout).toBe(1150);
    expect(cost.totalAfterRefund).toBe(650);

    const eligYes = checkPayoutEligibility({
      currentProfit: 5000,
      requiredProfitMinimum: 1000,
      winningDaysCount: 5,
      requiredWinningDays: 5,
      consistencyPct: 50,
      bestDayProfit: 1500,
      hasSafetyBufferRule: true,
      safetyBufferDollars: 2000,
      currentEquityDistanceToFloor: 4000,
      hasOpenPositions: false,
    });
    expect(eligYes.eligible).toBe('YES');

    const eligNo = checkPayoutEligibility({
      currentProfit: 500,
      requiredProfitMinimum: 1000,
      winningDaysCount: 2,
      requiredWinningDays: 5,
      consistencyPct: 30,
      bestDayProfit: 400,
      hasSafetyBufferRule: true,
      safetyBufferDollars: 2000,
      currentEquityDistanceToFloor: 500,
      hasOpenPositions: true,
    });
    expect(eligNo.eligible).toBe('NO');

    expect(describeAssumptions({ basis: 'balance', includesFloating: true, resetTime: '00:00', includesCosts: true, lastVerified: '2026-09-01', methodSpecified: false })).toEqual([
      'Calculation method not publicly specified.',
    ]);
    expect(describeAssumptions({ basis: 'balance', includesFloating: true, resetTime: '00:00', includesCosts: true, lastVerified: '2026-09-01', methodSpecified: true }).length).toBe(5);

    expect(toPublicEligibility('YES', true, false)).toBe('Conflicting rules');
    expect(toPublicEligibility('YES', false, true)).toBe('Insufficient information');
    expect(toPublicEligibility('YES', false, false)).toBe('Eligible');
    expect(toPublicEligibility('NO', false, false)).toBe('Not eligible');
    expect(toPublicEligibility('CONDITIONAL', false, false)).toBe('Potentially eligible');

    expect(calculateConsistencyImpact(2000, 1500, 50, 3000).breaches).toBe(true);
    expect(calculateConsistencyImpact(4000, 1000, 50, 3000).breaches).toBe(false);
  });

  it('exercises comparisonData, attributePagesData, schemaGenerator, pathAliases, and routesRegistry', () => {
    expect(getCanonicalCompareSlug('topstep', 'ftmo')).toBe('ftmo-vs-topstep');
    expect(CURATED_COMPARISONS.length).toBeGreaterThan(5);
    expect(getComparisonPairData('ftmo-vs-topstep')?.firmAName).toBe('FTMO');
    expect(getComparisonPairData('ftmo-vs-shark-funded')?.firmAName).toBe('FTMO');
    expect(getComparisonPairData('invalid-slug')).toBeNull();
    expect(getComparisonPairData('bad-vs-nonexistent')).toBeNull();

    const ftmo = getFirmBySlug('ftmo')!;
    expect(ATTRIBUTE_PAGES.length).toBeGreaterThan(5);
    for (const attr of ATTRIBUTE_PAGES) {
      expect(typeof attr.matcher(ftmo)).toBe('boolean');
    }

    expect(generateOrganizationSchema()['@type']).toBe('Organization');
    expect(generateWebSiteSchema()['@type']).toBe('WebSite');
    expect(generateBreadcrumbSchema([{ name: 'Home', url: '/' }])['@type']).toBe('BreadcrumbList');
    expect(generateFAQSchema([])).toBeNull();
    expect(generateFAQSchema([{ question: 'Q', answer: 'A' }])?.['@type']).toBe('FAQPage');
    expect(
      generateFirmSchema({
        name: 'FTMO',
        slug: 'ftmo',
        website: 'https://ftmo.com',
        country: 'CZ',
        headquarters: 'Prague',
        foundedYear: 2015,
      })['@type']
    ).toBe('FinancialProduct');
    expect(
      generateRuleArticleSchema({
        name: 'Daily Drawdown',
        slug: 'daily-drawdown',
        category: 'RISK',
        description: 'Desc',
        datePublished: '2026-01-01',
        dateModified: '2026-09-01',
      })['@type']
    ).toBe('TechArticle');
    expect(generateItemListSchema('List', [{ name: 'FTMO', url: '/prop-firms/ftmo' }])['@type']).toBe('ItemList');

    expect(ALL_SEO_ROUTES.length).toBeGreaterThan(20);
    expect(getRouteSEOData('/')?.pageType).toBe('core');
    expect(getRouteSEOData('/prop-firms/ftmo')?.pageType).toBe('firm');
    expect(getRouteSEOData('/compare/ftmo-vs-shark-funded')?.pageType).toBe('compare');
    const firstAcc = ftmo.programs[0].accounts[0];
    expect(getRouteSEOData(`/prop-firms/ftmo/accounts/${firstAcc.id}`)?.pageType).toBe('account');
    expect(getRouteSEOData('/prop-firms/ftmo/accounts/nonexistent')?.pageType).toBe('account');
    expect(getRouteSEOData('/totally-unknown-route')).toBeNull();
  });
});

describe('Data Selectors, Canonical Registries & Utils', () => {
  it('tests goatSelectors, goatCanonicalContext, and goatPhaseAwareRules', () => {
    expect(getCategoriesWithCounts().length).toBeGreaterThan(0);
    expect(getModelsByCategory('two_step').length).toBeGreaterThan(0);
    const model = getModelById('two_step_standard')!;
    expect(model).toBeDefined();
    expect(getPricingForModel(model.id, 100000)).toBeDefined();
    expect(getPricingForModel(model.id, 999999)).toBeDefined();
    expect(getAllPricingForModel(model.id).length).toBeGreaterThan(0);
    expect(getRulesForModel(model.id, 'all').length).toBeGreaterThan(0);
    expect(getRulesForModel(model.id, 'evaluation').length).toBeGreaterThan(0);
    expect(getWarningsForModel(model.id).length).toBeGreaterThan(0);
    expect(getChangeHistoryForModel(model.id).length).toBeGreaterThan(0);
    expect(Array.isArray(getReviewsForModel(model.id))).toBe(true);
    expect(Array.isArray(getReviewsForModel())).toBe(true);
    expect(getAllDecisionRecommendations().length).toBeGreaterThan(0);
    expect(getAllFuturesModels().length).toBeGreaterThan(0);

    const styles = [
      'conservative', 'news_trader', 'swing_trader', 'weekend_holder',
      'scalper', 'ea_trader', 'copy_trader', 'futures_trader', 'aggressive',
    ] as const;
    for (const m of GFT_CANONICAL_MODELS.slice(0, 5)) {
      for (const s of styles) {
        expect(calculateSuitability(m, s).score).toBeGreaterThan(0);
      }
    }

    const statuses = [
      'officially_verified', 'official_ambiguous', 'historical_rule',
      'conflicting_sources', 'third_party_report', 'community_reported',
      'unverified', 'not_applicable', 'not_available',
    ] as const;
    for (const st of statuses) {
      expect(getStatusBadgeInfo(st).label).toBeTruthy();
    }

    for (const m of GFT_CANONICAL_MODELS.slice(0, 6)) {
      const canonical = buildCanonicalSelectedRules(m, {
        category: m.category,
        modelId: m.id,
        accountSize: 100000,
        stage: 'all',
        platform: 'all',
        purchaseDate: '2026-09-01',
        termsVersion: 'current_2026',
        tradingStyle: 'conservative',
      });
      expect(canonical.allRuleItems.length).toBeGreaterThan(10);

      const simOut = runModelRiskSimulation({
        model: m,
        accountSize: 100000,
        startingBalance: 100000,
        currentEquity: 99000,
        currentFloatingLoss: 500,
        riskPerTradePct: 1,
        stopLossPips: 20,
        winRatePct: 55,
        riskRewardRatio: 2,
        simulatedTradesCount: 10,
        targetPayoutAmount: 2000,
        canonicalRules: canonical,
      });
      expect(simOut.summarySentence).toBeTruthy();
    }

    expect(calculatePercentageAmount(100000, 5)).toBe(5000);
    expect(calculateBreachFloor(100000, 10, 'static', 2000)).toBe(90000);
    expect(calculateBreachFloor(100000, 10, 'trailing_locked', 15000)).toBe(100000);
    expect(calculateBreachFloor(100000, 10, 'trailing_intraday', 3000)).toBe(93000);
    expect(calculateProfitTargetAmount(100000, 8)).toBe(8000);
    expect(calculateDailyLossAmount(100000, 4)).toBe(4000);
    expect(calculateFloatingLossAmount(100000, 1)).toBe(1000);
    expect(calculatePayoutAmount(5000, 80)).toBe(4000);
    expect(calculateScalingAmount(100000, 25)).toBe(125000);
    expect(formatCurrency(100000)).toBe('$100,000');

    const validationIssues = validateModelPhaseRules(GFT_CANONICAL_MODELS.slice(0, 4), 100000);
    expect(Array.isArray(validationIssues)).toBe(true);
  });

  it('tests allFirmsSelectors, firmSelectors, firmsCanonicalRegistry, allFirmsCanonicalData, firmLogos, and analytics', () => {
    const profile = getFirmCanonicalProfile('the-5ers');
    expect(profile.models.length).toBeGreaterThan(0);
    expect(getAllFirmsCategoriesWithCounts(profile.models).length).toBeGreaterThan(0);
    expect(getAllFirmsModelsByCategory(profile.models, 'two_step').length).toBeGreaterThan(0);
    expect(getAllFirmsModelById(profile.models, profile.models[0].id)).toBeDefined();
    expect(getAllFirmsPricingForModel(profile.pricingRegistry, profile.models[0].id).length).toBeGreaterThan(0);
    expect(getAllFirmsPricingForModel([], 'unknown-model').length).toBe(5);
    expect(getFirmWarningsForModel(profile.warnings, profile.models[0].id)).toBeDefined();
    expect(getFirmReviewsForModel(profile.reviews, profile.models[0].id)).toBeDefined();
    expect(getFirmChangeHistoryForModel(profile.changeHistory, profile.models[0].id).length).toBeGreaterThan(0);
    expect(getFirmChangeHistoryForModel([], 'any').length).toBe(2);

    const regFirm = CANONICAL_FIRMS_REGISTRY['ftmo'];
    expect(getFirmCategoriesWithCounts(regFirm).length).toBeGreaterThan(0);
    expect(getFirmModelsByCategory(regFirm, 'two_step').length).toBeGreaterThan(0);
    expect(getFirmModelById(regFirm, regFirm.models[0].id)).toBeDefined();
    expect(getFirmAllPricingForModel(regFirm.models[0]).length).toBeGreaterThan(0);
    expect(getFirmRulesForModel(regFirm.models[0], 100000, 'all').length).toBeGreaterThan(0);
    expect(getFirmRulesForModel(regFirm.models[0], 100000, 'evaluation').length).toBeGreaterThan(0);
    expect(getFirmDecisionRecommendations(regFirm).length).toBe(2);

    expect(normalizeRegistrySlug('the-5ers')).toBe('the-5-ers');
    expect(normalizeRegistrySlug('funded-next')).toBe('fundednext');
    expect(normalizeRegistrySlug('alpha-capital')).toBe('alpha-capital-group');
    expect(normalizeRegistrySlug('aqua-funded')).toBe('aquafunded');
    expect(normalizeRegistrySlug('blueguardian')).toBe('blue-guardian');
    expect(normalizeRegistrySlug('bright-funded')).toBe('brightfunded');
    expect(normalizeRegistrySlug('cryptofundtrader')).toBe('crypto-fund-trader');
    expect(normalizeRegistrySlug('atmos-funded')).toBe('atlas-funded');
    expect(getOrCreateFirmCanonicalProfile('unknown-new-firm').confidenceRating).toBe('A');

    expect(normalizeCanonicalSlug('the5ers')).toBe('the-5ers');
    expect(normalizeCanonicalSlug('funded-next')).toBe('fundednext');
    expect(normalizeCanonicalSlug('alpha-capital')).toBe('alpha-capital-group');
    expect(getFirmCanonicalProfile('unknown-new-firm').confidenceRating).toBe('A');
    expect(Object.keys(ALL_FIRMS_CANONICAL_DATA).length).toBeGreaterThan(5);

    for (const rule of GFT_CANONICAL_RULES) {
      expect(typeof rule.concreteExample(100000)).toBe('string');
      expect(rule.concreteExample(100000).length).toBeGreaterThan(10);
    }

    expect(getFirmLogoUrl('goat-funded-trader', 'Goat Funded Trader')).toBe('/goat-brand-logo.png');
    expect(getFirmLogoUrl('ftmo', 'FTMO')).toBe('/logos/ftmo.svg');
    expect(getFirmLogoUrl('the-5-ers', 'The5ers')).toBe('/logos/the-5ers.svg');
    expect(getFirmLogoUrl('funded-next', 'FundedNext')).toBe('/logos/fundednext.svg');
    expect(getFirmLogoUrl('atlas-funded', 'Atlas Funded')).toBe('/logos/atlas-funded.png');
    expect(getFirmLogoUrl('custom-slug', 'Custom Prop Firm')).toContain('data:image/svg+xml');
    expect(getCountryFlag('US')).toBe('https://flagcdn.com/w80/us.png');
    expect(getCountryFlag('ftmo')).toBe('https://flagcdn.com/w80/cz.png');
    expect(FIRM_COUNTRIES['ftmo'].code).toBe('CZ');

    const mockGtag = vi.fn();
    (globalThis as any).window = { dataLayer: [], gtag: mockGtag };
    trackEvent('test_event', { foo: 'bar' });
    trackConversion('conv_1', 100, 'USD');
    trackOutboundClick('FTMO', 'https://ftmo.com');
    expect((globalThis as any).window.dataLayer.length).toBe(3);
    expect(mockGtag).toHaveBeenCalledTimes(3);
  });

  it('exercises crawlerCLI fetchPage and runCrawler with mocked fetch', async () => {
    const origFetch = globalThis.fetch;
    try {
      globalThis.fetch = vi.fn(async (input: any) => {
        const url = String(input);
        if (url.includes('robots.txt')) {
          return {
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'text/plain' }),
            text: async () => 'User-agent: *\nDisallow: /wp-admin\nUser-agent: Googlebot\nDisallow: /private',
          } as any;
        }
        if (url.includes('sitemap.xml')) {
          return {
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/xml' }),
            text: async () => '<urlset><url><loc>https://example.com/terms</loc></url><url><loc>https://example.com/faq</loc></url></urlset>',
          } as any;
        }
        if (url.includes('/404')) {
          return {
            ok: false,
            status: 404,
            headers: new Headers({ 'content-type': 'text/html' }),
            text: async () => 'Not found',
          } as any;
        }
        if (url.includes('/doc.pdf')) {
          return {
            ok: true,
            status: 200,
            url,
            headers: new Headers({ 'content-type': 'application/pdf' }),
            text: async () => '%PDF',
          } as any;
        }
        if (url.includes('/throw')) {
          throw new Error('Network failure');
        }
        return {
          ok: true,
          status: 200,
          url,
          headers: new Headers({ 'content-type': 'text/html; charset=utf-8' }),
          text: async () =>
            '<html><head><title>Terms &amp; Rules</title><script>var a=1;</script><style>body{}</style></head><body><a href="/faq">FAQ</a><a href="https://external.com">Ext</a>Rules text</body></html>',
        } as any;
      });

      const okRes = await fetchPage('https://example.com/terms', { maxRetries: 0, timeoutMs: 1000 });
      expect(okRes.status).toBe(200);
      expect(okRes.title).toContain('Terms');
      expect(okRes.links.length).toBeGreaterThan(0);

      const err404 = await fetchPage('https://example.com/404', { maxRetries: 0, timeoutMs: 1000 });
      expect(err404.status).toBe(404);

      const pdfRes = await fetchPage('https://example.com/doc.pdf', { maxRetries: 0, timeoutMs: 1000 });
      expect(pdfRes.title).toBe('Non-HTML document');

      const netFail = await fetchPage('https://example.com/throw', { maxRetries: 0, timeoutMs: 1000 });
      expect(netFail.status).toBe(0);

      const dryRunSummary = await runCrawler('https://www.goatfundedtrader.com/', 2, {
        dryRun: true,
        rateLimitMs: 0,
      });
      expect(dryRunSummary.firmId).toBeDefined();

      const liveSummary = await runCrawler('https://example.com/', 3, {
        dryRun: false,
        rateLimitMs: 0,
        maxRetries: 0,
      });
      expect(liveSummary.totalCrawled).toBeGreaterThan(0);
    } finally {
      globalThis.fetch = origFetch;
    }
  });
});

