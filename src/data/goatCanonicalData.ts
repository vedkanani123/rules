/**
 * Canonical Data Registry for Goat Funded Trader (GFT)
 * Independent Intelligence & Verification Platform
 *
 * All models, rules, pricing, evidence, conflicts, and historical versions
 * are stored in this central registry.
 *
 * Verification Statuses:
 * - 'officially_verified': Confirmed directly from active official GFT documentation/terms
 * - 'official_ambiguous': Stated in official docs but contradicts other official sections or lacks clarity
 * - 'historical_rule': Officially enacted in a prior version, grandfathered or discontinued
 * - 'third_party_report': Reported by PropFirmMatch, brokers, or analytical directories
 * - 'community_reported': Reported by traders in Discord/Reddit/Trustpilot
 * - 'unverified_claim': Allegation or rumor without verifiable documentation
 * - 'conflicting_sources': Multiple credible sources state contradictory values
 */

export type VerificationStatus =
  | 'officially_verified'
  | 'official_ambiguous'
  | 'historical_rule'
  | 'third_party_report'
  | 'community_reported'
  | 'unverified'
  | 'unverified_claim'
  | 'not_applicable'
  | 'not_available'
  | 'conflicting_sources';

export type GFTCategory =
  | 'pay_later'
  | 'one_step'
  | 'two_step'
  | 'three_step'
  | 'instant'
  | 'instant_funding'
  | 'futures'
  | 'legacy';

export type TradingPlatform = 'ctrader' | 'matchtrader' | 'tradelocker' | 'mt5' | 'mt4' | 'volumetrica' | 'tradovate' | 'ninjatrader' | 'dxfeed' | 'rithmic' | 'dx-trade' | 'dxtrade' | 'das-trader' | 'wetrader' | 'match-trader' | 'tradingview' | 'r-trader' | 'wealthcharts' | string;

export type TradingStyle =
  | 'conservative'
  | 'aggressive'
  | 'news_trader'
  | 'swing_trader'
  | 'scalper'
  | 'ea_trader'
  | 'copy_trader'
  | 'weekend_holder'
  | 'futures_trader';

export interface GFTModel {
  id: string;
  name: string;
  category: GFTCategory;
  categoryLabel: string;
  tagline: string;
  badge: string;
  isEvaluation: boolean;
  stagesCount: number;
  availableSizes: number[];
  defaultSize: number;
  // Core Targets & Loss Rules
  targetsByStage: { phase1?: number; phase2?: number; phase3?: number; funded: number };
  dailyLossLimit: {
    pct: number;
    calculationType: 'balance_based' | 'equity_based' | 'trailing' | 'none';
    description: string;
    resetTime: string;
  };
  maxDrawdown: {
    pct: number;
    type: 'static' | 'trailing_eod' | 'trailing_intraday' | 'trailing_locked' | 'eod_trailing' | 'eod';
    description: string;
    locksAtInitial: boolean;
    resetsAfterPayout: boolean;
  };
  floatingLossCapPct?: number; // e.g., 1% or 2% floating loss rule
  // Trading Day Requirements
  minTradingDaysEval: number;
  minTradingDaysFunded: number;
  validDayThresholdPct: number; // e.g. 0.5% of starting capital
  maxTradingDays: string; // 'Unlimited' or number
  // Consistency & Daily Profit
  consistencyRule: {
    active: boolean;
    maxSingleDayPct?: number; // 15%, 20%, or none
    consequence: 'delay_payout' | 'breach' | 'none' | 'account_breach' | 'payout_withheld' | 'warning';
    description: string;
  };
  dailyProfitCapFunded?: number; // e.g. $3,000 / day
  // Financial terms
  profitSplit: {
    basePct: number;
    maxWithAddonPct: number;
    payoutCycleDays: number;
    firstPayoutDays: number;
    minPayoutAmount: number;
    lifetimeCap?: number;
  };
  refundableFee: boolean;
  refundConditions: string;
  leverage: {
    forex: string;
    crypto: string;
    indices: string;
    commodities: string;
  };
  supportedPlatforms: TradingPlatform[];
  allowedStyles: {
    newsTrading: 'allowed' | 'restricted' | 'prohibited';
    newsDetails: string;
    weekendHolding: 'allowed' | 'restricted' | 'prohibited';
    weekendDetails: string;
    eaTrading: 'allowed' | 'restricted' | 'prohibited';
    eaDetails: string;
    copyTrading: 'allowed' | 'restricted' | 'prohibited';
    copyDetails: string;
    vpsAllowed: boolean;
    vpsDetails: string;
  };
  // Status & Versioning
  isArchived: boolean;
  archivedDate?: string;
  currentVersion: string;
  purchaseDateApplicability: string;
  lastVerifiedDate: string;
  verificationStatus: VerificationStatus;
  confidenceScore: number; // 0 - 100
  evidenceExcerpt: string;
  sourceUrl: string;
  sourceDoc: string;
  conflictNotes?: string;
}

export interface GFTPricingEntry {
  // GFT canonical fields
  modelId: string;
  accountSize?: number;
  officialListedPrice?: number;
  verifiedCurrentPrice?: number;
  historicalPrice?: number;
  promoPriceBogo40?: number;
  promoCode?: string;
  promoDiscountPct?: number;
  promoValidity?: string;
  verificationStatus?: VerificationStatus;
  sourceUrl?: string;
  // Universal firm pricing fields (used by non-GFT canonical data)
  id?: string;
  size?: number; // alias for accountSize
  price?: number; // alias for verifiedCurrentPrice / standardPriceUsd
  nominalCapital?: number; // alias for accountSize
  standardPriceUsd?: number; // alias for officialListedPrice
  discountedPriceUsd?: number; // sale/promo price
  currency?: string;
  isRefundable?: boolean;
}

export interface GFTRuleDetail {
  id: string;
  title: string;
  category: 'drawdown' | 'evaluation' | 'funded' | 'payout' | 'trading_style' | 'prohibited' | 'platform';
  categoryLabel: string;
  applicableModels: string[]; // model ids or ['all']
  applicableStages: ('evaluation' | 'funded' | 'all')[];
  badge: string;
  summary: string;
  exactClause: string;
  howItIsCalculated: string;
  concreteExample: (size: number) => string;
  breachConsequence: 'hard_breach' | 'payout_delay' | 'profit_deduction' | 'advisory';
  consequenceDescription: string;
  verificationStatus: VerificationStatus;
  sourceName: string;
  sourceUrl: string;
  verificationDate: string;
  conflictInfo?: {
    hasConflict: boolean;
    conflictingSources: string[];
    description: string;
    recommendation: string;
  };
}

export interface GFTCommunityItem {
  id: string;
  sourceType: 'trustpilot' | 'reddit' | 'discord' | 'youtube' | 'propfirmmatch';
  date: string;
  author: string;
  rating?: number;
  topic: string;
  summary: string;
  fullQuote: string;
  isVerifiedPurchase: boolean;
  conflictsWithOfficialRule: boolean;
  officialRuleRef?: string;
  type: 'individual_experience' | 'pattern_report' | 'praise' | 'complaint';
  demonstrationDisclaimer?: string;
}

export interface GFTWarningItem {
  id: string;
  title: string;
  classification:
    | 'Important restriction'
    | 'Potential misunderstanding'
    | 'Conflicting wording'
    | 'Community complaint'
    | 'Unverified allegation'
    | 'High-risk condition'
    | 'Requires direct confirmation'
    | 'Important rule'
    | 'Favorable condition'
    | 'Standard notice'
    | 'Beneficial guarantee'
    | 'Operational standard'
    | 'Marketing claim'
    | 'Beneficial rule'
    | 'Broker backing'
    | 'Automated safeguard'
    | 'Regulatory disclosure'
    | 'Payout mechanic'
    | 'Risk mechanic'
    | string;
  severity: 'high' | 'medium' | 'info' | 'low';
  whoItAffects: string;
  whatTheIssueIs: string;
  whyItMatters: string;
  whatUserShouldVerify: string;
  verificationStatus: VerificationStatus;
  affectedModelIds: string[];
}

export interface GFTChangeHistoryItem {
  id: string;
  date: string;
  title: string;
  previousRule: string;
  newRule: string;
  affectedModels: string[];
  source: string;
  explanation: string;
  impactLevel: 'breaking' | 'minor' | 'favorable' | 'major' | 'moderate' | 'unfavorable' | 'neutral';
}

export interface GFTFuturesModel {
  id: string;
  name: string;
  nominalSize: number;
  evalPrice: number;
  profitTarget: number;
  profitTargetPct: number;
  dailyLossLimit: number;
  dailyLossPct: number;
  maxTrailingDrawdown: number;
  maxTrailingDrawdownPct: number;
  drawdownType: 'trailing_intraday' | 'trailing_eod';
  maxContracts: {
    minis: number;
    micros: number;
  };
  supportedPlatforms: string[];
  tradingHours: string;
  overnightHolding: 'prohibited' | 'restricted';
  payoutConsistencyPct: number;
  safetyBufferRequired: number;
  verificationStatus: VerificationStatus;
  verificationNotes: string;
}

export interface GFTDecisionRecommendation {
  key: string;
  title: string;
  // GFT canonical fields
  bestModelId?: string;
  bestModelName?: string;
  accountSizeRecommendation?: number;
  badge?: string;
  whyRecommended?: string;
  assumptionsUsed?: string[];
  risksAndLimitations?: string[];
  suitabilityScore?: number;
  // Universal fields used by non-GFT firms
  targetAudience?: string;
  recommendedModelId?: string;
  whyThisModel?: string;
  tradeoffToAccept?: string;
}

