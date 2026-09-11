// Centralized Route and SEO Registry for FundedTradingRules.com
// Single source of truth for all metadata, canonicals, Schema graphs, and sitemap inclusion

import { PROP_FIRMS_DATA, RULE_GUIDES } from '../../data/propFirmsData.ts';
import { CURATED_COMPARISONS, ComparisonPair } from './comparisonData.ts';
import { ATTRIBUTE_PAGES, AttributePageConfig } from './attributePagesData.ts';
import {
  BASE_URL,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateBreadcrumbSchema,
  generateFirmSchema,
  generateRuleArticleSchema,
  generateFAQSchema,
  generateItemListSchema,
  BreadcrumbItem,
} from './schemaGenerator.ts';

export interface RouteSEOData {
  path: string;
  pageType: 'core' | 'firm' | 'rule' | 'compare' | 'attribute' | 'account' | 'legal';
  title: string;
  metaDescription: string;
  canonicalUrl: string;
  h1: string;
  lastmod: string;
  isIndexable: boolean;
  breadcrumbs: BreadcrumbItem[];
  schemaGraph: any[];
  keywords?: string;
}

// 1. Core Pages
const CORE_ROUTES: RouteSEOData[] = [
  {
    path: '/',
    pageType: 'core',
    title: 'Funded Rules: Best Funded Accounts & Prop Firm Trading Rules (2026)',
    metaDescription: 'Compare verified funded rules and prop firm trading rules. Real drawdown math, news buffers, consistency rules, and payout terms across 24+ firms.',
    canonicalUrl: `${BASE_URL}/`,
    h1: 'Funded Rules & Best Funded Accounts: Know Every Rule Before You Buy',
    keywords: 'best funded account, best funded accounts, funded rules, funded trading rules, prop firm trading rules, prop firm rules, compare funded accounts, prop firm comparison, trailing drawdown, static drawdown, funded account rules, ftmo rules',
    lastmod: '2026-09-10',
    isIndexable: true,
    breadcrumbs: [{ name: 'Home', url: '/' }],
    schemaGraph: [
      generateOrganizationSchema(),
      generateWebSiteSchema(),
      generateFAQSchema([
        {
          question: 'What are funded rules in prop trading?',
          answer: 'Funded rules are the operational risk guidelines, profit objectives, and contractual trading restrictions set by proprietary trading firms (prop firms) that traders must follow to pass evaluations and maintain funded accounts. Core funded rules include daily loss limits, maximum drawdown thresholds, news trading restrictions, consistency rules, and payout criteria.',
        },
        {
          question: 'What are the most common funded rules and prop firm restrictions?',
          answer: 'The most common funded rules include: (1) Daily Loss Limit (typically 3%–5%), (2) Maximum Trailing or Static Drawdown (typically 6%–10%), (3) Consistency Rules (limiting the percentage of profit earned on a single trading day), (4) News Trading Buffers (prohibiting execution ±2 minutes around red-folder releases), and (5) Minimum Trading Days requirements.',
        },
        {
          question: 'How do daily drawdown funded rules work in prop trading?',
          answer: 'Daily loss limits cap the maximum equity or balance decline allowed in a single server day (usually resetting at 00:00 server time). In balance-based models, the floor is calculated from the day-start balance. In equity-based models, intraday open profits can pull the daily loss floor upwards, meaning open trades that retrace can trigger a daily drawdown breach.',
        },
        {
          question: 'Why do traders fail funded rules?',
          answer: 'The vast majority of prop firm failures are caused by hidden rule mechanics rather than market analysis errors. Common pitfalls include trailing drawdown on unrealized floating profit peaks, violating the 80% margin utilization cap, entering or closing trades within the 2-minute news buffer, and failing to meet weekend flat-position requirements.',
        },
        {
          question: 'What is the difference between soft breach and hard breach funded rules?',
          answer: 'A hard breach (such as exceeding the daily loss limit or maximum overall drawdown) immediately liquidates all positions and closes the funded account. A soft breach (such as leaving a trade open over the weekend or a minor lot size breach) automatically closes the offending trade or cancels profits from that trade without terminating the challenge account.',
        },
      ]),
    ],
  },
  {
    path: '/prop-firms',
    pageType: 'core',
    title: 'Prop Firm Rules Directory & Index — 24+ Verified Trading Firms | FundedTradingRules.com',
    metaDescription: 'Browse 24+ prop trading firms with verified rules, daily drawdown models, profit targets, payout consistency rules, and official contract citations.',
    canonicalUrl: `${BASE_URL}/prop-firms`,
    h1: 'Best Funded Accounts & Prop Firm Rules Directory: 24+ Verified Firms',
    keywords: 'best funded accounts, prop trading firms, best prop firms, funded accounts directory, prop firm list 2026, prop firm reviews, prop firm rules comparison',
    lastmod: '2026-09-10',
    isIndexable: true,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Prop Firms', url: '/prop-firms' },
    ],
    schemaGraph: [
      generateOrganizationSchema(),
      generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Prop Firms', url: '/prop-firms' },
      ]),
      generateItemListSchema(
        'Top Evaluated Prop Trading Firms',
        PROP_FIRMS_DATA.map(f => ({ name: f.name, url: `/prop-firms/${f.slug}` }))
      ),
    ],
  },
  {
    path: '/rules',
    pageType: 'core',
    title: 'Prop Firm Rules & Funded Trading Rules Guide | FundedTradingRules.com',
    metaDescription: 'Comprehensive prop firm rules guide: trailing vs balance drawdown, 2-minute news buffers, 80% margin caps, IP clustering rules, and payout consistency requirements.',
    canonicalUrl: `${BASE_URL}/rules`,
    h1: 'Prop Firm Rules & Funded Trading Rules Guide: Interactive Rule Intelligence',
    keywords: 'prop firm rules, funded account rules, funded trading rules, prop firm drawdown rules, daily loss limit, consistency rule, news trading rules, prop firm traps',
    lastmod: '2026-09-10',
    isIndexable: true,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Rules', url: '/rules' },
    ],
    schemaGraph: [
      generateOrganizationSchema(),
      generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Rules', url: '/rules' },
      ]),
      generateItemListSchema(
        'Master Prop Firm Rule Guides',
        RULE_GUIDES.map(g => ({ name: g.name, url: `/rules/${g.slug}` }))
      ),
    ],
  },
  {
    path: '/compare',
    pageType: 'core',
    title: 'Compare Prop Firms Side-by-Side — Evidence-Based | FundedTradingRules.com',
    metaDescription: 'Direct side-by-side comparison matrix for prop trading firms. Compare daily loss limits, trailing drawdown basis, news restrictions, and hidden traps.',
    canonicalUrl: `${BASE_URL}/compare`,
    h1: 'Side-by-Side Prop Firm Comparison Matrix',
    lastmod: '2026-09-10',
    isIndexable: true,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Compare', url: '/compare' },
    ],
    schemaGraph: [
      generateOrganizationSchema(),
      generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Compare', url: '/compare' },
      ]),
    ],
  },
  {
    path: '/wizard',
    pageType: 'core',
    title: 'Find My Best Prop Firm — Personalized Strategy Matcher | FundedTradingRules.com',
    metaDescription: 'Interactive prop firm recommendation engine. Match your unique trading style, risk tolerance, and profit expectations with audited prop firm rules.',
    canonicalUrl: `${BASE_URL}/wizard`,
    h1: 'Personalized Prop Firm Strategy Matcher',
    lastmod: '2026-09-10',
    isIndexable: true,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Strategy Matcher', url: '/wizard' },
    ],
    schemaGraph: [
      generateOrganizationSchema(),
      generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Strategy Matcher', url: '/wizard' },
      ]),
    ],
  },
  {
    path: '/simulator',
    pageType: 'core',
    title: 'Risk Simulator — Test Drawdowns Before You Buy | FundedTradingRules.com',
    metaDescription: 'Simulate intraday balance vs equity drawdowns, open lots, and trailing stops against verified prop firm risk boundaries before risking challenge fees.',
    canonicalUrl: `${BASE_URL}/simulator`,
    h1: 'Interactive Prop Firm Risk & Drawdown Simulator',
    lastmod: '2026-09-10',
    isIndexable: true,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Risk Simulator', url: '/simulator' },
    ],
    schemaGraph: [
      generateOrganizationSchema(),
      generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Risk Simulator', url: '/simulator' },
      ]),
    ],
  },
  {
    path: '/reviews',
    pageType: 'core',
    title: 'Trader Reviews vs Firm Responses — Neutral Dispute Registry | FundedTradingRules.com',
    metaDescription: 'Neutral dispute evidence registry. Real trader payout and breach complaints paired directly with official prop firm terms and verified outcomes.',
    canonicalUrl: `${BASE_URL}/reviews`,
    h1: 'Prop Firm Trader Dispute & Evidence Registry',
    lastmod: '2026-09-10',
    isIndexable: true,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Disputes & Reviews', url: '/reviews' },
    ],
    schemaGraph: [
      generateOrganizationSchema(),
      generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Disputes & Reviews', url: '/reviews' },
      ]),
    ],
  },
  {
    path: '/changes',
    pageType: 'core',
    title: 'Rule Changes Changelog — Live Audit Trail | FundedTradingRules.com',
    metaDescription: 'Real-time audit log of rule changes across all major prop firms. Track sudden drawdown adjustments, news bans, and consistency updates.',
    canonicalUrl: `${BASE_URL}/changes`,
    h1: 'Prop Firm Rule Changes & Audit Trail',
    lastmod: '2026-09-10',
    isIndexable: true,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Rule Changes', url: '/changes' },
    ],
    schemaGraph: [
      generateOrganizationSchema(),
      generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Rule Changes', url: '/changes' },
      ]),
    ],
  },
  {
    path: '/contact',
    pageType: 'core',
    title: 'Contact Us — Editorial & Rule Dispute Desk | FundedTradingRules.com',
    metaDescription: 'Reach the FundedTradingRules research desk to submit undocumented rule changes, dispute evidence, or editorial feedback.',
    canonicalUrl: `${BASE_URL}/contact`,
    h1: 'Contact FundedTradingRules Research Desk',
    lastmod: '2026-09-10',
    isIndexable: true,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Contact', url: '/contact' },
    ],
    schemaGraph: [
      generateOrganizationSchema(),
      generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Contact', url: '/contact' },
      ]),
    ],
  },
  {
    path: '/privacy',
    pageType: 'legal',
    title: 'Privacy Policy — GDPR & CCPA Compliance | FundedTradingRules.com',
    metaDescription: 'Privacy policy for FundedTradingRules.com. Details on data collection, Google Consent Mode v2, cookie controls, GDPR rights, and data protection.',
    canonicalUrl: `${BASE_URL}/privacy`,
    h1: 'Privacy Policy',
    lastmod: '2026-09-10',
    isIndexable: true,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Privacy Policy', url: '/privacy' },
    ],
    schemaGraph: [
      generateOrganizationSchema(),
      generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Privacy Policy', url: '/privacy' },
      ]),
    ],
  },
  {
    path: '/terms',
    pageType: 'legal',
    title: 'Terms of Service — User Agreement & Disclaimers | FundedTradingRules.com',
    metaDescription: 'Terms of service governing access to FundedTradingRules.com independent prop trading intelligence and simulation tools.',
    canonicalUrl: `${BASE_URL}/terms`,
    h1: 'Terms of Service',
    lastmod: '2026-09-10',
    isIndexable: true,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Terms of Service', url: '/terms' },
    ],
    schemaGraph: [
      generateOrganizationSchema(),
      generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Terms of Service', url: '/terms' },
      ]),
    ],
  },
  {
    path: '/disclaimer',
    pageType: 'legal',
    title: 'Risk & Financial Services Disclaimer — CFTC Rule 4.41 | FundedTradingRules.com',
    metaDescription: 'Comprehensive risk disclosure, simulated trading limitations, CFTC Rule 4.41 compliance, and proprietary evaluation warnings.',
    canonicalUrl: `${BASE_URL}/disclaimer`,
    h1: 'Risk & Regulatory Disclaimer',
    lastmod: '2026-09-10',
    isIndexable: true,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Disclaimer', url: '/disclaimer' },
    ],
    schemaGraph: [
      generateOrganizationSchema(),
      generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Disclaimer', url: '/disclaimer' },
      ]),
    ],
  },
];

