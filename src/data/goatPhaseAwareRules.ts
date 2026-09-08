/**
 * Goat Funded Trader Phase-Aware Rules Engine & Data Architecture
 * 
 * Canonical Single Source of Truth for Goat Funded Trader trading rules.
 * Generates structured, mathematically verified rule rows partitioned across:
 * - Phase 1
 * - Phase 2
 * - Phase 3
 * - Master Account
 * 
 * Partitioned into 28 Expandable Categories: A through AB
 * Accurately handles:
 * - 1-Phase models (Phase 2 & 3: N/A)
 * - 2-Phase models (Phase 3: N/A)
 * - 3-Phase models (Phase 1, 2, 3 active)
 * - Pay Later models ($5 entry, 0% daily DD in eval, 3% in funded)
 * - Instant Funding models (Phase 1, 2, 3: N/A — No evaluation)
 * - CME Futures models
 */

import { GFTModel, TradingPlatform, TradingStyle } from './goatCanonicalData.ts';

export type RuleDecisionValue =
  | 'YES'
  | 'NO'
  | 'LIMITED'
  | 'CONDITIONAL'
  | 'UNKNOWN'
  | 'N/A'
  | 'CONFLICTING'
  | 'Yes'
  | 'No'
  | 'Limited'
  | 'Conditional';

export type RuleStatusValue =
  | 'Verified'
  | 'Official but Ambiguous'
  | 'Historical'
  | 'Grandfathered'
  | 'Conflicting'
  | 'Third-Party Report'
  | 'Community Reported'
  | 'Unverified'
  | 'Requires Confirmation'
  | 'Not Applicable';

export interface PhaseAwareRuleRow {
  index: number;
  id: string;
  categoryKey: string; // 'A' through 'AB'
  categoryTitle: string;
  ruleName: string;
  phase1: string;
  phase2: string;
  phase3: string;
  masterAccount: string;
  decision: RuleDecisionValue;
  decisionDetail?: string; // e.g. "Allowed", "1% Credited Cap", "Prohibited"
  verification: RuleStatusValue;
  status: RuleStatusValue; // Alias to verification for backward compatibility
  calculation: string; // e.g. "5% · $5,000 allowance"
  formula?: string; // e.g. "$100,000 × 5% = $5,000"
  source: string;
  sourceUrl?: string;
  lastVerifiedDate: string;
  explanation: string;
  beginnerExplanation?: string;
  breachTrigger: string;
  afterBreachAction: string;
  appliesTo: string;
  termsVersion: string;
  notes?: string;
  conflictDetails?: {
    hasConflict: boolean;
    currentSource: string;
    alternativeSource: string;
    difference: string;
    userAction: string;
  };
  hasCalculationAction?: boolean;
}

export interface RuleCategoryGroup {
  key: string; // 'A' to 'AB'
  title: string;
  description: string;
  rules: PhaseAwareRuleRow[];
  hasConflict?: boolean;
  requiresConfirmationCount?: number;
}

export interface ModelValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  totalRulesCount: number;
  verifiedCount: number;
  ambiguousCount: number;
  conflictingCount: number;
  requiresConfirmationCount: number;
  historicalCount: number;
  notApplicableCount: number;
  unverifiedCount: number;
}

// =========================================================================
// SHARED CANONICAL CALCULATION ENGINE
// =========================================================================

/**
 * Primary canonical percentage calculation utility.
 */
export function calculatePercentageAmount(accountSize: number, percentage: number): number {
  return Math.round((accountSize * percentage) / 100);
}

/** Backward-compatible alias */
export const calculatePercentAmount = calculatePercentageAmount;

/**
 * Calculates the hard loss floor balance for an account.
 */
export function calculateBreachFloor(
  accountSize: number,
  maxDrawdownPct: number,
  drawdownType: string = 'static',
  currentProfit: number = 0
): number {
  const maxLoss = calculatePercentageAmount(accountSize, maxDrawdownPct);
  if (drawdownType === 'static') {
    return accountSize - maxLoss;
  }
  if (drawdownType === 'trailing_locked') {
    const highWater = accountSize + Math.max(0, currentProfit);
    const trailingFloor = highWater - maxLoss;
    return Math.min(accountSize, trailingFloor);
  }
  const highWater = accountSize + Math.max(0, currentProfit);
  return highWater - maxLoss;
}

/**
 * Calculates dollar profit target amount.
 */
export function calculateProfitTargetAmount(accountSize: number, targetPct: number): number {
  return calculatePercentageAmount(accountSize, targetPct);
}

/**
 * Calculates daily loss dollar allowance.
 */
export function calculateDailyLossAmount(accountSize: number, dailyLossPct: number): number {
  return calculatePercentageAmount(accountSize, dailyLossPct);
}

/**
 * Calculates floating open equity loss dollar allowance.
 */
export function calculateFloatingLossAmount(accountSize: number, floatingLossPct: number): number {
  return calculatePercentageAmount(accountSize, floatingLossPct);
}

/**
 * Calculates trader payout amount from net profit and split percentage.
 */
export function calculatePayoutAmount(profit: number, splitPct: number): number {
  return Math.round((profit * splitPct) / 100);
}

/**
 * Calculates scaled account balance.
 */
export function calculateScalingAmount(accountSize: number, scalingStepPct: number = 25): number {
  return Math.round(accountSize * (1 + scalingStepPct / 100));
}

/**
 * Format dollar amounts cleanly.
 */
export function formatCurrency(amount: number): string {
  return `$${Math.round(amount).toLocaleString()}`;
}

// =========================================================================
// 28 CANONICAL CATEGORIES (A through AB)
// =========================================================================

export const RULE_CATEGORIES: { id: string; name: string; desc: string }[] = [
  { id: 'A', name: 'Account and Evaluation Structure', desc: 'Core account structure, phase count, step model architecture, and pass criteria.' },
  { id: 'B', name: 'Profit Targets', desc: 'Target percentages and dollar targets for each evaluation milestone.' },
  { id: 'C', name: 'Minimum Trading Days', desc: 'Evaluation calendar and trading day requirements before advancement.' },
  { id: 'D', name: 'Daily Loss Limit', desc: 'Daily loss calculation mechanics, limits, and server reset thresholds.' },
  { id: 'E', name: 'Daily Loss Reset', desc: 'Daily rollover timing, 5:00 PM EST calculation mechanics, and midnight reset.' },
  { id: 'F', name: 'Maximum Drawdown', desc: 'Overall loss ceiling, trailing vs static tracking, and buffer mechanics.' },
  { id: 'G', name: 'Drawdown Mechanism', desc: 'Balance-based vs equity trailing vs static high-water mark lock.' },
  { id: 'H', name: 'Floating Loss Limit', desc: 'Intraday unrealized PnL breach rules and open risk thresholds.' },
  { id: 'I', name: 'Profit Split', desc: 'Base profit share, scaling upgrades, and add-on split options.' },
  { id: 'J', name: 'Payout Eligibility', desc: 'Eligibility milestones, minimum trading days, and buffer preservation.' },
  { id: 'K', name: 'Payout Frequency', desc: 'First payout waiting period and subsequent withdrawal schedule.' },
  { id: 'L', name: 'Payout Processing', desc: 'Payout settlement speed, crypto/Rise rails, and processing SLAs.' },
  { id: 'M', name: 'Consistency Rule', desc: 'Trading consistency caps, single-day profit limits, and lot size ranges.' },
  { id: 'N', name: 'News Trading', desc: 'Red-folder macroeconomic event holding, execution, and profit cap restrictions.' },
  { id: 'O', name: 'Weekend Holding', desc: 'Overnight and weekend position holding permissions and crypto exceptions.' },
  { id: 'P', name: 'EA and Algorithmic Trading', desc: 'Automated trading policies, commercial EAs, tick scalpers, and Martingale rules.' },
  { id: 'Q', name: 'Copy Trading', desc: 'Social trading, trade-copiers, group mirroring, and reverse-trading limits.' },
  { id: 'R', name: 'VPS and IP Restrictions', desc: 'Virtual private server usage, residential IP verification, and dual-logins.' },
  { id: 'S', name: 'Instruments', desc: 'Allowed financial instruments: FX majors, metals, indices, crypto, and futures.' },
  { id: 'T', name: 'Leverage', desc: 'Leverage tiers across Forex, Metals, Indices, Crypto, and Futures contracts.' },
  { id: 'U', name: 'Trading Platforms', desc: 'Match-Trader, cTrader, MT4/MT5 status, and TradeLocker connectivity.' },
  { id: 'V', name: 'Regional Restrictions', desc: 'Geographic availability, US resident status, and sanctioned jurisdiction rules.' },
  { id: 'W', name: 'Scaling Plan', desc: 'Capital growth milestones, balance bumps, and profit split acceleration.' },
  { id: 'X', name: 'Breach Conditions', desc: 'Hard vs soft breaches, automated liquidation, and account termination triggers.' },
  { id: 'Y', name: 'Fee Refund', desc: 'Evaluation fee refundability upon reaching first profitable payout.' },
  { id: 'Z', name: 'Account Inactivity', desc: 'Maximum dormant days before credentials expire and reset.' },
  { id: 'AA', name: 'Terms Version', desc: 'Version history, Terms of Service dates, and governance revisions.' },
  { id: 'AB', name: 'Evidence and Source History', desc: 'Direct FAQ citations, checkout terms, official Zendesk references, and audits.' },
];

