import { PropFirm } from '../types';

export interface DirectoryFirmItem {
  id: string;
  name: string;
  shortName: string;
  logoText: string;
  logoBg: string;
  status: 'ACTIVE_VERIFIED' | 'PIPELINE_READY' | 'UNDER_REVIEW';
  statusLabel: string;
  tagline: string;
  headquarters: string;
  founded: string;
  ceo?: string;
  website: string;
  overallScore: number;
  trustpilotRating: number;
  trustpilotReviewsCount: number;
  startingPrice: number;
  maxAllocation: string;
  profitSplit: string;
  payoutFrequency: string;
  challengeModels: string[];
  keyRules: {
    dailyDrawdown: string;
    dailyDrawdownType: string;
    maxDrawdown: string;
    maxDrawdownType: string;
    profitTarget: string;
    minTradingDays: string;
    leverage: string;
    newsTrading: string;
    weekendHolding: string;
    eaAllowed: boolean;
  };
  highlights: string[];
  cautionFlags: string[];
  activePromo?: {
    code: string;
    discount: string;
    details: string;
  };
  totalVerifiedRules: number;
  hiddenTrapsCount: number;
}

export const ALL_PROP_FIRMS_DIRECTORY: DirectoryFirmItem[] = [
  {
    id: 'goat-funded-trader',
    name: 'Goat Funded Trader',
    shortName: 'GFT',
    logoText: 'GFT',
    logoBg: 'from-amber-500 to-indigo-600',
    status: 'ACTIVE_VERIFIED',
    statusLabel: '100% Verified Deep-Dive Active',
    tagline: 'Multi-model prop firm with balance-based daily drawdown, up to 95% profit splits, and instant scaling.',
    headquarters: 'Hong Kong & Spain',
    founded: '2023',
    ceo: 'Edoardo Dalla Torre',
    website: 'https://www.goatfundedtrader.com',
    overallScore: 88,
    trustpilotRating: 4.3,
    trustpilotReviewsCount: 1420,
    startingPrice: 24.75,
    maxAllocation: '$800,000',
    profitSplit: 'Up to 95%',
    payoutFrequency: 'Bi-Weekly (14 days)',
    challengeModels: ['2-Step Standard', '1-Step Classic', 'Instant Funding', 'No-Time-Limit'],
    keyRules: {
      dailyDrawdown: '4%',
      dailyDrawdownType: 'Balance-Based (Resets 5 PM EST)',
      maxDrawdown: '8% (Static) / 6% (Trailing on 1-Step)',
      maxDrawdownType: 'Static Loss Floor',
      profitTarget: '8% (Step 1) / 5% (Step 2)',
      minTradingDays: '0 Days (Eval) / 4 Days (Funded)',
      leverage: '1:50 Forex, 1:20 Indices, 1:2 Crypto',
      newsTrading: 'Allowed across all phases',
      weekendHolding: 'Allowed',
      eaAllowed: true
    },
    highlights: [
      '24+ Deep-crawled and verified rules with math breakdown',
      'Balance-based daily drawdown preserves floating gains',
      'No minimum trading days required during evaluation phase',
      '100% Refundable fee with 4th payout',
      'Active discount code MATCH45 (45% OFF)'
    ],
    cautionFlags: [
      '80% maximum margin utilization rule buried in FAQ',
      '33% single-day consistency profit cap on funded payouts',
      'Funded stage requires 4 active trading days per payout cycle',
      'Must close all open positions and pending orders before payout'
    ],
    activePromo: {
      code: 'MATCH45',
      discount: '45% OFF',
      details: '45% OFF on all 2-Step and 1-Step evaluation plans + 150% fee refund on 4th payout.'
    },
    totalVerifiedRules: 24,
    hiddenTrapsCount: 7
  },
  {
    id: 'ftmo',
    name: 'FTMO',
    shortName: 'FTMO',
    logoText: 'FTMO',
    logoBg: 'from-blue-600 to-cyan-500',
    status: 'PIPELINE_READY',
    statusLabel: 'Industry Benchmark • Ready to Crawl',
    tagline: 'The gold-standard evaluation firm with 10 years of consistent payouts and institutional liquidity.',
    headquarters: 'Prague, Czech Republic',
    founded: '2014',
    ceo: 'Otakar Suffner',
    website: 'https://ftmo.com',
    overallScore: 94,
    trustpilotRating: 4.8,
    trustpilotReviewsCount: 22400,
    startingPrice: 155,
    maxAllocation: '$2,000,000 (Scaling Plan)',
    profitSplit: '80% - 90%',
    payoutFrequency: 'Bi-Weekly (14 days)',
    challengeModels: ['2-Step Standard', '2-Step Aggressive'],
    keyRules: {
      dailyDrawdown: '5%',
      dailyDrawdownType: 'Balance/Equity High-Watermark',
      maxDrawdown: '10%',
      maxDrawdownType: 'Static Loss Floor',
      profitTarget: '10% (Step 1) / 5% (Step 2)',
      minTradingDays: '4 Days per step',
      leverage: '1:100 (Normal), 1:30 (Swing)',
      newsTrading: 'Allowed on Swing accounts; 2-min restriction on standard',
      weekendHolding: 'Allowed on Swing accounts',
      eaAllowed: true
    },
    highlights: [
      '10+ years track record with over $160M paid out to traders',
      'Bi-weekly on-demand payouts after first 14 days',
      'FTMO Academy, Account MetriX, and Premium Coaching included',
      '100% refundable fee upon first payout'
    ],
    cautionFlags: [
      'Standard account restricts trading 2 minutes before/after major red folder news',
      'Weekend holding disabled on standard accounts (allowed on Swing model only)'
    ],
    activePromo: {
      code: 'FTMOFREE',
      discount: 'Free Trial',
      details: 'Free 14-day evaluation trial with complete MT4/MT5 metrics dashboard.'
    },
    totalVerifiedRules: 18,
    hiddenTrapsCount: 3
  },
  {
    id: 'funding-pips',
    name: 'FundingPips',
    shortName: 'FP',
    logoText: 'FP',
    logoBg: 'from-purple-600 to-pink-600',
    status: 'PIPELINE_READY',
    statusLabel: 'Low-Cost Leader • Ready to Crawl',
    tagline: 'Affordable evaluations with 5-day payout cycles, raw spreads, and flexible 1-step/2-step/3-step tiers.',
    headquarters: 'Dubai, UAE',
    founded: '2022',
    ceo: 'Khaled Aref',
    website: 'https://fundingpips.com',
    overallScore: 89,
    trustpilotRating: 4.5,
    trustpilotReviewsCount: 16800,
    startingPrice: 32,
    maxAllocation: '$300,000 ($2M Scaling)',
    profitSplit: '80% - 90%',
    payoutFrequency: 'Every 5 Business Days (Funded Master)',
    challengeModels: ['1-Step', '2-Step Student', '3-Step Zero'],
    keyRules: {
      dailyDrawdown: '5%',
      dailyDrawdownType: 'Balance-Based EOD',
      maxDrawdown: '10% (Static) / 6% (1-Step)',
      maxDrawdownType: 'Static Loss Floor',
      profitTarget: '8% (Step 1) / 5% (Step 2)',
      minTradingDays: '0 Days (Eval) / 5 Days (Funded)',
      leverage: '1:100 Forex, 1:30 Indices, 1:20 Crypto',
      newsTrading: 'Allowed (except 2-min rule on Master account)',
      weekendHolding: 'Allowed',
      eaAllowed: true
    },
    highlights: [
      'Fastest payout cadence in industry (every 5 business days on Master tier)',
      'Lowest entry cost in market ($32 for $5k evaluation)',
      'Raw spreads with Match-Trader & cTrader platforms'
    ],
    cautionFlags: [
      'News restriction on Master funded tier (2 min before & after news)',
      'Trailing drawdown on 1-Step challenge model'
    ],
    activePromo: {
      code: 'PIPS5',
      discount: '5% OFF',
      details: '5% discount on all challenge sizes + 110% refund on 1st payout.'
    },
    totalVerifiedRules: 16,
    hiddenTrapsCount: 4
  },
  {
    id: 'funded-next',
    name: 'FundedNext',
    shortName: 'FN',
    logoText: 'FN',
    logoBg: 'from-emerald-600 to-teal-500',
    status: 'PIPELINE_READY',
    statusLabel: '15% Challenge Share • Ready to Crawl',
    tagline: 'Guaranteed 15% profit sharing during the evaluation phase and balance-based drawdown guarantees.',
    headquarters: 'Dubai, UAE',
    founded: '2022',
    ceo: 'Syed Abdullah Jayed',
    website: 'https://fundednext.com',
    overallScore: 90,
    trustpilotRating: 4.6,
    trustpilotReviewsCount: 19500,
    startingPrice: 32,
    maxAllocation: '$300,000 ($4M Scaling)',
    profitSplit: '60% to 95% + 15% Challenge Bonus',
    payoutFrequency: '14 Days / 24-Hour Express',
    challengeModels: ['Stellar 2-Step', 'Stellar 1-Step', 'Express', 'Evaluation'],
    keyRules: {
      dailyDrawdown: '5%',
      dailyDrawdownType: 'Balance-Based (Simulated)',
      maxDrawdown: '10% (Static) / 6% (1-Step)',
      maxDrawdownType: 'Static Loss Floor',
      profitTarget: '8% (Step 1) / 5% (Step 2)',
      minTradingDays: '5 Days (Stellar)',
      leverage: '1:100 Forex, 1:20 Indices',
      newsTrading: 'Allowed on Stellar model',
      weekendHolding: 'Allowed',
      eaAllowed: true
    },
    highlights: [
      'Earn 15% profit share from challenge phases paid with first funded payout',
      'Balance-based daily drawdown calculations on Stellar models',
      'Zero commission raw spread trading with cTrader & MT5'
    ],
    cautionFlags: [
      'Express challenge model includes consistency rule matrix',
      'Inactivity rule: Must place trade every 30 days to prevent account forfeiture'
    ],
    activePromo: {
      code: 'FNSTELLAR',
      discount: '10% OFF',
      details: '10% discount on all Stellar packages + 15% profit share on eval phases.'
    },
    totalVerifiedRules: 17,
    hiddenTrapsCount: 4
  },
  {
    id: 'the-5ers',
    name: 'The5%ers',
    shortName: '5ERS',
    logoText: '5%',
    logoBg: 'from-amber-600 to-rose-600',
    status: 'PIPELINE_READY',
    statusLabel: 'Veteran Fund • Ready to Crawl',
    tagline: 'High-growth capital scaling up to $4 Million, instant funding programs, and bootcamp for low-cost traders.',
    headquarters: 'Ra\'anana, Israel & London, UK',
    founded: '2016',
    ceo: 'Saul Lokier',
    website: 'https://the5ers.com',
    overallScore: 92,
    trustpilotRating: 4.8,
    trustpilotReviewsCount: 8400,
    startingPrice: 39,
    maxAllocation: '$4,000,000 (Scaling Plan)',
    profitSplit: '80% - 100%',
    payoutFrequency: 'Bi-Weekly / Monthly (Instant)',
    challengeModels: ['Bootcamp', 'High Stakes 2-Step', 'Hyper Growth Instant'],
    keyRules: {
      dailyDrawdown: '5%',
      dailyDrawdownType: 'Equity / Balance-Based',
      maxDrawdown: '10% (Static) / 6% (Bootcamp)',
      maxDrawdownType: 'Static Loss Floor',
      profitTarget: '8% (Step 1) / 5% (Step 2)',
      minTradingDays: '3 Days',
      leverage: '1:100 (High Stakes), 1:10 (Bootcamp)',
      newsTrading: 'Allowed',
      weekendHolding: 'Allowed',
      eaAllowed: true
    },
    highlights: [
      'One of the oldest and most financially stable prop firms in the world (since 2016)',
      'Scaling plan doubles capital every 10% profit milestone up to $4,000,000',
      'Bootcamp allows testing with low entry fee ($39 upfront) before paying full challenge fee'
    ],
    cautionFlags: [
      'Bootcamp model requires mandatory stop-loss on every position (max 2% risk)',
      'Leverage on Bootcamp is conservative (1:10) suited for strict risk managers'
    ],
    activePromo: {
      code: '5ERSBONUS',
      discount: '5% OFF',
      details: '5% discount on all High Stakes and Hyper Growth challenge tiers.'
    },
    totalVerifiedRules: 15,
    hiddenTrapsCount: 2
  },
  {
    id: 'alpha-capital',
    name: 'Alpha Capital Group',
    shortName: 'ACG',
    logoText: 'ACG',
    logoBg: 'from-cyan-600 to-blue-700',
    status: 'PIPELINE_READY',
    statusLabel: 'Zero Commission • Ready to Crawl',
    tagline: 'Custom institutional brokerage with zero commission, free performance coaching, and proprietary dashboard.',
    headquarters: 'London, United Kingdom',
    founded: '2021',
    ceo: 'George Baker',
    website: 'https://alphacapitalgroup.uk',
    overallScore: 87,
    trustpilotRating: 4.7,
    trustpilotReviewsCount: 9200,
    startingPrice: 33,
    maxAllocation: '$300,000 ($2M Scaling)',
    profitSplit: '80%',
    payoutFrequency: 'Bi-Weekly (14 days)',
    challengeModels: ['Alpha Pro 2-Step', 'Alpha 1-Step'],
    keyRules: {
      dailyDrawdown: '5%',
      dailyDrawdownType: 'Balance-Based EOD',
      maxDrawdown: '10%',
      maxDrawdownType: 'Static Loss Floor',
      profitTarget: '8% (Step 1) / 5% (Step 2)',
      minTradingDays: '0 Days (Eval)',
      leverage: '1:100 Forex, 1:20 Indices',
      newsTrading: 'Allowed',
      weekendHolding: 'Allowed',
      eaAllowed: true
    },
    highlights: [
      'Zero trading commissions across all FX pairs and commodities',
      'Proprietary Alpha Trader tech platform & automated risk analytics',
      'Free trading performance coaching sessions included with funded stage'
    ],
    cautionFlags: [
      'Maximum 30 calendar days inactivity before account expiration',
      'Strict single-user IP policy'
    ],
    activePromo: {
      code: 'ALPHA15',
      discount: '15% OFF',
      details: '15% OFF on Alpha Pro evaluations + 80% default profit split.'
    },
    totalVerifiedRules: 14,
    hiddenTrapsCount: 3
  }
];