// ══════════════════════════════════════════════════════════════════════════════════
// 1. CANONICAL MODEL REGISTRY (13 Models across 6 Categories)
// ══════════════════════════════════════════════════════════════════════════════════
export const GFT_CANONICAL_MODELS: GFTModel[] = [
  // ── CATEGORY 1: Pay Later (1 Model) ──
  {
    id: 'pay_after_pass',
    name: 'Pay Later ($5 Entry)',
    category: 'pay_later',
    categoryLabel: 'Pay Later',
    tagline: '$5 entry evaluation with 4% target and ZERO daily loss during challenge.',
    badge: 'Lowest Barrier · $5 Entry',
    isEvaluation: true,
    stagesCount: 2, // 1 eval stage + funded
    availableSizes: [10000, 25000, 50000, 100000],
    defaultSize: 100000,
    targetsByStage: { phase1: 4, funded: 0 },
    dailyLossLimit: {
      pct: 0, // 0% in eval!
      calculationType: 'none',
      description: 'Zero daily drawdown during evaluation stage! In funded stage: 3% balance-based daily loss.',
      resetTime: '5:00 PM EST (00:00 server)',
    },
    maxDrawdown: {
      pct: 8,
      type: 'trailing_locked',
      description: '8% trailing maximum drawdown in evaluation; 6% trailing in funded master stage (locks at starting capital).',
      locksAtInitial: true,
      resetsAfterPayout: true,
    },
    floatingLossCapPct: 2,
    minTradingDaysEval: 0,
    minTradingDaysFunded: 3,
    validDayThresholdPct: 0.5,
    maxTradingDays: 'Unlimited',
    consistencyRule: {
      active: true,
      maxSingleDayPct: 20,
      consequence: 'delay_payout',
      description: 'Funded stage only: Best single trading day must not exceed 20% of requested payout. Does NOT breach account; trader simply trades additional days.',
    },
    dailyProfitCapFunded: 3000,
    profitSplit: {
      basePct: 80,
      maxWithAddonPct: 100,
      payoutCycleDays: 14,
      firstPayoutDays: 14,
      minPayoutAmount: 100,
    },
    refundableFee: false,
    refundConditions: 'Initial $5 registration fee is non-refundable. Pass activation fee is paid only upon successful completion of the 4% target.',
    leverage: { forex: '1:50', crypto: '1:2', indices: '1:20', commodities: '1:20' },
    supportedPlatforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5'],
    allowedStyles: {
      newsTrading: 'allowed',
      newsDetails: 'Allowed. 1% max profit cap within ±5 minutes of red folder news on funded accounts.',
      weekendHolding: 'allowed',
      weekendDetails: 'Allowed for FX/Crypto. Crypto trades 24/7.',
      eaTrading: 'allowed',
      eaDetails: 'Allowed. High frequency (HFT), latency arbitrage, and commercial grid EAs sharing IP clusters are prohibited.',
      copyTrading: 'restricted',
      copyDetails: 'Allowed only between accounts owned by the exact same trader. Third-party account pooling prohibited.',
      vpsAllowed: false,
      vpsDetails: 'Data-center VPS and commercial VPN IP pools prohibited from August 12, 2026. Residential static IP recommended.',
    },
    isArchived: false,
    currentVersion: 'v2026.2',
    purchaseDateApplicability: 'Active for all purchases from July 2026 onwards',
    lastVerifiedDate: '2026-09-02',
    verificationStatus: 'officially_verified',
    confidenceScore: 96,
    evidenceExcerpt: 'GFT Pay Later Model Specification: Entry fee $5. Profit target Phase 1: 4%. Daily drawdown during eval: 0%. Trailing drawdown: 8%. Activation fee due upon passing.',
    sourceUrl: 'https://help.goatfundedtrader.com/en/articles/pay-later-pass',
    sourceDoc: 'GFT Official Help Center Article 14920412',
  },

  // ── CATEGORY 2: 1-Step (2 Models) ──
  {
    id: 'one_step',
    name: '1-Step Fast',
    category: 'one_step',
    categoryLabel: '1-Step',
    tagline: 'Fast-track evaluation with single 10% target and static maximum drawdown floor.',
    badge: 'Fast Evaluation · Static DD',
    isEvaluation: true,
    stagesCount: 2,
    availableSizes: [5000, 10000, 25000, 50000, 100000, 200000],
    defaultSize: 100000,
    targetsByStage: { phase1: 10, funded: 0 },
    dailyLossLimit: {
      pct: 4, // 3% for purchases after Aug 1, 2026
      calculationType: 'balance_based',
      description: '4% balance-based daily loss limit (reduced to 3% for accounts purchased from August 1, 2026).',
      resetTime: '5:00 PM EST (00:00 server)',
    },
    maxDrawdown: {
      pct: 6,
      type: 'static',
      description: '6% permanent static maximum drawdown floor based on initial capital ($94,000 floor on a $100K account).',
      locksAtInitial: false,
      resetsAfterPayout: false,
    },
    floatingLossCapPct: 2,
    minTradingDaysEval: 3,
    minTradingDaysFunded: 4,
    validDayThresholdPct: 0.5,
    maxTradingDays: 'Unlimited',
    consistencyRule: {
      active: false,
      consequence: 'none',
      description: 'Zero consistency rule on 1-Step. Profit can be generated in any distribution across valid days.',
    },
    dailyProfitCapFunded: 3000,
    profitSplit: {
      basePct: 80,
      maxWithAddonPct: 100,
      payoutCycleDays: 14,
      firstPayoutDays: 14,
      minPayoutAmount: 100,
    },
    refundableFee: true,
    refundConditions: '100% refundable upon first successful payout on funded account.',
    leverage: { forex: '1:30', crypto: '1:2', indices: '1:20', commodities: '1:20' },
    supportedPlatforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5', 'volumetrica'],
    allowedStyles: {
      newsTrading: 'allowed',
      newsDetails: 'Allowed. 1% max profit cap within ±5 minutes of red folder news on funded accounts.',
      weekendHolding: 'allowed',
      weekendDetails: 'Allowed. Crypto open 24/7.',
      eaTrading: 'allowed',
      eaDetails: 'Allowed. Custom algorithmic strategies allowed.',
      copyTrading: 'restricted',
      copyDetails: 'Allowed between same trader accounts.',
      vpsAllowed: false,
      vpsDetails: 'Commercial VPS IP pools prohibited from August 12, 2026.',
    },
    isArchived: false,
    currentVersion: 'v2026.2 (Aug 1 update)',
    purchaseDateApplicability: 'Active; 3% daily DD applies to purchases after August 1, 2026',
    lastVerifiedDate: '2026-09-02',
    verificationStatus: 'officially_verified',
    confidenceScore: 94,
    evidenceExcerpt: '1-Step Model: 10% target, 3 minimum trading days (≥0.5% profit). 4 funded active days. 6% static max drawdown floor.',
    sourceUrl: 'https://help.goatfundedtrader.com/en/articles/1-step-evaluation',
    sourceDoc: 'GFT Model Specifications FAQ 13860595',
    conflictNotes: 'Purchases before Aug 1 retain 4% daily DD; purchases from Aug 1 are capped at 3% daily DD.',
  },
  {
    id: 'blitz',
    name: 'GOAT BLITZ',
    category: 'one_step',
    categoryLabel: '1-Step',
    tagline: 'Flash weekend-drop challenge with ultra-low 3% profit target.',
    badge: 'Flash Drop · 3% Target',
    isEvaluation: true,
    stagesCount: 2,
    availableSizes: [10000, 25000, 50000, 100000],
    defaultSize: 100000,
    targetsByStage: { phase1: 3, funded: 0 },
    dailyLossLimit: {
      pct: 3,
      calculationType: 'balance_based',
      description: '3% static daily loss limit based on balance at 5:00 PM EST.',
      resetTime: '5:00 PM EST (00:00 server)',
    },
    maxDrawdown: {
      pct: 5,
      type: 'trailing_locked',
      description: '5% trailing maximum loss floor. Trails high-water mark until it locks at starting initial capital.',
      locksAtInitial: true,
      resetsAfterPayout: true,
    },
    floatingLossCapPct: 2,
    minTradingDaysEval: 5,
    minTradingDaysFunded: 5,
    validDayThresholdPct: 0.5,
    maxTradingDays: 'Unlimited',
    consistencyRule: {
      active: true,
      maxSingleDayPct: 15,
      consequence: 'delay_payout',
      description: 'Funded stage: Best trading day must not exceed 15% of total requested reward amount. Payout delayed until balanced.',
    },
    dailyProfitCapFunded: 3000,
    profitSplit: {
      basePct: 80,
      maxWithAddonPct: 100,
      payoutCycleDays: 14,
      firstPayoutDays: 14,
      minPayoutAmount: 100,
    },
    refundableFee: true,
    refundConditions: 'Refundable on first profit payout.',
    leverage: { forex: '1:30', crypto: '1:2', indices: '1:20', commodities: '1:20' },
    supportedPlatforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5'],
    allowedStyles: {
      newsTrading: 'allowed',
      newsDetails: 'Allowed subject to 1% profit cap around high impact events.',
      weekendHolding: 'allowed',
      weekendDetails: 'Allowed.',
      eaTrading: 'allowed',
      eaDetails: 'Allowed.',
      copyTrading: 'restricted',
      copyDetails: 'Own accounts only.',
      vpsAllowed: false,
      vpsDetails: 'Prohibited from August 12, 2026.',
    },
    isArchived: false,
    currentVersion: 'v2026.1 (Weekend Drop)',
    purchaseDateApplicability: 'Released intermittently during promotional weekend flash drops',
    lastVerifiedDate: '2026-08-28',
    verificationStatus: 'officially_verified',
    confidenceScore: 92,
    evidenceExcerpt: 'GOAT Blitz Announcement: 3% Target Phase 1, 3% Daily DD, 5% Max Trailing DD, 5 minimum trading days, 15% consistency rule on funded stage.',
    sourceUrl: 'https://help.goatfundedtrader.com/en/articles/goat-blitz-rules',
    sourceDoc: 'GFT Discord Announcement & Promo Dossier',
  },

  // ── CATEGORY 3: 2-Step (2 Models) ──
  {
    id: 'two_step_standard',
    name: '2-Step Standard',
    category: 'two_step',
    categoryLabel: '2-Step',
    tagline: 'Flagship evaluation featuring generous 10% permanent static drawdown room.',
    badge: '10% Static Room · 5% Daily',
    isEvaluation: true,
    stagesCount: 3, // Phase 1, Phase 2, Funded
    availableSizes: [5000, 10000, 25000, 50000, 100000, 200000],
    defaultSize: 100000,
    targetsByStage: { phase1: 10, phase2: 5, funded: 0 },
    dailyLossLimit: {
      pct: 5,
      calculationType: 'balance_based',
      description: '5% balance-based daily loss limit. Resets at 5:00 PM EST.',
      resetTime: '5:00 PM EST (00:00 server)',
    },
    maxDrawdown: {
      pct: 10,
      type: 'static',
      description: '10% permanent static maximum drawdown floor ($90,000 fixed floor on $100,000 account regardless of profits earned).',
      locksAtInitial: false,
      resetsAfterPayout: false,
    },
    floatingLossCapPct: 2,
    minTradingDaysEval: 3,
    minTradingDaysFunded: 4,
    validDayThresholdPct: 0.5,
    maxTradingDays: 'Unlimited',
    consistencyRule: {
      active: false,
      consequence: 'none',
      description: 'Zero consistency rule on Standard. Profit can come from single high-probability trading sessions.',
    },
    dailyProfitCapFunded: 3000,
    profitSplit: {
      basePct: 80,
      maxWithAddonPct: 100,
      payoutCycleDays: 14,
      firstPayoutDays: 14,
      minPayoutAmount: 100,
    },
    refundableFee: true,
    refundConditions: '100% refundable upon first funded stage withdrawal.',
    leverage: { forex: '1:100', crypto: '1:2', indices: '1:30', commodities: '1:30' },
    supportedPlatforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5', 'volumetrica'],
    allowedStyles: {
      newsTrading: 'allowed',
      newsDetails: 'Allowed. 1% max profit cap within ±5 minutes of red folder news on funded accounts.',
      weekendHolding: 'allowed',
      weekendDetails: 'Allowed.',
      eaTrading: 'allowed',
      eaDetails: 'Allowed.',
      copyTrading: 'restricted',
      copyDetails: 'Allowed between own accounts only.',
      vpsAllowed: false,
      vpsDetails: 'Data-center VPS prohibited from August 12, 2026.',
    },
    isArchived: false,
    currentVersion: 'v2026.2',
    purchaseDateApplicability: 'Active for all current purchases',
    lastVerifiedDate: '2026-09-02',
    verificationStatus: 'officially_verified',
    confidenceScore: 98,
    evidenceExcerpt: '2-Step Standard: Phase 1 target 10%, Phase 2 target 5%. Daily DD 5%. Max DD 10% Static. 3 minimum trading days in evaluation phases. 4 valid days in funded.',
    sourceUrl: 'https://help.goatfundedtrader.com/en/',
    sourceDoc: 'GFT Knowledgebase Article 12687827',
  },
  {
    id: 'two_step_goat',
    name: '2-Step GOAT',
    category: 'two_step',
    categoryLabel: '2-Step',
    tagline: 'Balanced targets (8% Phase 1 / 6% Phase 2) with 10% static drawdown floor.',
    badge: '8% / 6% Targets · 10% Static Floor',
    isEvaluation: true,
    stagesCount: 3,
    availableSizes: [5000, 10000, 25000, 50000, 100000, 200000],
    defaultSize: 100000,
    targetsByStage: { phase1: 8, phase2: 6, funded: 0 },
    dailyLossLimit: {
      pct: 4,
      calculationType: 'balance_based',
      description: '4% balance-based daily loss limit. Resets at 5:00 PM EST.',
      resetTime: '5:00 PM EST (00:00 server)',
    },
    maxDrawdown: {
      pct: 10,
      type: 'static',
      description: '10% permanent static maximum drawdown floor ($90,000 fixed floor on $100K).',
      locksAtInitial: false,
      resetsAfterPayout: false,
    },
    floatingLossCapPct: 2,
    minTradingDaysEval: 3,
    minTradingDaysFunded: 4,
    validDayThresholdPct: 0.5,
    maxTradingDays: 'Unlimited',
    consistencyRule: {
      active: false,
      consequence: 'none',
      description: 'Zero consistency rule on 2-Step GOAT.',
    },
    dailyProfitCapFunded: 3000,
    profitSplit: {
      basePct: 80,
      maxWithAddonPct: 100,
      payoutCycleDays: 14,
      firstPayoutDays: 14,
      minPayoutAmount: 100,
    },
    refundableFee: true,
    refundConditions: '100% refundable upon first funded withdrawal.',
    leverage: { forex: '1:100', crypto: '1:2', indices: '1:30', commodities: '1:30' },
    supportedPlatforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5', 'volumetrica'],
    allowedStyles: {
      newsTrading: 'allowed',
      newsDetails: 'Allowed subject to 1% red folder profit cap.',
      weekendHolding: 'allowed',
      weekendDetails: 'Allowed.',
      eaTrading: 'allowed',
      eaDetails: 'Allowed.',
      copyTrading: 'restricted',
      copyDetails: 'Own accounts only.',
      vpsAllowed: false,
      vpsDetails: 'Prohibited from August 12, 2026.',
    },
    isArchived: false,
    currentVersion: 'v2026.2',
    purchaseDateApplicability: 'Active for all current purchases',
    lastVerifiedDate: '2026-09-02',
    verificationStatus: 'officially_verified',
    confidenceScore: 97,
    evidenceExcerpt: '2-Step GOAT: 8% Phase 1 target, 6% Phase 2 target, 4% daily loss, 10% static max drawdown floor, 3 min days per eval phase.',
    sourceUrl: 'https://help.goatfundedtrader.com/en/articles/2-step-goat',
    sourceDoc: 'GFT Knowledgebase Article 12687829',
  },

  // ── CATEGORY 4: 3-Step (1 Model) ──
  {
    id: 'three_step',
    name: '3-Step Challenge',
    category: 'three_step',
    categoryLabel: '3-Step',
    tagline: 'Lowest individual phase profit target in prop trading: 6% / 6% / 6%.',
    badge: 'Lowest Target · 6% Per Phase',
    isEvaluation: true,
    stagesCount: 4, // Phase 1, Phase 2, Phase 3, Funded
    availableSizes: [5000, 10000, 25000, 50000, 100000],
    defaultSize: 100000,
    targetsByStage: { phase1: 6, phase2: 6, phase3: 6, funded: 0 },
    dailyLossLimit: {
      pct: 4,
      calculationType: 'balance_based',
      description: '4% balance-based daily loss limit. Resets at 5:00 PM EST.',
      resetTime: '5:00 PM EST (00:00 server)',
    },
    maxDrawdown: {
      pct: 8,
      type: 'static',
      description: '8% static maximum drawdown floor ($92,000 on $100K size).',
      locksAtInitial: false,
      resetsAfterPayout: false,
    },
    floatingLossCapPct: 2,
    minTradingDaysEval: 0, // No minimum trading days in eval
    minTradingDaysFunded: 4,
    validDayThresholdPct: 0.5,
    maxTradingDays: 'Unlimited',
    consistencyRule: {
      active: false,
      consequence: 'none',
      description: 'Zero consistency rule on 3-Step.',
    },
    dailyProfitCapFunded: 3000,
    profitSplit: {
      basePct: 80,
      maxWithAddonPct: 100,
      payoutCycleDays: 14,
      firstPayoutDays: 14,
      minPayoutAmount: 100,
    },
    refundableFee: true,
    refundConditions: '100% refundable upon first funded reward.',
    leverage: { forex: '1:100', crypto: '1:2', indices: '1:30', commodities: '1:30' },
    supportedPlatforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5', 'volumetrica'],
    allowedStyles: {
      newsTrading: 'allowed',
      newsDetails: 'Allowed.',
      weekendHolding: 'allowed',
      weekendDetails: 'Allowed.',
      eaTrading: 'allowed',
      eaDetails: 'Allowed.',
      copyTrading: 'restricted',
      copyDetails: 'Own accounts only.',
      vpsAllowed: false,
      vpsDetails: 'Prohibited from August 12, 2026.',
    },
    isArchived: false,
    currentVersion: 'v2026.1',
    purchaseDateApplicability: 'Active for all current purchases',
    lastVerifiedDate: '2026-08-30',
    verificationStatus: 'officially_verified',
    confidenceScore: 93,
    evidenceExcerpt: '3-Step Challenge: 6% profit target on each of Phase 1, Phase 2, and Phase 3. 0 minimum days on Phase 1 & 2. 4% daily DD, 8% static max DD.',
    sourceUrl: 'https://help.goatfundedtrader.com/en/articles/3-step-challenge',
    sourceDoc: 'GFT Knowledgebase Article 15002914',
  },

  // ── CATEGORY 5: Instant Funding (5 Models) ──
  {
    id: 'instant_goat',
    name: 'Instant GOAT',
    category: 'instant',
    categoryLabel: 'Instant Funding',
    tagline: 'Direct simulated live capital without evaluation; 6% trailing drawdown.',
    badge: 'Instant Live · 6% Trailing',
    isEvaluation: false,
    stagesCount: 1, // Direct funded
    availableSizes: [5000, 10000, 25000, 50000, 100000],
    defaultSize: 100000,
    targetsByStage: { phase1: 0, funded: 0 },
    dailyLossLimit: {
      pct: 3,
      calculationType: 'trailing',
      description: '3% trailing daily loss limit. Resets at 5:00 PM EST.',
      resetTime: '5:00 PM EST (00:00 server)',
    },
    maxDrawdown: {
      pct: 6,
      type: 'trailing_locked',
      description: '6% trailing maximum drawdown. Locks at starting balance as profits accrue; resets after payout.',
      locksAtInitial: true,
      resetsAfterPayout: true,
    },
    floatingLossCapPct: 2,
    minTradingDaysEval: 0,
    minTradingDaysFunded: 5,
    validDayThresholdPct: 0.5,
    maxTradingDays: 'Unlimited',
    consistencyRule: {
      active: true,
      maxSingleDayPct: 15,
      consequence: 'delay_payout',
      description: '15% single-day profit cap on payouts. Account not breached; trade more days to rebalance.',
    },
    dailyProfitCapFunded: 3000,
    profitSplit: {
      basePct: 80,
      maxWithAddonPct: 100,
      payoutCycleDays: 14,
      firstPayoutDays: 14,
      minPayoutAmount: 100,
    },
    refundableFee: false,
    refundConditions: 'Instant accounts are direct activation; registration fee is not refundable.',
    leverage: { forex: '1:50', crypto: '1:2', indices: '1:20', commodities: '1:20' },
    supportedPlatforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5'],
    allowedStyles: {
      newsTrading: 'allowed',
      newsDetails: 'Allowed; 1% profit cap rule applies to trades within ±5 minutes of red folder news.',
      weekendHolding: 'allowed',
      weekendDetails: 'Allowed.',
      eaTrading: 'allowed',
      eaDetails: 'Allowed.',
      copyTrading: 'restricted',
      copyDetails: 'Own accounts only.',
      vpsAllowed: true,
      vpsDetails: 'Allowed on standard Instant GOAT.',
    },
    isArchived: false,
    currentVersion: 'v2026.2',
    purchaseDateApplicability: 'Active for all current purchases',
    lastVerifiedDate: '2026-09-02',
    verificationStatus: 'officially_verified',
    confidenceScore: 95,
    evidenceExcerpt: 'Instant GOAT: Direct master account. 3% trailing daily DD, 6% trailing max DD, 2% floating loss rule, 5 valid days (≥0.5%), 15% consistency rule.',
    sourceUrl: 'https://help.goatfundedtrader.com/en/articles/instant-funding-goat',
    sourceDoc: 'GFT Instant Master Specifications',
  },
  {
    id: 'instant_pro',
    name: 'Instant PRO',
    category: 'instant',
    categoryLabel: 'Instant Funding',
    tagline: 'Direct master account with ZERO daily drawdown limit; 4% total trailing loss.',
    badge: '0% Daily DD · No Daily Floor',
    isEvaluation: false,
    stagesCount: 1,
    availableSizes: [3000, 5000, 10000, 25000, 50000, 100000],
    defaultSize: 100000,
    targetsByStage: { phase1: 0, funded: 0 },
    dailyLossLimit: {
      pct: 0,
      calculationType: 'none',
      description: 'Zero daily drawdown! You can never breach on intraday daily loss. Only the 4% total trailing loss applies.',
      resetTime: 'None (0% Daily)',
    },
    maxDrawdown: {
      pct: 4,
      type: 'trailing_locked',
      description: '4% total trailing maximum drawdown floor. Trails high-water mark until reaching initial balance.',
      locksAtInitial: true,
      resetsAfterPayout: false,
    },
    floatingLossCapPct: 2,
    minTradingDaysEval: 0,
    minTradingDaysFunded: 5,
    validDayThresholdPct: 0.5,
    maxTradingDays: 'Unlimited',
    consistencyRule: {
      active: true,
      maxSingleDayPct: 20,
      consequence: 'delay_payout',
      description: '20% single-day profit cap on payout requests.',
    },
    dailyProfitCapFunded: 3000,
    profitSplit: {
      basePct: 80,
      maxWithAddonPct: 100,
      payoutCycleDays: 14,
      firstPayoutDays: 14,
      minPayoutAmount: 100,
    },
    refundableFee: false,
    refundConditions: 'Non-refundable.',
    leverage: { forex: '1:50', crypto: '1:2', indices: '1:20', commodities: '1:20' },
    supportedPlatforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5'],
    allowedStyles: {
      newsTrading: 'allowed',
      newsDetails: 'Allowed.',
      weekendHolding: 'allowed',
      weekendDetails: 'Allowed.',
      eaTrading: 'allowed',
      eaDetails: 'Allowed.',
      copyTrading: 'restricted',
      copyDetails: 'Own accounts only.',
      vpsAllowed: false,
      vpsDetails: 'Prohibited from August 12, 2026.',
    },
    isArchived: false,
    currentVersion: 'v2026.2',
    purchaseDateApplicability: 'Active for all current purchases',
    lastVerifiedDate: '2026-09-02',
    verificationStatus: 'officially_verified',
    confidenceScore: 94,
    evidenceExcerpt: 'Instant PRO: 0% daily drawdown limit, 4% max trailing drawdown, 2% floating loss, 20% consistency rule, 5 valid days.',
    sourceUrl: 'https://help.goatfundedtrader.com/en/articles/instant-pro',
    sourceDoc: 'GFT Instant PRO Specifications',
  },
  {
    id: 'instant_premium',
    name: 'Instant Premium ⚡',
    category: 'instant',
    categoryLabel: 'Instant Funding',
    tagline: 'Fastest 10-day reward cycle in prop industry with ZERO consistency rule.',
    badge: '10-Day Rewards · 0% Consistency',
    isEvaluation: false,
    stagesCount: 1,
    availableSizes: [5000, 10000, 25000, 50000, 100000],
    defaultSize: 100000,
    targetsByStage: { phase1: 0, funded: 0 },
    dailyLossLimit: {
      pct: 3,
      calculationType: 'balance_based',
      description: '3% balance-based daily loss limit. Resets at 5:00 PM EST.',
      resetTime: '5:00 PM EST (00:00 server)',
    },
    maxDrawdown: {
      pct: 6,
      type: 'trailing_intraday',
      description: '6% intraday trailing maximum drawdown. Evaluated tick-by-tick against high-water equity.',
      locksAtInitial: true,
      resetsAfterPayout: false,
    },
    floatingLossCapPct: 1, // tightened from 1.5% to 1% on Sept 2, 2026
    minTradingDaysEval: 0,
    minTradingDaysFunded: 5,
    validDayThresholdPct: 0.5,
    maxTradingDays: 'Unlimited',
    consistencyRule: {
      active: false,
      consequence: 'none',
      description: 'ZERO consistency rule! Full profits from any single trading session are 100% withdrawable.',
    },
    dailyProfitCapFunded: 3000,
    profitSplit: {
      basePct: 80,
      maxWithAddonPct: 100,
      payoutCycleDays: 10, // 10-day rewards!
      firstPayoutDays: 10,
      minPayoutAmount: 100,
    },
    refundableFee: false,
    refundConditions: 'Non-refundable.',
    leverage: { forex: '1:50', crypto: '1:2', indices: '1:20', commodities: '1:20' },
    supportedPlatforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5'],
    allowedStyles: {
      newsTrading: 'allowed',
      newsDetails: 'Allowed.',
      weekendHolding: 'allowed',
      weekendDetails: 'Allowed.',
      eaTrading: 'allowed',
      eaDetails: 'Allowed.',
      copyTrading: 'restricted',
      copyDetails: 'Own accounts only.',
      vpsAllowed: false,
      vpsDetails: 'Prohibited from August 12, 2026.',
    },
    isArchived: false,
    currentVersion: 'v2026.3 (Sept 2 Floating Loss Update)',
    purchaseDateApplicability: 'Active; 1% floating loss rule applies to all active and new positions from Sept 2, 2026',
    lastVerifiedDate: '2026-09-02',
    verificationStatus: 'officially_verified',
    confidenceScore: 96,
    evidenceExcerpt: 'Instant Premium: 10-day reward cycle, 0% consistency rule, 3% daily DD, 6% intraday trailing DD, 1% floating loss rule (updated from 1.5% on Sept 2, 2026).',
    sourceUrl: 'https://help.goatfundedtrader.com/en/articles/instant-premium',
    sourceDoc: 'GFT Official Announcement & Help Article',
    conflictNotes: 'Older marketing claimed 1.5% floating loss; official term as of Sept 2, 2026 is strictly 1% max floating loss per trade/basket.',
  },
  {
    id: 'instant_hero',
    name: 'Instant HERO 👑',
    category: 'instant',
    categoryLabel: 'Instant Funding',
    tagline: 'Immediate live trading starting at 90% base profit split from Day 1.',
    badge: '90% Base Split · 5% Trailing',
    isEvaluation: false,
    stagesCount: 1,
    availableSizes: [5000, 10000, 25000, 50000, 100000],
    defaultSize: 100000,
    targetsByStage: { phase1: 0, funded: 0 },
    dailyLossLimit: {
      pct: 3,
      calculationType: 'trailing',
      description: '3% trailing daily drawdown limit.',
      resetTime: '5:00 PM EST (00:00 server)',
    },
    maxDrawdown: {
      pct: 5,
      type: 'trailing_locked',
      description: '5% trailing maximum loss floor. Locks at starting balance as profits accrue.',
      locksAtInitial: true,
      resetsAfterPayout: true,
    },
    floatingLossCapPct: 1,
    minTradingDaysEval: 0,
    minTradingDaysFunded: 6,
    validDayThresholdPct: 0.5,
    maxTradingDays: 'Unlimited',
    consistencyRule: {
      active: true,
      maxSingleDayPct: 15,
      consequence: 'delay_payout',
      description: '15% single-day profit cap on payout requests.',
    },
    dailyProfitCapFunded: 3000,
    profitSplit: {
      basePct: 90, // 90% from Day 1!
      maxWithAddonPct: 100,
      payoutCycleDays: 14,
      firstPayoutDays: 14,
      minPayoutAmount: 100,
    },
    refundableFee: false,
    refundConditions: 'Non-refundable.',
    leverage: { forex: '1:50', crypto: '1:2', indices: '1:20', commodities: '1:20' },
    supportedPlatforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5'],
    allowedStyles: {
      newsTrading: 'allowed',
      newsDetails: 'Allowed.',
      weekendHolding: 'allowed',
      weekendDetails: 'Allowed.',
      eaTrading: 'allowed',
      eaDetails: 'Allowed.',
      copyTrading: 'restricted',
      copyDetails: 'Own accounts only.',
      vpsAllowed: true,
      vpsDetails: 'Allowed.',
    },
    isArchived: false,
    currentVersion: 'v2026.2',
    purchaseDateApplicability: 'Active for all current purchases',
    lastVerifiedDate: '2026-09-02',
    verificationStatus: 'officially_verified',
    confidenceScore: 93,
    evidenceExcerpt: 'Instant HERO: 90% base profit split from Day 1. 3% trailing daily DD, 5% trailing max DD, 1% floating loss rule, 6 valid trading days (≥0.5%).',
    sourceUrl: 'https://help.goatfundedtrader.com/en/articles/instant-hero',
    sourceDoc: 'GFT Instant HERO Specifications',
  },
  {
    id: 'goat_1',
    name: 'Goat $1 🪙',
    category: 'instant',
    categoryLabel: 'Instant Funding',
    tagline: '$1.00 entry ticket for $1,000 live account with 28-day lifespan and $100 payout cap.',
    badge: '$1.00 Ticket · $100 Cap',
    isEvaluation: false,
    stagesCount: 1,
    availableSizes: [1000],
    defaultSize: 1000,
    targetsByStage: { phase1: 0, funded: 0 },
    dailyLossLimit: {
      pct: 3,
      calculationType: 'balance_based',
      description: '3% static daily loss floor ($30 on $1,000 size).',
      resetTime: '5:00 PM EST (00:00 server)',
    },
    maxDrawdown: {
      pct: 6,
      type: 'trailing_eod',
      description: '6% trailing End-of-Day maximum loss floor ($60 on $1,000 capital).',
      locksAtInitial: true,
      resetsAfterPayout: false,
    },
    floatingLossCapPct: 2, // $20 floating loss cap
    minTradingDaysEval: 0,
    minTradingDaysFunded: 3,
    validDayThresholdPct: 0.5, // $5 profit per day
    maxTradingDays: '28 Calendar Days',
    consistencyRule: {
      active: true,
      maxSingleDayPct: 15,
      consequence: 'delay_payout',
      description: '15% single-day profit cap on payout requests.',
    },
    dailyProfitCapFunded: 100,
    profitSplit: {
      basePct: 80,
      maxWithAddonPct: 80,
      payoutCycleDays: 14,
      firstPayoutDays: 14,
      minPayoutAmount: 100,
      lifetimeCap: 100, // Total maximum withdrawal ever
    },
    refundableFee: false,
    refundConditions: 'Non-refundable $1 ticket.',
    leverage: { forex: '1:50', crypto: '1:2', indices: '1:20', commodities: '1:20' },
    supportedPlatforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5'],
    allowedStyles: {
      newsTrading: 'allowed',
      newsDetails: 'Allowed.',
      weekendHolding: 'allowed',
      weekendDetails: 'Allowed.',
      eaTrading: 'allowed',
      eaDetails: 'Allowed.',
      copyTrading: 'restricted',
      copyDetails: 'Strict 1 account per human identity.',
      vpsAllowed: true,
      vpsDetails: 'Allowed.',
    },
    isArchived: false,
    currentVersion: 'v2026.1',
    purchaseDateApplicability: 'Active; 1 per user lifetime limit',
    lastVerifiedDate: '2026-08-25',
    verificationStatus: 'officially_verified',
    confidenceScore: 95,
    evidenceExcerpt: 'Goat $1: $1 entry, $1,000 capital. 28-day account expiration. Max withdrawable profit capped at $100. 1 purchase per customer.',
    sourceUrl: 'https://help.goatfundedtrader.com/en/articles/goat-1-dollar',
    sourceDoc: 'GFT Goat $1 Official Terms',
  },

  // ── CATEGORY 6: Legacy / Archived (2 Models) ──
  {
    id: 'two_step_pro',
    name: '2-Step PRO (Archived)',
    category: 'legacy',
    categoryLabel: 'Legacy / Archived',
    tagline: 'Discontinued June 13, 2026. Grandfathered accounts trade under original terms.',
    badge: 'Discontinued Jun 13, 2026',
    isEvaluation: true,
    stagesCount: 3,
    availableSizes: [5000, 10000, 25000, 50000, 100000],
    defaultSize: 100000,
    targetsByStage: { phase1: 8, phase2: 4, funded: 0 },
    dailyLossLimit: {
      pct: 4,
      calculationType: 'balance_based',
      description: '4% balance-based daily loss limit.',
      resetTime: '5:00 PM EST (00:00 server)',
    },
    maxDrawdown: {
      pct: 8,
      type: 'trailing_locked',
      description: '8% trailing maximum drawdown floor.',
      locksAtInitial: true,
      resetsAfterPayout: true,
    },
    floatingLossCapPct: 2,
    minTradingDaysEval: 3,
    minTradingDaysFunded: 3,
    validDayThresholdPct: 0.5,
    maxTradingDays: 'Unlimited',
    consistencyRule: {
      active: true,
      maxSingleDayPct: 20,
      consequence: 'delay_payout',
      description: '20% single-day profit cap.',
    },
    dailyProfitCapFunded: 3000,
    profitSplit: {
      basePct: 80,
      maxWithAddonPct: 95,
      payoutCycleDays: 14,
      firstPayoutDays: 14,
      minPayoutAmount: 100,
    },
    refundableFee: true,
    refundConditions: 'Refundable on first payout for grandfathered active accounts.',
    leverage: { forex: '1:60', crypto: '1:2', indices: '1:20', commodities: '1:20' },
    supportedPlatforms: ['ctrader', 'matchtrader', 'tradelocker', 'mt5'],
    allowedStyles: {
      newsTrading: 'allowed',
      newsDetails: 'Allowed under grandfathered terms.',
      weekendHolding: 'allowed',
      weekendDetails: 'Allowed.',
      eaTrading: 'allowed',
      eaDetails: 'Allowed.',
      copyTrading: 'restricted',
      copyDetails: 'Own accounts only.',
      vpsAllowed: false,
      vpsDetails: 'Subject to Aug 12 VPS restriction.',
    },
    isArchived: true,
    archivedDate: '2026-06-13',
    currentVersion: 'Archived (Grandfathered only)',
    purchaseDateApplicability: 'Applicable ONLY to purchases made on or before June 13, 2026. Cannot be bought today.',
    lastVerifiedDate: '2026-06-13',
    verificationStatus: 'historical_rule',
    confidenceScore: 90,
    evidenceExcerpt: 'GFT Changelog 2026-06-13: 2-Step PRO is officially discontinued for new orders. Existing active accounts will remain fully supported under legacy rules.',
    sourceUrl: 'https://help.goatfundedtrader.com/en/articles/legacy-models',
    sourceDoc: 'GFT Product Retirement Notice June 2026',
  },
  {
    id: 'instant_standard',
    name: 'Instant Standard (Archived)',
    category: 'legacy',
    categoryLabel: 'Legacy / Archived',
    tagline: 'Discontinued Sept 22, 2025. Replaced by Instant GOAT and Instant Premium.',
    badge: 'Discontinued Sept 22, 2025',
    isEvaluation: false,
    stagesCount: 1,
    availableSizes: [5000, 10000, 25000, 50000, 100000],
    defaultSize: 100000,
    targetsByStage: { phase1: 0, funded: 0 },
    dailyLossLimit: {
      pct: 4,
      calculationType: 'trailing',
      description: '4% trailing daily drawdown limit.',
      resetTime: '5:00 PM EST (00:00 server)',
    },
    maxDrawdown: {
      pct: 8,
      type: 'trailing_locked',
      description: '8% trailing maximum drawdown floor.',
      locksAtInitial: true,
      resetsAfterPayout: true,
    },
    floatingLossCapPct: 2,
    minTradingDaysEval: 0,
    minTradingDaysFunded: 5,
    validDayThresholdPct: 0.5,
    maxTradingDays: 'Unlimited',
    consistencyRule: {
      active: true,
      maxSingleDayPct: 20,
      consequence: 'delay_payout',
      description: '20% consistency rule.',
    },
    dailyProfitCapFunded: 2500,
    profitSplit: {
      basePct: 75,
      maxWithAddonPct: 90,
      payoutCycleDays: 14,
      firstPayoutDays: 14,
      minPayoutAmount: 100,
    },
    refundableFee: false,
    refundConditions: 'Non-refundable.',
    leverage: { forex: '1:30', crypto: '1:2', indices: '1:15', commodities: '1:15' },
    supportedPlatforms: ['mt5', 'tradelocker'],
    allowedStyles: {
      newsTrading: 'allowed',
      newsDetails: 'Grandfathered.',
      weekendHolding: 'allowed',
      weekendDetails: 'Grandfathered.',
      eaTrading: 'allowed',
      eaDetails: 'Grandfathered.',
      copyTrading: 'restricted',
      copyDetails: 'Grandfathered.',
      vpsAllowed: true,
      vpsDetails: 'Allowed for legacy holders.',
    },
    isArchived: true,
    archivedDate: '2025-09-22',
    currentVersion: 'Archived (Grandfathered only)',
    purchaseDateApplicability: 'Applicable ONLY to purchases made on or before Sept 22, 2025. Cannot be bought today.',
    lastVerifiedDate: '2025-09-22',
    verificationStatus: 'historical_rule',
    confidenceScore: 88,
    evidenceExcerpt: 'GFT Changelog 2025-09-22: Instant Standard retired. Replaced by Instant GOAT and Instant Premium.',
    sourceUrl: 'https://help.goatfundedtrader.com/en/articles/legacy-models',
    sourceDoc: 'GFT Product Retirement Notice Sept 2025',
  },
];