// 2. Firm Routes
const FIRM_ROUTES: RouteSEOData[] = PROP_FIRMS_DATA.map(firm => {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: '/' },
    { name: 'Prop Firms', url: '/prop-firms' },
    { name: firm.name, url: `/prop-firms/${firm.slug}` },
  ];

  return {
    path: `/prop-firms/${firm.slug}`,
    pageType: 'firm',
    title: `${firm.name} — Verified Rules & Drawdown Math | FundedTradingRules.com`,
    metaDescription: `Complete verified rules dossier for ${firm.name}. Drawdown calculation, consistency limits, news trading rules, lot size caps, and trader dispute record backed by official citations.`,
    canonicalUrl: `${BASE_URL}/prop-firms/${firm.slug}`,
    h1: `${firm.name} Rules & Evaluation Intelligence Dossier`,
    lastmod: firm.lastVerified || '2026-09-10',
    isIndexable: true,
    keywords: `${firm.name} rules, ${firm.name} drawdown, ${firm.name} funded account, ${firm.name} payout rules, ${firm.name} consistency rule, ${firm.name} evaluation target, ${firm.name} trading rules 2026`,
    breadcrumbs,
    schemaGraph: [
      generateOrganizationSchema(),
      generateBreadcrumbSchema(breadcrumbs),
      generateFirmSchema({
        name: firm.name,
        slug: firm.slug,
        website: firm.website,
        country: firm.country,
        headquarters: firm.headquarters,
        foundedYear: firm.foundedYear,
        description: firm.tagline,
        rating: firm.scorecard?.overallScore ? Number((firm.scorecard.overallScore / 20).toFixed(1)) : 4.5,
        reviewsCount: firm.reviewsOverview?.totalReviews || 120,
      }),
    ],
  };
});

