// Deterministic Financial Calculation Engine for Prop Firm Rules
// Implements exact mathematical formulas to prevent floating-point inaccuracies and eliminate LLM math hallucinations.

import { SimulationInput, SimulationResult, DrawdownType } from '../../types/schema.ts';

/**
 * Rounds a number safely to 2 decimal places.
 */
export function roundCurrency(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates the Daily Drawdown Floor and current loss.
 * Goat Funded Trader and most modern firms calculate Daily Loss relative to the higher of:
 * - Starting balance of the day
 * - High-water mark of equity at the daily reset (server time midnight).
 */
export function calculateDailyLossFloor(
  startingBalanceOrEquity: number,
  dailyLossPercent: number
): { floor: number; maxAllowedLossDollars: number } {
  const maxAllowedLossDollars = roundCurrency((startingBalanceOrEquity * dailyLossPercent) / 100);
  const floor = roundCurrency(startingBalanceOrEquity - maxAllowedLossDollars);
  return { floor, maxAllowedLossDollars };
}

/**
 * Calculates Maximum Overall Drawdown Floor — 5-Type Correct.
 * Matches Section 4.1 of master plan:
 * - static: Floor = start - X% forever. Never moves.
 * - trailing_balance: Floor trails realized Balance peak (closed P&L only), never down, caps at initial.
 * - trailing_equity: Floor trails Equity peak (balance + open P&L), never down, caps at initial (+ optional buffer).
 * - end_of_day: Floor trails highest EOD / midnight balance, enforced IN REAL TIME against equity. Caps at initial.
 * - intraday_equity: Same as trailing_equity but explicitly intraday (Apex Intraday). No cap until lock.
 * 
 * For Goat/FTMO/FundedNext static programs: use 'static'.
 * For FTMO 1-Step / Topstep EOD: use 'end_of_day' (Topstep MLL set at end of day, Tradeify enforced real-time).
 * For Apex Intraday: use 'intraday_equity' / 'trailing_equity'.
 */
export function calculateMaxLossFloor(
  initialNominalSize: number,
  highWaterEquity: number,
  maxLossPercent: number,
  drawdownType: DrawdownType,
  options?: { lockBufferDollars?: number; eodHighWater?: number }
): { floor: number; maxAllowedLossDollars: number; rawCalculatedFloor: number } {
  const maxAllowedLossDollars = roundCurrency((initialNominalSize * maxLossPercent) / 100);

  if (drawdownType === 'static') {
    const floor = roundCurrency(initialNominalSize - maxAllowedLossDollars);
    return { floor, maxAllowedLossDollars, rawCalculatedFloor: floor };
  }

  // For EOD accounts, use EOD high-water if provided, else equity high-water
  const effectiveHighWater = drawdownType === 'end_of_day' && options?.eodHighWater !== undefined
    ? options.eodHighWater
    : highWaterEquity;

  const calculatedFloor = roundCurrency(effectiveHighWater - maxAllowedLossDollars);
  const lockBuffer = options?.lockBufferDollars ?? 0; // e.g. Tradeify +$100, Apex +$100 safety net
  const lockLevel = roundCurrency(initialNominalSize + lockBuffer);

  // All trailing types cap at lockLevel (initial or initial+buffer) once profitable enough
  // intraday_equity with no buffer still caps at initial — this prevents "I'm up 8% I have 10% room" lie
  let floor = calculatedFloor;
  if (drawdownType === 'trailing_balance' || drawdownType === 'trailing_equity' || drawdownType === 'end_of_day' || drawdownType === 'intraday_equity') {
    floor = Math.min(calculatedFloor, lockLevel);
    // Floor never goes below static floor (can't be looser than start)
    const staticFloor = roundCurrency(initialNominalSize - maxAllowedLossDollars);
    floor = Math.max(floor, staticFloor);
  }

  return { floor, maxAllowedLossDollars, rawCalculatedFloor: calculatedFloor };
}

/**
 * Calculates profit target dollar requirement and remaining distance.
 */
export function calculateProfitTarget(
  nominalSize: number,
  currentBalance: number,
  targetPercent: number
): { targetBalance: number; targetDollars: number; remainingDollars: number; percentProgress: number } {
  const targetDollars = roundCurrency((nominalSize * targetPercent) / 100);
  const targetBalance = roundCurrency(nominalSize + targetDollars);
  const profitMade = Math.max(0, currentBalance - nominalSize);
  const remainingDollars = roundCurrency(Math.max(0, targetBalance - currentBalance));
  const percentProgress = Math.min(100, roundCurrency((profitMade / targetDollars) * 100));

  return { targetBalance, targetDollars, remainingDollars, percentProgress };
}

/**
 * Calculates net profit split for a payout withdrawal.
 */
export function calculateProfitSplit(
  profitAmount: number,
  splitPercentage: number
): { traderShare: number; firmShare: number } {
  const traderShare = roundCurrency((profitAmount * splitPercentage) / 100);
  const firmShare = roundCurrency(profitAmount - traderShare);
  return { traderShare, firmShare };
}

/**
 * Comprehensive Account Risk Simulator
 * Evaluates the trader's real-time balance, equity, and open positions against prop firm rules.
 */
export function simulateAccountState(input: SimulationInput): SimulationResult {
  const triggeredRules: string[] = [];

  // 1. Calculate Daily Drawdown Floor (GOAT uses start of day balance/equity)
  const baselineForDaily = Math.max(input.todayStartEquity, input.startingBalance);
  const { floor: dailyFloor } = calculateDailyLossFloor(baselineForDaily, input.dailyLossLimitPct);
  const dailyLossDistance = roundCurrency(input.currentEquity - dailyFloor);

  let dailyLossStatus: 'SAFE' | 'WARNING' | 'BREACH' = 'SAFE';
  if (dailyLossDistance <= 0) {
    dailyLossStatus = 'BREACH';
    triggeredRules.push(
      `Daily Drawdown Breached: Current equity ($${input.currentEquity.toLocaleString()}) has breached the daily loss floor ($${dailyFloor.toLocaleString()}).`
    );
  } else if (dailyLossDistance <= (input.nominalSize * input.dailyLossLimitPct * 0.25) / 100) {
    dailyLossStatus = 'WARNING';
    triggeredRules.push(
      `Daily Drawdown Warning: Only $${dailyLossDistance.toLocaleString()} buffer remaining before daily loss breach.`
    );
  }

  // 2. Calculate Maximum Overall Loss Floor
  const { floor: maxFloor } = calculateMaxLossFloor(
    input.nominalSize,
    input.highWaterEquityToday,
    input.maxLossLimitPct,
    input.drawdownType
  );
  const maxLossDistance = roundCurrency(input.currentEquity - maxFloor);

  let maxLossStatus: 'SAFE' | 'WARNING' | 'BREACH' = 'SAFE';
  if (maxLossDistance <= 0) {
    maxLossStatus = 'BREACH';
    triggeredRules.push(
      `Max Overall Drawdown Breached: Current equity ($${input.currentEquity.toLocaleString()}) has fallen below max loss threshold ($${maxFloor.toLocaleString()}).`
    );
  } else if (maxLossDistance <= (input.nominalSize * input.maxLossLimitPct * 0.25) / 100) {
    maxLossStatus = 'WARNING';
    triggeredRules.push(
      `Max Drawdown Warning: Only $${maxLossDistance.toLocaleString()} buffer remaining before account termination.`
    );
  }

  // 3. Trade Risk Check (Position Sizing Warning)
  if (input.tradeRiskPercent > 2.5) {
    triggeredRules.push(
      `High Risk Warning: Risking ${input.tradeRiskPercent}% on active trade significantly increases breach risk under strict prop firm daily limit (${input.dailyLossLimitPct}%).`
    );
  }

  // Overall status is the most severe of daily or max
  let overallStatus: 'SAFE' | 'WARNING' | 'BREACH' = 'SAFE';
  if (dailyLossStatus === 'BREACH' || maxLossStatus === 'BREACH') {
    overallStatus = 'BREACH';
  } else if (dailyLossStatus === 'WARNING' || maxLossStatus === 'WARNING' || input.tradeRiskPercent > 3) {
    overallStatus = 'WARNING';
  }

  const remainingSafeLoss = Math.max(0, Math.min(dailyLossDistance, maxLossDistance));
  const safetyBufferPercentage = roundCurrency((remainingSafeLoss / input.nominalSize) * 100);

  let explanation = `Account is currently ${overallStatus}. `;
  if (overallStatus === 'BREACH') {
    explanation += `Account has violated official prop firm risk limits and is subject to immediate disqualification.`;
  } else if (overallStatus === 'WARNING') {
    explanation += `You are trading within close proximity to risk limit thresholds ($${remainingSafeLoss.toLocaleString()} remaining). Reduce position size immediately.`;
  } else {
    explanation += `You have $${remainingSafeLoss.toLocaleString()} (${safetyBufferPercentage}%) of buffer remaining above your nearest loss floor.`;
  }

  return {
    overallStatus,
    dailyLossFloor: dailyFloor,
    dailyLossDistance,
    dailyLossStatus,
    maxLossFloor: maxFloor,
    maxLossDistance,
    maxLossStatus,
    triggeredRules,
    explanation,
    remainingSafeLoss,
    safetyBufferPercentage,
  };
}

/**
 * All-In Cost to First Payout — Section 26
 * Calculates realistic total cost including fee, resets, activation, data, add-ons minus refund.
 * Never pretend exact future cost when duration unknown — show scenario assumptions.
 */
export interface AllInCostInput {
  challengeFee: number;
  expectedResets?: number; // avg resets before pass, 0-3
  resetFee?: number;
  activationFee?: number;
  dataFeeMonthly?: number;
  monthsToPayout?: number;
  addOnCost?: number;
  refundableOnFirstPayout?: boolean;
}
export interface AllInCostResult {
  totalPaidBeforePayout: number;
  totalAfterRefund: number;
  breakdown: { label: string; amount: number }[];
  assumptionNote: string;
}
export function calculateAllInCost(input: AllInCostInput): AllInCostResult {
  const resets = input.expectedResets ?? 0;
  const resetFee = input.resetFee ?? input.challengeFee;
  const activation = input.activationFee ?? 0;
  const data = (input.dataFeeMonthly ?? 0) * (input.monthsToPayout ?? 1);
  const addOn = input.addOnCost ?? 0;
  const totalPaid = roundCurrency(input.challengeFee + resets * resetFee + activation + data + addOn);
  const refund = input.refundableOnFirstPayout ? input.challengeFee : 0;
  const totalAfterRefund = roundCurrency(Math.max(0, totalPaid - refund));
  const breakdown = [
    { label: 'Challenge fee', amount: input.challengeFee },
    ...(resets > 0 ? [{ label: `Resets × ${resets}`, amount: roundCurrency(resets * resetFee) }] : []),
    ...(activation > 0 ? [{ label: 'Activation fee', amount: activation }] : []),
    ...(data > 0 ? [{ label: `Data ${input.monthsToPayout}mo`, amount: data }] : []),
    ...(addOn > 0 ? [{ label: 'Add-ons', amount: addOn }] : []),
    ...(refund > 0 ? [{ label: 'Refund on 1st payout', amount: -refund }] : []),
  ];
  const assumptionNote = resets === 0
    ? 'Assumes pass on first attempt. Add 1–2 resets for realistic avg (FPFX: only 7% get payout).'
    : `Assumes ${resets} reset(s). Data fees vary by platform.`;
  return { totalPaidBeforePayout: totalPaid, totalAfterRefund, breakdown, assumptionNote };
}

/**
 * Payout Eligibility Engine — Section 25
 * Models: first payout date, min profit, winning days, consistency, cap, safety buffer.
 */
export interface PayoutEligibilityInput {
  currentProfit: number;
  requiredProfitMinimum?: number; // e.g. Apex $500 min, $250 day
  winningDaysCount: number;
  requiredWinningDays: number; // e.g. Topstep 5x$150, Apex 5 qualifying
  consistencyPct?: number; // best day % of total, e.g. 50%
  bestDayProfit: number;
  hasSafetyBufferRule?: boolean;
  safetyBufferDollars?: number; // distance above floor required to withdraw
  currentEquityDistanceToFloor: number;
  hasOpenPositions?: boolean;
  minProfitPerWinningDay?: number;
}
export function checkPayoutEligibility(input: PayoutEligibilityInput): { eligible: 'YES' | 'NO' | 'CONDITIONAL'; reasons: string[]; blockers: string[] } {
  const blockers: string[] = [];
  const reasons: string[] = [];

  if (input.hasOpenPositions) {
    blockers.push('Close all open positions & pending orders before payout request (most firms).');
  }
  if (input.requiredProfitMinimum && input.currentProfit < input.requiredProfitMinimum) {
    blockers.push(`Profit $${input.currentProfit.toLocaleString()} below minimum $${input.requiredProfitMinimum.toLocaleString()} required.`);
  } else if (input.requiredProfitMinimum) {
    reasons.push(`Profit meets minimum ($${input.requiredProfitMinimum.toLocaleString()}).`);
  }
  if (input.winningDaysCount < input.requiredWinningDays) {
    blockers.push(`Only ${input.winningDaysCount}/${input.requiredWinningDays} winning days completed.`);
  } else {
    reasons.push(`${input.winningDaysCount} winning days satisfied.`);
  }
  if (input.consistencyPct !== undefined) {
    const allowed = (input.currentProfit * input.consistencyPct) / 100;
    if (input.bestDayProfit > allowed) {
      blockers.push(`Consistency: best day $${input.bestDayProfit.toLocaleString()} is ${(input.bestDayProfit / Math.max(1, input.currentProfit) * 100).toFixed(1)}% of profit (limit ${input.consistencyPct}%). Payout hidden until ratio drops or target raises.`);
    } else if (input.bestDayProfit > 0) {
      reasons.push(`Consistency OK: best day within ${input.consistencyPct}% limit.`);
    }
  }
  if (input.hasSafetyBufferRule && input.safetyBufferDollars !== undefined) {
    if (input.currentEquityDistanceToFloor < input.safetyBufferDollars) {
      blockers.push(`Safety buffer not met: need $${input.safetyBufferDollars.toLocaleString()} above floor, have $${input.currentEquityDistanceToFloor.toLocaleString()}.`);
    } else {
      reasons.push('Safety buffer satisfied.');
    }
  }

  let eligible: 'YES' | 'NO' | 'CONDITIONAL' = 'YES';
  if (blockers.length > 0) eligible = blockers.length <= 1 && reasons.length > 0 ? 'CONDITIONAL' : 'NO';
  if (blockers.length === 0) reasons.push('No blockers detected — request should be eligible. Verify KYC & inactivity clock.');
  return { eligible, reasons, blockers };
}

/**
 * Consistency / Best-Day Calculator — Section 24
 * Example: "This $1,800 day just changed effective target from X to Y."
 */
export function calculateConsistencyImpact(
  totalProfit: number,
  bestDayProfit: number,
  maxBestDayPct: number,
  currentTarget: number
): { ratio: number; breaches: boolean; adjustedTarget: number; explanation: string } {
  const ratio = totalProfit > 0 ? roundCurrency((bestDayProfit / totalProfit) * 100) : 0;
  const breaches = ratio > maxBestDayPct;
  // Topstep-style: exceeding raises target to bestDay / 0.50
  const adjustedTarget = breaches ? roundCurrency(bestDayProfit / (maxBestDayPct / 100)) : currentTarget;
  const explanation = breaches
    ? `Best day $${bestDayProfit.toLocaleString()} is ${ratio}% of $${totalProfit.toLocaleString()} profit (limit ${maxBestDayPct}%). Effective target raised to $${adjustedTarget.toLocaleString()}. Losses do NOT reset best day.`
    : `Best day ${ratio}% within ${maxBestDayPct}% limit. Target remains $${currentTarget.toLocaleString()}.`;
  return { ratio, breaches, adjustedTarget, explanation };
}
