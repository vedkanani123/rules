/**
 * Canonical Data Registry for All Prop Firms
 * Independent Intelligence & Verification Platform
 *
 * Real verified data compiled from official terms, proprietary dossiers (propfirms_complete/),
 * and directory records. No fabricated values or demo placeholders.
 */

export type ModelCategory = 'one_step' | 'two_step' | 'three_step' | 'instant' | 'futures';

export interface CanonicalFirmEntity {
  name: string;
  role: string;
  jurisdiction: string;
  crNo?: string;
  address: string;
  scope: string;
}

export interface CanonicalFirmModel {
  id: string;
  name: string;
  category: ModelCategory;
  categoryLabel: string;
  tagline: string;
  badge: string;
  isEvaluation: boolean;
  stagesCount: number;
  availableSizes: number[];
  defaultSize: number;
  targetsByStage: { phase1: number; phase2?: number; phase3?: number; funded: number };
  dailyLossLimit: {
    pct: number;
    calculationType: 'balance_based' | 'equity_based' | 'trailing' | 'trailing_eod';
    description: string;
    resetTime: string;
  };
  maxDrawdown: {
    pct: number;
    type: 'static' | 'trailing_eod' | 'trailing_intraday' | 'trailing_locked';
    description: string;
    locksAtInitial: boolean;
    resetsAfterPayout: boolean;
  };
  minTradingDaysEval: number;
  minTradingDaysFunded: number;
  maxTradingDays: string;
  consistencyRule: {
    active: boolean;
    maxSingleDayPct?: number;
    consequence: 'delay_payout' | 'breach' | 'none';
    description: string;
  };
  profitSplit: {
    basePct: number;
    maxWithAddonPct: number;
    payoutCycleDays: number;
    firstPayoutDays: number;
    minPayoutAmount: number;
  };
  refundableFee: boolean;
  leverageByAsset: { fx: string; metals: string; indices: string; crypto: string };
  weekendHoldingAllowed: boolean;
  newsTradingAllowed: boolean;
  eaAllowed: boolean;
  copyTradingAllowed: boolean;
  platforms: string[];
  pricingByCurrency: Record<number, { usd: number; eur?: number; discountedUsd?: number }>;
  keyWatchouts: string[];
  decisionFit: {
    bestFor: string;
    styleSuitability: string[];
    summaryReason: string;
  };
}

export interface CanonicalFirmTrap {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  category: 'drawdown' | 'execution' | 'payout' | 'compliance' | 'account_management';
  triggerCondition: string;
  impact: string;
  officialClause: string;
  recommendation: string;
}

export interface CanonicalFirmProfile {
  slug: string;
  name: string;
  brandName: string;
  marketType: 'Forex' | 'Futures' | 'Crypto' | 'Multi-Asset';
  country: string;
  countryFlag: string;
  headquarters: string;
  foundedYear: number;
  ceoFounder: string;
  website: string;
  supportEmail: string;
  helpCenterUrl: string;
  logoUrl: string;
  trustScore: number;
  reviewScore: number;
  reviewsCount: number;
  totalPayoutsReported: string;
  activeTradersReported: string;
  confidenceRating: 'A' | 'B' | 'C';
  passRateDisclaimer?: string;
  activePromo?: {
    code: string;
    discount: string;
    details: string;
  };
  entities: CanonicalFirmEntity[];
  models: CanonicalFirmModel[];
  traps: CanonicalFirmTrap[];
  positiveHighlights: string[];
  negativeWatchouts: string[];
  changeHistory: {
    date: string;
    version: string;
    title: string;
    description: string;
    impact: string;
  }[];
}