// 3. Rule Guide Routes (including the dedicated 1% Floating Loss Rule guide)
const ALL_RULE_GUIDES = [
  ...RULE_GUIDES,
  {
    slug: '1-percent-floating-loss',
    name: '1% Floating Loss Rule',
    category: 'Execution & Risk Rules',
    shortDefinition: 'An instant breach triggered when any single open trade floats into a 1% unrealized loss relative to starting account balance.',
    detailedExplanation: 'The 1% floating loss rule is enforced on certain instant-funding accounts and aggressive micro-evaluation tiers. Unlike normal daily loss limits that calculate net equity across all trades at day-close, this rule watches individual positions in real time. If a single trade pulls back beyond 1%, the account is immediately breached, regardless of overall daily profit.',
    formula: 'Single Position Loss Floor = Starting Nominal Capital * 1.00%',
    example: 'On a $10,000 account, if your open position hits -$100.01 floating loss, the rule is violated instantly even if you are +$500 in realized profit on the day.',
    howFirmsCalculate: [
      {
        title: 'Intraday Tick Monitoring',
        description: 'Automated bridge server monitoring registers any millisecond breach of the 1% threshold, triggering instant liquidation.',
      },
    ],
    commonMistakes: [
      'Assuming the 4% or 5% daily loss limit gives you room to hold a swing trade.',
      'Failing to set a hard stop-loss inside 0.8% to account for market slippage and spread widening.',
    ],
    firmsUsing: [
      { firmName: 'Goat Funded Trader', modelVariation: 'Instant 5k Micro-Loss threshold' },
    ],
  },
];

