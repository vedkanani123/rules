// Curated High-Intent Firm Comparison Pairs
// Alphabetically sorted canonical pairs (firmA < firmB) to prevent duplicate A/B vs B/A pages.

import { PROP_FIRMS_DATA } from '../../data/propFirmsData.ts';
import { ALL_FIRMS_CANONICAL_DATA } from '../../data/allFirmsCanonicalData.ts';

export interface ComparisonPair {
  slug: string;
  firmASlug: string;
  firmBSlug: string;
  firmAName: string;
  firmBName: string;
  title: string;
  metaDescription: string;
  verdict: string;
  keyDifferences: {
    title: string;
    description: string;
  }[];
  suitabilityA: string;
  suitabilityB: string;
}

// Canonical pair generator helper
export function getCanonicalCompareSlug(firmA: string, firmB: string): string {
  const [first, second] = [firmA, firmB].sort();
  return `${first}-vs-${second}`;
}

export const CURATED_COMPARISONS: ComparisonPair[] = [
  {
    slug: 'ftmo-vs-topstep',
    firmASlug: 'ftmo',
    firmBSlug: 'topstep',
    firmAName: 'FTMO',
    firmBName: 'Topstep',
    title: 'FTMO vs Topstep Rules & Drawdown Comparison (2026)',
    metaDescription: 'Direct side-by-side rule comparison: FTMO (Forex/CFD static drawdown) vs Topstep (Futures intraday trailing drawdown). Target, daily loss, and payout rules compared.',
    verdict: 'FTMO is best for Forex/CFD swing and day traders wanting static balance drawdown. Topstep is the premier choice for CME/CBOT futures day traders seeking rapid scaling and exchange compliance.',
    keyDifferences: [
      {
        title: 'Drawdown Mechanism',
        description: 'FTMO uses a static 10% maximum loss calculated against initial account balance. Topstep uses an End-of-Day (EOD) trailing maximum drawdown that trails upward with unrealized trading gains.',
      },
      {
        title: 'Tradable Instruments & Venues',
        description: 'FTMO provides simulated CFD trading on Forex, Metals, Indices, and Crypto via MT4, MT5, cTrader, and DXtrade. Topstep provides direct market access to regulated Futures (ES, NQ, CL, GC) on NinjaTrader and TradingView.',
      },
      {
        title: 'News & Weekend Trading',
        description: 'FTMO Swing accounts allow weekend holding and news execution without restriction (Standard challenge has a 2-minute news buffer). Topstep strictly prohibits holding futures positions through weekend exchange market closures.',
      },
      {
        title: 'Profit Split & Payouts',
        description: 'FTMO offers 80% to 90% profit splits with bi-weekly payout cycles. Topstep provides 100% of the first $10,000 in payouts, scaling to 90% thereafter with daily payout processing upon qualification.',
      },
    ],
    suitabilityA: 'Swing traders, algorithmic MT5 EA users, and multi-asset CFD traders looking for generous drawdown cushions.',
    suitabilityB: 'Intraday futures scalpers and order-flow traders who want 100% initial profit retention and TradingView integration.',
  },
  {
    slug: 'ftmo-vs-funding-pips',
    firmASlug: 'ftmo',
    firmBSlug: 'funding-pips',
    firmAName: 'FTMO',
    firmBName: 'Funding Pips',
    title: 'FTMO vs Funding Pips Rules & Fees Comparison (2026)',
    metaDescription: 'Compare FTMO vs Funding Pips: Evaluation targets (8% vs 10%), balance-based daily loss rules, payout frequency, and pricing side-by-side with verified evidence.',
    verdict: 'Funding Pips provides significantly lower entry prices ($32 for 5k vs FTMO €155 minimum) with lower phase targets (8%/5%), while FTMO offers superior operational longevity, DXtrade/cTrader options, and higher institutional trust.',
    keyDifferences: [
      {
        title: 'Phase 1 Profit Target',
        description: 'Funding Pips requires an 8% Phase 1 profit target, whereas FTMO mandates a 10% profit target on standard challenges.',
      },
      {
        title: 'Pricing & Entry Fees',
        description: 'Funding Pips accounts are priced among the most affordable in the industry ($399 for $100k), whereas FTMO $100k costs approximately €540 ($580).',
      },
      {
        title: 'Platforms Supported',
        description: 'FTMO supports MetaTrader 4, MetaTrader 5, cTrader, and DXtrade. Funding Pips operates on TradeLocker, Match-Trader, and cTrader.',
      },
      {
        title: 'First Payout Waiting Period',
        description: 'Funding Pips offers weekly on-demand payouts on funded stages after the initial 14-day cycle. FTMO provides on-demand payout requests every 14 days.',
      },
    ],
    suitabilityA: 'Traders who prioritize an audited 10-year track record, large scaling up to $2M, and premium broker feeds.',
    suitabilityB: 'Budget-conscious traders looking for 8% targets, fast 1-day minimum trading days, and low challenge fees.',
  },
  {
    slug: 'ftmo-vs-funded-next',
    firmASlug: 'ftmo',
    firmBSlug: 'funded-next',
    firmAName: 'FTMO',
    firmBName: 'FundedNext',
    title: 'FTMO vs FundedNext Rules & Profit Split Comparison (2026)',
    metaDescription: 'Side-by-side rules comparison between FTMO and FundedNext. Compare Stellar 1-Step, 2-Step, balance-based drawdowns, and 15% evaluation profit sharing.',
    verdict: 'FundedNext differentiates itself by paying a 15% profit share during the evaluation challenge phase and offering both 1-step and instant funding, whereas FTMO represents the gold standard for institutional discipline and dispute-free payouts.',
    keyDifferences: [
      {
        title: 'Evaluation Profit Share',
        description: 'FundedNext pays traders 15% of the simulated profits generated during Phase 1 & Phase 2 once they pass and receive their first funded payout. FTMO does not share profits made during challenge phases.',
      },
      {
        title: 'Drawdown Calculation',
        description: 'Both firms feature balance-based daily loss options, but FundedNext also offers 1-step challenges with trailing drawdown and instant funding accounts.',
      },
      {
        title: 'Consistency Rule on Payouts',
        description: 'FTMO has zero consistency rules on standard challenges. FundedNext enforces a consistency range rule on certain models to prevent lot-size gambling before payout review.',
      },
    ],
    suitabilityA: 'Traders seeking an uncompromised institutional benchmark with zero payout consistency traps.',
    suitabilityB: 'Traders who want evaluation profit bonuses, 1-step options, and 95% scaling profit splits.',
  },
  {
    slug: 'ftmo-vs-the-5ers',
    firmASlug: 'ftmo',
    firmBSlug: 'the-5ers',
    firmAName: 'FTMO',
    firmBName: 'The 5%ers',
    title: 'FTMO vs The 5%ers Rules, Scaling & Bootcamp Comparison',
    metaDescription: 'Compare FTMO vs The 5%ers: High Stakes 2-step, $4M career scaling bootcamp, static drawdowns, and leverage limits compared with official source citations.',
    verdict: 'The 5%ers excels for long-term career traders through their $4,000,000 scaling plan and Bootcamp model, whereas FTMO delivers higher leverage (1:100 vs 1:30) and multi-platform diversity.',
    keyDifferences: [
      {
        title: 'Scaling Ceiling',
        description: 'The 5%ers offers career scaling up to $4,000,000 with doubling account sizes every 10% gain. FTMO caps standard allocation at $400,000 ($2M with scaling plan).',
      },
      {
        title: 'Leverage',
        description: 'FTMO provides up to 1:100 leverage on Forex instruments. The 5%ers restricts standard leverage to 1:30 or 1:10 to enforce strict institutional risk boundaries.',
      },
      {
        title: 'Bootcamp 3-Step Model',
        description: 'The 5%ers provides a low entry-cost Bootcamp challenge where traders only pay the full challenge fee after passing evaluation phases.',
      },
    ],
    suitabilityA: 'High-leverage day traders and scalp traders wanting 1:100 purchasing power.',
    suitabilityB: 'Low-risk swing traders and systematic portfolio builders focused on multi-million dollar career capital.',
  },
  {
    slug: 'apex-trader-funding-vs-topstep',
    firmASlug: 'apex-trader-funding',
    firmBSlug: 'topstep',
    firmAName: 'Apex Trader Funding',
    firmBName: 'Topstep',
    title: 'Apex Trader Funding vs Topstep: Futures Rules Compared (2026)',
    metaDescription: 'Detailed futures prop firm comparison: Apex Trader Funding vs Topstep. Intraday trailing drawdown vs End-of-Day trailing, payout thresholds, and contract limits.',
    verdict: 'Topstep provides a safer End-of-Day (EOD) trailing drawdown and free activation fees on TradingView, while Apex Trader Funding offers higher account allocations (up to 20 accounts) with deep promotional discounts.',
    keyDifferences: [
      {
        title: 'Trailing Drawdown Calculation',
        description: 'Apex Trader Funding enforces an intraday trailing drawdown that ratchets upward on unrealized open equity ticks. Topstep uses an End-of-Day (EOD) calculation that calculates only at the daily market close.',
      },
      {
        title: 'Multi-Account Capability',
        description: 'Apex allows traders to trade up to 20 funded accounts concurrently using trade copiers. Topstep limits traders to 3 concurrent Express Funded Accounts.',
      },
      {
        title: 'Payout Gates & Minimum Days',
        description: 'Apex mandates 10 active trading days per payout request with strict payout caps during the first 3 months. Topstep requires winning days of $200+ with 50% consistency compliance.',
      },
    ],
    suitabilityA: 'Experienced multi-account copy traders who can manage intraday peak trailing drawdown without letting profits evaporate.',
    suitabilityB: 'Futures traders who need intraday breathing room and refuse to be penalized by unrealized intra-trade pullbacks.',
  },
  {
    slug: 'funding-pips-vs-goat-funded-trader',
    firmASlug: 'funding-pips',
    firmBSlug: 'goat-funded-trader',
    firmAName: 'Funding Pips',
    firmBName: 'Goat Funded Trader',
    title: 'Funding Pips vs Goat Funded Trader Rules & Traps Comparison',
    metaDescription: 'Compare Funding Pips vs Goat Funded Trader: Balance-based daily drawdown, 1-step vs 2-step evaluation rules, news trading windows, and payout consistency.',
    verdict: 'Both firms feature trader-friendly balance-based daily loss rules, but Goat Funded Trader provides on-demand 24h payout guarantees and BOGO promos, while Funding Pips maintains simpler rule consistency terms.',
    keyDifferences: [
      {
        title: 'Daily Loss Calculation Basis',
        description: 'Both firms calculate daily loss from midnight starting balance/equity, protecting traders from floating profit traps.',
      },
      {
        title: 'News Trading Buffer',
        description: 'Goat Funded Trader enforces a strict 2-minute news buffer on funded accounts for red-folder releases. Funding Pips permits news holding on standard accounts.',
      },
      {
        title: 'Program Variety',
        description: 'Goat Funded Trader offers 1-step, 2-step, and instant funding with up to 100% profit split. Funding Pips offers 1-step, 2-step, and zero-evaluation accounts.',
      },
    ],
    suitabilityA: 'Traders who prefer clean payout guidelines and Match-Trader / cTrader interfaces.',
    suitabilityB: 'Traders seeking high profit splits (up to 100%), instant scaling, and promotional BOGO incentives.',
  },
  {
    slug: 'e8-markets-vs-ftmo',
    firmASlug: 'e8-markets',
    firmBSlug: 'ftmo',
    firmAName: 'E8 Markets',
    firmBName: 'FTMO',
    title: 'E8 Markets vs FTMO Rules & Custom Evaluation Comparison',
    metaDescription: 'Compare E8 Markets vs FTMO: E8 custom drawdown sliders (up to 14% max loss), 1-step to 3-step flexibility, vs FTMO static 10% institutional challenge.',
    verdict: 'E8 Markets offers unmatched rule customization (choose your own drawdown, profit target, and payout split), while FTMO maintains higher brand trust, tighter spreads, and greater regulatory clarity.',
    keyDifferences: [
      {
        title: 'Customizable Rules & Sizing',
        description: 'E8 Markets allows traders to build custom challenge accounts with adjustable drawdown (up to 14%) and payout parameters. FTMO maintains fixed evaluation rules.',
      },
      {
        title: 'Scaling Framework',
        description: 'E8 Markets features the E8 Track scaling program up to $1,000,000 with balance increments. FTMO scales by 25% every 4 months with sustained profit.',
      },
      {
        title: 'Trading Days Requirements',
        description: 'E8 Markets has zero minimum trading days on evaluation phases. FTMO requires a minimum of 4 trading days per phase.',
      },
    ],
    suitabilityA: 'Traders wanting custom risk parameters, higher max drawdown buffers, and immediate 1-day phase passes.',
    suitabilityB: 'Traders who want verified execution consistency, top-tier institutional liquidity, and zero slippage disputes.',
  },
  {
    slug: 'alpha-capital-vs-ftmo',
    firmASlug: 'alpha-capital',
    firmBSlug: 'ftmo',
    firmAName: 'Alpha Capital Group',
    firmBName: 'FTMO',
    title: 'Alpha Capital Group vs FTMO Rules & Fees Comparison (2026)',
    metaDescription: 'Compare Alpha Capital Group vs FTMO: Zero-commission raw spreads, 8% Phase 1 target, balance-based drawdown, and fee refund timelines compared side-by-side.',
    verdict: 'Alpha Capital Group delivers lower challenge pricing, zero commission raw spreads, and an 8% Phase 1 target, while FTMO offers a decade-long audited payout track record, cTrader/DXtrade flexibility, and higher institutional brand recognition.',
    keyDifferences: [
      {
            "title": "Evaluation Profit Target",
            "description": "Alpha Capital Group requires an 8% Phase 1 profit target, whereas FTMO mandates a 10% profit target on standard challenge evaluations."
      },
      {
            "title": "Commissions & Trading Spreads",
            "description": "Alpha Capital Group offers raw spread accounts with $0 commission on major pairs. FTMO charges standard $3 per lot round turn commissions on raw feeds."
      },
      {
            "title": "Drawdown Calculation Basis",
            "description": "Both firms utilize balance-based daily loss rules that reset at midnight server time, protecting traders from unrealized intraday profit peaks."
      },
      {
            "title": "Platform Selection",
            "description": "FTMO supports MT4, MT5, cTrader, and DXtrade. Alpha Capital Group operates on MetaTrader 5 and cTrader."
      }
],
    suitabilityA: 'Traders who prioritize zero commissions, lower challenge costs, and an 8% target hurdle.',
    suitabilityB: 'Traders who demand a 10-year audited operating history, DXtrade/MT4 options, and scaling up to $2M.',
  },
  {
    slug: 'funded-next-vs-funding-pips',
    firmASlug: 'funded-next',
    firmBSlug: 'funding-pips',
    firmAName: 'FundedNext',
    firmBName: 'Funding Pips',
    title: 'FundedNext vs Funding Pips Rules & Profit Split Comparison (2026)',
    metaDescription: 'Compare FundedNext vs Funding Pips: 15% evaluation profit split vs weekly payouts, balance-based daily loss rules, challenge pricing, and consistency requirements.',
    verdict: 'FundedNext stands out with a 15% profit bonus earned during challenge phases and diverse evaluation models, while Funding Pips provides industry-leading low challenge fees, 1-day minimum trading, and fast weekly payouts without consistency traps.',
    keyDifferences: [
      {
            "title": "Evaluation Profit Sharing",
            "description": "FundedNext pays a 15% reward on simulated profits earned during evaluation phases upon passing. Funding Pips does not share profits during evaluation."
      },
      {
            "title": "Payout Frequency & Cycles",
            "description": "Funding Pips provides weekly on-demand payouts after the first 14-day cycle. FundedNext offers bi-weekly payouts with scale progression."
      },
      {
            "title": "Evaluation Models Available",
            "description": "FundedNext features 1-Step, 2-Step Stellar, and Instant Funding accounts. Funding Pips provides 1-Step, 2-Step, and Zero-Evaluation accounts."
      },
      {
            "title": "Consistency Rule on Payouts",
            "description": "Funding Pips enforces no lot size or single-day profit consistency rules on standard challenges. FundedNext enforces consistency ranges on specific model tiers."
      }
],
    suitabilityA: 'Traders looking for evaluation profit bonuses, 1-step challenges, and up to 95% scaling splits.',
    suitabilityB: 'Traders wanting ultra-low challenge fees ($32+ for 5k), weekly payouts, and zero consistency traps.',
  },
  {
    slug: 'take-profit-trader-vs-topstep',
    firmASlug: 'take-profit-trader',
    firmBSlug: 'topstep',
    firmAName: 'Take Profit Trader',
    firmBName: 'Topstep',
    title: 'Take Profit Trader vs Topstep: Futures Rules & Payouts (2026)',
    metaDescription: 'Compare Take Profit Trader vs Topstep: Day-1 immediate payout eligibility vs 50% consistency rules, intraday vs End-of-Day trailing drawdowns, and futures platform fees.',
    verdict: 'Take Profit Trader allows day-one payout withdrawals with Pro+ accounts and zero minimum trading days, whereas Topstep provides a safer End-of-Day trailing drawdown, free TradingView activation, and institutional CME education.',
    keyDifferences: [
      {
            "title": "First Payout Waiting Time",
            "description": "Take Profit Trader (Pro+ account) allows traders to withdraw profits on Day 1 of reaching funded status. Topstep requires 5 winning days of $200+ before payout qualification."
      },
      {
            "title": "Trailing Drawdown Calculation",
            "description": "Take Profit Trader uses an intraday peak equity trailing drawdown during evaluation. Topstep enforces an End-of-Day (EOD) calculation that calculates only at market close."
      },
      {
            "title": "Consistency Rule",
            "description": "Topstep enforces a 50% consistency rule (no single day can account for more than 50% of total profit). Take Profit Trader Pro accounts enforce consistency tiers unless Pro+ is selected."
      },
      {
            "title": "Initial Profit Retention",
            "description": "Topstep gives traders 100% of their first $10,000 in payouts. Take Profit Trader gives 80% to 90% profit splits from the start depending on account tier."
      }
],
    suitabilityA: 'Futures scalpers wanting day-1 instant payouts without multi-week buffer periods.',
    suitabilityB: 'Disciplined futures day traders who need an EOD trailing cushion and 100% first $10k profit split.',
  },
];

