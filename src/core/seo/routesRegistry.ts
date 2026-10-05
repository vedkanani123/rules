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
}

// 1. Core Pages
const CORE_ROUTES: RouteSEOData[] = [
  {
    path: '/',
    pageType: 'core',
    title: 'Prop Firm Rules Compared: Drawdown & Payouts (2026)',
    metaDescription: 'Compare verified funded rules and prop firm trading rules. Real drawdown math, news buffers, consistency rules, and payout terms across 24+ firms.',
    canonicalUrl: `${BASE_URL}/`,
    h1: 'Compare Prop Firm Rules Before You Buy a Challenge',
    lastmod: '2026-09-13',
    isIndexable: true,
    breadcrumbs: [{ name: 'Home', url: '/' }],
    schemaGraph: [
      generateOrganizationSchema(),
      generateWebSiteSchema(),
      generateFAQSchema([
        {
          question: 'What rules do prop trading firms enforce?',
          answer: 'Prop firm rules are the operational risk guidelines, profit objectives, and contractual trading restrictions set by proprietary trading firms that traders must follow to pass evaluations and maintain funded accounts. Core prop firm rules include daily loss limits, maximum drawdown thresholds, news trading restrictions, consistency rules, and payout criteria.',
        },
        {
          question: 'What are the most common prop firm trading restrictions?',
          answer: 'The most common prop firm rules include: (1) Daily Loss Limit (typically 3%–5%), (2) Maximum Trailing or Static Drawdown (typically 6%–10%), (3) Consistency Rules (limiting the percentage of profit earned on a single trading day), (4) News Trading Buffers (prohibiting execution ±2 minutes around red-folder releases), and (5) Minimum Trading Days requirements.',
        },
        {
          question: 'How does the daily drawdown rule work at prop firms?',
          answer: 'Daily loss limits cap the maximum equity or balance decline allowed in a single server day (usually resetting at 00:00 server time). In balance-based models, the floor is calculated from the day-start balance. In equity-based models, intraday open profits can pull the daily loss floor upwards, meaning open trades that retrace can trigger a daily drawdown breach.',
        },
        {
          question: 'Why do traders fail prop firm evaluations?',
          answer: 'The vast majority of prop firm failures are caused by hidden rule mechanics rather than market analysis errors. Common pitfalls include trailing drawdown on unrealized floating profit peaks, violating the 80% margin utilization cap, entering or closing trades within the 2-minute news buffer, and failing to meet weekend flat-position requirements.',
        },
        {
          question: 'What is the difference between soft breach and hard breach prop firm rules?',
          answer: 'A hard breach (such as exceeding the daily loss limit or maximum overall drawdown) immediately liquidates all positions and closes the funded account. A soft breach (such as leaving a trade open over the weekend or a minor lot size breach) automatically closes the offending trade or cancels profits from that trade without terminating the challenge account.',
        },
      ]),
    ],
  },
  {
    path: '/prop-firms',
    pageType: 'core',
    title: 'List of Prop Trading Firms (2026): Rules & Conditions',
    metaDescription: 'Browse 24+ prop trading firms with verified rules, daily drawdown models, profit targets, payout consistency rules, and official contract citations.',
    canonicalUrl: `${BASE_URL}/prop-firms`,
    h1: 'Best Funded Accounts & Prop Firm Rules Directory: 24+ Verified Firms',
    lastmod: '2026-09-13',
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
    title: 'Prop Firm Trading Rules: Drawdown, Lot Size & Payouts',
    metaDescription: 'Complete prop firm rules guide: trailing vs static drawdown, 2-minute news buffers, 80% margin caps, lot size limits, and payout consistency math.',
    canonicalUrl: `${BASE_URL}/rules`,
    h1: 'Funded Rules Explained: Complete Prop Firm Trading Rules Guide (2026)',
    lastmod: '2026-09-13',
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
        [
          ...RULE_GUIDES.map(g => ({ name: g.name, url: `/rules/${g.slug}` })),
          { name: '1% Floating Loss Rule', url: '/rules/1-percent-floating-loss' },
        ]
      ),
    ],
  },
  {
    path: '/compare',
    pageType: 'core',
    title: 'Compare Prop Firms Side-by-Side: Rules, Fees & Split',
    metaDescription: 'Direct side-by-side comparison matrix for prop trading firms. Compare daily loss limits, trailing drawdown basis, news restrictions, and hidden traps.',
    canonicalUrl: `${BASE_URL}/compare`,
    h1: 'Side-by-Side Prop Firm Comparison Matrix',
    lastmod: '2026-09-13',
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
    title: 'Prop Firm Account Matcher: Find Best Funded Account',
    metaDescription: 'Interactive prop firm recommendation engine. Match your unique trading style, risk tolerance, and profit expectations with audited prop firm rules.',
    canonicalUrl: `${BASE_URL}/wizard`,
    h1: 'Personalized Prop Firm Strategy Matcher',
    lastmod: '2026-09-13',
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
    title: 'Prop Firm Drawdown Calculator & Risk Simulator (2026)',
    metaDescription: 'Simulate intraday balance vs equity drawdowns, open lots, and trailing stops against verified prop firm risk boundaries before risking challenge fees.',
    canonicalUrl: `${BASE_URL}/simulator`,
    h1: 'Interactive Prop Firm Risk & Drawdown Simulator',
    lastmod: '2026-09-13',
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
      generateFAQSchema([
        {
          question: 'How is prop firm daily drawdown calculated?',
          answer:
            "Daily drawdown is calculated as a fixed percentage (typically 3% to 5%) of either your previous day's closed balance or the higher of your closed balance and floating equity at server reset. If your intraday floating equity drops below the daily floor at any millisecond, the account is breached.",
        },
        {
          question: 'What is the difference between static, EOD, and trailing drawdown?',
          answer:
            'Static drawdown stays fixed at its initial dollar floor forever. End-of-Day (EOD) trailing drawdown moves up only at the end of the trading day based on closed balance. Intraday trailing drawdown follows your highest unrealized floating equity tick-by-tick until it locks at the starting balance.',
        },
      ]),
    ],
  },
  {
    path: '/reviews',
    pageType: 'core',
    title: 'Prop Firm Trader Reviews vs Official Rules (2026)',
    metaDescription: 'Neutral dispute evidence registry. Real trader payout and breach complaints paired directly with official prop firm terms and verified outcomes.',
    canonicalUrl: `${BASE_URL}/reviews`,
    h1: 'Prop Firm Trader Dispute & Evidence Registry',
    lastmod: '2026-09-13',
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
    title: 'Prop Firm Rule Changes & Policy Changelog (2026)',
    metaDescription: 'Real-time audit log of rule changes across all major prop firms. Track sudden drawdown adjustments, news bans, and consistency updates.',
    canonicalUrl: `${BASE_URL}/changes`,
    h1: 'Prop Firm Rule Changes & Audit Trail',
    lastmod: '2026-09-13',
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
    title: 'Contact Our Research Desk | FundedTradingRules',
    metaDescription: 'Reach our independent prop firm research desk to submit undocumented rule changes, payout dispute evidence, or editorial feedback.',
    canonicalUrl: `${BASE_URL}/contact`,
    h1: 'Contact FundedTradingRules Research Desk',
    lastmod: '2026-09-13',
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
    title: 'Privacy Policy & Data Protection | FundedTradingRules',
    metaDescription: 'Comprehensive privacy policy covering data collection, Google Consent Mode v2, cookie controls, GDPR rights, and user data protection.',
    canonicalUrl: `${BASE_URL}/privacy`,
    h1: 'Privacy Policy',
    lastmod: '2026-09-13',
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
    title: 'Terms of Service & Usage Policy | FundedTradingRules',
    metaDescription: 'Terms of service and usage conditions governing access to our independent prop trading rule database, calculators, and simulation tools.',
    canonicalUrl: `${BASE_URL}/terms`,
    h1: 'Terms of Service',
    lastmod: '2026-09-13',
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
    title: 'Risk & Regulatory Disclaimer | FundedTradingRules',
    metaDescription: 'Comprehensive risk disclosure, simulated trading limitations, CFTC Rule 4.41 compliance, and proprietary evaluation warnings.',
    canonicalUrl: `${BASE_URL}/disclaimer`,
    h1: 'Risk & Regulatory Disclaimer',
    lastmod: '2026-09-13',
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
  {
    path: '/about',
    pageType: 'legal',
    title: 'About FundedTradingRules | Who We Are & Our Mission',
    metaDescription: 'Learn about FundedTradingRules.com, our mission to document prop firm rules accurately, and why we built this intelligence platform.',
    canonicalUrl: `${BASE_URL}/about`,
    h1: 'About FundedTradingRules',
    lastmod: '2026-09-13',
    isIndexable: true,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'About', url: '/about' },
    ],
    schemaGraph: [
      generateOrganizationSchema(),
      generateBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }]),
    ],
  },
  {
    path: '/methodology',
    pageType: 'legal',
    title: 'Research Methodology | How We Verify Prop Firm Rules',
    metaDescription: 'Discover our rigorous research methodology for verifying, documenting, and updating proprietary trading firm rules and data.',
    canonicalUrl: `${BASE_URL}/methodology`,
    h1: 'Our Methodology',
    lastmod: '2026-09-13',
    isIndexable: true,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Methodology', url: '/methodology' },
    ],
    schemaGraph: [
      generateOrganizationSchema(),
      generateBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Methodology', url: '/methodology' }]),
    ],
  },
  {
    path: '/editorial-policy',
    pageType: 'legal',
    title: 'Editorial Policy | Independence & Objective Research',
    metaDescription: 'Read our editorial policy outlining our commitment to independent, objective, and accurate proprietary trading rule documentation.',
    canonicalUrl: `${BASE_URL}/editorial-policy`,
    h1: 'Editorial Policy',
    lastmod: '2026-09-13',
    isIndexable: true,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Editorial Policy', url: '/editorial-policy' },
    ],
    schemaGraph: [
      generateOrganizationSchema(),
      generateBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Editorial Policy', url: '/editorial-policy' }]),
    ],
  },
  {
    path: '/affiliate-disclosure',
    pageType: 'legal',
    title: 'Affiliate Disclosure | How We Are Funded',
    metaDescription: 'Complete transparency regarding our affiliate partnerships, commissions, and how FundedTradingRules.com remains free to use.',
    canonicalUrl: `${BASE_URL}/affiliate-disclosure`,
    h1: 'Affiliate Disclosure',
    lastmod: '2026-09-13',
    isIndexable: true,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Affiliate Disclosure', url: '/affiliate-disclosure' },
    ],
    schemaGraph: [
      generateOrganizationSchema(),
      generateBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Affiliate Disclosure', url: '/affiliate-disclosure' }]),
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

  const primaryAcc = firm.programs[0]?.accounts[0];
  const fullFirmTitle = `${firm.name} Rules, Drawdown & Payouts (2026) | FundedTradingRules`;
  const title = fullFirmTitle.length <= 65 ? fullFirmTitle : `${firm.name} Rules, Drawdown & Payouts (2026)`;

  const fullFirmDesc = `Verified ${firm.name} rules (2026): daily drawdown, max loss floor, lot size limits, consistency rule, news trading, and payout terms with official citations.`;
  const metaDescription = fullFirmDesc.length <= 158
    ? fullFirmDesc
    : `Verified ${firm.name} rules (2026): daily drawdown, max loss floor, lot size limits, consistency rule, news trading, and official payout terms.`;

  const firmFaqs = [
    {
      question: `What are ${firm.name}'s daily drawdown and maximum loss rules?`,
      answer: `${firm.name}'s primary evaluation account (${primaryAcc?.name || 'Standard'}) enforces a ${primaryAcc?.dailyLossLimit ?? 5}% daily loss limit (${primaryAcc?.dailyLossCalculation || 'balance'}-based) and a ${primaryAcc?.maxTotalLoss ?? 10}% maximum overall drawdown calculated on a ${(primaryAcc?.drawdownType || 'static').replace(/_/g, ' ')} basis.`,
    },
    {
      question: `What is the maximum lot size and consistency rule at ${firm.name}?`,
      answer: `${firm.name} provides ${primaryAcc?.leverage || 'standard institutional'} leverage where position sizing is governed by margin limits and contract caps. Consistency rule policy: ${primaryAcc?.consistencyRule || 'No consistency rule is enforced on standard evaluation accounts'}.`,
    },
    {
      question: `Does ${firm.name} allow news trading, weekend holding, and EAs?`,
      answer: `At ${firm.name}, news trading is ${primaryAcc?.newsTradingRule || 'Allowed'}${primaryAcc?.newsTradingDetail ? ` (${primaryAcc.newsTradingDetail})` : ''}, weekend holding is ${primaryAcc?.weekendHolding ? 'allowed' : 'restricted before Friday close'}, and Expert Advisors (EAs) are ${primaryAcc?.eaAllowed ? 'allowed subject to fair execution rules' : 'not permitted'}.`,
    },
    {
      question: `What is ${firm.name}'s profit split and payout frequency?`,
      answer: `${firm.name} offers a ${primaryAcc?.profitSplit ?? 80}% trader profit split with payouts processed on a ${primaryAcc?.payoutFrequency || '14-day'} schedule (${primaryAcc?.firstPayoutConditions || 'subject to standard minimum trading days'}).`,
    },
  ];

  return {
    path: `/prop-firms/${firm.slug}`,
    pageType: 'firm',
    title,
    metaDescription,
    canonicalUrl: `${BASE_URL}/prop-firms/${firm.slug}`,
    h1: `${firm.name} Rules & Evaluation Intelligence Dossier`,
    lastmod: firm.lastVerified || '2026-09-13',
    isIndexable: true,
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
        logoUrl: firm.logoUrl,
        description: firm.tagline,
        rating: firm.scorecard?.overallScore ? Number((firm.scorecard.overallScore / 20).toFixed(1)) : 4.5,
        reviewsCount: firm.reviewsOverview?.totalReviews || 120,
      }),
      generateFAQSchema(firmFaqs),
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

  const cleanName = guide.name.replace(/\s+rules?$/i, '');
  const brandedRuleTitle = `${cleanName} Rules & Math | FundedTradingRules`;
  const guideRuleTitle = `${cleanName}: Prop Firm Rule Guide (2026)`;
  const shortRuleTitle = `${cleanName}: Prop Firm Rules (2026)`;
  const title = brandedRuleTitle.length <= 65
    ? brandedRuleTitle
    : guideRuleTitle.length <= 65
      ? guideRuleTitle
      : shortRuleTitle;

  const fullRuleDesc = `${guide.shortDefinition} Formula, examples & prop firms enforcing this rule.`;
  const midRuleDesc = `${guide.shortDefinition} Formula, examples & prop firms using it.`;
  const shortRuleDesc = `${guide.shortDefinition} Formula, math & prop firms.`;
  const metaDescription = fullRuleDesc.length <= 158
    ? fullRuleDesc
    : midRuleDesc.length <= 158
      ? midRuleDesc
      : shortRuleDesc;

  return {
    path: `/rules/${guide.slug}`,
    pageType: 'rule',
    title,
    metaDescription,
    canonicalUrl: `${BASE_URL}/rules/${guide.slug}`,
    h1: `${guide.name} — Prop Firm Rule Guide`,
    lastmod: '2026-09-13',
    isIndexable: true,

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
    title: pair.title,
    metaDescription: pair.metaDescription,
    canonicalUrl: `${BASE_URL}/compare/${pair.slug}`,
    h1: `${pair.firmAName} vs ${pair.firmBName}: Rules & Drawdown Compared`,
    lastmod: '2026-09-13',
    isIndexable: true,

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
    title: attr.title,
    metaDescription: attr.metaDescription,
    canonicalUrl: `${BASE_URL}/prop-firms/${attr.slug}`,
    h1: attr.h1,
    lastmod: '2026-09-13',
    isIndexable: true,

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

// 5.5 Account Detail Routes (/prop-firms/:slug/accounts/:accId)
const ACCOUNT_ROUTES: RouteSEOData[] = PROP_FIRMS_DATA.flatMap(firm =>
  firm.programs.flatMap(program =>
    program.accounts.map(acc => {
      const cleanPath = `/prop-firms/${firm.slug}/accounts/${acc.id}`;
      const breadcrumbs: BreadcrumbItem[] = [
        { name: 'Home', url: '/' },
        { name: 'Prop Firms', url: '/prop-firms' },
        { name: firm.name, url: `/prop-firms/${firm.slug}` },
        { name: acc.name, url: cleanPath },
      ];
      const baseLabel = acc.name.startsWith(firm.name) ? acc.name : `${firm.name} ${acc.name}`;
      const cand1 = `${baseLabel} Account Rules (2026)`;
      const cand2 = `${baseLabel} Account Rules`;
      const cand3 = `${baseLabel} Rules (2026)`;
      const cand4 = `${baseLabel} Rules`;
      const title = [cand1, cand2, cand3, cand4].find(c => c.length >= 35 && c.length <= 65) || cand1.slice(0, 65);

      const drawdownLabel = acc.drawdownType.replace(/_/g, ' ');
      const metaDescription = `Verified ${firm.name} ${acc.name} rules: ${acc.dailyLossLimit}% daily loss, ${acc.maxTotalLoss}% max drawdown (${drawdownLabel}), ${acc.profitSplit}% split, and breach math.`;

      const accountFaqs = [
        {
          question: `What are the ${firm.name} ${acc.name} account rules?`,
          answer: `The ${firm.name} ${acc.name} ($${acc.nominalSize.toLocaleString()}) account enforces a ${acc.dailyLossLimit}% daily loss limit, ${acc.maxTotalLoss}% maximum (${drawdownLabel}) drawdown, ${acc.profitTargetPhase1}% Phase 1 profit target${acc.profitTargetPhase2 ? `, ${acc.profitTargetPhase2}% Phase 2 target` : ''}, and a ${acc.profitSplit}% profit split.`,
        },
        {
          question: `How is drawdown calculated on the ${firm.name} ${acc.name} account?`,
          answer: `On the ${firm.name} ${acc.name} account, maximum drawdown is ${acc.maxTotalLoss}% ($${Math.round((acc.nominalSize * acc.maxTotalLoss) / 100).toLocaleString()}) using a ${drawdownLabel} model, while the daily loss limit is ${acc.dailyLossLimit}% ($${Math.round((acc.nominalSize * acc.dailyLossLimit) / 100).toLocaleString()}) calculated on a ${acc.dailyLossCalculation} basis.`,
        },
        {
          question: `What is the profit split and minimum trading days for ${firm.name} ${acc.name}?`,
          answer: `Traders on the ${firm.name} ${acc.name} account receive an ${acc.profitSplit}% profit split (${acc.payoutFrequency} payout cycle) and must complete at least ${acc.minimumTradingDays} minimum trading days per evaluation phase.`,
        },
      ];

      return {
        path: cleanPath,
        pageType: 'account' as const,
        title,
        metaDescription,
        canonicalUrl: `${BASE_URL}${cleanPath}`,
        h1: `${firm.name} — ${acc.name} Rules & Conditions`,
        lastmod: firm.lastVerified || '2026-09-13',
        isIndexable: true,
        breadcrumbs,
        schemaGraph: [
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbs),
          generateFAQSchema(accountFaqs),
        ],
      };
    })
  )
);