const RULE_ROUTES: RouteSEOData[] = ALL_RULE_GUIDES.map(guide => {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: '/' },
    { name: 'Rules', url: '/rules' },
    { name: guide.name, url: `/rules/${guide.slug}` },
  ];

  const faqs = [
    {
      question: `What is the ${guide.name}?`,
      answer: guide.shortDefinition,
    },
    {
      question: `How is ${guide.name} calculated across prop firms?`,
      answer: guide.formula || guide.detailedExplanation,
    },
    {
      question: `What are the most common mistakes traders make with ${guide.name}?`,
      answer: (guide.commonMistakes || []).join(' ') || 'Failing to read official terms of service before trading.',
    },
  ];

  return {
    path: `/rules/${guide.slug}`,
    pageType: 'rule',
    title: `${guide.name} Rules & Calculation | FundedTradingRules.com`,
    metaDescription: `${guide.shortDefinition} Complete calculation formula, practical examples, common violation mistakes, and prop firms using this rule.`,
    canonicalUrl: `${BASE_URL}/rules/${guide.slug}`,
    h1: `${guide.name} — Prop Firm Rule Guide`,
    lastmod: '2026-09-10',
    isIndexable: true,
    keywords: `${guide.name} prop firm, ${guide.name} rules, prop firm ${guide.name}, funded account ${guide.name}, how ${guide.name} works, avoid ${guide.name} breach`,

    breadcrumbs,
    schemaGraph: [
      generateOrganizationSchema(),
      generateBreadcrumbSchema(breadcrumbs),
      generateRuleArticleSchema({
        name: guide.name,
        slug: guide.slug,
        category: guide.category,
        description: guide.shortDefinition,
      }),
      generateFAQSchema(faqs),
    ],
  };
});