// Helper to look up curated comparison or generate dynamic pair
export function getComparisonPairData(slug: string): ComparisonPair | null {
  const curated = CURATED_COMPARISONS.find(c => c.slug === slug);
  if (curated) return curated;

  // Dynamic resolution for arbitrary pairs: [firmA]-vs-[firmB]
  const parts = slug.split('-vs-');
  if (parts.length !== 2) return null;
  const [slugA, slugB] = parts;

  const firmA = PROP_FIRMS_DATA.find(f => f.slug === slugA);
  const firmB = PROP_FIRMS_DATA.find(f => f.slug === slugB);
  if (!firmA || !firmB) return null;

  return {
    slug,
    firmASlug: firmA.slug,
    firmBSlug: firmB.slug,
    firmAName: firmA.name,
    firmBName: firmB.name,
    title: `${firmA.name} vs ${firmB.name} Rules & Drawdown Comparison`,
    metaDescription: `Compare ${firmA.name} vs ${firmB.name} side by side: Daily loss limits, maximum drawdown mechanics, profit targets, payout frequency, and official terms citations.`,
    verdict: `${firmA.name} and ${firmB.name} offer distinct trading terms. Compare their drawdown mechanics, news trading restrictions, and payout rules below to find the best match.`,
    keyDifferences: [
      {
        title: 'Drawdown Model',
        description: `${firmA.name} uses ${firmA.programs[0]?.accounts[0]?.drawdownType || 'static'} drawdown, while ${firmB.name} enforces ${firmB.programs[0]?.accounts[0]?.drawdownType || 'static'} drawdown.`,
      },
      {
        title: 'Daily Loss Limit',
        description: `${firmA.name} allows ${firmA.programs[0]?.accounts[0]?.dailyLossLimit || 5}% daily loss, compared to ${firmB.programs[0]?.accounts[0]?.dailyLossLimit || 5}% at ${firmB.name}.`,
      },
      {
        title: 'Supported Trading Platforms',
        description: `${firmA.name} supports ${firmA.platforms.slice(0, 3).join(', ')}, while ${firmB.name} offers ${firmB.platforms.slice(0, 3).join(', ')}.`,
      },
      {
        title: 'News Trading & Restrictions',
        description: `${firmA.name} lists news trading as ${firmA.programs[0]?.accounts[0]?.newsTradingRule || 'Allowed'}, whereas ${firmB.name} specifies ${firmB.programs[0]?.accounts[0]?.newsTradingRule || 'Allowed'}.`,
      },
    ],
    suitabilityA: `Traders prioritizing ${firmA.tagline || firmA.name + ' terms and platform infrastructure'}.`,
    suitabilityB: `Traders prioritizing ${firmB.tagline || firmB.name + ' terms and platform infrastructure'}.`,
  };
}
