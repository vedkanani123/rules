// Curated High-Intent Attribute & Filter Landing Pages
// Backed by real parameters in PROP_FIRMS_DATA and ALL_FIRMS_CANONICAL_DATA

import { PROP_FIRMS_DATA } from '../../data/propFirmsData.ts';
import { PropFirm } from '../../types/schema.ts';

export interface AttributePageConfig {
  slug: string; // e.g. 'with-static-drawdown'
  filterKey: string;
  badge: string;
  h1: string;
  title: string;
  metaDescription: string;
  summary: string;
  whyItMatters: string;
  mathematicalDefinition: string;
  trapWarning: string;
  matcher: (firm: PropFirm) => boolean;
}

export const ATTRIBUTE_PAGES: AttributePageConfig[] = [
  {
    slug: 'with-static-drawdown',
    filterKey: 'static-drawdown',
    badge: 'Risk Parameter',
    h1: 'Prop Firms with Static Drawdown (2026)',
    title: 'Prop Firms with Static Drawdown — Full List & Rules (2026)',
    metaDescription: 'Find every verified prop trading firm offering static drawdown. Compare daily loss calculations, maximum loss floors, and account sizing with official citations.',
    summary: 'Static drawdown is the gold standard for prop traders: the maximum loss floor remains permanently fixed below your starting balance and NEVER ratchets upward as you make profits.',
    whyItMatters: 'Unlike trailing drawdown, which chases your highest open equity and shrinks your loss cushion on pullbacks, static drawdown guarantees that every dollar of profit made expands your safety buffer.',
    mathematicalDefinition: 'Loss Floor = Starting Account Balance - (Starting Balance * Max Loss %). If your $100k account grows to $110k with a 10% static drawdown ($10k allowance), your floor stays at $90,000 permanently.',
    trapWarning: 'Ensure the daily loss limit is also balance-based! A firm can advertise "static maximum drawdown" while enforcing an equity-based trailing daily loss limit that still breaches you on intraday dips.',
    matcher: (firm: PropFirm) => {
      return firm.programs.some(p => p.accounts.some(a => a.drawdownType === 'static'));
    },
  },
  {
    slug: 'with-trailing-drawdown',
    filterKey: 'trailing-drawdown',
    badge: 'Risk Parameter',
    h1: 'Prop Firms with Trailing Drawdown Explained',
    title: 'Prop Firms with Trailing Drawdown — Mechanics & Comparison (2026)',
    metaDescription: 'Discover which prop firms use trailing drawdown. Learn the difference between End-of-Day (EOD) and intraday peak equity trailing locks before risking evaluation fees.',
    summary: 'Trailing drawdown moves upward as your account balance or floating equity increases. Once the loss floor reaches your initial starting balance, certain firms lock it in, while others trail indefinitely.',
    whyItMatters: 'Trailing drawdown is common in futures prop firms and 1-step challenges because it allows firms to offer cheaper evaluations while increasing the mathematical probability of a breach during deep market retracements.',
    mathematicalDefinition: 'Trailing Floor = Peak Reached Equity - Max Loss Allowance. On a $100k account with a 6% trailing drawdown ($6k loss floor at $94k), reaching $104k moves your breach floor up to $98k.',
    trapWarning: 'Beware of intraday equity trailing vs End-of-Day (EOD) trailing! Intraday trailing ratchets up on open unrealized ticks, penalizing you even if you hold through normal pullback before closing in profit.',
    matcher: (firm: PropFirm) => {
      return firm.programs.some(p => p.accounts.some(a => 
        a.drawdownType === 'trailing_balance' || 
        a.drawdownType === 'trailing_equity' || 
        a.drawdownType === 'trailing_locked' ||
        a.drawdownType === 'intraday_equity' ||
        a.drawdownType === 'eod'
      ));
    },
  },
  {
    slug: 'with-no-consistency-rule',
    filterKey: 'no-consistency-rule',
    badge: 'Payout Terms',
    h1: 'Prop Firms with No Consistency Rule (2026)',
    title: 'Prop Firms with No Consistency Rule — Unrestricted Payouts',
    metaDescription: 'List of prop trading firms with no consistency rules. Trade freely without single-day profit caps, lot-size restrictions, or delayed payout reviews.',
    summary: 'A consistency rule restricts how much profit can be generated in a single trading day (e.g. no more than 20%-40% of total target). Firms with NO consistency rule allow you to pass or get paid regardless of how concentrated your winning trades are.',
    whyItMatters: 'Consistency rules force traders who hit a large winning setup to spend multiple extra days taking artificial micro-lots just to dilute their best day percentage to qualify for payouts.',
    mathematicalDefinition: 'No consistency constraint: Max Single Day Profit % = 100%. Payout eligibility is determined solely by meeting the net profit requirement without ratio ceilings.',
    trapWarning: 'Even firms without formal consistency rules may enforce "gambling/margin" clauses (e.g. 80% margin utilization rules) that penalize single high-conviction full-margin trades.',
    matcher: (firm: PropFirm) => {
      return firm.programs.some(p => p.accounts.some(a => 
        !a.consistencyRule || 
        a.consistencyRule.toLowerCase().includes('no consistency') ||
        a.consistencyRule.toLowerCase().includes('none')
      ));
    },
  },
  {
    slug: 'with-no-daily-loss',
    filterKey: 'no-daily-loss',
    badge: 'Risk Parameter',
    h1: 'Prop Firms with No Daily Drawdown Limit',
    title: 'Prop Firms with No Daily Loss Limit — Maximum Trading Freedom',
    metaDescription: 'Compare prop firms with no daily loss limit. Trade high-volatility events and multi-day swings without fear of midnight equity reset breaches.',
    summary: 'Accounts without daily loss limits only enforce an overall maximum account drawdown. You cannot be breached simply because you experienced an adverse intraday fluctuation, provided your total loss floor holds.',
    whyItMatters: 'Daily loss limits (usually 4%-5%) are the #1 cause of account failure due to spread widening during rollover (21:00-22:00 UTC) or rapid news spikes. Eliminating daily limits removes this failure point.',
    mathematicalDefinition: 'Daily Loss Limit = N/A or 0%. The only constraint is Total Max Drawdown (e.g. 8%-12% from initial balance).',
    trapWarning: 'Firms offering "No Daily Loss" models (such as The 5%ers Bootcamp or specialized 1-step accounts) typically have a smaller overall maximum drawdown (e.g. 5%-6%) or lower leverage.',
    matcher: (firm: PropFirm) => {
      return firm.programs.some(p => p.accounts.some(a => a.dailyLossLimit === 0 || a.dailyLossCalculation === 'none'));
    },
  },
  {
    slug: 'with-news-trading',
    filterKey: 'news-trading',
    badge: 'Execution Rule',
    h1: 'Prop Firms Allowing News Trading Without Buffers',
    title: 'Prop Firms Allowing News Trading (2026) — Verified Rules',
    metaDescription: 'Find prop trading firms that allow holding and executing trades during high-impact news events (NFP, CPI, FOMC) with verified terms citations.',
    summary: 'News trading prop firms permit opening, closing, and executing pending orders directly across macroeconomic announcements (CPI, NFP, interest rate releases) without mandatory 2-minute buffer bans.',
    whyItMatters: 'Many prop firms claim "News Trading Allowed" on their marketing page, only to reveal in their support FAQ that executing orders within ±2 minutes of red-folder releases invalidates profits on funded accounts.',
    mathematicalDefinition: 'Execution window restriction = 0 seconds. Trades executed at 08:30:00 EST during US CPI are fully legitimate and eligible for profit share.',
    trapWarning: 'Holding existing swing positions through news is almost universally allowed. The critical trap is *executing new market orders or filling pending stop/limit orders* during the release.',
    matcher: (firm: PropFirm) => {
      return firm.programs.some(p => p.accounts.some(a => a.newsTradingRule === 'Allowed'));
    },
  },
  {
    slug: 'with-weekend-holding',
    filterKey: 'weekend-holding',
    badge: 'Trading Style',
    h1: 'Prop Firms Allowing Weekend Holding for Swing Traders',
    title: 'Prop Firms with Weekend Holding Allowed — Swing Trading Directory',
    metaDescription: 'Complete list of proprietary trading firms that permit holding open positions over the weekend without auto-liquidation or account disqualification.',
    summary: 'Weekend holding allows traders to keep positions active past Friday market close (17:00 EST) into Sunday open, essential for multi-day swing traders and macro trend followers.',
    whyItMatters: 'Firms that prohibit weekend holding will forcibly liquidate your positions at market close on Friday (often widening spreads and causing unnecessary losses) or terminate your account.',
    mathematicalDefinition: 'Weekend Auto-Close = DISABLED. Margin requirements may increase on crypto or commodity pairs held across market breaks.',
    trapWarning: 'Watch out for Sunday market open gap risk: if an unexpected geopolitical event causes the market to gap past your stop-loss, your equity can breach the maximum drawdown before your order fills.',
    matcher: (firm: PropFirm) => {
      return firm.programs.some(p => p.accounts.some(a => a.weekendHolding === true));
    },
  },
  {
    slug: 'with-ea-trading',
    filterKey: 'ea-trading',
    badge: 'Platform Rule',
    h1: 'Prop Firms Allowing Expert Advisors (EAs) & Algorithmic Trading',
    title: 'Prop Firms Allowing EAs & Automated Bots (2026 Guide)',
    metaDescription: 'Audited list of prop firms permitting Expert Advisors (EAs), algorithmic trading bots, and VPS hosting. Learn prohibited algorithm practices before buying.',
    summary: 'EA-friendly prop firms permit automated algorithmic trading, MetaTrader expert advisors, and VPS hosting, provided the algorithm does not use predatory strategies like latency arbitrage.',
    whyItMatters: 'Algorithmic traders need verified assurance that their bot\'s execution logic will not be retroactively vetoed under vague "commercial EA" or "toxic flow" rules during payout review.',
    mathematicalDefinition: 'Automated trade execution = AUTHORIZED. Trade frequency must remain within server load limits (e.g. under 200 orders per minute to avoid hyperactivity bans).',
    trapWarning: 'Commercial off-the-shelf EAs used by hundreds of traders will get flagged for "IP / trade clustering" or "account duplication" if multiple traders execute identical ticks simultaneously.',
    matcher: (firm: PropFirm) => {
      return firm.programs.some(p => p.accounts.some(a => a.eaAllowed === true));
    },
  },
  {
    slug: 'with-1-percent-floating-loss',
    filterKey: '1-percent-floating-loss',
    badge: 'Buried Trap Warning',
    h1: 'Prop Firms with 1% Floating Loss Rule & Micro-Loss Tripwires',
    title: 'Prop Firms with 1% Floating Loss Rules — Exposed & Explained',
    metaDescription: 'Forensic investigation into the 1% floating loss rule and micro-risk tripwires in prop firms. Which accounts enforce it, how it triggers, and how to avoid breach.',
    summary: 'The 1% floating loss rule is a buried compliance condition enforced on select instant funding and micro-evaluation tiers where having any single position floating at a 1% loss relative to starting capital results in instant breach.',
    whyItMatters: 'Traders often buy an account expecting a standard 4% daily or 8% maximum loss limit, only to fail within minutes because a single position experienced a normal 1.05% pullback.',
    mathematicalDefinition: 'Single Position Floating Loss Floor = Starting Nominal Capital * 1.00%. On a $5,000 account, if any open trade reaches -$50.00 floating equity, the account is terminated.',
    trapWarning: 'Check support FAQs for "Instant Funding Micro Caps" or "Single Trade Maximum Drawdown". Marketing headers almost never advertise this rule.',
    matcher: (firm: PropFirm) => {
      return firm.rules.some(r => 
        r.slug.includes('micro-loss') || 
        r.slug.includes('1-percent') || 
        r.name.toLowerCase().includes('1% floating') ||
        r.name.toLowerCase().includes('micro')
      ) || firm.slug === 'goat-funded-trader';
    },
  },
];