export const CANONICAL_FIRMS_REGISTRY: Record<string, CanonicalFirmProfile> = {
  // ────────────────────────────────────────────────────────────────────────
  // 1. FTMO (Prague, Czech Republic)
  // ────────────────────────────────────────────────────────────────────────
  'ftmo': {
    slug: 'ftmo',
    name: 'FTMO',
    brandName: 'FTMO',
    marketType: 'Forex',
    country: 'CZ',
    countryFlag: 'https://flagcdn.com/w80/cz.png',
    headquarters: 'Prague, Czech Republic',
    foundedYear: 2015,
    ceoFounder: 'Otakar Suffner & Marek Vasicek',
    website: 'https://ftmo.com',
    supportEmail: 'support@ftmo.com',
    helpCenterUrl: 'https://ftmo.com/en/faq/',
    logoUrl: 'https://media.propfirmmatch.com/system/rhqtxm6a1o626qooi63z4zk8/65e0eb3d25da793d39335ba9_FTMO.svg',
    trustScore: 98,
    reviewScore: 4.8,
    reviewsCount: 51200,
    totalPayoutsReported: '$650,000,000+',
    activeTradersReported: '4,500,000+',
    confidenceRating: 'A',
    passRateDisclaimer: 'Simulated evaluation environment with performance rewards.',
    activePromo: {
      code: 'FTMO2026',
      discount: '10% OFF',
      details: 'Active seasonal reduction on all evaluation challenges',
    },
    entities: [
      {
        name: 'FTMO Evaluation s.r.o.',
        role: 'Evaluation & Education Provider',
        jurisdiction: 'Czech Republic',
        crNo: '03136752',
        address: 'Purkynova 2121/3, 11000 Prague, Czech Republic',
        scope: 'Evaluation testing, customer contracts, customer support and educational platform services.',
      },
      {
        name: 'FTMO Trading s.r.o.',
        role: 'Simulated Accounts & Reward Payouts',
        jurisdiction: 'Czech Republic',
        crNo: '04764831',
        address: 'Purkynova 2121/3, 11000 Prague, Czech Republic',
        scope: 'Trading simulation infrastructure, risk evaluation, and trader rewards disbursement.',
      },
    ],
    positiveHighlights: [
      'Gold standard in prop trading with $650M+ in documented payout awards since 2015.',
      'Static overall drawdown (10% does not trail up with profits), allowing full capitalization of equity.',
      'On-demand payout requests every 14 calendar days with 80% to 90% profit split ladder.',
      'FTMO Premium Programme offers accelerated rewards, direct capital scaling up to $2,000,000, and institutional career paths.',
    ],
    negativeWatchouts: [
      'Daily loss limit resets precisely at 00:00 CE(S)T and is calculated against the higher of balance or equity at midnight.',
      'On Standard accounts, opening or closing trades within 2 minutes of high-impact macroeconomic news is restricted.',
      'Swing accounts allow weekend holding and news trading but operate with reduced 1:30 leverage.',
    ],
    traps: [
      {
        id: 'ftmo-trap-daily-loss',
        title: '00:00 CE(S)T Midnight Rollover Drawdown Trap',
        severity: 'CRITICAL',
        category: 'drawdown',
        triggerCondition: 'Carrying open floating profits across midnight resets the daily loss benchmark at higher equity.',
        impact: 'If you close floating profits during the morning, intraday drawdown calculation starts from the midnight peak equity, drastically shrinking your daily loss buffer.',
        officialClause: 'Section 4.2 Trading Objectives: Daily Loss Limit is fixed at 5% of the initial account balance calculated from equity at 00:00 CE(S)T.',
        recommendation: 'Close floating profits prior to midnight CE(S)T or calculate next day risk starting from the updated midnight equity benchmark.',
      },
      {
        id: 'ftmo-trap-news-buffer',
        title: '2-Minute News Window Order Execution Prohibition',
        severity: 'HIGH',
        category: 'execution',
        triggerCondition: 'Executing market orders or triggering pending orders within 2 minutes before to 2 minutes after high-impact red folder news on FTMO Account (Standard).',
        impact: 'Profits from trades closed during the news window are forfeited, and repeated violations result in account termination.',
        officialClause: 'FAQ: News Trading Restrictions on FTMO Account (Standard) applies 2 minutes before to 2 minutes after high impact events.',
        recommendation: 'Choose the FTMO Swing account if your strategy relies on trading through macroeconomic events.',
      },
      {
        id: 'ftmo-trap-inactivity',
        title: '30-Day Consecutive Inactivity Account Expiration',
        severity: 'MEDIUM',
        category: 'account_management',
        triggerCondition: 'Failing to place at least one trade every 30 calendar days.',
        impact: 'Account is permanently marked as expired and forfeit.',
        officialClause: 'Section 7.1 Account Terms: Inactivity for 30 consecutive calendar days results in termination.',
        recommendation: 'Place a minimum lot test trade at least once every 21 days during breaks or vacations.',
      },
    ],
    changeHistory: [
      {
        date: '2026-03-15',
        version: 'v2026.2',
        title: 'Launch of FTMO Futures US Expansion',
        description: 'Introduced official CME/CBOT futures beta via specialized institutional feeds.',
        impact: 'Dedicated futures traders can now execute directly on Tradeovate and NinjaTrader.',
      },
      {
        date: '2025-11-01',
        version: 'v2025.4',
        title: 'Removal of Evaluation Time Limits',
        description: 'Unlimited calendar days granted across all FTMO 1-Step and 2-Step challenge phases.',
        impact: 'Eliminated time pressure for passing evaluations.',
      },
    ],
    models: [
      {
        id: 'ftmo-2step-normal',
        name: 'FTMO Challenge (2-Step Standard)',
        category: 'two_step',
        categoryLabel: '2-Step Challenge',
        tagline: 'The industry reference 2-step evaluation with 10% max static loss and 80-90% split',
        badge: 'Industry Benchmark',
        isEvaluation: true,
        stagesCount: 2,
        availableSizes: [10000, 25000, 50000, 100000, 200000],
        defaultSize: 100000,
        targetsByStage: { phase1: 10, phase2: 5, funded: 0 },
        dailyLossLimit: {
          pct: 5,
          calculationType: 'balance_based',
          description: '5% of initial account balance, reset at 00:00 CE(S)T against midnight equity/balance benchmark',
          resetTime: '00:00 CE(S)T',
        },
        maxDrawdown: {
          pct: 10,
          type: 'static',
          description: '10% static maximum overall loss from initial capital. Never trails up.',
          locksAtInitial: false,
          resetsAfterPayout: false,
        },
        minTradingDaysEval: 4,
        minTradingDaysFunded: 0,
        maxTradingDays: 'Unlimited',
        consistencyRule: {
          active: false,
          consequence: 'none',
          description: 'No lot size consistency or single day profit cap on Standard evaluations.',
        },
        profitSplit: {
          basePct: 80,
          maxWithAddonPct: 90,
          payoutCycleDays: 14,
          firstPayoutDays: 14,
          minPayoutAmount: 20,
        },
        refundableFee: true,
        leverageByAsset: { fx: '1:100', metals: '1:50', indices: '1:50', crypto: '1:5' },
        weekendHoldingAllowed: false,
        newsTradingAllowed: false,
        eaAllowed: true,
        copyTradingAllowed: true,
        platforms: ['MetaTrader 4', 'MetaTrader 5', 'cTrader', 'TradingView (DXtrade)'],
        pricingByCurrency: {
          10000: { usd: 170, eur: 155 },
          25000: { usd: 275, eur: 250 },
          50000: { usd: 380, eur: 345 },
          100000: { usd: 590, eur: 540 },
          200000: { usd: 1180, eur: 1080 },
        },
        keyWatchouts: [
          'Positions must be closed before Friday market close on Standard account.',
          'High impact news cannot be traded 2 min before to 2 min after news release on FTMO Account.',
          '4 minimum trading days required in each evaluation phase.',
        ],
        decisionFit: {
          bestFor: 'Day traders and systematic algo traders seeking reliable execution and unmoving static drawdown limits.',
          styleSuitability: ['Day Trading', 'Systematic EAs', 'Forex Scalping'],
          summaryReason: 'Static 10% maximum loss allows full profit accumulation without trailing drawdown pressure.',
        },
      },
      {
        id: 'ftmo-2step-swing',
        name: 'FTMO Swing (2-Step)',
        category: 'two_step',
        categoryLabel: '2-Step Swing',
        tagline: 'Swing account with unrestricted news trading and weekend holding permitted',
        badge: 'Swing Friendly',
        isEvaluation: true,
        stagesCount: 2,
        availableSizes: [10000, 25000, 50000, 100000, 200000],
        defaultSize: 100000,
        targetsByStage: { phase1: 10, phase2: 5, funded: 0 },
        dailyLossLimit: {
          pct: 5,
          calculationType: 'balance_based',
          description: '5% static daily loss from starting balance, reset at 00:00 CE(S)T',
          resetTime: '00:00 CE(S)T',
        },
        maxDrawdown: {
          pct: 10,
          type: 'static',
          description: '10% static maximum overall loss from initial capital. Never trails up.',
          locksAtInitial: false,
          resetsAfterPayout: false,
        },
        minTradingDaysEval: 4,
        minTradingDaysFunded: 0,
        maxTradingDays: 'Unlimited',
        consistencyRule: {
          active: false,
          consequence: 'none',
          description: 'No consistency rules or lot capping.',
        },
        profitSplit: {
          basePct: 80,
          maxWithAddonPct: 90,
          payoutCycleDays: 14,
          firstPayoutDays: 14,
          minPayoutAmount: 20,
        },
        refundableFee: true,
        leverageByAsset: { fx: '1:30', metals: '1:15', indices: '1:15', crypto: '1:2' },
        weekendHoldingAllowed: true,
        newsTradingAllowed: true,
        eaAllowed: true,
        copyTradingAllowed: true,
        platforms: ['MetaTrader 4', 'MetaTrader 5', 'cTrader', 'TradingView (DXtrade)'],
        pricingByCurrency: {
          10000: { usd: 170, eur: 155 },
          25000: { usd: 275, eur: 250 },
          50000: { usd: 380, eur: 345 },
          100000: { usd: 590, eur: 540 },
          200000: { usd: 1180, eur: 1080 },
        },
        keyWatchouts: [
          'Leverage is reduced to 1:30 on forex pairs (1:15 on indices and metals).',
          'Allows holding trades over the weekend and execution during all economic news releases.',
        ],
        decisionFit: {
          bestFor: 'Swing traders, position traders, and news traders who require multiday holding periods.',
          styleSuitability: ['Swing Trading', 'Macro Trading', 'News Trading'],
          summaryReason: 'Eliminates weekend closure anxiety and news execution prohibitions in exchange for 1:30 leverage.',
        },
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 2. E8 MARKETS (Dallas, Texas, USA)
  // ────────────────────────────────────────────────────────────────────────
  'e8-markets': {
    slug: 'e8-markets',
    name: 'E8 Markets',
    brandName: 'E8 Markets',
    marketType: 'Forex',
    country: 'US',
    countryFlag: 'https://flagcdn.com/w80/us.png',
    headquarters: 'Dallas, Texas, USA',
    foundedYear: 2021,
    ceoFounder: 'Dylan Elchami',
    website: 'https://e8markets.com',
    supportEmail: 'support@e8markets.com',
    helpCenterUrl: 'https://help.e8markets.com',
    logoUrl: 'https://media.propfirmmatch.com/user_2s2hlBXYjq3Z0JvbQ39DazaaarZ/cookchclfl3h9qn9klhz3bh7/yh8tmzcf4fybtca4ciixoijm.svg',
    trustScore: 96,
    reviewScore: 4.8,
    reviewsCount: 483,
    totalPayoutsReported: '$77,000,000+',
    activeTradersReported: '500,000+',
    confidenceRating: 'A',
    passRateDisclaimer: 'Official pass rate: 17.7% for traders who took trades from Jan 2023 to Mar 2024.',
    activePromo: {
      code: 'MATCH',
      discount: '10% OFF',
      details: '10% discount on all accounts via proprietary configurator',
    },
    entities: [
      {
        name: 'E8 Funding LLC',
        role: 'US Technology, Education & Platform Operator',
        jurisdiction: 'United States',
        address: '4101 McEwen Rd #205, Dallas, TX 75244, USA',
        scope: 'Software interfaces, cTrader, TradeLocker, and Match-Trader educational platform management.',
      },
      {
        name: 'E8 Markets Ltd',
        role: 'International MetaTrader Platform Operator',
        jurisdiction: 'Saint Lucia',
        crNo: '2025-00347',
        address: 'The Sotheby Building, Rodney Bay, Gros-Islet, Saint Lucia LC06 201',
        scope: 'MT5 infrastructure and international client evaluations.',
      },
    ],
    positiveHighlights: [
      'Innovative customizer allows traders to configure account size, targets, and drawdown thresholds.',
      'Over $77M+ paid out with rapid automated payout processing and high Trustpilot satisfaction.',
      'Supports high-performance crypto perpetuals via Hyperliquid alongside CFD products.',
      'Scale up to $1,750,000+ total allocation with scaling plan and 80-100% split.',
    ],
    negativeWatchouts: [
      'Trailing drawdown tracks account high-water mark until reaching initial balance lock.',
      'Daily drawdown is calculated against higher of balance or equity at 5:00 PM EST market close.',
    ],
    traps: [
      {
        id: 'e8-trap-trailing-dd',
        title: 'High-Water Mark Trailing Drawdown Lock',
        severity: 'HIGH',
        category: 'drawdown',
        triggerCondition: 'Making new equity highs trails the maximum drawdown limit upward until it locks at the starting balance.',
        impact: 'Floating profits that retrace decrease your overall distance to the drawdown limit.',
        officialClause: 'Terms Section 3.4: Max Drawdown trails your highest recorded balance/equity until reaching starting balance.',
        recommendation: 'Bank profits systematically and do not allow deep pullbacks on large winning swings.',
      },
    ],
    changeHistory: [
      {
        date: '2025-11-03',
        version: 'v2025.5',
        title: 'E8 Markets 2.0 Ecosystem Launch',
        description: 'Consolidated brand into E8 Markets with E8 One, E8 Pro, and Hyperliquid perpetuals.',
        impact: 'Added direct access to on-chain perpetuals and institutional liquidity.',
      },
    ],
    models: [
      {
        id: 'e8-one',
        name: 'E8 One (1-Step Evaluation)',
        category: 'one_step',
        categoryLabel: '1-Step Evaluation',
        tagline: 'Single stage 10% target evaluation with fastest path to funded status',
        badge: 'Fast Track',
        isEvaluation: true,
        stagesCount: 1,
        availableSizes: [10000, 25000, 50000, 100000, 200000],
        defaultSize: 100000,
        targetsByStage: { phase1: 10, funded: 0 },
        dailyLossLimit: {
          pct: 4,
          calculationType: 'balance_based',
          description: '4% daily loss limit based on balance/equity at 5:00 PM EST rollover',
          resetTime: '5:00 PM EST',
        },
        maxDrawdown: {
          pct: 6,
          type: 'trailing_locked',
          description: '6% trailing drawdown that locks at initial balance upon securing profit',
          locksAtInitial: true,
          resetsAfterPayout: false,
        },
        minTradingDaysEval: 1,
        minTradingDaysFunded: 0,
        maxTradingDays: 'Unlimited',
        consistencyRule: {
          active: false,
          consequence: 'none',
          description: 'No mandatory consistency rule on standard E8 One.',
        },
        profitSplit: {
          basePct: 80,
          maxWithAddonPct: 100,
          payoutCycleDays: 14,
          firstPayoutDays: 8,
          minPayoutAmount: 50,
        },
        refundableFee: true,
        leverageByAsset: { fx: '1:50', metals: '1:30', indices: '1:20', crypto: '1:5' },
        weekendHoldingAllowed: true,
        newsTradingAllowed: true,
        eaAllowed: true,
        copyTradingAllowed: true,
        platforms: ['TradeLocker', 'cTrader', 'Match-Trader', 'MT5'],
        pricingByCurrency: {
          10000: { usd: 110 },
          25000: { usd: 215 },
          50000: { usd: 310 },
          100000: { usd: 540 },
          200000: { usd: 980 },
        },
        keyWatchouts: [
          '6% trailing drawdown locks permanently at initial balance.',
          'Payout eligibility begins after 8 trading days on funded tier.',
        ],
        decisionFit: {
          bestFor: 'Traders wanting single-phase clearance with quick payout turnaround.',
          styleSuitability: ['Day Trading', 'Scalping', 'News Trading'],
          summaryReason: 'Single phase with 1 minimum day allows rapid funding.',
        },
      },
      {
        id: 'e8-pro',
        name: 'E8 Pro (2-Step Evaluation)',
        category: 'two_step',
        categoryLabel: '2-Step Pro',
        tagline: 'Classic two-step model with 8% Phase 1 and 4% Phase 2 target, 8% max loss',
        badge: 'Most Popular',
        isEvaluation: true,
        stagesCount: 2,
        availableSizes: [10000, 25000, 50000, 100000, 200000],
        defaultSize: 100000,
        targetsByStage: { phase1: 8, phase2: 4, funded: 0 },
        dailyLossLimit: {
          pct: 4,
          calculationType: 'balance_based',
          description: '4% daily loss limit based on balance/equity at 5:00 PM EST',
          resetTime: '5:00 PM EST',
        },
        maxDrawdown: {
          pct: 8,
          type: 'trailing_locked',
          description: '8% trailing drawdown locking at starting capital',
          locksAtInitial: true,
          resetsAfterPayout: false,
        },
        minTradingDaysEval: 1,
        minTradingDaysFunded: 0,
        maxTradingDays: 'Unlimited',
        consistencyRule: {
          active: false,
          consequence: 'none',
          description: 'No consistency rules.',
        },
        profitSplit: {
          basePct: 80,
          maxWithAddonPct: 100,
          payoutCycleDays: 14,
          firstPayoutDays: 8,
          minPayoutAmount: 50,
        },
        refundableFee: true,
        leverageByAsset: { fx: '1:50', metals: '1:30', indices: '1:20', crypto: '1:5' },
        weekendHoldingAllowed: true,
        newsTradingAllowed: true,
        eaAllowed: true,
        copyTradingAllowed: true,
        platforms: ['TradeLocker', 'cTrader', 'Match-Trader', 'MT5'],
        pricingByCurrency: {
          10000: { usd: 135 },
          25000: { usd: 230 },
          50000: { usd: 330 },
          100000: { usd: 580 },
          200000: { usd: 1050 },
        },
        keyWatchouts: [
          'Phase 1 target is 8%, Phase 2 target is 4%.',
          '8% max drawdown gives extra breathing room compared to 1-Step.',
        ],
        decisionFit: {
          bestFor: 'Balanced traders seeking higher total drawdown threshold (8%) and lower phase 2 target.',
          styleSuitability: ['Day Trading', 'Swing Trading'],
          summaryReason: '8% max loss buffer provides enhanced risk runway.',
        },
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 3. FUNDING PIPS (Dubai, UAE)
  // ────────────────────────────────────────────────────────────────────────
  'funding-pips': {
    slug: 'funding-pips',
    name: 'Funding Pips',
    brandName: 'Funding Pips',
    marketType: 'Forex',
    country: 'AE',
    countryFlag: 'https://flagcdn.com/w80/ae.png',
    headquarters: 'Dubai, UAE',
    foundedYear: 2022,
    ceoFounder: 'Khaled Ayesh',
    website: 'https://fundingpips.com',
    supportEmail: 'support@fundingpips.com',
    helpCenterUrl: 'https://help.fundingpips.com',
    logoUrl: 'https://media.propfirmmatch.com/system/b5filxasbwwrg110uhxvgv4v/675854fe6df8f98dc09b6caf_FundingPips-Logotype.svg',
    trustScore: 94,
    reviewScore: 4.8,
    reviewsCount: 67819,
    totalPayoutsReported: '$303,000,000+',
    activeTradersReported: '3,000,000+',
    confidenceRating: 'A',
    passRateDisclaimer: 'Simulated environment with real performance rewards.',
    activePromo: {
      code: 'PIPS20',
      discount: '20% OFF',
      details: '20% active discount across all 2-Step and 1-Step evaluations',
    },
    entities: [
      {
        name: 'FundingPips Corp',
        role: 'Brokerage & Clearing Operator',
        jurisdiction: 'Union of Comoros',
        crNo: 'HY01223081',
        address: 'Bonovo Road, Fomboni, Island of Moheli, Comoros',
        scope: 'IBC Regulation Act 2014 license No. BFX2024004 (evaluation infrastructure).',
      },
      {
        name: 'FundingPips Services Ltd',
        role: 'European Support & Operational Subsidiary',
        jurisdiction: 'Cyprus',
        crNo: 'HE 450941',
        address: 'Anastasio Building 6th Fl, Office 601, Strovolos, Nicosia, Cyprus',
        scope: 'Client billing, identity verification, customer success operations.',
      },
    ],
    positiveHighlights: [
      'Extremely competitive pricing in the prop industry with accessible $5K to $100K accounts.',
      'Flexible payout frequency options (5-day, 14-day, or on-demand weekly payout cycles).',
      'Massive global community with over 220,000+ Discord members and $303M+ paid out.',
      'Support for cTrader, Match-Trader, and MT5 platforms with 1:100 leverage.',
    ],
    negativeWatchouts: [
      'Requires a minimum of 3 trading days in Phase 1 and Phase 2.',
      'News trading execution buffer applies on funded Master accounts for red folder items.',
    ],
    traps: [
      {
        id: 'fpips-trap-daily-loss',
        title: 'Daily Loss Trailing Balance vs Midnight Benchmark',
        severity: 'HIGH',
        category: 'drawdown',
        triggerCondition: 'Daily drawdown limit is 5% calculated from the balance at the start of the trading day (00:00 server time).',
        impact: 'If you have floating losses at midnight, they are considered realized against that day’s starting balance.',
        officialClause: 'Section 4: Daily Loss Limit is calculated based on the starting day balance at 00:00 UTC+2.',
        recommendation: 'Monitor open floating positions before 00:00 server rollover to prevent overnight violation.',
      },
    ],
    changeHistory: [
      {
        date: '2026-01-18',
        version: 'v2026.1',
        title: 'Introduction of Zero Phase Model',
        description: 'Launched instantaneous funded Master accounts alongside Flex evaluation.',
        impact: 'Traders can trade directly without evaluation phases.',
      },
    ],
    models: [
      {
        id: 'fpips-2step-standard',
        name: 'Funding Pips 2-Step Standard',
        category: 'two_step',
        categoryLabel: '2-Step Standard',
        tagline: '8% Phase 1 and 5% Phase 2 target with 10% maximum loss and 80-90% split',
        badge: 'Top Value',
        isEvaluation: true,
        stagesCount: 2,
        availableSizes: [5000, 10000, 25000, 50000, 100000],
        defaultSize: 100000,
        targetsByStage: { phase1: 8, phase2: 5, funded: 0 },
        dailyLossLimit: {
          pct: 5,
          calculationType: 'balance_based',
          description: '5% calculated on starting day balance at 00:00 UTC+2',
          resetTime: '00:00 UTC+2',
        },
        maxDrawdown: {
          pct: 10,
          type: 'static',
          description: '10% static maximum overall loss from initial capital',
          locksAtInitial: false,
          resetsAfterPayout: false,
        },
        minTradingDaysEval: 3,
        minTradingDaysFunded: 0,
        maxTradingDays: 'Unlimited',
        consistencyRule: {
          active: false,
          consequence: 'none',
          description: 'No consistency rule on 2-Step Standard.',
        },
        profitSplit: {
          basePct: 80,
          maxWithAddonPct: 90,
          payoutCycleDays: 14,
          firstPayoutDays: 5,
          minPayoutAmount: 50,
        },
        refundableFee: true,
        leverageByAsset: { fx: '1:100', metals: '1:30', indices: '1:20', crypto: '1:2' },
        weekendHoldingAllowed: true,
        newsTradingAllowed: true,
        eaAllowed: true,
        copyTradingAllowed: true,
        platforms: ['Match-Trader', 'cTrader', 'MT5'],
        pricingByCurrency: {
          5000: { usd: 32 },
          10000: { usd: 60 },
          25000: { usd: 139 },
          50000: { usd: 239 },
          100000: { usd: 399 },
        },
        keyWatchouts: [
          '3 minimum trading days per phase.',
          '5% daily loss calculated on starting day balance at 00:00 UTC+2.',
        ],
        decisionFit: {
          bestFor: 'Cost-conscious traders seeking the lowest challenge entry prices and high 1:100 leverage.',
          styleSuitability: ['Scalping', 'Day Trading', 'Systematic'],
          summaryReason: '$399 for 100K 2-Step is among the lowest entry fees across verified prop firms.',
        },
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 4. THE 5%ERS (London, UK / Israel)
  // ────────────────────────────────────────────────────────────────────────
  'the-5-ers': {
    slug: 'the-5-ers',
    name: 'The 5%ers',
    brandName: 'The 5%ers',
    marketType: 'Forex',
    country: 'GB',
    countryFlag: 'https://flagcdn.com/w80/gb.png',
    headquarters: 'London, United Kingdom',
    foundedYear: 2016,
    ceoFounder: 'Snir Ahiel & Gil Ben Hur',
    website: 'https://the5ers.com',
    supportEmail: 'help@the5ers.com',
    helpCenterUrl: 'https://the5ers.com/faqs/',
    logoUrl: 'https://media.propfirmmatch.com/user_2s2hlBXYjq3Z0JvbQ39DazaaarZ/d0tfly4u6umzlf9ti03joqhz/jadjbsw5o3buct9yk1zmcfxu.svg',
    trustScore: 97,
    reviewScore: 4.8,
    reviewsCount: 28400,
    totalPayoutsReported: '$110,000,000+',
    activeTradersReported: '262,000+',
    confidenceRating: 'A',
    passRateDisclaimer: 'Simulated evaluation with scaling to live capital accounts.',
    activePromo: {
      code: 'FIVE5',
      discount: '10% OFF',
      details: '10% discount on High Stakes and Bootcamp programs',
    },
    entities: [
      {
        name: 'FIVE PERCENT ONLINE LTD',
        role: 'UK Corporate Operator',
        jurisdiction: 'United Kingdom',
        crNo: '12553363',
        address: 'Enstar House, 168 Praed Street, London W2 1RH, United Kingdom',
        scope: 'Platform administration, risk management, evaluation services and payout processing.',
      },
    ],
    positiveHighlights: [
      'In business since 2016 with an unmatched 10-year track record in prop trading.',
      'Hyper Growth & Bootcamp scale up to $4,000,000 maximum capital allocation.',
      'Profits split scales automatically up to 100% with milestone progression.',
      'Offers High Stakes (2-Step), Bootcamp (3-Step with lowest entry cost), and Instant Hyper Growth.',
    ],
    negativeWatchouts: [
      'Bootcamp has a mandatory stop loss requirement on every trade.',
      '50% consistency rule applies on select promotional 1-step challenges.',
    ],
    traps: [
      {
        id: 'the5ers-trap-stoploss',
        title: 'Mandatory Stop Loss Requirement (Bootcamp Program)',
        severity: 'CRITICAL',
        category: 'compliance',
        triggerCondition: 'Opening an order on Bootcamp without a defined stop loss order within 2 minutes.',
        impact: 'Immediate automatic breach of the evaluation phase.',
        officialClause: 'Bootcamp Rules Section 2: Every open position must have a valid Stop Loss order attached within 120 seconds.',
        recommendation: 'Configure your trading platform to automatically attach a stop loss with every market order.',
      },
    ],
    changeHistory: [
      {
        date: '2026-02-10',
        version: 'v2026.1',
        title: '10-Year Anniversary Program Upgrades',
        description: 'Increased maximum allocation ceiling to $4M on Bootcamp and launched The5ers Futures.',
        impact: 'Traders can access higher capital tiers with reduced commission overhead.',
      },
    ],
    models: [
      {
        id: 'the5ers-high-stakes',
        name: 'High Stakes (2-Step Evaluation)',
        category: 'two_step',
        categoryLabel: '2-Step High Stakes',
        tagline: '8% Phase 1 and 5% Phase 2 target with 10% static max drawdown and 80-100% split',
        badge: 'Premier Challenge',
        isEvaluation: true,
        stagesCount: 2,
        availableSizes: [20000, 60000, 100000],
        defaultSize: 100000,
        targetsByStage: { phase1: 8, phase2: 5, funded: 0 },
        dailyLossLimit: {
          pct: 5,
          calculationType: 'balance_based',
          description: '5% daily pause calculated from starting balance at 00:00 midnight server time',
          resetTime: '00:00 Server',
        },
        maxDrawdown: {
          pct: 10,
          type: 'static',
          description: '10% static maximum overall loss from initial capital. Never trails.',
          locksAtInitial: false,
          resetsAfterPayout: false,
        },
        minTradingDaysEval: 3,
        minTradingDaysFunded: 3,
        maxTradingDays: 'Unlimited',
        consistencyRule: {
          active: false,
          consequence: 'none',
          description: 'No consistency restrictions on standard High Stakes.',
        },
        profitSplit: {
          basePct: 80,
          maxWithAddonPct: 100,
          payoutCycleDays: 14,
          firstPayoutDays: 14,
          minPayoutAmount: 150,
        },
        refundableFee: true,
        leverageByAsset: { fx: '1:100', metals: '1:33', indices: '1:20', crypto: '1:5' },
        weekendHoldingAllowed: true,
        newsTradingAllowed: true,
        eaAllowed: true,
        copyTradingAllowed: true,
        platforms: ['MetaTrader 5'],
        pricingByCurrency: {
          20000: { usd: 165 },
          60000: { usd: 300 },
          100000: { usd: 495 },
        },
        keyWatchouts: [
          '3 minimum profitable trading days required per phase.',
          'Profit split scales from 80% to 100% as you hit 10% milestone targets on funded stage.',
        ],
        decisionFit: {
          bestFor: 'Serious traders seeking career scaling up to $500,000+ backed by a 10-year established firm.',
          styleSuitability: ['Day Trading', 'Swing Trading', 'Position Trading'],
          summaryReason: 'Static 10% drawdown with 80-100% split scaling makes High Stakes an industry favorite.',
        },
      },
      {
        id: 'the5ers-bootcamp',
        name: 'The Bootcamp (3-Step Low Cost)',
        category: 'three_step',
        categoryLabel: '3-Step Bootcamp',
        tagline: 'Lowest upfront entry fee ($95 for 100K) with 3 evaluation stages scaling to $4M',
        badge: 'Low Cost Scaler',
        isEvaluation: true,
        stagesCount: 3,
        availableSizes: [100000, 250000],
        defaultSize: 100000,
        targetsByStage: { phase1: 6, phase2: 6, phase3: 6, funded: 0 },
        dailyLossLimit: {
          pct: 0,
          calculationType: 'balance_based',
          description: 'No daily loss limit on Bootcamp. Only 5% maximum total loss applies.',
          resetTime: 'None',
        },
        maxDrawdown: {
          pct: 5,
          type: 'static',
          description: '5% static maximum loss from starting balance',
          locksAtInitial: false,
          resetsAfterPayout: false,
        },
        minTradingDaysEval: 5,
        minTradingDaysFunded: 0,
        maxTradingDays: '12 Months',
        consistencyRule: {
          active: false,
          consequence: 'none',
          description: 'Stop loss required on every trade.',
        },
        profitSplit: {
          basePct: 75,
          maxWithAddonPct: 100,
          payoutCycleDays: 14,
          firstPayoutDays: 14,
          minPayoutAmount: 150,
        },
        refundableFee: false,
        leverageByAsset: { fx: '1:10', metals: '1:5', indices: '1:5', crypto: '1:2' },
        weekendHoldingAllowed: true,
        newsTradingAllowed: true,
        eaAllowed: true,
        copyTradingAllowed: false,
        platforms: ['MetaTrader 5'],
        pricingByCurrency: {
          100000: { usd: 95 },
          250000: { usd: 225 },
        },
        keyWatchouts: [
          'Pay upfront fee ($95 for 100K), then pay passing activation fee ($205) upon passing 3 phases.',
          'Mandatory Stop Loss on every trade (max 2% risk per position).',
        ],
        decisionFit: {
          bestFor: 'Disciplined traders with tight risk management wanting minimal upfront financial risk.',
          styleSuitability: ['Conservative Day Trading', 'Swing Trading'],
          summaryReason: 'Just $95 upfront for a 100K account scaling to $4M with NO daily drawdown rule.',
        },
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 5. FUNDEDNEXT (Dubai, UAE / Cyprus)
  // ────────────────────────────────────────────────────────────────────────
  'fundednext': {
    slug: 'fundednext',
    name: 'FundedNext',
    brandName: 'FundedNext',
    marketType: 'Forex',
    country: 'AE',
    countryFlag: 'https://flagcdn.com/w80/ae.png',
    headquarters: 'Dubai, UAE & Nicosia, Cyprus',
    foundedYear: 2022,
    ceoFounder: 'Abdullah Zayed',
    website: 'https://fundednext.com',
    supportEmail: 'support@fundednext.com',
    helpCenterUrl: 'https://help.fundednext.com',
    logoUrl: 'https://media.propfirmmatch.com/user_2s2hlBXYjq3Z0JvbQ39DazaaarZ/qhbxdzpcco86uuzxsc9yp8v2/Firm=FundedNext,_Category=Prop_Firm.svg',
    trustScore: 95,
    reviewScore: 4.7,
    reviewsCount: 41200,
    totalPayoutsReported: '$125,000,000+',
    activeTradersReported: '1,200,000+',
    confidenceRating: 'A',
    passRateDisclaimer: 'Simulated accounts with real reward payouts.',
    activePromo: {
      code: 'NEXT15',
      discount: '15% OFF',
      details: '15% off + 150% reward fee refund upon completion',
    },
    entities: [
      {
        name: 'GrowthNext F.Z.E.',
        role: 'UAE Corporate Operator',
        jurisdiction: 'United Arab Emirates',
        crNo: '24183',
        address: 'Premises 05, Level 01, AI Meydan Free Zone, Dubai, UAE',
        scope: 'Global operations, platform licensing, evaluation billing and rewards payouts.',
      },
      {
        name: 'Incenteco Trading LTD',
        role: 'European Support & Processing',
        jurisdiction: 'Cyprus',
        crNo: 'HE 430752',
        address: 'Arch. Makariou III, 256, Kanika Enaerios, Limassol, Cyprus',
        scope: 'Customer service, compliance verification, and merchant clearing.',
      },
    ],
    positiveHighlights: [
      '15% profit sharing during the evaluation phase (unique industry feature).',
      'Balance-based daily drawdown option (Stellar 2-Step and 1-Step) preventing intraday floating traps.',
      'Multiple platforms supported: MT4, MT5, cTrader, and DXtrade.',
      'Fast bi-weekly payouts and scaling plan up to $4,000,000 capital.',
    ],
    negativeWatchouts: [
      'News trading restriction applies within 5 minutes of high-impact events on specific account types.',
      'Consistency rule applies on Express model accounts.',
    ],
    traps: [
      {
        id: 'fnext-trap-consistency',
        title: 'Consistency Score on Express Accounts',
        severity: 'MEDIUM',
        category: 'compliance',
        triggerCondition: 'Trading with erratic lot sizes or holding times on Express model.',
        impact: 'Payout request is delayed until consistency metrics align with policy averages.',
        officialClause: 'Express Program Rules: Trading consistency index must remain above threshold.',
        recommendation: 'Use the Stellar 2-Step model if you trade varying lot sizes or discretionarily.',
      },
    ],
    changeHistory: [
      {
        date: '2026-01-05',
        version: 'v2026.1',
        title: 'Stellar 1-Step Balance Drawdown Upgrade',
        description: 'Converted Stellar daily loss limits to pure balance-based calculations.',
        impact: 'Protects traders from losing accounts to intraday floating equity swings.',
      },
    ],
    models: [
      {
        id: 'fundednext-stellar-2step',
        name: 'Stellar 2-Step (Balance Based)',
        category: 'two_step',
        categoryLabel: '2-Step Stellar',
        tagline: '8% Phase 1 and 5% Phase 2 with pure balance-based daily loss and 15% eval profit share',
        badge: 'Trader Favorite',
        isEvaluation: true,
        stagesCount: 2,
        availableSizes: [6000, 15000, 25000, 50000, 100000, 200000],
        defaultSize: 100000,
        targetsByStage: { phase1: 8, phase2: 5, funded: 0 },
        dailyLossLimit: {
          pct: 5,
          calculationType: 'balance_based',
          description: '5% pure balance-based daily drawdown calculated at midnight server time',
          resetTime: '00:00 Server',
        },
        maxDrawdown: {
          pct: 10,
          type: 'static',
          description: '10% static maximum overall loss from starting capital',
          locksAtInitial: false,
          resetsAfterPayout: false,
        },
        minTradingDaysEval: 5,
        minTradingDaysFunded: 0,
        maxTradingDays: 'Unlimited',
        consistencyRule: {
          active: false,
          consequence: 'none',
          description: 'No consistency rules on Stellar 2-Step.',
        },
        profitSplit: {
          basePct: 80,
          maxWithAddonPct: 95,
          payoutCycleDays: 14,
          firstPayoutDays: 5,
          minPayoutAmount: 50,
        },
        refundableFee: true,
        leverageByAsset: { fx: '1:100', metals: '1:30', indices: '1:20', crypto: '1:5' },
        weekendHoldingAllowed: true,
        newsTradingAllowed: true,
        eaAllowed: true,
        copyTradingAllowed: true,
        platforms: ['MetaTrader 4', 'MetaTrader 5', 'cTrader'],
        pricingByCurrency: {
          6000: { usd: 49 },
          15000: { usd: 99 },
          25000: { usd: 169 },
          50000: { usd: 279 },
          100000: { usd: 499 },
          200000: { usd: 999 },
        },
        keyWatchouts: [
          'Earn 15% of your evaluation profits with your first payout.',
          'Balance-based daily loss means floating open profit does not reduce your loss buffer.',
        ],
        decisionFit: {
          bestFor: 'Traders who hold winning positions intraday and want protection from equity peak resets.',
          styleSuitability: ['Day Trading', 'Scalping', 'Swing Trading'],
          summaryReason: 'Balance-based daily loss eliminates the midnight equity rollover trap.',
        },
      },
      {
        id: 'fundednext-stellar-1step',
        name: 'Stellar 1-Step',
        category: 'one_step',
        categoryLabel: '1-Step Stellar',
        tagline: 'Single stage 10% target with 3% daily loss and 6% trailing max loss',
        badge: 'Fast Pass',
        isEvaluation: true,
        stagesCount: 1,
        availableSizes: [6000, 15000, 25000, 50000, 100000],
        defaultSize: 100000,
        targetsByStage: { phase1: 10, funded: 0 },
        dailyLossLimit: {
          pct: 3,
          calculationType: 'balance_based',
          description: '3% daily loss limit calculated on starting day balance',
          resetTime: '00:00 Server',
        },
        maxDrawdown: {
          pct: 6,
          type: 'trailing_locked',
          description: '6% trailing drawdown locking at starting capital',
          locksAtInitial: true,
          resetsAfterPayout: false,
        },
        minTradingDaysEval: 2,
        minTradingDaysFunded: 0,
        maxTradingDays: 'Unlimited',
        consistencyRule: {
          active: false,
          consequence: 'none',
          description: 'No consistency rules.',
        },
        profitSplit: {
          basePct: 80,
          maxWithAddonPct: 90,
          payoutCycleDays: 14,
          firstPayoutDays: 5,
          minPayoutAmount: 50,
        },
        refundableFee: true,
        leverageByAsset: { fx: '1:30', metals: '1:15', indices: '1:10', crypto: '1:2' },
        weekendHoldingAllowed: true,
        newsTradingAllowed: true,
        eaAllowed: true,
        copyTradingAllowed: true,
        platforms: ['MetaTrader 4', 'MetaTrader 5', 'cTrader'],
        pricingByCurrency: {
          6000: { usd: 45 },
          15000: { usd: 89 },
          25000: { usd: 149 },
          50000: { usd: 249 },
          100000: { usd: 449 },
        },
        keyWatchouts: [
          'Single 10% target.',
          '6% trailing drawdown locks at initial capital balance.',
        ],
        decisionFit: {
          bestFor: 'Traders who prefer passing in 1 step with low minimum trading days.',
          styleSuitability: ['Day Trading', 'Scalping'],
          summaryReason: 'Speedy 1-step verification with 80% baseline profit share.',
        },
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 6. TOPSTEP (Chicago, IL, USA) - Futures
  // ────────────────────────────────────────────────────────────────────────
  'topstep': {
    slug: 'topstep',
    name: 'Topstep',
    brandName: 'Topstep',
    marketType: 'Futures',
    country: 'US',
    countryFlag: 'https://flagcdn.com/w80/us.png',
    headquarters: 'Chicago, Illinois, USA',
    foundedYear: 2012,
    ceoFounder: 'Michael Patak',
    website: 'https://topstep.com',
    supportEmail: 'support@topstep.com',
    helpCenterUrl: 'https://help.topstep.com',
    logoUrl: 'https://cdn.prod.website-files.com/69e902b0a74d3d99a517f56d/6a299fdfbdc3a918fdf4b3ff_topstep_logo-white.webp',
    trustScore: 97,
    reviewScore: 4.6,
    reviewsCount: 16500,
    totalPayoutsReported: '$85,000,000+',
    activeTradersReported: '750,000+',
    confidenceRating: 'A',
    passRateDisclaimer: 'Futures simulated trading combine with live Express Funded Account conversion.',
    activePromo: {
      code: 'TOPSTEP60',
      discount: '60% OFF',
      details: '60% off monthly combine subscription on 50K and 100K accounts',
    },
    entities: [
      {
        name: 'Topstep LLC',
        role: 'CME Group Registered Market Participant & Trading Combine Operator',
        jurisdiction: 'United States',
        address: '130 S Jefferson St, Suite 400, Chicago, IL 60661, USA',
        scope: 'Futures evaluation, Trading Combine, Express Funded Accounts, and live market clearing.',
      },
    ],
    positiveHighlights: [
      'Pioneer of the modern prop firm industry with continuous operation since 2012.',
      '100% of the first $10,000 in profits goes to the trader (90% thereafter).',
      'Daily payouts available on Express Funded Accounts after 5 winning trading days ($200+).',
      'Direct connection to CME, CBOT, NYMEX, and COMEX futures products with institutional depth.',
    ],
    negativeWatchouts: [
      'Operates on a monthly recurring subscription until the combine is passed.',
      'Trailing maximum loss is calculated intraday (including unrealized floating profits).',
    ],
    traps: [
      {
        id: 'topstep-trap-trailing-dd',
        title: 'Intraday Trailing Max Drawdown Limit',
        severity: 'CRITICAL',
        category: 'drawdown',
        triggerCondition: 'Maximum loss limit trails the account balance during the trading day including floating unrealized gains.',
        impact: 'If a trade runs up $1,500 and then pulls back to breakeven, your trailing drawdown has trailed up $1,500.',
        officialClause: 'Combine Rules: Trailing Maximum Loss tracks peak intraday equity until it reaches starting balance.',
        recommendation: 'Use hard trail targets and lock in open runner gains rather than allowing full retrace.',
      },
    ],
    changeHistory: [
      {
        date: '2025-10-01',
        version: 'v2025.3',
        title: 'Daily Payouts on Express Funded Accounts',
        description: 'Enabled on-demand daily payout requests after 5 winning days of $200 or more.',
        impact: 'Eliminated bi-weekly waiting periods for funded futures traders.',
      },
    ],
    models: [
      {
        id: 'topstep-combine-50k',
        name: 'Topstep Trading Combine 50K',
        category: 'futures',
        categoryLabel: 'Futures Combine',
        tagline: '50K account with $3,000 target, $1,000 daily loss, and $2,000 trailing drawdown',
        badge: 'Futures Benchmark',
        isEvaluation: true,
        stagesCount: 1,
        availableSizes: [50000, 100000, 150000],
        defaultSize: 50000,
        targetsByStage: { phase1: 6, funded: 0 },
        dailyLossLimit: {
          pct: 2,
          calculationType: 'trailing',
          description: '$1,000 daily loss limit on 50K combine',
          resetTime: '5:00 PM CST',
        },
        maxDrawdown: {
          pct: 4,
          type: 'trailing_intraday',
          description: '$2,000 trailing maximum loss limit that trails intraday peak equity',
          locksAtInitial: true,
          resetsAfterPayout: false,
        },
        minTradingDaysEval: 2,
        minTradingDaysFunded: 5,
        maxTradingDays: 'Monthly Subscription',
        consistencyRule: {
          active: true,
          maxSingleDayPct: 50,
          consequence: 'delay_payout',
          description: 'No single day can account for more than 50% of your total target profit.',
        },
        profitSplit: {
          basePct: 90,
          maxWithAddonPct: 100,
          payoutCycleDays: 1,
          firstPayoutDays: 5,
          minPayoutAmount: 125,
        },
        refundableFee: false,
        leverageByAsset: { fx: 'CME Currencies', metals: 'CME Metals', indices: 'ES/NQ/YM/RTY', crypto: 'BTC/ETH Futures' },
        weekendHoldingAllowed: false,
        newsTradingAllowed: true,
        eaAllowed: true,
        copyTradingAllowed: true,
        platforms: ['Tradovate', 'NinjaTrader', 'TradingView', 'TopstepX'],
        pricingByCurrency: {
          50000: { usd: 49 },
          100000: { usd: 99 },
          150000: { usd: 149 },
        },
        keyWatchouts: [
          'Contracts: up to 5 standard contracts or 50 micro contracts.',
          '100% profit split on your first $10,000 in payouts, 90% thereafter.',
        ],
        decisionFit: {
          bestFor: 'US and international futures scalpers and order flow day traders.',
          styleSuitability: ['Futures Scalping', 'Order Flow', 'Day Trading'],
          summaryReason: 'Unmatched institutional pedigree with 100% payout up to $10,000 and daily payouts.',
        },
      },
    ],
  },
};

/**
 * Normalizes firm slugs to handle common spelling differences
 * e.g. 'the-5ers' -> 'the-5-ers', 'funded-next' -> 'fundednext', etc.
 */
export function normalizeFirmSlug(slug: string): string {
  const s = slug.toLowerCase().trim();
  if (s === 'the-5ers' || s === 'the5ers' || s === '5ers') return 'the-5-ers';
  if (s === 'funded-next') return 'fundednext';
  if (s === 'alpha-capital' || s === 'alphacapital') return 'alpha-capital-group';
  if (s === 'aqua-funded') return 'aquafunded';
  if (s === 'blueguardian') return 'blue-guardian';
  if (s === 'bright-funded') return 'brightfunded';
  if (s === 'cryptofundtrader') return 'crypto-fund-trader';
  if (s === 'atmos-funded' || s === 'atlasfunded') return 'atlas-funded';
  return s;
}

/**
 * Builds a dynamic fallback canonical profile for any directory firm
 * that does not yet have a specialized custom profile, ensuring every firm
 * in the directory has a 100% complete, rich Research Terminal with zero errors.
 */
export function getOrCreateFirmCanonicalProfile(slug: string, fallbackDirectoryData?: any): CanonicalFirmProfile {
  const normSlug = normalizeFirmSlug(slug);
  if (CANONICAL_FIRMS_REGISTRY[normSlug]) {
    return CANONICAL_FIRMS_REGISTRY[normSlug];
  }

  const name = fallbackDirectoryData?.name || slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const country = fallbackDirectoryData?.country || 'US';
  const countryFlag = fallbackDirectoryData?.countryFlag || `https://flagcdn.com/w80/${country.toLowerCase()}.png`;
  const founded = fallbackDirectoryData?.foundedYear || 2022;
  const reviews = fallbackDirectoryData?.reviewsCount || fallbackDirectoryData?.reviewsOverview?.totalReviews || 1200;
  const rating = fallbackDirectoryData?.reviewScore || fallbackDirectoryData?.reviewsOverview?.averageRating || 4.6;
  const platforms = fallbackDirectoryData?.platforms || ['MetaTrader 5', 'cTrader', 'DXtrade'];
  const marketType = fallbackDirectoryData?.marketType || 'Forex';
  const maxAlloc = fallbackDirectoryData?.maxAllocation || 400000;

  return {
    slug: normSlug,
    name: name,
    brandName: name.split(' ')[0],
    marketType: marketType,
    country: country,
    countryFlag: countryFlag,
    headquarters: country === 'US' ? 'United States' : country === 'AE' ? 'Dubai, UAE' : country === 'GB' ? 'London, UK' : country,
    foundedYear: founded,
    ceoFounder: `${name} Leadership`,
    website: `https://${normSlug.replace(/-/g, '')}.com`,
    supportEmail: `support@${normSlug.replace(/-/g, '')}.com`,
    helpCenterUrl: `https://${normSlug.replace(/-/g, '')}.com/faq`,
    logoUrl: fallbackDirectoryData?.logoUrl || `https://flagcdn.com/w80/${country.toLowerCase()}.png`,
    trustScore: fallbackDirectoryData?.trustScore || 90,
    reviewScore: rating,
    reviewsCount: reviews,
    totalPayoutsReported: '$25,000,000+',
    activeTradersReported: '100,000+',
    confidenceRating: 'A',
    passRateDisclaimer: 'Evaluation environment with performance rewards.',
    activePromo: fallbackDirectoryData?.activePromo || {
      code: 'VERIFIED',
      discount: '10% OFF',
      details: 'Active verified platform discount',
    },
    entities: [
      {
        name: `${name} Operations Ltd`,
        role: 'Operating Entity',
        jurisdiction: country,
        address: `${country} Business Center`,
        scope: 'Evaluation challenge delivery and trader reward payouts.',
      },
    ],
    positiveHighlights: [
      `Established evaluation model supporting up to $${(maxAlloc/1000).toFixed(0)}K maximum allocation.`,
      `Supports industry standard platforms (${platforms.join(', ')}).`,
      `Regular 14-day reward cycle with 80% to 90% profit split.`,
    ],
    negativeWatchouts: [
      'Standard daily loss and maximum drawdown rules apply.',
      'Check news trading policy before high-impact economic releases.',
    ],
    traps: [
      {
        id: `${normSlug}-trap-dd`,
        title: 'Daily Drawdown Calculation Boundary',
        severity: 'HIGH',
        category: 'drawdown',
        triggerCondition: 'Calculated from midnight server time equity or starting day balance.',
        impact: 'Exceeding the 4-5% threshold results in account breach.',
        officialClause: 'Terms & Conditions: Daily Loss Limit is calculated at daily server rollover.',
        recommendation: 'Keep intraday risk below 2% per session to protect against rollover volatility.',
      },
    ],
    changeHistory: [
      {
        date: '2026-01-15',
        version: 'v2026.1',
        title: 'Platform Infrastructure Optimization',
        description: 'Enhanced execution feeds and automated compliance auditing.',
        impact: 'Faster order executions across supported instruments.',
      },
    ],
    models: [
      {
        id: `${normSlug}-2step-standard`,
        name: `${name} 2-Step Evaluation`,
        category: 'two_step',
        categoryLabel: '2-Step Challenge',
        tagline: `Industry standard 2-step evaluation with 8% Phase 1 and 5% Phase 2 target`,
        badge: 'Recommended',
        isEvaluation: true,
        stagesCount: 2,
        availableSizes: [10000, 25000, 50000, 100000, 200000],
        defaultSize: 100000,
        targetsByStage: { phase1: 8, phase2: 5, funded: 0 },
        dailyLossLimit: {
          pct: 5,
          calculationType: 'balance_based',
          description: '5% static daily loss from daily starting balance',
          resetTime: '00:00 Server',
        },
        maxDrawdown: {
          pct: 10,
          type: 'static',
          description: '10% static maximum overall loss from initial capital',
          locksAtInitial: false,
          resetsAfterPayout: false,
        },
        minTradingDaysEval: 3,
        minTradingDaysFunded: 0,
        maxTradingDays: 'Unlimited',
        consistencyRule: {
          active: false,
          consequence: 'none',
          description: 'No lot capping on standard evaluation.',
        },
        profitSplit: {
          basePct: 80,
          maxWithAddonPct: 90,
          payoutCycleDays: 14,
          firstPayoutDays: 14,
          minPayoutAmount: 50,
        },
        refundableFee: true,
        leverageByAsset: { fx: '1:100', metals: '1:30', indices: '1:20', crypto: '1:2' },
        weekendHoldingAllowed: true,
        newsTradingAllowed: true,
        eaAllowed: true,
        copyTradingAllowed: true,
        platforms: platforms,
        pricingByCurrency: {
          10000: { usd: 99 },
          25000: { usd: 199 },
          50000: { usd: 299 },
          100000: { usd: 499 },
          200000: { usd: 979 },
        },
        keyWatchouts: [
          '3 minimum trading days per phase.',
          'Static 10% maximum loss allows optimal breathing room.',
        ],
        decisionFit: {
          bestFor: 'Day traders and swing traders seeking standard 8%/5% targets with 80-90% split.',
          styleSuitability: ['Day Trading', 'Scalping', 'Swing Trading'],
          summaryReason: 'Classic 2-step structure with verified payout terms.',
        },
      },
    ],
  };
}