// 6. Master Route Map & Lookup
export const ALL_SEO_ROUTES: RouteSEOData[] = [
  ...CORE_ROUTES,
  ...FIRM_ROUTES,
  ...RULE_ROUTES,
  ...COMPARE_ROUTES,
  ...ATTRIBUTE_ROUTES,
  ...ACCOUNT_ROUTES,
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
      const fullDynamicTitle = `${firmA.name} vs ${firmB.name}: Rules & Drawdown (2026)`;
      const dynamicTitle = fullDynamicTitle.length <= 65
        ? fullDynamicTitle
        : `${firmA.name} vs ${firmB.name} Rules Compared`;
      return {
        path: cleanPath,
        pageType: 'compare',
        title: dynamicTitle,
        metaDescription: `Compare ${firmA.name} vs ${firmB.name} side-by-side: daily loss limits, max drawdown rules, profit targets, payout splits, and official citations.`,
        canonicalUrl: `${BASE_URL}${cleanPath}`,
        h1: `${firmA.name} vs ${firmB.name} Rules Comparison`,
        lastmod: '2026-09-13',
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
      const baseLabel = accName.startsWith(firm.name) ? accName : `${firm.name} ${accName}`;
      const cand1 = `${baseLabel} Account Rules (2026)`;
      const cand2 = `${baseLabel} Account Rules`;
      const cand3 = `${baseLabel} Rules (2026)`;
      const cand4 = `${baseLabel} Rules`;
      const title = [cand1, cand2, cand3, cand4].find(c => c.length >= 35 && c.length <= 65) || cand1.slice(0, 65);

      const dynamicFaqs = [
        {
          question: `What are the ${firm.name} ${accName} account rules?`,
          answer: `Verified evaluation rules for ${firm.name} ${accName}, including daily loss limits, maximum drawdown floors, profit targets, and payout conditions.`,
        },
        {
          question: `How is drawdown calculated on the ${firm.name} ${accName} account?`,
          answer: `Drawdown on the ${firm.name} ${accName} account is calculated according to the firm's official daily loss and maximum overall loss rules.`,
        },
        {
          question: `What is the profit split and minimum trading days for ${firm.name} ${accName}?`,
          answer: `Profit split and minimum trading days on the ${firm.name} ${accName} account follow ${firm.name}'s verified program schedule.`,
        },
      ];

      return {
        path: cleanPath,
        pageType: 'account',
        title,
        metaDescription: `Verified ${firm.name} ${accName} rules: daily loss limits, maximum drawdown calculation, profit split, minimum trading days, and breach math.`,
        canonicalUrl: `${BASE_URL}${cleanPath}`,
        h1: `${firm.name} — ${accName} Rules & Conditions`,
        lastmod: firm.lastVerified || '2026-09-13',
        isIndexable: true,
        breadcrumbs,
        schemaGraph: [
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbs),
          generateFAQSchema(dynamicFaqs),
        ],
      };
    }
  }

  return null;
}