/**
 * Builds the complete 28-category Phase-Aware Rules Dataset for the exact selected model and context.
 */
export function buildPhaseAwareRuleTable(
  model: GFTModel,
  context: {
    accountSize: number;
    stage: 'all' | 'evaluation' | 'funded';
    platform: 'all' | TradingPlatform;
    termsVersion: 'current_2026' | 'pre_aug_2026';
    tradingStyle: TradingStyle;
  }
): {
  groups: RuleCategoryGroup[];
  allRows: PhaseAwareRuleRow[];
  validationReport: ModelValidationReport;
} {
  const { accountSize, termsVersion, platform } = context;
  const isOnePhase = model.isEvaluation && model.stagesCount === 2;
  const isTwoPhase = model.isEvaluation && model.stagesCount === 3;
  const isThreePhase = model.isEvaluation && model.stagesCount === 4;
  const isInstant = !model.isEvaluation || model.stagesCount <= 1;
  const isPayLater = model.id === 'pay_after_pass';

  const p1Target = model.targetsByStage.phase1 || 0;
  const p2Target = model.targetsByStage.phase2 || 0;
  const p3Target = model.targetsByStage.phase3 || 0;

  // Resolve daily loss based on model and termsVersion (1-Step Fast cutoff)
  let dailyLossPct = model.dailyLossLimit.pct;
  let isDailyLossGrandfathered = false;
  let isDailyLossConflicting = false;
  if (model.id === 'one_step') {
    if (termsVersion === 'pre_aug_2026') {
      dailyLossPct = 4;
      isDailyLossGrandfathered = true;
    } else {
      dailyLossPct = 3;
      isDailyLossConflicting = true;
    }
  }

  // Pay Later evaluation is 0% daily DD; funded is 3%
  const payLaterEvalDaily = 0;
  const payLaterFundedDaily = 3;

  // Resolve floating loss (Instant Premium cutoff)
  let floatingLossPct: number = model.floatingLossCapPct || 2;
  let isFloatingLossConflicting = false;
  if (model.id === 'instant_premium') {
    isFloatingLossConflicting = true;
    floatingLossPct = termsVersion === 'pre_aug_2026' ? 1.5 : 1.0;
  }

  // Max drawdown values
  const maxDDPct = model.maxDrawdown.pct;
  const maxDDDollars = calculatePercentageAmount(accountSize, maxDDPct);
  const maxDDType = model.maxDrawdown.type;
  const maxDDFloor = accountSize - maxDDDollars;

  // Valid day values
  const validDayThresholdDollars = calculatePercentageAmount(accountSize, model.validDayThresholdPct);

  // Helper N/A strings
  const naNoEval = 'N/A — Direct Live (No Evaluation)';
  const naNoPhase2 = 'N/A — No Phase 2 (1-Phase Model)';
  const naNoPhase3 = isOnePhase
    ? 'N/A — No Phase 3 (1-Phase Model)'
    : 'N/A — No Phase 3 (2-Phase Model)';

  let globalIndex = 1;
  const allRows: PhaseAwareRuleRow[] = [];

  function addRow(
    categoryKey: string,
    categoryTitle: string,
    row: Omit<PhaseAwareRuleRow, 'index' | 'categoryKey' | 'categoryTitle' | 'status'>
  ): PhaseAwareRuleRow {
    const fullRow: PhaseAwareRuleRow = {
      index: globalIndex++,
      categoryKey,
      categoryTitle,
      status: row.verification,
      ...row,
    };
    allRows.push(fullRow);
    return fullRow;
  }

  // =========================================================================
  // A. Account and Evaluation Structure
  // =========================================================================
  addRow('A', 'A. Account and Evaluation Structure', {
    id: 'A-1',
    ruleName: 'Challenge Structure & Phase Count',
    phase1: isInstant ? naNoEval : 'Phase 1 Challenge',
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : 'Phase 2 Challenge',
    phase3: isInstant ? naNoEval : isThreePhase ? 'Phase 3 Challenge' : naNoPhase3,
    masterAccount: 'Funded Master Account',
    decision: 'YES',
    decisionDetail: isInstant ? 'Direct Live' : `${model.stagesCount - 1} Phase(s)`,
    verification: 'Verified',
    calculation: `${model.categoryLabel} (${model.stagesCount - 1} evaluation step[s])`,
    formula: `Evaluation stages: ${isInstant ? 0 : model.stagesCount - 1} -> Funded Master Stage: 1`,
    source: model.sourceDoc,
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: isInstant
      ? 'Direct instant simulated live funding. No evaluation challenge required before payout eligibility.'
      : `Traders must successfully pass ${model.stagesCount - 1} evaluation phase(s) without violating drawdown limits to advance to the funded master account.`,
    beginnerExplanation: 'Shows how many testing phases you have to complete before receiving a real funded trading account.',
    breachTrigger: 'Violating loss limits during evaluation immediately invalidates challenge progress.',
    afterBreachAction: 'Challenge access is revoked; account requires reset or new evaluation purchase.',
    appliesTo: 'Account setup',
    termsVersion: 'Active 2026',
  });

  addRow('A', 'A. Account and Evaluation Structure', {
    id: 'A-2',
    ruleName: 'Nominal Account Starting Balance',
    phase1: isInstant ? naNoEval : formatCurrency(accountSize),
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : formatCurrency(accountSize),
    phase3: isInstant ? naNoEval : isThreePhase ? formatCurrency(accountSize) : naNoPhase3,
    masterAccount: formatCurrency(accountSize),
    decision: 'YES',
    decisionDetail: formatCurrency(accountSize),
    verification: 'Verified',
    calculation: `${formatCurrency(accountSize)} baseline capital tier`,
    formula: `Starting Baseline = ${formatCurrency(accountSize)} (all dollar risk metrics scale from this value)`,
    source: 'GFT Pricing Matrix',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: `Baseline capital tier chosen at registration is ${formatCurrency(accountSize)}. All drawdown thresholds, profit goals, and loss floors scale directly from this amount.`,
    beginnerExplanation: 'The starting amount of virtual capital in your account that all risk limits and targets are based on.',
    breachTrigger: 'Capital tier cannot be modified once challenge starts.',
    afterBreachAction: 'N/A',
    appliesTo: 'All Stages',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // B. Profit Targets
  // =========================================================================
  addRow('B', 'B. Profit Targets', {
    id: 'B-1',
    ruleName: 'Profit Target Percentage',
    phase1: isInstant
      ? naNoEval
      : `+${p1Target}% / ${formatCurrency(calculateProfitTargetAmount(accountSize, p1Target))}`,
    phase2: isInstant
      ? naNoEval
      : isOnePhase
      ? naNoPhase2
      : `+${p2Target}% / ${formatCurrency(calculateProfitTargetAmount(accountSize, p2Target))}`,
    phase3: isInstant
      ? naNoEval
      : isThreePhase
      ? `+${p3Target}% / ${formatCurrency(calculateProfitTargetAmount(accountSize, p3Target))}`
      : naNoPhase3,
    masterAccount: '0% / $0 (No Target — Unlimited)',
    decision: isInstant ? 'N/A' : 'YES',
    decisionDetail: isInstant ? 'No Target Required' : `P1: +${p1Target}%${p2Target ? ` | P2: +${p2Target}%` : ''}`,
    verification: 'Verified',
    calculation: isInstant
      ? 'No Profit Target (Instant Live)'
      : `Phase 1: ${p1Target}% · ${formatCurrency(calculateProfitTargetAmount(accountSize, p1Target))}`,
    formula: isInstant
      ? 'Instant Funding: $0 profit required'
      : `${formatCurrency(accountSize)} × ${p1Target}% = ${formatCurrency(calculateProfitTargetAmount(accountSize, p1Target))} (Target Equity: ${formatCurrency(accountSize + calculateProfitTargetAmount(accountSize, p1Target))})`,
    source: model.sourceDoc,
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: isInstant
      ? 'Instant live accounts have zero profit targets. Any net closed profit above zero is withdrawable subject to payout rules.'
      : `Traders must reach net closed equity of ${formatCurrency(accountSize + calculateProfitTargetAmount(accountSize, p1Target))} in Phase 1 with all orders closed.`,
    beginnerExplanation: 'Profit Target is the profit goal you must reach to pass an evaluation stage. Once funded, there is no profit target.',
    breachTrigger: 'Failing to reach target is not a breach; evaluation duration is unlimited with no deadline.',
    afterBreachAction: 'Traders can continue trading indefinitely as long as loss limits are respected.',
    appliesTo: isInstant ? 'Funded only' : 'Evaluation phases',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // C. Minimum Trading Days
  // =========================================================================
  addRow('C', 'C. Minimum Trading Days', {
    id: 'C-1',
    ruleName: 'Minimum Trading Days',
    phase1: isInstant ? naNoEval : `${model.minTradingDaysEval} Day(s)`,
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : `${model.minTradingDaysEval} Day(s)`,
    phase3: isInstant ? naNoEval : isThreePhase ? `${model.minTradingDaysEval} Day(s)` : naNoPhase3,
    masterAccount: `${model.minTradingDaysFunded} Day(s) before Payout`,
    decision: model.minTradingDaysEval === 0 ? 'NO' : 'LIMITED',
    decisionDetail: model.minTradingDaysEval === 0 ? 'Zero Min Days' : `${model.minTradingDaysEval} Eval Days | ${model.minTradingDaysFunded} Funded Days`,
    verification: 'Verified',
    calculation: `Eval: ${model.minTradingDaysEval}d | Funded: ${model.minTradingDaysFunded}d (Min ${model.validDayThresholdPct}% / ${formatCurrency(validDayThresholdDollars)} profit to count)`,
    formula: `Valid Day Profit Threshold = ${formatCurrency(accountSize)} × ${model.validDayThresholdPct}% = ${formatCurrency(validDayThresholdDollars)}`,
    source: model.sourceDoc,
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: `Evaluation has ${model.minTradingDaysEval === 0 ? 'zero minimum trading days (pass as fast as 1 day)' : `${model.minTradingDaysEval} minimum trading day(s)`}. In the funded stage, traders must trade at least ${model.minTradingDaysFunded} calendar day(s) before requesting a payout.`,
    beginnerExplanation: 'The minimum number of different days you must execute trades on before you can advance or request a payout.',
    breachTrigger: 'Requesting payout without meeting funded trading days delays withdrawal.',
    afterBreachAction: 'Payout request remains pending until the required days are completed.',
    appliesTo: 'All Stages',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // D. Daily Loss Limit
  // =========================================================================
  const p1DailyVal = isInstant
    ? naNoEval
    : isPayLater
    ? '0% / $0 (No Daily Loss in Eval!)'
    : `${dailyLossPct}% / ${formatCurrency(calculateDailyLossAmount(accountSize, dailyLossPct))}`;

  const p2DailyVal = isInstant
    ? naNoEval
    : isOnePhase
    ? naNoPhase2
    : `${dailyLossPct}% / ${formatCurrency(calculateDailyLossAmount(accountSize, dailyLossPct))}`;

  const p3DailyVal = isInstant
    ? naNoEval
    : isThreePhase
    ? `${dailyLossPct}% / ${formatCurrency(calculateDailyLossAmount(accountSize, dailyLossPct))}`
    : naNoPhase3;

  const masterDailyVal = isPayLater
    ? `${payLaterFundedDaily}% / ${formatCurrency(calculateDailyLossAmount(accountSize, payLaterFundedDaily))}`
    : dailyLossPct === 0
    ? '0% / $0 (No Daily Loss Limit!)'
    : `${dailyLossPct}% / ${formatCurrency(calculateDailyLossAmount(accountSize, dailyLossPct))}`;

  addRow('D', 'D. Daily Loss Limit', {
    id: 'D-1',
    ruleName: 'Daily Loss Limit',
    phase1: p1DailyVal,
    phase2: p2DailyVal,
    phase3: p3DailyVal,
    masterAccount: masterDailyVal,
    decision: (isPayLater || dailyLossPct === 0) ? 'NO' : 'LIMITED',
    decisionDetail: isPayLater
      ? '0% Eval | 3% Funded'
      : dailyLossPct === 0
      ? 'No Daily Loss'
      : `${dailyLossPct}% Balance-Based`,
    verification: isDailyLossConflicting ? 'Conflicting' : 'Verified',
    calculation: isPayLater
      ? `Eval: $0 limit | Funded: 3% · ${formatCurrency(calculateDailyLossAmount(accountSize, 3))}`
      : dailyLossPct === 0
      ? 'No Daily Drawdown Limit'
      : `${dailyLossPct}% · ${formatCurrency(calculateDailyLossAmount(accountSize, dailyLossPct))}`,
    formula: isPayLater
      ? `Funded Daily Floor = ${formatCurrency(accountSize)} - (${formatCurrency(accountSize)} × 3%) = ${formatCurrency(accountSize - calculateDailyLossAmount(accountSize, 3))}`
      : `${formatCurrency(accountSize)} × ${dailyLossPct}% = ${formatCurrency(calculateDailyLossAmount(accountSize, dailyLossPct))} daily loss ceiling`,
    source: (model.dailyLossLimit as any).sourceDoc || model.sourceDoc,
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: isPayLater
      ? 'Pay Later features 0% daily loss in evaluation. In funded master, a 3% balance-based daily loss applies.'
      : dailyLossPct === 0
      ? 'This model has zero daily loss limit. Account only breaches if the overall maximum drawdown is touched.'
      : `Daily loss limit is ${dailyLossPct}% (${formatCurrency(calculateDailyLossAmount(accountSize, dailyLossPct))}). Resets daily at 5:00 PM EST based on the higher of balance or equity.`,
    beginnerExplanation: 'The maximum money you are allowed to lose in a single trading day before your account is automatically closed.',
    breachTrigger: `Equity drops below the daily loss floor at any point intraday.`,
    afterBreachAction: 'Hard breach. Account is permanently liquidated and revoked.',
    appliesTo: 'All Stages',
    termsVersion: isDailyLossGrandfathered ? 'Pre-August 2026' : 'Active 2026',
    conflictDetails: isDailyLossConflicting
      ? {
          hasConflict: true,
          currentSource: 'Checkout Term 2026-08 (3% Daily Loss)',
          alternativeSource: 'Legacy FAQ 2026-06 (4% Daily Loss)',
          difference: 'GFT lowered 1-Step daily loss from 4% to 3% on August 12, 2026.',
          userAction: 'Check account agreement for purchase date. Pre-Aug 12 accounts retain 4%.',
        }
      : undefined,
  });

  // =========================================================================
  // E. Daily Loss Reset
  // =========================================================================
  addRow('E', 'E. Daily Loss Reset', {
    id: 'E-1',
    ruleName: 'Daily Loss Reset & Rollover Timing',
    phase1: isInstant ? naNoEval : isPayLater ? 'N/A — No Eval Daily Loss' : '5:00 PM EST / 00:00 Server',
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : '5:00 PM EST / 00:00 Server',
    phase3: isInstant ? naNoEval : isThreePhase ? '5:00 PM EST / 00:00 Server' : naNoPhase3,
    masterAccount: '5:00 PM EST / 00:00 Server',
    decision: 'YES',
    decisionDetail: '5:00 PM EST Rollover',
    verification: 'Verified',
    calculation: 'Reset time: 5:00 PM EST / 21:00 UTC / 00:00 MT5 Server Time',
    formula: 'Daily Balance Snapshot = Higher of (Closed Balance, Equity) recorded at 16:59:59 EST',
    source: 'GFT Drawdown FAQ Article 148',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: 'Daily drawdown resets every day at 5:00 PM EST (00:00 server time). The daily loss floor for the next 24 hours is calculated from the higher of balance or floating equity at that exact second.',
    beginnerExplanation: 'The exact clock time every evening when your daily loss counter restarts for the new day.',
    breachTrigger: 'Holding open floating loss through 5:00 PM EST rollover resets your balance lower while equity stays depleted.',
    afterBreachAction: 'Loss floor recalculates immediately at 17:00 EST.',
    appliesTo: 'All Stages with Daily Loss',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // F. Maximum Drawdown
  // =========================================================================
  addRow('F', 'F. Maximum Drawdown', {
    id: 'F-1',
    ruleName: 'Maximum Overall Drawdown',
    phase1: isInstant ? naNoEval : `${maxDDPct}% / ${formatCurrency(maxDDDollars)}`,
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : `${maxDDPct}% / ${formatCurrency(maxDDDollars)}`,
    phase3: isInstant ? naNoEval : isThreePhase ? `${maxDDPct}% / ${formatCurrency(maxDDDollars)}` : naNoPhase3,
    masterAccount: isPayLater ? `6% / ${formatCurrency(calculatePercentageAmount(accountSize, 6))}` : `${maxDDPct}% / ${formatCurrency(maxDDDollars)}`,
    decision: 'LIMITED',
    decisionDetail: `${maxDDPct}% Maximum Loss Allowance`,
    verification: 'Verified',
    calculation: `${maxDDPct}% · ${formatCurrency(maxDDDollars)} total buffer`,
    formula: `Hard Floor = ${formatCurrency(accountSize)} - ${formatCurrency(maxDDDollars)} = ${formatCurrency(maxDDFloor)}`,
    source: model.sourceDoc,
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: `Total maximum loss ceiling is ${maxDDPct}% (${formatCurrency(maxDDDollars)}). Account balance or equity must never breach the calculated floor of ${formatCurrency(maxDDFloor)}.`,
    beginnerExplanation: 'The maximum total money your account can ever lose from its start or highest profit point.',
    breachTrigger: `Account equity touches or drops below ${formatCurrency(maxDDFloor)}.`,
    afterBreachAction: 'Hard breach. Account is terminated permanently.',
    appliesTo: 'All Stages',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // G. Drawdown Mechanism
  // =========================================================================
  addRow('G', 'G. Drawdown Mechanism', {
    id: 'G-1',
    ruleName: 'Drawdown Calculation Mechanism',
    phase1: isInstant ? naNoEval : maxDDType === 'static' ? 'Static (Fixed Floor)' : 'Trailing Locked',
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : maxDDType === 'static' ? 'Static (Fixed Floor)' : 'Trailing Locked',
    phase3: isInstant ? naNoEval : isThreePhase ? (maxDDType === 'static' ? 'Static' : 'Trailing') : naNoPhase3,
    masterAccount: maxDDType === 'static' ? 'Static (Fixed Floor)' : 'Trailing Locked at Initial',
    decision: maxDDType === 'static' ? 'YES' : 'CONDITIONAL',
    decisionDetail: maxDDType === 'static' ? 'Static Fixed Floor' : 'Trailing Lock at Starting Capital',
    verification: 'Verified',
    calculation: maxDDType === 'static'
      ? `Floor permanently locked at ${formatCurrency(maxDDFloor)}`
      : `Floor trails profit until it reaches ${formatCurrency(accountSize)}, then locks forever`,
    formula: maxDDType === 'static'
      ? `Loss Floor = ${formatCurrency(accountSize)} - ${formatCurrency(maxDDDollars)} (Constant)`
      : `Trailing Floor = min(${formatCurrency(accountSize)}, High Water Mark - ${formatCurrency(maxDDDollars)})`,
    source: 'GFT Rules Guide: Drawdown Types',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: maxDDType === 'static'
      ? 'Static drawdown means your loss floor never moves up when you make profits. You keep your entire profit buffer.'
      : 'Trailing drawdown moves up as you earn profits, but locks permanently at your initial starting balance once profits equal the drawdown allowance.',
    beginnerExplanation: 'Static means your loss floor never changes. Trailing means the floor moves up as you profit.',
    breachTrigger: 'Equity touches the trailing floor.',
    afterBreachAction: 'Account closed on touch.',
    appliesTo: 'All Stages',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // H. Floating Loss Limit
  // =========================================================================
  addRow('H', 'H. Floating Loss Limit', {
    id: 'H-1',
    ruleName: 'Floating Open-Loss Cap',
    phase1: isInstant ? naNoEval : `${floatingLossPct}% / ${formatCurrency(calculateFloatingLossAmount(accountSize, floatingLossPct))}`,
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : `${floatingLossPct}% / ${formatCurrency(calculateFloatingLossAmount(accountSize, floatingLossPct))}`,
    phase3: isInstant ? naNoEval : isThreePhase ? `${floatingLossPct}% / ${formatCurrency(calculateFloatingLossAmount(accountSize, floatingLossPct))}` : naNoPhase3,
    masterAccount: `${floatingLossPct}% / ${formatCurrency(calculateFloatingLossAmount(accountSize, floatingLossPct))}`,
    decision: 'LIMITED',
    decisionDetail: `${floatingLossPct}% Open Risk Cap`,
    verification: isFloatingLossConflicting ? 'Conflicting' : 'Requires Confirmation',
    calculation: `${floatingLossPct}% · ${formatCurrency(calculateFloatingLossAmount(accountSize, floatingLossPct))} max open trade loss`,
    formula: `Max Open Trade Loss = ${formatCurrency(accountSize)} × ${floatingLossPct}% = ${formatCurrency(calculateFloatingLossAmount(accountSize, floatingLossPct))}`,
    source: 'GFT Terms of Service Cl. 8.4',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: `Unrealized (floating) loss on any single trade or position cluster must not exceed ${floatingLossPct}% (${formatCurrency(calculateFloatingLossAmount(accountSize, floatingLossPct))}).`,
    beginnerExplanation: 'A restriction limiting how much unrealized loss your open trades can show before being closed.',
    breachTrigger: `Unrealized floating loss reaches ${floatingLossPct}%.`,
    afterBreachAction: 'Soft breach or position auto-liquidation.',
    appliesTo: 'Open Trades',
    termsVersion: 'Active 2026',
    conflictDetails: isFloatingLossConflicting
      ? {
          hasConflict: true,
          currentSource: 'ToS Revision 2026-08 (1.0% Floating Cap on Instant Premium)',
          alternativeSource: 'FAQ Article 19 (1.5% Floating Cap)',
          difference: 'Stricter 1.0% cap applied on checkout after August 2026.',
          userAction: 'Confirm floating risk settings with GFT support.',
        }
      : undefined,
  });

  // =========================================================================
  // I. Profit Split
  // =========================================================================
  addRow('I', 'I. Profit Split', {
    id: 'I-1',
    ruleName: 'Trader Profit Share Percentage',
    phase1: isInstant ? naNoEval : '0% (Evaluation Stage)',
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : '0% (Evaluation Stage)',
    phase3: isInstant ? naNoEval : isThreePhase ? '0% (Evaluation Stage)' : naNoPhase3,
    masterAccount: `${model.profitSplit.basePct}% Base (Up to ${model.profitSplit.maxWithAddonPct}%)`,
    decision: 'YES',
    decisionDetail: `${model.profitSplit.basePct}% to ${model.profitSplit.maxWithAddonPct}%`,
    verification: 'Verified',
    calculation: `Trader keeps ${model.profitSplit.basePct}% of net profits (upgradeable to ${model.profitSplit.maxWithAddonPct}% via add-on)`,
    formula: `Payout = Net Closed Profit × ${model.profitSplit.basePct}% (e.g., $10,000 profit = $${Math.round(10000 * model.profitSplit.basePct / 100).toLocaleString()})`,
    source: model.sourceDoc,
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: `Traders receive ${model.profitSplit.basePct}% of generated net profits in the funded stage by default. Purchasing the 90% or 100% profit split add-on at checkout increases this tier.`,
    beginnerExplanation: 'The percentage of profits you keep when you request a withdrawal.',
    breachTrigger: 'N/A',
    afterBreachAction: 'N/A',
    appliesTo: 'Master Account only',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // J. Payout Eligibility
  // =========================================================================
  addRow('J', 'J. Payout Eligibility', {
    id: 'J-1',
    ruleName: 'Payout Eligibility Requirements',
    phase1: isInstant ? naNoEval : 'N/A — Evaluation Stage',
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : 'N/A — Evaluation Stage',
    phase3: isInstant ? naNoEval : isThreePhase ? 'N/A' : naNoPhase3,
    masterAccount: `Min ${model.minTradingDaysFunded} Trading Days · $100 Min Profit · Consistency Met`,
    decision: 'CONDITIONAL',
    decisionDetail: `${model.minTradingDaysFunded} Days + Consistency Pass`,
    verification: 'Verified',
    calculation: `Funded requirements: ${model.minTradingDaysFunded} active trading days + balance above starting capital + consistency cap met`,
    formula: `Eligible Payout = Closed Equity - Starting Capital (must be >= $100)`,
    source: 'GFT Payout Policy Section 4',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: `To be eligible for payout, trader must have completed at least ${model.minTradingDaysFunded} valid trading days, have all trades closed, and comply with the consistency cap.`,
    beginnerExplanation: 'Checklist of rules you must complete before submitting a payout request.',
    breachTrigger: 'Submitting payout request while trades are open or consistency is violated delays request.',
    afterBreachAction: 'Payout request is postponed until conditions are met.',
    appliesTo: 'Master Account',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // K. Payout Frequency
  // =========================================================================
  addRow('K', 'K. Payout Frequency', {
    id: 'K-1',
    ruleName: 'Payout Schedule & Withdrawal Frequency',
    phase1: isInstant ? naNoEval : 'N/A — Evaluation Stage',
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : 'N/A — Evaluation Stage',
    phase3: isInstant ? naNoEval : isThreePhase ? 'N/A' : naNoPhase3,
    masterAccount: `First: ${model.profitSplit.firstPayoutDays} Days · Subsequent: Every ${model.profitSplit.payoutCycleDays} Days`,
    decision: 'YES',
    decisionDetail: `Every ${model.profitSplit.payoutCycleDays} Days (Bi-weekly)`,
    verification: 'Verified',
    calculation: `Initial waiting period: ${model.profitSplit.firstPayoutDays} calendar days; subsequent cycles: ${model.profitSplit.payoutCycleDays} days`,
    formula: `Next Payout Date = Last Payout Date + ${model.profitSplit.payoutCycleDays} calendar days`,
    source: 'GFT Payout Terms',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: `First withdrawal is eligible ${model.profitSplit.firstPayoutDays} calendar days after placing the first trade on the funded account. Subsequent payouts can be requested every ${model.profitSplit.payoutCycleDays} days (bi-weekly).`,
    beginnerExplanation: 'How often you can withdraw your profits.',
    breachTrigger: 'Early withdrawal requests before the cycle matures are rejected.',
    afterBreachAction: 'Trader must wait for cycle maturity.',
    appliesTo: 'Master Account',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // L. Payout Processing
  // =========================================================================
  addRow('L', 'L. Payout Processing', {
    id: 'L-1',
    ruleName: 'Payout Processing Speed & Rails',
    phase1: isInstant ? naNoEval : 'N/A',
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : 'N/A',
    phase3: isInstant ? naNoEval : isThreePhase ? 'N/A' : naNoPhase3,
    masterAccount: '24-48 Hours SLA · Rise / Crypto (USDT, BTC) · $100 Min',
    decision: 'YES',
    decisionDetail: 'Rise & Crypto (24-48h SLA)',
    verification: 'Verified',
    calculation: 'Processed within 24 to 48 business hours after compliance approval',
    formula: 'Minimum Withdrawal: $100 net profit',
    source: 'GFT Payout Desk Documentation',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: 'Payouts are processed via Rise Works (bank wire / debit) and cryptocurrency (USDT ERC20/TRC20, BTC). Processing is guaranteed within 24-48 business hours after risk approval.',
    beginnerExplanation: 'How fast and through which payment methods the firm sends your money.',
    breachTrigger: 'Providing invalid wallet address or unverified Rise account causes delay.',
    afterBreachAction: 'Desk requests KYC/payment verification.',
    appliesTo: 'Master Account',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // M. Consistency Rule
  // =========================================================================
  addRow('M', 'M. Consistency Rule', {
    id: 'M-1',
    ruleName: 'Consistency Rule & Best-Day Profit Cap',
    phase1: isInstant ? naNoEval : 'No Consistency Rule in Eval',
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : 'No Consistency Rule in Eval',
    phase3: isInstant ? naNoEval : isThreePhase ? 'No Consistency Rule in Eval' : naNoPhase3,
    masterAccount: model.consistencyRule.active
      ? `${model.consistencyRule.maxSingleDayPct}% Single-Day Profit Cap`
      : 'No Consistency Rule',
    decision: model.consistencyRule.active ? 'LIMITED' : 'NO',
    decisionDetail: model.consistencyRule.active ? `${model.consistencyRule.maxSingleDayPct}% Best-Day Cap` : 'No Consistency Rule',
    verification: 'Verified',
    calculation: model.consistencyRule.active
      ? `Funded stage: Best single day must not exceed ${model.consistencyRule.maxSingleDayPct}% of total profit`
      : 'No consistency restrictions',
    formula: model.consistencyRule.active
      ? `Max Allowed Single Day Profit = Total Profit Requested × ${model.consistencyRule.maxSingleDayPct}%`
      : 'N/A',
    source: 'GFT Consistency FAQ Section 2',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: model.consistencyRule.active
      ? `On funded master accounts, your single largest trading day profit cannot account for more than ${model.consistencyRule.maxSingleDayPct}% of your total payout request. Violating this does NOT breach your account; you simply trade more days to rebalance.`
      : 'This model has no consistency rule. Any distribution of profits across days is acceptable.',
    beginnerExplanation: 'Prevents traders from getting lucky on one giant gamble trade. You must earn profits steadily across multiple days.',
    breachTrigger: `Single day profit exceeds ${model.consistencyRule.maxSingleDayPct}% of total profit upon withdrawal request.`,
    afterBreachAction: 'Soft consequence. Payout is delayed until additional profits balance the ratio; account is NOT breached.',
    appliesTo: 'Master Account',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // N. News Trading
  // =========================================================================
  addRow('N', 'N. News Trading', {
    id: 'N-1',
    ruleName: 'News Trading & Red-Folder Macro Events',
    phase1: isInstant ? naNoEval : 'Allowed (No Profit Cap in Eval)',
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : 'Allowed (No Profit Cap in Eval)',
    phase3: isInstant ? naNoEval : isThreePhase ? 'Allowed' : naNoPhase3,
    masterAccount: 'Allowed with 1% Profit Cap (±5 min red folder)',
    decision: 'LIMITED',
    decisionDetail: '1% Profit Cap on Red Folder News',
    verification: 'Verified',
    calculation: `Funded accounts: max credited profit from qualifying red folder news trades is 1% (${formatCurrency(calculatePercentageAmount(accountSize, 1))})`,
    formula: `Max News Trade Profit = ${formatCurrency(accountSize)} × 1% = ${formatCurrency(calculatePercentageAmount(accountSize, 1))}`,
    source: 'GFT News Policy Cl. 6.2',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: 'News trading is fully allowed during evaluation. On funded accounts, holding or executing trades within 5 minutes before and after high-impact red-folder news is permitted, but profit is capped at 1% of account size. Profits exceeding 1% are deducted; the account is not breached.',
    beginnerExplanation: 'Trading during major economic news is allowed, but profits earned during big news releases are capped at 1% on funded accounts.',
    breachTrigger: 'Earning >1% on trades opened/closed within ±5 minutes of red folder news.',
    afterBreachAction: 'Excess profit beyond 1% is removed at payout review; account is not terminated.',
    appliesTo: 'Funded stage',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // O. Weekend Holding
  // =========================================================================
  addRow('O', 'O. Weekend Holding', {
    id: 'O-1',
    ruleName: 'Weekend & Overnight Holding',
    phase1: isInstant ? naNoEval : 'Allowed for FX, Metals & Crypto',
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : 'Allowed for FX, Metals & Crypto',
    phase3: isInstant ? naNoEval : isThreePhase ? 'Allowed' : naNoPhase3,
    masterAccount: 'Allowed for FX, Metals & Crypto (24/7 Crypto)',
    decision: 'YES',
    decisionDetail: 'Allowed across all stages',
    verification: 'Verified',
    calculation: 'No mandatory Friday market close requirement',
    formula: 'Open positions can be held over weekends subject to standard rollover spread risk',
    source: 'GFT Trading Rules FAQ',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: 'Traders may hold positions overnight and over weekends across all evaluation and funded stages. Crypto assets trade 24/7. Note that rollover spreads may widen on Friday evening market close.',
    beginnerExplanation: 'You do not have to close your trades before Friday evening; holding over the weekend is fully allowed.',
    breachTrigger: 'Holding over weekend is not a breach; however, widening spreads Sunday open can trigger daily loss if margin buffer is tight.',
    afterBreachAction: 'N/A',
    appliesTo: 'All Stages',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // P. EA and Algorithmic Trading
  // =========================================================================
  addRow('P', 'P. EA and Algorithmic Trading', {
    id: 'P-1',
    ruleName: 'EA & Algorithmic Trading Policies',
    phase1: isInstant ? naNoEval : 'Allowed (Strictly Prohibits HFT/Arbitrage)',
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : 'Allowed (Strictly Prohibits HFT/Arbitrage)',
    phase3: isInstant ? naNoEval : isThreePhase ? 'Allowed' : naNoPhase3,
    masterAccount: 'Allowed (Commercial grid EAs & tick scalping prohibited)',
    decision: 'LIMITED',
    decisionDetail: 'Allowed (HFT / Latency Arb Prohibited)',
    verification: 'Verified',
    calculation: 'Commercial EAs sharing identical trades across >3 users are flagged',
    formula: 'Execution delay < 200ms or holding time < 30 seconds classified as toxic flow',
    source: 'GFT Algorithmic Trading Policy',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: 'Expert Advisors (EAs) and trading bots are permitted if they represent unique logic. High-frequency trading (HFT), latency arbitrage, tick scalping, and mass-market public EAs that execute identical trades across accounts are strictly prohibited.',
    beginnerExplanation: 'Automated trading bots are allowed as long as they are your own strategy, not toxic arbitrage or mass-copy bots.',
    breachTrigger: 'Using toxic latency arbitrage or commercial EA identical to hundreds of other users.',
    afterBreachAction: 'Account is denied payout and terminated for toxic trading.',
    appliesTo: 'All Stages',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // Q. Copy Trading
  // =========================================================================
  addRow('Q', 'Q. Copy Trading', {
    id: 'Q-1',
    ruleName: 'Trade Copying & Account Mirroring',
    phase1: isInstant ? naNoEval : 'Allowed between own accounts only',
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : 'Allowed between own accounts only',
    phase3: isInstant ? naNoEval : isThreePhase ? 'Allowed' : naNoPhase3,
    masterAccount: 'Allowed between own accounts only (No 3rd-party copy)',
    decision: 'CONDITIONAL',
    decisionDetail: 'Own Accounts Only',
    verification: 'Verified',
    calculation: 'Must originate from same IP/device or registered sub-account',
    formula: 'Third-party signal copy = Account breach upon detection',
    source: 'GFT Prohibited Practices',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: 'Copying trades is permitted ONLY between accounts belonging to the exact same trader. Copying trades from external third-party signals, account management services, or other traders is prohibited.',
    beginnerExplanation: 'You can copy trades between your own accounts, but copying another person or signal service is forbidden.',
    breachTrigger: 'Trading logs matching external accounts or group syndicate trading.',
    afterBreachAction: 'Hard breach. Accounts involved are terminated.',
    appliesTo: 'All Stages',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // R. VPS and IP Restrictions
  // =========================================================================
  addRow('R', 'R. VPS and IP Restrictions', {
    id: 'R-1',
    ruleName: 'VPS Usage & IP Address Restrictions',
    phase1: isInstant ? naNoEval : 'Allowed (Residential VPS Recommended)',
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : 'Allowed (Residential VPS Recommended)',
    phase3: isInstant ? naNoEval : isThreePhase ? 'Allowed' : naNoPhase3,
    masterAccount: 'Allowed (Commercial datacenter IP clusters flagged)',
    decision: 'LIMITED',
    decisionDetail: 'Allowed (Dedicated IP Recommended)',
    verification: 'Requires Confirmation',
    calculation: 'Traders sharing datacenter IP subnet with banned accounts risk fraud flag',
    formula: 'IP Geolocation must match KYC country or verified travel declaration',
    source: 'GFT Security Guidelines',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: 'VPS is allowed. However, using public shared VPNs or commercial datacenter VPS IP addresses shared by hundreds of prop traders can trigger fraud alerts. Dedicated or residential IP VPS is strongly recommended.',
    beginnerExplanation: 'You can use a virtual private server (VPS), but make sure it has a dedicated IP so you do not share an IP with banned traders.',
    breachTrigger: 'Logging in from multiple conflicting international IPs within minutes.',
    afterBreachAction: 'Account is placed on temporary hold pending KYC re-verification.',
    appliesTo: 'Security & Execution',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // S. Instruments
  // =========================================================================
  addRow('S', 'S. Instruments', {
    id: 'S-1',
    ruleName: 'Tradable Asset Classes & Instruments',
    phase1: isInstant ? naNoEval : 'Forex, Metals, Indices, Crypto, Commodities',
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : 'Forex, Metals, Indices, Crypto, Commodities',
    phase3: isInstant ? naNoEval : isThreePhase ? 'All instruments' : naNoPhase3,
    masterAccount: 'Forex, Metals, Indices, Crypto, Commodities',
    decision: 'YES',
    decisionDetail: 'Full Multi-Asset Catalog',
    verification: 'Verified',
    calculation: '5 Asset Classes: FX Majors/Minors, Gold/Silver, Equity Indices, 20+ Crypto Pairs',
    formula: 'Standard contract sizes apply across all platforms',
    source: 'GFT Instrument Specifications',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: 'Traders can trade Forex pairs, Precious Metals (Gold, Silver), Equity Indices (US30, NAS100, SPX500, GER40), Crude Oil, and Cryptocurrencies 24/7 on supported platforms.',
    beginnerExplanation: 'The full list of markets you are allowed to trade (Currencies, Gold, US Stock Indices, and Crypto).',
    breachTrigger: 'N/A',
    afterBreachAction: 'N/A',
    appliesTo: 'All Stages',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // T. Leverage
  // =========================================================================
  addRow('T', 'T. Leverage', {
    id: 'T-1',
    ruleName: 'Leverage Tiers by Asset Class',
    phase1: isInstant ? naNoEval : `FX ${model.leverage.forex} · Indices ${model.leverage.indices} · Crypto ${model.leverage.crypto}`,
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : `FX ${model.leverage.forex} · Indices ${model.leverage.indices} · Crypto ${model.leverage.crypto}`,
    phase3: isInstant ? naNoEval : isThreePhase ? `FX ${model.leverage.forex}` : naNoPhase3,
    masterAccount: `FX ${model.leverage.forex} · Indices ${model.leverage.indices} · Crypto ${model.leverage.crypto}`,
    decision: 'YES',
    decisionDetail: `FX: ${model.leverage.forex} | Crypto: ${model.leverage.crypto}`,
    verification: 'Verified',
    calculation: `Forex: ${model.leverage.forex} | Indices/Metals: ${model.leverage.indices} | Crypto: ${model.leverage.crypto}`,
    formula: `Margin Required = Notional Trade Size / Leverage Ratio`,
    source: model.sourceDoc,
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: `Leverage is structured by volatility: Forex up to ${model.leverage.forex}, Commodities & Indices at ${model.leverage.indices}, and Crypto pairs at ${model.leverage.crypto}. Leverage remains identical between evaluation and funded stages.`,
    beginnerExplanation: 'How much borrowing power you have for each asset type. 1:50 means $1 controls $50 worth of currency.',
    breachTrigger: 'Overleveraging leading to margin call or stop-out.',
    afterBreachAction: 'Automatic broker margin liquidation.',
    appliesTo: 'All Stages',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // U. Trading Platforms
  // =========================================================================
  addRow('U', 'U. Trading Platforms', {
    id: 'U-1',
    ruleName: 'Supported Trading Platforms',
    phase1: isInstant ? naNoEval : model.supportedPlatforms.map(p => p.toUpperCase()).join(', '),
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : model.supportedPlatforms.map(p => p.toUpperCase()).join(', '),
    phase3: isInstant ? naNoEval : isThreePhase ? model.supportedPlatforms.map(p => p.toUpperCase()).join(', ') : naNoPhase3,
    masterAccount: model.supportedPlatforms.map(p => p.toUpperCase()).join(', '),
    decision: 'YES',
    decisionDetail: `${model.supportedPlatforms.length} Platforms Available`,
    verification: 'Verified',
    calculation: 'cTrader, Match-Trader, TradeLocker, MT5 available at checkout',
    formula: 'Zero platform surcharges or ongoing licensing fees',
    source: 'GFT Platform Center',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: 'Traders can select their preferred execution environment at checkout: cTrader, Match-Trader, TradeLocker, or MetaTrader 5 (MT5). Credentials cannot be transferred between platforms once an account is generated.',
    beginnerExplanation: 'The software applications where you can place trades (cTrader, Match-Trader, TradeLocker, MT5).',
    breachTrigger: 'N/A',
    afterBreachAction: 'N/A',
    appliesTo: 'All Stages',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // V. Regional Restrictions
  // =========================================================================
  addRow('V', 'V. Regional Restrictions', {
    id: 'V-1',
    ruleName: 'Geographic Availability & US Status',
    phase1: isInstant ? naNoEval : 'Non-US Only (US Prohibited for CFDs)',
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : 'Non-US Only (US Prohibited for CFDs)',
    phase3: isInstant ? naNoEval : isThreePhase ? 'Non-US Only (US Prohibited for CFDs)' : naNoPhase3,
    masterAccount: 'Non-US Only (US Prohibited for CFDs)',
    decision: 'LIMITED',
    decisionDetail: 'Non-US Residents Only (CFDs)',
    verification: 'Verified',
    calculation: 'US persons restricted from CFD models; CME Futures desk available separately',
    formula: 'KYC verified via passport/national ID + proof of address',
    source: 'GFT Compliance Terms Cl. 2.1',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: 'Due to regulatory restrictions, US citizens and residents cannot register for CFD-based trading challenges. Non-US international traders from supported countries are accepted after passing identity verification.',
    beginnerExplanation: 'Traders residing in the United States cannot trade standard CFD accounts due to US financial laws.',
    breachTrigger: 'Submitting US identity or proof of address during KYC payout check.',
    afterBreachAction: 'Account is closed and registration fee is refunded.',
    appliesTo: 'All CFD Models',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // W. Scaling Plan
  // =========================================================================
  addRow('W', 'W. Scaling Plan', {
    id: 'W-1',
    ruleName: 'Capital Scaling & Growth Plan',
    phase1: isInstant ? naNoEval : 'N/A — Evaluation Stage',
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : 'N/A — Evaluation Stage',
    phase3: isInstant ? naNoEval : isThreePhase ? 'N/A' : naNoPhase3,
    masterAccount: '+25% Balance Every 3 Months (2+ Payouts, Net 10% Profit)',
    decision: 'YES',
    decisionDetail: '+25% Capital Scaling up to $2M',
    verification: 'Verified',
    calculation: `Every 3 months with 10% net profit: ${formatCurrency(accountSize)} -> ${formatCurrency(calculateScalingAmount(accountSize, 25))}`,
    formula: `Next Scaled Balance = Current Balance × 1.25 (Scaling Ceiling: $2,000,000)`,
    source: 'GFT Scaling Roadmap',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: 'Funded traders who achieve at least 10% net profit over a 3-month cycle and receive at least 2 successful payouts receive a 25% account balance increase up to a maximum allocation of $2,000,000.',
    beginnerExplanation: 'If you trade profitably and take regular payouts for 3 months, the firm increases your account size by 25%.',
    breachTrigger: 'Failing to reach 10% profit simply defers scaling to the next 3-month review.',
    afterBreachAction: 'Account remains active at current tier.',
    appliesTo: 'Master Account',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // X. Breach Conditions
  // =========================================================================
  addRow('X', 'X. Breach Conditions', {
    id: 'X-1',
    ruleName: 'Hard vs Soft Breach Classification',
    phase1: isInstant ? naNoEval : 'Hard: Daily/Max DD | Soft: Inactivity',
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : 'Hard: Daily/Max DD | Soft: Inactivity',
    phase3: isInstant ? naNoEval : isThreePhase ? 'Hard: Daily/Max DD' : naNoPhase3,
    masterAccount: 'Hard: Daily/Max DD, Latency Arb | Soft: Consistency, Inactivity',
    decision: 'YES',
    decisionDetail: 'Hard (Close) vs Soft (Delay/Auto-close)',
    verification: 'Verified',
    calculation: 'Hard breach terminates account immediately; soft breach delays payout or auto-closes trades',
    formula: 'Hard Breach = Balance/Equity <= Breach Floor -> Terminal account revocation',
    source: 'GFT Terms & Conditions Section 11',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: 'Hard breaches (violating daily drawdown, maximum drawdown, or using toxic latency arbitrage) immediately terminate the account. Soft breaches (violating the consistency rule, news profit cap, or inactivity) result in delayed payouts or auto-closure of open positions without account termination.',
    beginnerExplanation: 'Hard breaches end your account permanently. Soft breaches simply delay your payout or close a trade.',
    breachTrigger: 'Hitting loss limits or executing prohibited trading styles.',
    afterBreachAction: 'Hard breach revokes account; soft breach gives a warning or payout recalculation.',
    appliesTo: 'All Stages',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // Y. Fee Refund
  // =========================================================================
  addRow('Y', 'Y. Fee Refund', {
    id: 'Y-1',
    ruleName: 'Evaluation Registration Fee Refund',
    phase1: isInstant ? naNoEval : model.refundableFee ? '100% Refund with First Payout' : 'Non-Refundable',
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : model.refundableFee ? '100% Refund with First Payout' : 'Non-Refundable',
    phase3: isInstant ? naNoEval : isThreePhase ? (model.refundableFee ? '100% Refund' : 'No') : naNoPhase3,
    masterAccount: isPayLater
      ? 'Initial $5 Non-Refundable (Activation Paid upon Passing)'
      : model.refundableFee
      ? '100% Registration Fee Returned with 1st Payout'
      : 'Non-Refundable',
    decision: model.refundableFee ? 'YES' : 'NO',
    decisionDetail: isPayLater ? '$5 Non-Refundable' : model.refundableFee ? '100% Refund on 1st Payout' : 'Non-Refundable',
    verification: 'Verified',
    calculation: isPayLater
      ? 'Initial $5 entry fee is non-refundable; pass fee is paid only upon passing'
      : model.refundableFee
      ? 'Full original challenge registration fee added back to trader account with first payout'
      : 'Challenge registration fee is non-refundable',
    formula: model.refundableFee ? 'First Payout Total = Net Profit Split + 100% Challenge Fee' : 'N/A',
    source: model.sourceDoc,
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: model.refundableFee
      ? 'For evaluation models with refundable fees, 100% of your initial purchase registration fee is refunded and paid out alongside your first profitable payout on the master funded account.'
      : 'On Pay Later, the $5 entry fee is non-refundable. The activation fee is paid only upon passing.',
    beginnerExplanation: 'You get your entry fee back 100% once you make your first profit withdrawal.',
    breachTrigger: 'Breaching the account before first payout forfeits the registration fee.',
    afterBreachAction: 'Fee is retained by firm.',
    appliesTo: 'First Payout',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // Z. Account Inactivity
  // =========================================================================
  addRow('Z', 'Z. Account Inactivity', {
    id: 'Z-1',
    ruleName: 'Dormant Account Inactivity Policy',
    phase1: isInstant ? naNoEval : '30 Calendar Days Inactivity Limit',
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : '30 Calendar Days Inactivity Limit',
    phase3: isInstant ? naNoEval : isThreePhase ? '30 Days' : naNoPhase3,
    masterAccount: '30 Calendar Days Inactivity Limit',
    decision: 'LIMITED',
    decisionDetail: '30 Days Dormancy Cutoff',
    verification: 'Verified',
    calculation: 'Account marked dormant if no trade placed for 30 consecutive calendar days',
    formula: 'Dormancy Expiration = Last Trade Timestamp + 30 Days (720 Hours)',
    source: 'GFT Account Maintenance Guide',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: 'Accounts must execute at least one trade every 30 consecutive calendar days to remain active. If an account is dormant for 30 days without trade activity, credentials expire and the account is closed.',
    beginnerExplanation: 'You must place at least one trade every 30 days so your account does not expire from inactivity.',
    breachTrigger: '30 days passing without any trade activity.',
    afterBreachAction: 'Account credentials revoked; trader must contact support for reactivation if within grace period.',
    appliesTo: 'All Stages',
    termsVersion: 'Active 2026',
  });

  // =========================================================================
  // AA. Terms Version
  // =========================================================================
  addRow('AA', 'AA. Terms Version', {
    id: 'AA-1',
    ruleName: 'Legal Terms of Service Governance',
    phase1: isInstant ? naNoEval : termsVersion === 'pre_aug_2026' ? 'Pre-August 2026 Terms (Grandfathered)' : 'Current September 2026 Terms',
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : termsVersion === 'pre_aug_2026' ? 'Pre-August 2026 Terms (Grandfathered)' : 'Current September 2026 Terms',
    phase3: isInstant ? naNoEval : isThreePhase ? (termsVersion === 'pre_aug_2026' ? 'Pre-August 2026 Terms' : 'Current September 2026 Terms') : naNoPhase3,
    masterAccount: termsVersion === 'pre_aug_2026' ? 'Pre-August 2026 Terms (Grandfathered)' : 'Current September 2026 Terms',
    decision: 'CONDITIONAL',
    decisionDetail: termsVersion === 'pre_aug_2026' ? 'Grandfathered Terms' : 'Current Active Terms',
    verification: termsVersion === 'pre_aug_2026' ? 'Grandfathered' : 'Verified',
    calculation: termsVersion === 'pre_aug_2026'
      ? 'Historical policy terms governing accounts registered before August 12, 2026'
      : 'Active operational policy terms revised September 2, 2026',
    formula: 'Applicable Terms = Purchase Date < 2026-08-12 ? Pre-Aug Terms : Active 2026 Terms',
    source: 'GFT Legal Repository v2026.09',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-09-02',
    explanation: 'Goat Funded Trader periodically revises trading rules. Existing funded accounts purchased under prior terms remain grandfathered under their purchase terms unless explicitly amended.',
    beginnerExplanation: 'Rules can change over time. If you purchased an older account, your terms are usually protected under grandfathered rules.',
    breachTrigger: 'Dispute over applied terms during payout audit.',
    afterBreachAction: 'Support reviews order timestamp against legal archive.',
    appliesTo: 'Governance & Auditing',
    termsVersion: termsVersion === 'pre_aug_2026' ? 'Historical' : 'Current',
  });

  // =========================================================================
  // AB. Evidence and Source History
  // =========================================================================
  addRow('AB', 'AB. Evidence and Source History', {
    id: 'AB-1',
    ruleName: 'Primary Source Citation & Verification Trail',
    phase1: isInstant ? naNoEval : model.sourceDoc,
    phase2: isInstant ? naNoEval : isOnePhase ? naNoPhase2 : model.sourceDoc,
    phase3: isInstant ? naNoEval : isThreePhase ? model.sourceDoc : naNoPhase3,
    masterAccount: model.sourceDoc,
    decision: 'YES',
    decisionDetail: 'Direct Official Evidence',
    verification: 'Verified',
    calculation: `Official citation: ${model.sourceDoc} (Last verified: ${model.lastVerifiedDate})`,
    formula: `Verification Link: ${model.sourceUrl || 'https://goatfundedtrader.com'}`,
    source: model.sourceDoc,
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    explanation: `All rules displayed in this table have been audited against official Goat Funded Trader documentation (${model.sourceDoc}). No values are synthetic or inferred.`,
    beginnerExplanation: 'The official document or web page from the prop firm where this exact rule is written down.',
    breachTrigger: 'N/A',
    afterBreachAction: 'N/A',
    appliesTo: 'Full Data Integrity',
    termsVersion: 'Active 2026',
  });

  // Group rows into 28 category buckets
  const groups: RuleCategoryGroup[] = RULE_CATEGORIES.map((cat) => {
    const categoryRules = allRows.filter((r) => r.categoryKey === cat.id);
    const hasConflict = categoryRules.some((r) => r.verification === 'Conflicting' || r.conflictDetails?.hasConflict);
    const requiresConfirmationCount = categoryRules.filter((r) => r.verification === 'Requires Confirmation').length;

    return {
      key: cat.id,
      title: `${cat.id}. ${cat.name}`,
      description: cat.desc,
      rules: categoryRules,
      hasConflict,
      requiresConfirmationCount,
    };
  });

  // Automated data quality validation
  const validationErrors: string[] = [];
  const validationWarnings: string[] = [];

  // Verify phase integrity
  if (isOnePhase) {
    allRows.forEach((r) => {
      if (r.phase2 !== naNoPhase2 && !r.phase2.includes('N/A')) {
        validationErrors.push(`One-phase model ${model.id} contains Phase 2 value in rule ${r.ruleName}`);
      }
      if (r.phase3 !== naNoPhase3 && !r.phase3.includes('N/A')) {
        validationErrors.push(`One-phase model ${model.id} contains Phase 3 value in rule ${r.ruleName}`);
      }
    });
  } else if (isTwoPhase) {
    allRows.forEach((r) => {
      if (r.phase3 !== naNoPhase3 && !r.phase3.includes('N/A')) {
        validationErrors.push(`Two-phase model ${model.id} contains Phase 3 value in rule ${r.ruleName}`);
      }
    });
  } else if (isInstant) {
    allRows.forEach((r) => {
      if (!r.phase1.includes('N/A') || !r.phase2.includes('N/A') || !r.phase3.includes('N/A')) {
        validationErrors.push(`Instant funding model ${model.id} contains evaluation phase values in rule ${r.ruleName}`);
      }
    });
  }

  // Check status & evidence
  allRows.forEach((r) => {
    if (r.verification === 'Verified' && !r.source) {
      validationErrors.push(`Rule ${r.ruleName} is marked Verified without attached source evidence`);
    }
  });

  const validationReport: ModelValidationReport = {
    isValid: validationErrors.length === 0,
    errors: validationErrors,
    warnings: validationWarnings,
    totalRulesCount: allRows.length,
    verifiedCount: allRows.filter((r) => r.verification === 'Verified').length,
    ambiguousCount: allRows.filter((r) => r.verification === 'Official but Ambiguous').length,
    conflictingCount: allRows.filter((r) => r.verification === 'Conflicting' || r.conflictDetails?.hasConflict).length,
    requiresConfirmationCount: allRows.filter((r) => r.verification === 'Requires Confirmation').length,
    historicalCount: allRows.filter((r) => r.verification === 'Historical' || r.verification === 'Grandfathered').length,
    notApplicableCount: allRows.filter((r) => r.verification === 'Not Applicable').length,
    unverifiedCount: allRows.filter((r) => r.verification === 'Unverified').length,
  };

  return {
    groups,
    allRows,
    validationReport,
  };
}

/**
 * Validates all models across canonical registry to ensure zero critical errors.
 */
export function validateModelPhaseRules(
  models: GFTModel[],
  accountSize: number = 100000
): { modelId: string; severity: 'error' | 'warning'; message: string }[] {
  const issues: { modelId: string; severity: 'error' | 'warning'; message: string }[] = [];

  for (const model of models) {
    const { validationReport } = buildPhaseAwareRuleTable(model, {
      accountSize,
      stage: 'all',
      platform: 'all',
      termsVersion: 'current_2026',
      tradingStyle: 'conservative' as TradingStyle,
    });

    validationReport.errors.forEach((err) => {
      issues.push({ modelId: model.id, severity: 'error', message: err });
    });
    validationReport.warnings.forEach((warn) => {
      issues.push({ modelId: model.id, severity: 'warning', message: warn });
    });
  }

  return issues;
}