// 4. Curated Comparison Routes
const COMPARE_ROUTES: RouteSEOData[] = CURATED_COMPARISONS.map(pair => {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: '/' },
    { name: 'Compare', url: '/compare' },
    { name: `${pair.firmAName} vs ${pair.firmBName}`, url: `/compare/${pair.slug}` },
  ];

  const faqs = [
    {
      question: `What is the main difference between ${pair.firmAName} and ${pair.firmBName}?`,
      answer: pair.verdict,
    },
    ...pair.keyDifferences.slice(0, 2).map(d => ({
      question: `${d.title} difference between ${pair.firmAName} and ${pair.firmBName}`,
      answer: d.description,
    })),
  ];

  return {
    path: `/compare/${pair.slug}`,
    pageType: 'compare',
    title: `${pair.title} | FundedTradingRules.com`,
    metaDescription: pair.metaDescription,
    canonicalUrl: `${BASE_URL}/compare/${pair.slug}`,
    h1: `${pair.firmAName} vs ${pair.firmBName}: Rules & Drawdown Compared`,
    lastmod: '2026-09-10',
    isIndexable: true,
    keywords: `${pair.firmAName} vs ${pair.firmBName}, compare ${pair.firmAName} and ${pair.firmBName}, ${pair.firmAName} or ${pair.firmBName}, ${pair.firmAName} vs ${pair.firmBName} rules, ${pair.firmAName} vs ${pair.firmBName} drawdown, best funded account ${pair.firmAName} vs ${pair.firmBName}`,

    breadcrumbs,
    schemaGraph: [
      generateOrganizationSchema(),
      generateBreadcrumbSchema(breadcrumbs),
      generateFAQSchema(faqs),
    ],
  };
});

// 5. Curated Attribute / Filter Landing Pages
const ATTRIBUTE_ROUTES: RouteSEOData[] = ATTRIBUTE_PAGES.map(attr => {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: '/' },
    { name: 'Prop Firms', url: '/prop-firms' },
    { name: attr.badge, url: `/prop-firms/${attr.slug}` },
  ];

  const matchingFirms = PROP_FIRMS_DATA.filter(attr.matcher);

  return {
    path: `/prop-firms/${attr.slug}`,
    pageType: 'attribute',
    title: `${attr.title} | FundedTradingRules.com`,
    metaDescription: attr.metaDescription,
    canonicalUrl: `${BASE_URL}/prop-firms/${attr.slug}`,
    h1: attr.h1,
    lastmod: '2026-09-10',
    isIndexable: true,
    keywords: `${attr.h1.toLowerCase()}, prop firms ${attr.badge.toLowerCase()}, best funded accounts ${attr.badge.toLowerCase()}, prop trading firms ${attr.slug.replace('with-', '').replace(/-/g, ' ')}`,

    breadcrumbs,
    schemaGraph: [
      generateOrganizationSchema(),
      generateBreadcrumbSchema(breadcrumbs),
      generateItemListSchema(
        attr.h1,
        matchingFirms.map(f => ({ name: f.name, url: `/prop-firms/${f.slug}` }))
      ),
      generateFAQSchema([
        {
          question: `What does ${attr.badge} mean in prop firms?`,
          answer: attr.summary,
        },
        {
          question: 'How is it calculated mathematically?',
          answer: attr.mathematicalDefinition,
        },
        {
          question: 'What is the primary risk or trap to watch out for?',
          answer: attr.trapWarning,
        },
      ]),
    ],
  };
});