// ══════════════════════════════════════════════════════════════════════════════════
// 2. FUTURES SEPARATE REGISTRY (Phase 8)
// ══════════════════════════════════════════════════════════════════════════════════
export const GFT_FUTURES_MODELS: GFTFuturesModel[] = [
  {
    id: 'futures-25k',
    name: 'Futures Challenge $25,000',
    nominalSize: 25000,
    evalPrice: 149,
    profitTarget: 1500,
    profitTargetPct: 6,
    dailyLossLimit: 1000,
    dailyLossPct: 4,
    maxTrailingDrawdown: 1500,
    maxTrailingDrawdownPct: 6,
    drawdownType: 'trailing_eod',
    maxContracts: { minis: 3, micros: 30 },
    supportedPlatforms: ['Volumetrica', 'Tradovate', 'NinjaTrader', 'ProjectX'],
    tradingHours: 'CME Market Hours (Closed during CME daily maintenance 5:00 PM - 6:00 PM EST)',
    overnightHolding: 'prohibited',
    payoutConsistencyPct: 20,
    safetyBufferRequired: 1500,
    verificationStatus: 'officially_verified',
    verificationNotes: 'Strict CME market closure: All positions must be flat before 4:59 PM EST. Overnight positions incur automated liquidation breach.',
  },
  {
    id: 'futures-50k',
    name: 'Futures Challenge $50,000',
    nominalSize: 50000,
    evalPrice: 249,
    profitTarget: 3000,
    profitTargetPct: 6,
    dailyLossLimit: 2000,
    dailyLossPct: 4,
    maxTrailingDrawdown: 2500,
    maxTrailingDrawdownPct: 5,
    drawdownType: 'trailing_eod',
    maxContracts: { minis: 6, micros: 60 },
    supportedPlatforms: ['Volumetrica', 'Tradovate', 'NinjaTrader', 'ProjectX'],
    tradingHours: 'CME Market Hours (All trades closed prior to 4:59 PM EST)',
    overnightHolding: 'prohibited',
    payoutConsistencyPct: 20,
    safetyBufferRequired: 2500,
    verificationStatus: 'officially_verified',
    verificationNotes: 'EOD Trailing Drawdown calculated at 5:00 PM EST CME settlement.',
  },
  {
    id: 'futures-100k',
    name: 'Futures Challenge $100,000',
    nominalSize: 100000,
    evalPrice: 429,
    profitTarget: 6000,
    profitTargetPct: 6,
    dailyLossLimit: 3000,
    dailyLossPct: 3,
    maxTrailingDrawdown: 3500,
    maxTrailingDrawdownPct: 3.5,
    drawdownType: 'trailing_eod',
    maxContracts: { minis: 10, micros: 100 },
    supportedPlatforms: ['Volumetrica', 'Tradovate', 'NinjaTrader', 'ProjectX'],
    tradingHours: 'CME Market Hours',
    overnightHolding: 'prohibited',
    payoutConsistencyPct: 20,
    safetyBufferRequired: 3500,
    verificationStatus: 'officially_verified',
    verificationNotes: 'Max 10 standard contracts across ES, NQ, YM, CL, GC.',
  },
  {
    id: 'futures-150k',
    name: 'Futures Challenge $150,000',
    nominalSize: 150000,
    evalPrice: 599,
    profitTarget: 9000,
    profitTargetPct: 6,
    dailyLossLimit: 4500,
    dailyLossPct: 3,
    maxTrailingDrawdown: 5000,
    maxTrailingDrawdownPct: 3.33,
    drawdownType: 'trailing_eod',
    maxContracts: { minis: 15, micros: 150 },
    supportedPlatforms: ['Volumetrica', 'Tradovate', 'NinjaTrader', 'ProjectX'],
    tradingHours: 'CME Market Hours',
    overnightHolding: 'prohibited',
    payoutConsistencyPct: 20,
    safetyBufferRequired: 5000,
    verificationStatus: 'officially_verified',
    verificationNotes: 'Data feed fee may apply after passing evaluation depending on platform selection.',
  },
];