// 6. Master Route Map & Lookup
export const ALL_SEO_ROUTES: RouteSEOData[] = [
  ...CORE_ROUTES,
  ...FIRM_ROUTES,
  ...RULE_ROUTES,
  ...COMPARE_ROUTES,
  ...ATTRIBUTE_ROUTES,
];

export function getRouteSEOData(path: string): RouteSEOData | null {
  const cleanPath = path === '/' ? '/' : path.replace(/\/$/, '').split('?')[0].split('#')[0];
  const exact = ALL_SEO_ROUTES.find(r => r.path === cleanPath);
  if (exact) return exact;

  // Dynamic comparison lookup for arbitrary [firmA]-vs-[firmB]
  if (cleanPath.startsWith('/compare/') && cleanPath.includes('-vs-')) {
    const slug = cleanPath.replace('/compare/', '');
    const [slugA, slugB] = slug.split('-vs-');
    const firmA = PROP_FIRMS_DATA.find(f => f.slug === slugA);
    const firmB = PROP_FIRMS_DATA.find(f => f.slug === slugB);
    if (firmA && firmB) {
      const breadcrumbs: BreadcrumbItem[] = [
        { name: 'Home', url: '/' },
        { name: 'Compare', url: '/compare' },
        { name: `${firmA.name} vs ${firmB.name}`, url: cleanPath },
      ];
      return {
        path: cleanPath,
        pageType: 'compare',
        title: `${firmA.name} vs ${firmB.name} Rules & Drawdown Comparison | FundedTradingRules.com`,
        metaDescription: `Compare ${firmA.name} vs ${firmB.name} side-by-side: Daily loss limits, maximum drawdown mechanics, profit targets, payout frequency, and official terms citations.`,
        canonicalUrl: `${BASE_URL}${cleanPath}`,
        h1: `${firmA.name} vs ${firmB.name} Rules Comparison`,
        lastmod: '2026-09-10',
        isIndexable: true,
        breadcrumbs,
        schemaGraph: [
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbs),
        ],
      };
    }
  }

  // Dynamic account lookup: /prop-firms/:slug/accounts/:accId
  if (cleanPath.includes('/accounts/')) {
    const [firmPart, accId] = cleanPath.split('/accounts/');
    const firmSlug = firmPart.replace('/prop-firms/', '');
    const firm = PROP_FIRMS_DATA.find(f => f.slug === firmSlug);
    if (firm) {
      let foundAcc: any = null;
      for (const p of firm.programs) {
        const match = p.accounts.find(a => a.id === accId);
        if (match) { foundAcc = match; break; }
      }
      const accName = foundAcc?.name || accId.toUpperCase();
      const breadcrumbs: BreadcrumbItem[] = [
        { name: 'Home', url: '/' },
        { name: 'Prop Firms', url: '/prop-firms' },
        { name: firm.name, url: `/prop-firms/${firm.slug}` },
        { name: accName, url: cleanPath },
      ];
      return {
        path: cleanPath,
        pageType: 'account',
        title: `${firm.name} ${accName} Account Rules & Drawdown Limits | FundedTradingRules.com`,
        metaDescription: `Verified evaluation rules for ${firm.name} ${accName}. Exact daily loss, maximum drawdown, profit split, and failure trigger math.`,
        canonicalUrl: `${BASE_URL}${cleanPath}`,
        h1: `${firm.name} — ${accName} Rules & Conditions`,
        lastmod: firm.lastVerified || '2026-09-10',
        isIndexable: true,
        breadcrumbs,
        schemaGraph: [
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbs),
        ],
      };
    }
  }

  return null;
}