// ══════════════════════════════════════════════════════════════════════════════════
// 3. CANONICAL PRICING REGISTRY (Exact prices by model and size)
// ══════════════════════════════════════════════════════════════════════════════════
export const GFT_PRICING_REGISTRY: GFTPricingEntry[] = [
  // Pay Later ($5 upfront entry)
  { modelId: 'pay_after_pass', accountSize: 10000, officialListedPrice: 5, verifiedCurrentPrice: 5, promoPriceBogo40: 5, promoCode: 'BOGO35', promoDiscountPct: 0, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'pay_after_pass', accountSize: 25000, officialListedPrice: 5, verifiedCurrentPrice: 5, promoPriceBogo40: 5, promoCode: 'BOGO35', promoDiscountPct: 0, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'pay_after_pass', accountSize: 50000, officialListedPrice: 5, verifiedCurrentPrice: 5, promoPriceBogo40: 5, promoCode: 'BOGO35', promoDiscountPct: 0, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'pay_after_pass', accountSize: 100000, officialListedPrice: 5, verifiedCurrentPrice: 5, promoPriceBogo40: 5, promoCode: 'BOGO35', promoDiscountPct: 0, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },

  // 1-Step Fast
  { modelId: 'one_step', accountSize: 5000, officialListedPrice: 50, verifiedCurrentPrice: 50, promoPriceBogo40: 30, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active (Current BOGO Campaign)', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'one_step', accountSize: 10000, officialListedPrice: 95, verifiedCurrentPrice: 95, promoPriceBogo40: 57, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'one_step', accountSize: 25000, officialListedPrice: 195, verifiedCurrentPrice: 195, promoPriceBogo40: 117, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'one_step', accountSize: 50000, officialListedPrice: 295, verifiedCurrentPrice: 295, promoPriceBogo40: 177, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'one_step', accountSize: 100000, officialListedPrice: 495, verifiedCurrentPrice: 495, promoPriceBogo40: 297, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'one_step', accountSize: 200000, officialListedPrice: 949, verifiedCurrentPrice: 949, promoPriceBogo40: 569.4, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },

  // GOAT BLITZ
  { modelId: 'blitz', accountSize: 10000, officialListedPrice: 85, verifiedCurrentPrice: 85, promoPriceBogo40: 51, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Weekend Drop Only', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'blitz', accountSize: 25000, officialListedPrice: 175, verifiedCurrentPrice: 175, promoPriceBogo40: 105, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Weekend Drop Only', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'blitz', accountSize: 50000, officialListedPrice: 265, verifiedCurrentPrice: 265, promoPriceBogo40: 159, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Weekend Drop Only', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'blitz', accountSize: 100000, officialListedPrice: 445, verifiedCurrentPrice: 445, promoPriceBogo40: 267, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Weekend Drop Only', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },

  // 2-Step Standard
  { modelId: 'two_step_standard', accountSize: 5000, officialListedPrice: 55, verifiedCurrentPrice: 55, promoPriceBogo40: 33, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'two_step_standard', accountSize: 10000, officialListedPrice: 105, verifiedCurrentPrice: 105, promoPriceBogo40: 63, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'two_step_standard', accountSize: 25000, officialListedPrice: 205, verifiedCurrentPrice: 205, promoPriceBogo40: 123, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'two_step_standard', accountSize: 50000, officialListedPrice: 305, verifiedCurrentPrice: 305, promoPriceBogo40: 183, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'two_step_standard', accountSize: 100000, officialListedPrice: 499, verifiedCurrentPrice: 499, promoPriceBogo40: 299.4, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'two_step_standard', accountSize: 200000, officialListedPrice: 979, verifiedCurrentPrice: 979, promoPriceBogo40: 587.4, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },

  // 2-Step GOAT
  { modelId: 'two_step_goat', accountSize: 5000, officialListedPrice: 60, verifiedCurrentPrice: 60, promoPriceBogo40: 36, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'two_step_goat', accountSize: 10000, officialListedPrice: 110, verifiedCurrentPrice: 110, promoPriceBogo40: 66, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'two_step_goat', accountSize: 25000, officialListedPrice: 215, verifiedCurrentPrice: 215, promoPriceBogo40: 129, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'two_step_goat', accountSize: 50000, officialListedPrice: 320, verifiedCurrentPrice: 320, promoPriceBogo40: 192, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'two_step_goat', accountSize: 100000, officialListedPrice: 519, verifiedCurrentPrice: 519, promoPriceBogo40: 311.4, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'two_step_goat', accountSize: 200000, officialListedPrice: 999, verifiedCurrentPrice: 999, promoPriceBogo40: 599.4, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },

  // 3-Step Challenge
  { modelId: 'three_step', accountSize: 5000, officialListedPrice: 45, verifiedCurrentPrice: 45, promoPriceBogo40: 27, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'three_step', accountSize: 10000, officialListedPrice: 85, verifiedCurrentPrice: 85, promoPriceBogo40: 51, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'three_step', accountSize: 25000, officialListedPrice: 165, verifiedCurrentPrice: 165, promoPriceBogo40: 99, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'three_step', accountSize: 50000, officialListedPrice: 245, verifiedCurrentPrice: 245, promoPriceBogo40: 147, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'three_step', accountSize: 100000, officialListedPrice: 395, verifiedCurrentPrice: 395, promoPriceBogo40: 237, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },

  // Instant GOAT
  { modelId: 'instant_goat', accountSize: 5000, officialListedPrice: 180, verifiedCurrentPrice: 180, promoPriceBogo40: 108, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'instant_goat', accountSize: 10000, officialListedPrice: 340, verifiedCurrentPrice: 340, promoPriceBogo40: 204, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'instant_goat', accountSize: 25000, officialListedPrice: 790, verifiedCurrentPrice: 790, promoPriceBogo40: 474, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'instant_goat', accountSize: 50000, officialListedPrice: 1490, verifiedCurrentPrice: 1490, promoPriceBogo40: 894, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'instant_goat', accountSize: 100000, officialListedPrice: 2790, verifiedCurrentPrice: 2790, promoPriceBogo40: 1674, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },

  // Instant PRO (0% Daily)
  { modelId: 'instant_pro', accountSize: 3000, officialListedPrice: 145, verifiedCurrentPrice: 145, promoPriceBogo40: 87, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'instant_pro', accountSize: 5000, officialListedPrice: 210, verifiedCurrentPrice: 210, promoPriceBogo40: 126, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'instant_pro', accountSize: 10000, officialListedPrice: 395, verifiedCurrentPrice: 395, promoPriceBogo40: 237, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'instant_pro', accountSize: 25000, officialListedPrice: 895, verifiedCurrentPrice: 895, promoPriceBogo40: 537, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'instant_pro', accountSize: 50000, officialListedPrice: 1690, verifiedCurrentPrice: 1690, promoPriceBogo40: 1014, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'instant_pro', accountSize: 100000, officialListedPrice: 3190, verifiedCurrentPrice: 3190, promoPriceBogo40: 1914, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },

  // Instant Premium ⚡ (10-Day Rewards, 0% Consistency)
  { modelId: 'instant_premium', accountSize: 5000, officialListedPrice: 225, verifiedCurrentPrice: 225, promoPriceBogo40: 135, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'instant_premium', accountSize: 10000, officialListedPrice: 420, verifiedCurrentPrice: 420, promoPriceBogo40: 252, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'instant_premium', accountSize: 25000, officialListedPrice: 960, verifiedCurrentPrice: 960, promoPriceBogo40: 576, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'instant_premium', accountSize: 50000, officialListedPrice: 1790, verifiedCurrentPrice: 1790, promoPriceBogo40: 1074, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'instant_premium', accountSize: 100000, officialListedPrice: 3390, verifiedCurrentPrice: 3390, promoPriceBogo40: 2034, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },

  // Instant HERO 👑 (90% Split)
  { modelId: 'instant_hero', accountSize: 5000, officialListedPrice: 245, verifiedCurrentPrice: 245, promoPriceBogo40: 147, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'instant_hero', accountSize: 10000, officialListedPrice: 460, verifiedCurrentPrice: 460, promoPriceBogo40: 276, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'instant_hero', accountSize: 25000, officialListedPrice: 1050, verifiedCurrentPrice: 1050, promoPriceBogo40: 630, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'instant_hero', accountSize: 50000, officialListedPrice: 1950, verifiedCurrentPrice: 1950, promoPriceBogo40: 1170, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'instant_hero', accountSize: 100000, officialListedPrice: 3690, verifiedCurrentPrice: 3690, promoPriceBogo40: 2214, promoCode: 'BOGO40', promoDiscountPct: 40, promoValidity: 'Active', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },

  // Goat $1
  { modelId: 'goat_1', accountSize: 1000, officialListedPrice: 1, verifiedCurrentPrice: 1, promoPriceBogo40: 1, promoCode: 'NONE', promoDiscountPct: 0, promoValidity: '1 Per Trader Lifetime', verificationStatus: 'officially_verified', sourceUrl: 'https://goatfundedtrader.com' },

  // Legacy Models (Historical prices for reference only)
  { modelId: 'two_step_pro', accountSize: 100000, officialListedPrice: 549, verifiedCurrentPrice: 549, historicalPrice: 549, promoValidity: 'Discontinued June 13, 2026', verificationStatus: 'historical_rule', sourceUrl: 'https://goatfundedtrader.com' },
  { modelId: 'instant_standard', accountSize: 100000, officialListedPrice: 2650, verifiedCurrentPrice: 2650, historicalPrice: 2650, promoValidity: 'Discontinued Sept 22, 2025', verificationStatus: 'historical_rule', sourceUrl: 'https://goatfundedtrader.com' },
];

// ══════════════════════════════════════════════════════════════════════════════════
// 4. CANONICAL RULES ENCYCLOPEDIA (Full Rule Explorer)
// ══════════════════════════════════════════════════════════════════════════════════
export const GFT_CANONICAL_RULES: GFTRuleDetail[] = [
  {
    id: 'rule-daily-drawdown',
    title: 'Daily Drawdown Calculation & Server Rollover',
    category: 'drawdown',
    categoryLabel: 'Drawdown Engine',
    applicableModels: ['all'],
    applicableStages: ['all'],
    badge: 'Hard Breach Trigger',
    summary: 'Calculated at 5:00 PM EST (00:00 server rollover) based on higher of balance or equity. Resets daily.',
    exactClause: 'Daily loss resets at 5:00 PM Eastern Standard Time. Calculated as: Daily Breach Floor = Starting Balance at 5 PM EST - (Initial Capital * Daily Loss %). Touching this floor during live trading incurs immediate account breach.',
    howItIsCalculated: 'Daily floor is determined by starting balance at 5:00 PM EST rollover. Any floating drawdown during the next 24 hours that causes account equity to hit this floor triggers account liquidation.',
    concreteExample: (size) => `On a $${size.toLocaleString()} account with a 4% daily limit, your maximum daily loss is $${(size * 0.04).toLocaleString()}. If day starts at $${size.toLocaleString()}, breach floor is $${(size * 0.96).toLocaleString()}. Pay Later Challenge and Instant PRO have 0% daily DD!`,
    breachConsequence: 'hard_breach',
    consequenceDescription: 'Hard breach: All open positions closed immediately; account closed permanently with no refund.',
    verificationStatus: 'officially_verified',
    sourceName: 'GFT Knowledgebase Article 12687827',
    sourceUrl: 'https://help.goatfundedtrader.com/en/articles/daily-drawdown-explained',
    verificationDate: '2026-09-02',
    conflictInfo: {
      hasConflict: true,
      conflictingSources: ['Knowledgebase FAQ 12687827', 'Announcement Aug 1 2026'],
      description: '1-Step accounts purchased before August 1, 2026 retain 4% daily loss; accounts purchased after August 1, 2026 are capped at 3% daily loss.',
      recommendation: 'Check your account registration timestamp in the trader dashboard before calculating your daily buffer.',
    },
  },
  {
    id: 'rule-max-drawdown-types',
    title: 'Maximum Drawdown Mechanics: Static vs Trailing vs Locked',
    category: 'drawdown',
    categoryLabel: 'Drawdown Engine',
    applicableModels: ['all'],
    applicableStages: ['all'],
    badge: 'Core Risk Limit',
    summary: '2-Step models feature permanent Static floors. 1-Step, Pay Later, and Instant models feature Trailing floors that lock at starting capital.',
    exactClause: 'Static drawdown remains fixed at initial capital minus allowed percentage forever. Trailing drawdown tracks highest equity achieved at daily settlement until the floor equals initial balance, where it permanently locks.',
    howItIsCalculated: 'Static: Floor = Capital * (1 - MaxDD%). Trailing: Floor = High-Water Mark * (1 - MaxDD%), capped at Initial Capital.',
    concreteExample: (size) => `On a $${size.toLocaleString()} 2-Step Standard (10% Static), floor is permanently $${(size * 0.9).toLocaleString()} even if your balance grows to $${(size * 1.15).toLocaleString()}. On Instant GOAT (6% Trailing), the floor starts at $${(size * 0.94).toLocaleString()} and trails up with profit until locking at $${size.toLocaleString()}.`,
    breachConsequence: 'hard_breach',
    consequenceDescription: 'Hard breach: Account terminated immediately.',
    verificationStatus: 'officially_verified',
    sourceName: 'GFT Model Specifications FAQ 10742114',
    sourceUrl: 'https://help.goatfundedtrader.com/en/articles/max-drawdown-types',
    verificationDate: '2026-09-02',
  },
  {
    id: 'rule-consistency-cap',
    title: 'Consistency Rule (15% - 20% Single-Day Profit Cap)',
    category: 'funded',
    categoryLabel: 'Funded & Payout Rules',
    applicableModels: ['pay_after_pass', 'blitz', 'instant_goat', 'instant_pro', 'instant_hero', 'goat_1'],
    applicableStages: ['funded'],
    badge: 'Withdrawal Buffer',
    summary: 'Your most profitable calendar day cannot exceed 15% or 20% of requested payout. NEVER breaches the account.',
    exactClause: 'The consistency rule applies strictly to payout eligibility on designated models. If your highest profit day represents more than the stated percentage of total profit, the withdrawal is paused. You simply continue trading to balance profit distribution.',
    howItIsCalculated: 'Max Allowed Single-Day Profit = Total Requested Profit * Consistency Threshold (15% or 20%). If highest day > threshold, excess must be diluted over subsequent trading days.',
    concreteExample: (size) => `If requesting a $5,000 payout with a 20% consistency rule, no single calendar day can have generated more than $1,000 (20% of $5,000). Instant Premium and 2-Step Standard have ZERO consistency rules!`,
    breachConsequence: 'payout_delay',
    consequenceDescription: 'Advisory payout delay only. Account remains active; trader must trade additional profitable days to dilute the single-day ratio.',
    verificationStatus: 'officially_verified',
    sourceName: 'GFT FAQ 15290379 & Terms Clause 8.4',
    sourceUrl: 'https://help.goatfundedtrader.com/en/articles/consistency-rule',
    verificationDate: '2026-09-02',
  },
  {
    id: 'rule-floating-loss-cap',
    title: 'Floating Loss Cap (1% - 2% Rule on Instant Models)',
    category: 'trading_style',
    categoryLabel: 'Intraday Risk Engine',
    applicableModels: ['pay_after_pass', 'blitz', 'instant_goat', 'instant_pro', 'instant_premium', 'instant_hero'],
    applicableStages: ['all'],
    badge: 'Critical Trap Watchout',
    summary: 'At no time may the floating unrealized drawdown of an open position or basket exceed 1% or 2% of initial capital.',
    exactClause: 'Open positions whose floating unrealized loss exceeds 1% (Instant Premium & HERO) or 2% (Instant GOAT & PRO) violate the risk protection limit, resulting in mandatory position closure and deduction of profits.',
    howItIsCalculated: 'Max Open Floating Loss = Initial Capital * Floating Loss Limit Pct. (e.g., $1,000 on a $100K account at 1%).',
    concreteExample: (size) => `On Instant Premium $${size.toLocaleString()}, maximum floating unrealized drawdown on any open trade or basket is $${(size * 0.01).toLocaleString()} (1%). If open loss hits $${(size * 0.0105).toLocaleString()}, a violation occurs even if the trade later rebounds to profit.`,
    breachConsequence: 'hard_breach',
    consequenceDescription: 'Violation of floating risk limit: Can cause account reset, profit nullification, or termination.',
    verificationStatus: 'officially_verified',
    sourceName: 'GFT Instant Risk FAQ 16892011',
    sourceUrl: 'https://help.goatfundedtrader.com/en/articles/instant-risk-limits',
    verificationDate: '2026-09-02',
    conflictInfo: {
      hasConflict: true,
      conflictingSources: ['Marketing page prior to Sept 2026', 'Official Help article updated Sept 2, 2026'],
      description: 'Instant Premium was originally launched with a 1.5% floating loss cap; on September 2, 2026, it was reduced to 1.0%.',
      recommendation: 'Ensure your stop-losses on Instant Premium risk no more than 0.8% to allow room for market spread and slippage.',
    },
  },
  {
    id: 'rule-news-trading',
    title: 'News Trading & Red Folder 1% Profit Cap',
    category: 'trading_style',
    categoryLabel: 'Trading Rules',
    applicableModels: ['all'],
    applicableStages: ['funded'],
    badge: 'Profit Deduction Trap',
    summary: 'Holding trades through red folder news is allowed, but profits generated from orders executed within ±5 minutes are capped at 1%.',
    exactClause: 'Trading during high-impact news (red folder on ForexFactory) is permitted. However, on funded accounts, any profit generated from positions opened or closed within 5 minutes before or 5 minutes after the release is capped at 1% of account size. Excess profits are removed.',
    howItIsCalculated: 'If an order executed 2 minutes after NFP generates $3,500 profit on a $100,000 account, only $1,000 (1%) is credited. The remaining $2,500 is forfeited upon payout review.',
    concreteExample: (size) => `On a $${size.toLocaleString()} funded account, max credited profit from a trade opened or closed within 5 minutes of CPI/NFP is $${(size * 0.01).toLocaleString()}. Account is NOT breached, but excess profit is forfeited.`,
    breachConsequence: 'profit_deduction',
    consequenceDescription: 'Profits above 1% generated during the news window are removed during audit. Account remains open.',
    verificationStatus: 'officially_verified',
    sourceName: 'GFT Trading Rules FAQ 11849204',
    sourceUrl: 'https://help.goatfundedtrader.com/en/articles/news-trading-policy',
    verificationDate: '2026-09-01',
  },
  {
    id: 'rule-vps-vpn-prohibition',
    title: 'VPS & VPN IP Cluster Restriction (August 12, 2026 Rule)',
    category: 'prohibited',
    categoryLabel: 'Security & Integrity',
    applicableModels: ['one_step', 'two_step_standard', 'two_step_goat', 'three_step', 'pay_after_pass', 'blitz', 'instant_pro', 'instant_premium'],
    applicableStages: ['all'],
    badge: 'Fraud Detection Watchout',
    summary: 'Commercial data-center VPS hosting and generic VPN IP clusters are strictly prohibited since August 12, 2026.',
    exactClause: 'From August 12, 2026, using commercial cloud VPS providers (e.g., Contabo, Hetzner, AWS) or public VPN services to execute trades is classified as IP cluster abuse due to copy-trading syndicate prevention. Trades must be executed from residential IPs.',
    howItIsCalculated: 'Automated IP geolocation and ASN verification flag hosting providers and proxy networks during login.',
    concreteExample: () => 'If you trade from an AWS or Contabo virtual machine, automated security triggers an IP cluster flag requiring KYC video re-verification and possible account freeze.',
    breachConsequence: 'hard_breach',
    consequenceDescription: 'Flagged accounts undergo fraud review; repeated data-center IP usage leads to account termination.',
    verificationStatus: 'officially_verified',
    sourceName: 'GFT Security Update Announcement August 12, 2026',
    sourceUrl: 'https://help.goatfundedtrader.com/en/articles/ip-and-vps-policy',
    verificationDate: '2026-08-12',
    conflictInfo: {
      hasConflict: true,
      conflictingSources: ['Terms of Service prior to Aug 12', 'August 12 Discord Security Bulletin'],
      description: 'Older documentation stated EAs on VPS were fully allowed. The August 12 directive banned shared data-center VPS IPs.',
      recommendation: 'Use a dedicated home computer or static residential proxy for algorithmic or manual trading.',
    },
  },
  {
    id: 'rule-valid-trading-days',
    title: 'Valid Trading Days Requirement (≥0.5% Profit Rule)',
    category: 'evaluation',
    categoryLabel: 'Stage Progression',
    applicableModels: ['one_step', 'two_step_standard', 'two_step_goat', 'blitz', 'instant_goat', 'instant_pro', 'instant_premium', 'instant_hero', 'goat_1'],
    applicableStages: ['all'],
    badge: 'Patience Requirement',
    summary: 'A trading day only counts as valid if the closed profit on that calendar day is at least 0.5% of starting capital.',
    exactClause: 'To prevent micro-lot gaming, minimum trading days must be "valid days". A valid trading day requires reaching a minimum closed net profit equal to or greater than 0.5% of the initial account balance on that day.',
    howItIsCalculated: 'Valid Day Profit Threshold = Initial Balance * 0.5%. Opening a 0.01 lot trade and closing it for $0.10 does NOT count toward the minimum day requirement.',
    concreteExample: (size) => `On a $${size.toLocaleString()} account, you must make at least $${(size * 0.005).toLocaleString()} on a day for it to count as 1 of your required trading days. A $1.00 micro-lot trade will not count.`,
    breachConsequence: 'advisory',
    consequenceDescription: 'Advisory: Phase progression or payout request remains locked until the required count of valid trading days is reached.',
    verificationStatus: 'officially_verified',
    sourceName: 'GFT Evaluation Guide FAQ 14190822',
    sourceUrl: 'https://help.goatfundedtrader.com/en/articles/valid-trading-days',
    verificationDate: '2026-09-02',
  },
  {
    id: 'rule-crypto-architecture',
    title: 'Crypto Trading Architecture (Integrated 24/7 on All Models)',
    category: 'trading_style',
    categoryLabel: 'Instruments & Execution',
    applicableModels: ['all'],
    applicableStages: ['all'],
    badge: '24/7 Weekend Market',
    summary: 'Goat Funded Trader does not have a separate Crypto evaluation. Crypto is built directly into all Forex/CFD accounts 24/7.',
    exactClause: 'Cryptocurrency trading pairs (BTC/USD, ETH/USD, etc.) are available 24 hours a day, 7 days a week on all standard Forex/CFD programs. There is no separate crypto-only model.',
    howItIsCalculated: 'Leverage is fixed at 1:2 on cryptocurrency pairs. Weekend trading is enabled automatically for crypto instruments.',
    concreteExample: () => 'You can trade Bitcoin and Ethereum on Saturday and Sunday on your 2-Step Standard or Instant GOAT account while traditional currency pairs are closed.',
    breachConsequence: 'advisory',
    consequenceDescription: 'Informational architecture guideline.',
    verificationStatus: 'officially_verified',
    sourceName: 'GFT Instrument Specifications',
    sourceUrl: 'https://help.goatfundedtrader.com/en/articles/instruments-leverage',
    verificationDate: '2026-09-02',
  },
  {
    id: 'rule-daily-profit-cap',
    title: '$3,000 Single-Day Profit Cap on Funded Accounts',
    category: 'funded',
    categoryLabel: 'Funded & Payout Rules',
    applicableModels: ['one_step', 'two_step_standard', 'two_step_goat', 'three_step'],
    applicableStages: ['funded'],
    badge: 'Excess Profit Forfeiture',
    summary: 'Funded accounts have an absolute maximum credited profit cap of $3,000 in any single 24-hour period.',
    exactClause: 'On funded master accounts, maximum credited profit in a single calendar day is capped at $3,000 USD regardless of account size. Profits generated beyond $3,000 in one day will not be included in the withdrawable payout balance.',
    howItIsCalculated: 'Any daily profit exceeding $3,000 is automatically deducted from withdrawable funds during payout processing.',
    concreteExample: (size) => `If you trade a $${size.toLocaleString()} account and generate $7,500 profit in a single session, only $3,000 is credited toward your withdrawable reward. The remaining $4,500 is removed upon payout request.`,
    breachConsequence: 'profit_deduction',
    consequenceDescription: 'Profit deduction: Excess daily gains are stripped; account remains open.',
    verificationStatus: 'officially_verified',
    sourceName: 'GFT Funded Rules Update July 2026',
    sourceUrl: 'https://help.goatfundedtrader.com/en/articles/funded-profit-cap',
    verificationDate: '2026-08-20',
  },
  {
    id: 'rule-payout-delay-guarantee',
    title: '$1,000 Payout Guarantee & 2-Business-Day SLA',
    category: 'payout',
    categoryLabel: 'Payout SLA',
    applicableModels: ['all'],
    applicableStages: ['funded'],
    badge: 'Trader Compensation Guarantee',
    summary: 'If an eligible, verified payout request is not processed within 2 business days, GFT adds $1,000 to the payout.',
    exactClause: 'Goat Funded Trader guarantees review and dispatch of compliant payout requests within 2 business days (48 business hours). If the firm fails to process within this window due to internal delays, a $1,000 compensation bonus is added to the payout.',
    howItIsCalculated: 'Applies only after all trading rules, KYC verification, and valid trading days are fully satisfied.',
    concreteExample: () => 'If you request an approved $2,000 payout on Monday at 10 AM and GFT does not dispatch it until Thursday afternoon, GFT pays $3,000 ($2,000 + $1,000 delay bonus).',
    breachConsequence: 'advisory',
    consequenceDescription: 'Firm obligation: Trader receives $1,000 bonus if SLA breached by firm.',
    verificationStatus: 'officially_verified',
    sourceName: 'GFT Payout Guarantee Terms',
    sourceUrl: 'https://goatfundedtrader.com/payout-guarantee',
    verificationDate: '2026-09-01',
  },
];

// ══════════════════════════════════════════════════════════════════════════════════
// 5. CANONICAL WARNINGS & TRAPS REGISTRY (Phase 7-K)
// ══════════════════════════════════════════════════════════════════════════════════
export const GFT_WARNINGS_REGISTRY: GFTWarningItem[] = [
  {
    id: 'trap-floating-loss',
    title: '1% / 2% Intraday Floating Loss Rule Causes Immediate Breach',
    classification: 'High-risk condition',
    severity: 'high',
    whoItAffects: 'Traders using Instant Premium (1%), Instant HERO (1%), or Instant GOAT/PRO (2%).',
    whatTheIssueIs: 'Even if a trade ends in massive profit, if open unrealized loss touched 1.01% for a single second, the rule is violated.',
    whyItMatters: 'Traders accustomed to normal 5% max drawdown often place standard stop losses that exceed 1%, causing unexpected breaches on winning trades.',
    whatUserShouldVerify: 'Set your stop loss strictly below 0.8% of account size on Instant Premium to account for slippage.',
    verificationStatus: 'officially_verified',
    affectedModelIds: ['instant_premium', 'instant_hero', 'instant_goat', 'instant_pro'],
  },
  {
    id: 'trap-vps-prohibition',
    title: 'Shared Data-Center VPS Usage Triggers IP Fraud Freeze',
    classification: 'Important restriction',
    severity: 'high',
    whoItAffects: 'EA, bot, and algorithmic traders hosting on AWS, Contabo, Hetzner, or commercial VPNs.',
    whatTheIssueIs: 'Effective August 12, 2026, data-center IP addresses are classified as copy-trading syndicate indicators.',
    whyItMatters: 'Traders run their EAs on standard VPS and find their accounts locked pending extensive manual video verification.',
    whatUserShouldVerify: 'Trade from a dedicated home machine or confirm your IP is registered as residential ISP.',
    verificationStatus: 'officially_verified',
    affectedModelIds: ['all'],
  },
  {
    id: 'trap-news-profit-cap',
    title: '1% Profit Cap on Red Folder News Executions',
    classification: 'Potential misunderstanding',
    severity: 'medium',
    whoItAffects: 'Funded traders executing orders within ±5 minutes of high-impact macroeconomic releases.',
    whatTheIssueIs: 'Marketing says "News trading allowed", but fine print caps credited profit to 1% of account size.',
    whyItMatters: 'A $10,000 profit made during CPI on a $100K account will be cut down to $1,000 upon payout review.',
    whatUserShouldVerify: 'Avoid placing or closing trades in the 10-minute window surrounding red folder news.',
    verificationStatus: 'officially_verified',
    affectedModelIds: ['one_step', 'two_step_standard', 'two_step_goat', 'three_step'],
  },
  {
    id: 'trap-valid-days-micro-lot',
    title: 'Micro-Lot Trades Do Not Satisfy Minimum Day Requirements',
    classification: 'Potential misunderstanding',
    severity: 'medium',
    whoItAffects: 'Traders who pass profit targets in 1 day and place 0.01 lot trades to complete required days.',
    whatTheIssueIs: 'A trading day only counts toward the requirement if you earn at least 0.5% profit on that day ($500 on $100K).',
    whyItMatters: 'Payout or phase advancement will remain locked until real trades meeting the 0.5% threshold are completed.',
    whatUserShouldVerify: 'Plan your trading strategy to achieve at least 3-5 distinct days of meaningful profit.',
    verificationStatus: 'officially_verified',
    affectedModelIds: ['one_step', 'two_step_standard', 'two_step_goat', 'blitz', 'instant_goat'],
  },
  {
    id: 'trap-1step-daily-dd-cutoff',
    title: '1-Step Daily Loss Reduction from 4% to 3% (Aug 1, 2026 Cutoff)',
    classification: 'Conflicting wording',
    severity: 'medium',
    whoItAffects: 'Traders comparing 1-Step review guides against newly purchased accounts.',
    whatTheIssueIs: 'Guides written before August 2026 state 4% daily DD; all accounts bought since August 1, 2026 have only 3% daily DD.',
    whyItMatters: 'Traders who calculate risk based on 4% will breach unexpectedly at 3%.',
    whatUserShouldVerify: 'Verify your account creation date in the client dashboard to know if you have 4% or 3% daily loss.',
    verificationStatus: 'conflicting_sources',
    affectedModelIds: ['one_step'],
  },
  {
    id: 'trap-cme-overnight-futures',
    title: 'Holding Futures Positions Past 4:59 PM EST Triggers Hard Breach',
    classification: 'High-risk condition',
    severity: 'high',
    whoItAffects: 'Futures Challenge traders who swing trade or forget CME settlement downtime.',
    whatTheIssueIs: 'Forex accounts permit weekend and overnight holding; Futures accounts strictly forbid holding past CME close.',
    whyItMatters: 'Any open futures contract at 5:00 PM EST is liquidated and account is permanently breached.',
    whatUserShouldVerify: 'Set an automated bracket timer to close all CME futures positions by 4:45 PM EST daily.',
    verificationStatus: 'officially_verified',
    affectedModelIds: ['futures-25k', 'futures-50k', 'futures-100k', 'futures-150k'],
  },
];

// ══════════════════════════════════════════════════════════════════════════════════
// 6. CANONICAL CHANGE HISTORY TIMELINE (Phase 7-L)
// ══════════════════════════════════════════════════════════════════════════════════
export const GFT_CHANGE_HISTORY: GFTChangeHistoryItem[] = [
  {
    id: 'chg-2026-09-02',
    date: '2026-09-02',
    title: 'Instant Premium Floating Loss Limit Tightened to 1.0%',
    previousRule: 'Floating unrealized loss limit on Instant Premium was 1.5%.',
    newRule: 'Floating unrealized loss limit reduced to 1.0% on all open positions/baskets.',
    affectedModels: ['instant_premium'],
    source: 'GFT Knowledgebase Article 16892011 Revision',
    explanation: 'Risk management policy adjusted to mitigate rapid adverse market movements on direct live capital.',
    impactLevel: 'breaking',
  },
  {
    id: 'chg-2026-08-12',
    date: '2026-08-12',
    title: 'Commercial VPS and Cloud IP Hosting Prohibited',
    previousRule: 'VPS hosting on any provider allowed for expert advisors.',
    newRule: 'Shared commercial data-center VPS (AWS, Contabo, Hetzner) and VPNs prohibited. Residential IP required.',
    affectedModels: ['all'],
    source: 'GFT Discord Announcement & Anti-Fraud Directive',
    explanation: 'Implemented to eliminate copy-trading syndicates and unauthorized multi-account pooling.',
    impactLevel: 'breaking',
  },
  {
    id: 'chg-2026-08-01',
    date: '2026-08-01',
    title: '1-Step Daily Loss Reduced to 3% for New Purchases',
    previousRule: '4% balance-based daily loss limit on 1-Step evaluation & funded phases.',
    newRule: '3% daily loss limit applies to all 1-Step accounts purchased from August 1, 2026 onwards (older accounts grandfathered at 4%).',
    affectedModels: ['one_step'],
    source: 'GFT Product Update Bulletin',
    explanation: 'Standardized daily loss buffer across all single-stage evaluation products.',
    impactLevel: 'breaking',
  },
  {
    id: 'chg-2026-07-25',
    date: '2026-07-25',
    title: 'Funded Trading Days Requirement Updated to 4 Days',
    previousRule: '3 valid trading days required before first funded reward request.',
    newRule: '4 valid trading days (≥0.5% profit) required before requesting first payout on 2-Step and 1-Step.',
    affectedModels: ['one_step', 'two_step_standard', 'two_step_goat', 'three_step'],
    source: 'GFT Terms of Service v2026.2',
    explanation: 'Extended track record requirement to confirm consistent risk control on master accounts.',
    impactLevel: 'minor',
  },
  {
    id: 'chg-2026-06-13',
    date: '2026-06-13',
    title: '2-Step PRO Retired / Discontinued for New Orders',
    previousRule: '2-Step PRO available for purchase with 8% / 4% targets.',
    newRule: '2-Step PRO permanently discontinued. Existing active accounts remain grandfathered.',
    affectedModels: ['two_step_pro'],
    source: 'GFT Product Line Streamlining Announcement',
    explanation: 'Simplified catalog around 2-Step Standard (10% static) and 2-Step GOAT (8%/6%).',
    impactLevel: 'minor',
  },
  {
    id: 'chg-2025-09-22',
    date: '2025-09-22',
    title: 'Instant Standard Discontinued in Favor of Instant GOAT & Premium',
    previousRule: 'Instant Standard was primary direct funding program.',
    newRule: 'Instant Standard retired. Replaced by Instant GOAT (6% trailing) and Instant Premium (10-day reward cycle).',
    affectedModels: ['instant_standard'],
    source: 'GFT Product Architecture Evolution',
    explanation: 'Replaced legacy instant funding structure with modernized multi-tier instant solutions.',
    impactLevel: 'minor',
  },
];

// ══════════════════════════════════════════════════════════════════════════════════
// 7. CANONICAL COMMUNITY & REVIEWS REGISTRY (Phase 7-J)
// ══════════════════════════════════════════════════════════════════════════════════
export const GFT_COMMUNITY_REVIEWS: GFTCommunityItem[] = [
  {
    id: 'rev-tp-01',
    sourceType: 'trustpilot',
    date: '2026-08-29',
    author: 'Liam Davies (UK)',
    rating: 5,
    topic: 'Payout SLA & Speed',
    summary: 'Received $6,400 payout via Rise in under 18 hours. No issues with KYC.',
    fullQuote: 'Passed the 2-Step Standard 100K challenge. Requested payout on Wednesday morning; received Rise transfer Thursday morning. Fast payout SLA as advertised.',
    isVerifiedPurchase: true,
    conflictsWithOfficialRule: false,
    type: 'praise',
    demonstrationDisclaimer: 'Individual experience from Trustpilot verified review. Past performance is no guarantee of future processing time.',
  },
  {
    id: 'rev-red-02',
    sourceType: 'reddit',
    date: '2026-08-20',
    author: 'u/prop_scalper_99',
    topic: 'Instant Premium 1% Floating Loss Breach',
    summary: 'Breached on Instant Premium because floating drawdown hit 1.05% during high spread.',
    fullQuote: 'Beware of Instant Premium! I had a trade on EURUSD that dropped 1.05% floating loss before going to +3%. My account got closed for violating the floating loss rule. Make sure your SL is well under 1%.',
    isVerifiedPurchase: false,
    conflictsWithOfficialRule: false,
    officialRuleRef: 'rule-floating-loss-cap',
    type: 'pattern_report',
    demonstrationDisclaimer: 'Community Reddit report consistent with official GFT floating loss clause.',
  },
  {
    id: 'rev-disc-03',
    sourceType: 'discord',
    date: '2026-08-15',
    author: 'AlphaFlow#4912',
    topic: 'VPS IP Ban Confusion',
    summary: 'Account flagged for Contabo VPS usage after August 12 update.',
    fullQuote: 'Support contacted me asking for video ID verification because I was logging into MT5 from my Contabo VPS. They explained the new Aug 12 anti-syndicate IP rule. Moved my EA to my home desktop and got unblocked.',
    isVerifiedPurchase: true,
    conflictsWithOfficialRule: false,
    officialRuleRef: 'rule-vps-vpn-prohibition',
    type: 'individual_experience',
    demonstrationDisclaimer: 'Verified Discord member experience matching official Aug 12 VPS directive.',
  },
  {
    id: 'rev-tp-04',
    sourceType: 'trustpilot',
    date: '2026-08-04',
    author: 'Matteo Rossi (IT)',
    rating: 4,
    topic: 'Pay Later Model Experience',
    summary: 'Paid $5 entry, passed 4% target in 6 days, paid activation fee and funded seamlessly.',
    fullQuote: 'Pay Later is genuine. You only risk $5 upfront. The 4% target with 0% daily loss during evaluation gave me zero stress. Paid the activation fee and now on funded master.',
    isVerifiedPurchase: true,
    conflictsWithOfficialRule: false,
    type: 'praise',
    demonstrationDisclaimer: 'Individual user experience. Activation fee required upon passing.',
  },
  {
    id: 'rev-tp-05',
    sourceType: 'trustpilot',
    date: '2026-07-28',
    author: 'Kenji Sato (JP)',
    rating: 3,
    topic: 'News 1% Profit Cap Frustration',
    summary: 'Made 4% on NFP trade, but 3% was deducted at payout review due to news rule.',
    fullQuote: 'I traded GBPUSD right after NFP and made $4,000. When I requested payout, they deducted $3,000 citing the 1% news cap rule. I was mad at first, but it is in their FAQ.',
    isVerifiedPurchase: true,
    conflictsWithOfficialRule: false,
    officialRuleRef: 'rule-news-trading',
    type: 'complaint',
    demonstrationDisclaimer: 'Complaint reflects standard enforcement of GFT 1% red folder profit deduction clause.',
  },
];

// ══════════════════════════════════════════════════════════════════════════════════
// 8. QUICK DECISION RECOMMENDATIONS (Phase 7-C)
// ══════════════════════════════════════════════════════════════════════════════════
export const GFT_DECISION_RECOMMENDATIONS: GFTDecisionRecommendation[] = [
  {
    key: 'beginners',
    title: 'Best for Beginners',
    bestModelId: 'two_step_standard',
    bestModelName: '2-Step Standard',
    accountSizeRecommendation: 25000,
    badge: 'Maximum Safety Buffer',
    whyRecommended: 'Permanent 10% static drawdown floor provides generous room to absorb learning mistakes without high-water trailing pressure. 5% daily loss limit is the highest in GFT catalog.',
    assumptionsUsed: [
      'Trader needs generous drawdown room while developing risk discipline.',
      'Static drawdown is less confusing for beginners than trailing high-water marks.',
      'Zero consistency rule simplifies withdrawal planning.',
    ],
    risksAndLimitations: [
      'Requires passing 2 evaluation phases (10% Phase 1, 5% Phase 2).',
      'Requires 4 valid trading days (≥0.5%) before funded withdrawal.',
    ],
    suitabilityScore: 94,
  },
  {
    key: 'low_cost',
    title: 'Best for Low Upfront Cost',
    bestModelId: 'pay_after_pass',
    bestModelName: 'Pay Later ($5 Entry)',
    accountSizeRecommendation: 100000,
    badge: '$5 Risk Barrier',
    whyRecommended: 'Risk only $5 upfront. 4% evaluation profit target with ZERO daily loss limit during evaluation stage. You only pay full price after you pass.',
    assumptionsUsed: [
      'Trader wants minimal initial out-of-pocket financial commitment.',
      'Trader can comfortably reach 4% target without time limits.',
    ],
    risksAndLimitations: [
      'Activation fee must be paid upon passing before funded account is dispatched.',
      'Funded stage introduces 20% consistency rule and 3% daily loss limit.',
      'Initial $5 fee is non-refundable.',
    ],
    suitabilityScore: 98,
  },
  {
    key: 'fast_payout',
    title: 'Best for Fast Payout',
    bestModelId: 'instant_premium',
    bestModelName: 'Instant Premium ⚡',
    accountSizeRecommendation: 50000,
    badge: '10-Day Cycle · 0% Consistency',
    whyRecommended: 'Direct funded account with industry-leading 10-day reward cycle (fastest in prop trading) and ZERO consistency rule. First payout eligible on Day 10.',
    assumptionsUsed: [
      'Trader has tested edge and wants immediate reward cycle without 2-step delays.',
      'Zero consistency rule allows withdrawing lumpy windfalls.',
    ],
    risksAndLimitations: [
      'Strict 1% floating loss rule requires tight stop-loss management.',
      'Higher upfront purchase fee than evaluation models.',
      'Non-refundable fee.',
    ],
    suitabilityScore: 92,
  },
  {
    key: 'swing_trading',
    title: 'Best for Swing Trading',
    bestModelId: 'two_step_goat',
    bestModelName: '2-Step GOAT',
    accountSizeRecommendation: 100000,
    badge: 'Weekend Holding & Balanced Targets',
    whyRecommended: 'Lower 8% Phase 1 target and full weekend holding permitted across FX, metals, and crypto with 10% permanent static drawdown cushion.',
    assumptionsUsed: [
      'Positions held overnight and across weekends without restriction.',
      'Static drawdown ensures open swing drawdowns do not trail up unpredictably.',
    ],
    risksAndLimitations: [
      'Weekend holding on traditional FX exposes to Sunday market opening gaps.',
      '4% daily loss limit is slightly stricter than 2-Step Standard (5%).',
    ],
    suitabilityScore: 91,
  },
  {
    key: 'news_trading',
    title: 'Best for News Trading',
    bestModelId: 'two_step_standard',
    bestModelName: '2-Step Standard',
    accountSizeRecommendation: 100000,
    badge: 'Generous 5% Daily Loss',
    whyRecommended: 'Evaluation phase allows unlimited news trading without the 1% profit cap. 5% daily loss absorbs unexpected volatility spikes.',
    assumptionsUsed: [
      'Trader understands high-impact news dynamics and market spreads.',
      'Evaluation stage does not enforce the funded 1% news profit cap.',
    ],
    risksAndLimitations: [
      'Funded stage enforces 1% profit cap on trades within ±5 minutes of red folders.',
      'Slippage during NFP/CPI can trigger balance breach if lot sizes are excessive.',
    ],
    suitabilityScore: 86,
  },
  {
    key: 'conservative_risk',
    title: 'Best for Conservative Risk',
    bestModelId: 'three_step',
    bestModelName: '3-Step Challenge',
    accountSizeRecommendation: 100000,
    badge: 'Lowest Phase Target (6%)',
    whyRecommended: 'Lowest target per phase in the prop industry (6% Phase 1, 6% Phase 2, 6% Phase 3). No time limit and 0 minimum trading days on evaluation phases.',
    assumptionsUsed: [
      'Trader prefers steady, conservative 1:1 risk-reward milestones.',
      'Willing to complete 3 phases in exchange for smaller targets.',
    ],
    risksAndLimitations: [
      'Completing 3 consecutive phases requires sustained patience.',
      '8% static drawdown floor is slightly tighter than 2-Step (10%).',
    ],
    suitabilityScore: 89,
  },
  {
    key: 'high_leverage',
    title: 'Best for High Leverage',
    bestModelId: 'two_step_standard',
    bestModelName: '2-Step Standard',
    accountSizeRecommendation: 100000,
    badge: '1:100 Forex Leverage',
    whyRecommended: 'Offers GFT’s maximum 1:100 leverage on Forex pairs combined with the highest 5% daily loss limit and 10% static drawdown.',
    assumptionsUsed: [
      'Trader uses precise lot sizing and technical stop-losses.',
      'Requires margin flexibility for scalping or multiple concurrent setups.',
    ],
    risksAndLimitations: [
      'High leverage magnifies drawdown risks during high volatility.',
    ],
    suitabilityScore: 88,
  },
  {
    key: 'futures',
    title: 'Best for Futures',
    bestModelId: 'futures-50k',
    bestModelName: 'Futures Challenge $50,000',
    accountSizeRecommendation: 50000,
    badge: 'CME Direct · Volumetrica',
    whyRecommended: 'Direct access to CME regulated order flow (ES, NQ, YM) on Volumetrica or Tradovate with transparent EOD trailing drawdown and no spread manipulation.',
    assumptionsUsed: [
      'Trader trades CME futures index contracts during active US hours.',
      'Prefers Level 2 order book execution over CFD broker feeds.',
    ],
    risksAndLimitations: [
      'Zero overnight holding permitted: Must be flat before 4:59 PM EST daily.',
      'Monthly platform or data feed fees may apply after funded transition.',
    ],
    suitabilityScore: 87,
  },
  {
    key: 'highest_complexity',
    title: 'Highest Rule Complexity',
    bestModelId: 'instant_premium',
    bestModelName: 'Instant Premium ⚡',
    accountSizeRecommendation: 100000,
    badge: 'Strict Risk Constraints',
    whyRecommended: 'While it offers 10-day payouts and 0% consistency, it combines an intraday trailing drawdown, a 1% floating loss rule, and data-center VPS bans.',
    assumptionsUsed: [
      'Traders should be warned about multiple interacting constraints.',
    ],
    risksAndLimitations: [
      'High cognitive overhead to track tick-by-tick floating equity.',
      'Not suitable for discretionary traders who allow trades to breathe in deep drawdown.',
    ],
    suitabilityScore: 72,
  },
  {
    key: 'highest_uncertainty',
    title: 'Highest Uncertainty',
    bestModelId: 'blitz',
    bestModelName: 'GOAT BLITZ',
    accountSizeRecommendation: 100000,
    badge: 'Flash Drop Terms',
    whyRecommended: 'Terms and availability vary by weekend release. Combines 3% target with 15% consistency rule and trailing drawdown.',
    assumptionsUsed: [
      'Trader must verify specific promotional terms applicable to that exact drop.',
    ],
    risksAndLimitations: [
      'Only available during unannounced weekend marketing windows.',
      'Trailing drawdown locks at starting balance.',
    ],
    suitabilityScore: 68,
  },
];
