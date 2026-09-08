/**
 * Selector functions and simulation calculations for Goat Funded Trader
 * Independent Intelligence & Verification Platform
 * Strictly derived from the canonical registry.
 */

import {
  GFT_CANONICAL_MODELS,
  GFT_PRICING_REGISTRY,
  GFT_CANONICAL_RULES,
  GFT_WARNINGS_REGISTRY,
  GFT_COMMUNITY_REVIEWS,
  GFT_CHANGE_HISTORY,
  GFT_DECISION_RECOMMENDATIONS,
  GFT_FUTURES_MODELS,
  GFTCategory,
  GFTModel,
  GFTPricingEntry,
  GFTRuleDetail,
  GFTWarningItem,
  GFTCommunityItem,
  GFTChangeHistoryItem,
  GFTDecisionRecommendation,
  GFTFuturesModel,
  TradingStyle,
  TradingPlatform,
} from './goatCanonicalData.ts';
import { CanonicalSelectedModelRules } from './goatCanonicalContext.ts';
import {
  calculatePercentageAmount,
  calculateDailyLossAmount,
  calculateProfitTargetAmount,
  calculateFloatingLossAmount,
  calculateBreachFloor,
} from './goatPhaseAwareRules.ts';

export interface CategoryMeta {
  id: GFTCategory;
  label: string;
  description: string;
  badge: string;
  modelCount: number;
}

export const CATEGORY_DEFINITIONS: Array<{ id: GFTCategory; label: string; description: string }> = [
  { id: 'pay_later', label: 'Pay Later', description: '$5 upfront entry; pay activation fee only after passing 4% target.' },
  { id: 'one_step', label: '1-Step', description: 'Single-stage evaluations with fast profit targets.' },
  { id: 'two_step', label: '2-Step', description: 'Traditional two-phase evaluations with generous static drawdown.' },
  { id: 'three_step', label: '3-Step', description: 'Lowest per-phase target (6% / 6% / 6%) with 0 minimum trading days in eval.' },
  { id: 'instant', label: 'Instant Funding', description: 'Direct live simulated funding without any evaluation challenge.' },
  { id: 'legacy', label: 'Legacy / Archived', description: 'Discontinued models preserved for grandfathered account holders.' },
];

/**
 * Dynamically computes category metadata and model counts directly from registry
 */
export function getCategoriesWithCounts(): CategoryMeta[] {
  return CATEGORY_DEFINITIONS.map((cat) => {
    const models = GFT_CANONICAL_MODELS.filter((m) => m.category === cat.id);
    return {
      id: cat.id,
      label: cat.label,
      description: cat.description,
      badge: `${models.length} ${models.length === 1 ? 'Model' : 'Models'}`,
      modelCount: models.length,
    };
  });
}

export function getModelsByCategory(catId: GFTCategory): GFTModel[] {
  return GFT_CANONICAL_MODELS.filter((m) => m.category === catId);
}

export function getModelById(modelId: string): GFTModel | undefined {
  return GFT_CANONICAL_MODELS.find((m) => m.id === modelId) || GFT_CANONICAL_MODELS[0];
}

export function getPricingForModel(modelId: string, accountSize: number): GFTPricingEntry | undefined {
  const match = GFT_PRICING_REGISTRY.find(
    (p) => p.modelId === modelId && p.accountSize === accountSize
  );
  if (match) return match;

  // Fallback to first available size for model
  return GFT_PRICING_REGISTRY.find((p) => p.modelId === modelId);
}

export function getAllPricingForModel(modelId: string): GFTPricingEntry[] {
  return GFT_PRICING_REGISTRY.filter((p) => p.modelId === modelId);
}

export function getRulesForModel(modelId: string, stage?: 'evaluation' | 'funded' | 'all'): GFTRuleDetail[] {
  return GFT_CANONICAL_RULES.filter((rule) => {
    const modelMatches = rule.applicableModels.includes('all') || rule.applicableModels.includes(modelId);
    if (!modelMatches) return false;
    if (!stage || stage === 'all') return true;
    return rule.applicableStages.includes('all') || rule.applicableStages.includes(stage);
  });
}

export function getWarningsForModel(modelId: string): GFTWarningItem[] {
  return GFT_WARNINGS_REGISTRY.filter(
    (w) => w.affectedModelIds.includes('all') || w.affectedModelIds.includes(modelId)
  );
}

export function getChangeHistoryForModel(modelId: string): GFTChangeHistoryItem[] {
  return GFT_CHANGE_HISTORY.filter(
    (c) => c.affectedModels.includes('all') || c.affectedModels.includes(modelId)
  );
}

export function getReviewsForModel(modelId?: string): GFTCommunityItem[] {
  if (!modelId) return GFT_COMMUNITY_REVIEWS;
  // Return all reviews that are either general or match relevant model traps
  return GFT_COMMUNITY_REVIEWS;
}

export function getAllDecisionRecommendations(): GFTDecisionRecommendation[] {
  return GFT_DECISION_RECOMMENDATIONS;
}

export function getAllFuturesModels(): GFTFuturesModel[] {
  return GFT_FUTURES_MODELS;
}

/**
 * Calculate user suitability score based on selected trading style and model
 */
export function calculateSuitability(model: GFTModel, style: TradingStyle): { score: number; rationale: string } {
  switch (style) {
    case 'conservative':
      if (model.id === 'two_step_standard') {
        return { score: 96, rationale: 'Excellent match: 10% static drawdown floor protects capital; no consistency pressure.' };
      }
      if (model.id === 'three_step') {
        return { score: 93, rationale: 'High match: 6% targets require low risk per trade with 0 min days in evaluation.' };
      }
      if (model.id === 'pay_after_pass') {
        return { score: 90, rationale: 'Zero daily drawdown in evaluation allows patient execution.' };
      }
      return { score: 78, rationale: 'Acceptable match; keep risk under 0.5% per trade.' };

    case 'news_trader':
      if (model.category === 'instant') {
        return { score: 62, rationale: 'Caution: 1% floating loss rule or news execution caps may cause violations during spikes.' };
      }
      if (model.id === 'two_step_standard') {
        return { score: 91, rationale: 'Best news choice: 5% daily loss allows room for slippage in evaluation.' };
      }
      return { score: 75, rationale: 'News trading allowed, but beware of the 1% profit cap within ±5 minutes of red folders on funded.' };

    case 'swing_trader':
    case 'weekend_holder':
      if (model.category === 'instant' && (model.id === 'instant_premium' || model.id === 'instant_hero')) {
        return { score: 65, rationale: 'Caution: 1% floating loss rule makes holding through weekend gap risk dangerous.' };
      }
      if (model.id === 'two_step_standard' || model.id === 'two_step_goat') {
        return { score: 94, rationale: 'Ideal: Static drawdown floor does not trail up into floating swings.' };
      }
      return { score: 82, rationale: 'Weekend holding allowed on crypto and FX; monitor rollover fees.' };

    case 'scalper':
      if (model.id === 'instant_pro') {
        return { score: 92, rationale: 'Ideal: 0% daily loss limit gives scalpers total intraday drawdown freedom.' };
      }
      if (model.id === 'instant_premium') {
        return { score: 85, rationale: '10-day payouts are great for active scalpers, but obey 1% floating loss rule.' };
      }
      return { score: 84, rationale: 'Scalping allowed; ensure trades stay open at least 30-60 seconds to avoid latency flags.' };

    case 'ea_trader':
      return {
        score: 72,
        rationale: 'EAs allowed, but commercial data-center VPS (AWS, Contabo) is banned since Aug 12, 2026. Run from residential IP.',
      };

    case 'copy_trader':
      return {
        score: 70,
        rationale: 'Copy trading is only permitted between accounts owned by the exact same KYC identity.',
      };

    case 'futures_trader':
      return {
        score: 95,
        rationale: 'Select CME Futures Challenge mode for direct order book access on Volumetrica/Tradovate.',
      };

    case 'aggressive':
    default:
      if (model.id === 'one_step' || model.id === 'blitz') {
        return { score: 88, rationale: 'Fast 1-phase qualification, but monitor tight daily drawdown floors.' };
      }
      return { score: 80, rationale: 'Standard risk parameters apply.' };
  }
}

/**
 * Model-Specific Risk Simulator Calculation Engine (Phase 7-G)
 */
export interface SimulatorInputs {
  model: GFTModel;
  accountSize: number;
  startingBalance: number;
  currentEquity: number;
  currentFloatingLoss: number; // in dollars
  riskPerTradePct: number; // e.g. 1.0%
  stopLossPips: number;
  winRatePct: number; // e.g. 50%
  riskRewardRatio: number; // e.g. 2.0 (1:2)
  simulatedTradesCount: number; // e.g. 20
  targetPayoutAmount: number; // e.g. 4000
  canonicalRules?: CanonicalSelectedModelRules;
}

export interface SimulatorOutputs {
  maxPermittedDailyLossDollars: number;
  remainingDailyLossBuffer: number;
  maxTotalDrawdownDollars: number;
  remainingTotalDrawdownBuffer: number;
  maxPermittedRiskPerTradeDollars: number;
  consecutiveLossesBeforeDailyBreach: number;
  consecutiveLossesBeforeTotalBreach: number;
  distanceToProfitTargetDollars: number;
  profitTargetReached: boolean;
  floatingLossViolation: boolean;
  maxPermittedFloatingLossDollars?: number;
  consistencyCapDollars?: number;
  isPayoutEligible: boolean;
  payoutBlockReason?: string;
  status: 'safe' | 'caution' | 'danger';
  expectedValuePerTradeDollars: number;
  projectedEquityAfterSimTrades: number;
  summarySentence: string;
  isDailyLossCalculable: boolean;
  dailyLossCalculationMessage?: string;
  hasDailyLossLimit: boolean;
  formulas: {
    dailyLossBuffer: string;
    totalDrawdownBuffer: string;
    floatingLossBuffer: string;
    profitTargetDistance: string;
    payoutEligibility: string;
    consistencyCap: string;
    lossesRemaining: string;
    equityStatus: string;
    floatingLossStatus: string;
  };
}

export function runModelRiskSimulation(inputs: SimulatorInputs): SimulatorOutputs {
  const {
    model,
    accountSize,
    startingBalance,
    currentEquity,
    currentFloatingLoss,
    riskPerTradePct,
    winRatePct,
    riskRewardRatio,
    simulatedTradesCount,
    targetPayoutAmount,
    canonicalRules,
  } = inputs;

  const dollarRiskPerTrade = calculatePercentageAmount(accountSize, riskPerTradePct);

  // 1. Daily Loss Limit calculation - STRICTLY FROM CANONICAL OBJECT IF PRESENT
  const dailyLossPct = canonicalRules ? canonicalRules.core.dailyLossPct : model.dailyLossLimit.pct;
  const hasDailyLossLimit = canonicalRules ? canonicalRules.core.hasDailyLossLimit : dailyLossPct > 0;
  const maxPermittedDailyLossDollars = calculateDailyLossAmount(accountSize, dailyLossPct);
  
  const dailyFloor = hasDailyLossLimit ? startingBalance - maxPermittedDailyLossDollars : 0;
  const remainingDailyLossBuffer = hasDailyLossLimit ? Math.max(0, currentEquity - dailyFloor) : accountSize;
  const isDailyLossCalculable = true;

  // 2. Maximum Total Drawdown calculation
  const maxDDPct = canonicalRules ? canonicalRules.core.maxDDPct : model.maxDrawdown.pct;
  const maxTotalDrawdownDollars = calculatePercentageAmount(accountSize, maxDDPct);
  const maxDDType = canonicalRules ? canonicalRules.core.maxDDType : model.maxDrawdown.type;

  let totalDrawdownFloor = 0;
  if (maxDDType === 'static') {
    totalDrawdownFloor = accountSize - maxTotalDrawdownDollars;
  } else if (maxDDType === 'trailing_locked') {
    const highWater = Math.max(startingBalance, currentEquity);
    const rawFloor = highWater - maxTotalDrawdownDollars;
    totalDrawdownFloor = model.maxDrawdown.locksAtInitial ? Math.min(accountSize, rawFloor) : rawFloor;
  } else {
    const highWater = Math.max(startingBalance, currentEquity);
    totalDrawdownFloor = highWater - maxTotalDrawdownDollars;
  }

  const remainingTotalDrawdownBuffer = Math.max(0, currentEquity - totalDrawdownFloor);

  // 3. Floating loss cap check
  const floatingLossPct = canonicalRules ? canonicalRules.core.floatingLossPct : model.floatingLossCapPct;
  let floatingLossViolation = false;
  let maxPermittedFloatingLossDollars: number | undefined;
  if (floatingLossPct) {
    maxPermittedFloatingLossDollars = calculateFloatingLossAmount(accountSize, floatingLossPct);
    if (currentFloatingLoss > maxPermittedFloatingLossDollars) {
      floatingLossViolation = true;
    }
  }

  // 4. Consecutive losses before breach
  const effectiveLossPerTrade = Math.max(1, dollarRiskPerTrade);
  const consecutiveLossesBeforeDailyBreach =
    !hasDailyLossLimit ? 999 : Math.floor(remainingDailyLossBuffer / effectiveLossPerTrade);
  const consecutiveLossesBeforeTotalBreach = Math.floor(remainingTotalDrawdownBuffer / effectiveLossPerTrade);

  // 5. Distance to profit target
  const targetPct = canonicalRules ? canonicalRules.core.targetPct : (model.targetsByStage.phase1 || 0);
  const targetDollars = calculateProfitTargetAmount(accountSize, targetPct);
  const targetEquity = accountSize + targetDollars;
  const distanceToProfitTargetDollars = Math.max(0, targetEquity - currentEquity);
  const profitTargetReached = currentEquity >= targetEquity && targetPct > 0;

  // 6. Consistency and Payout check
  const hasConsistencyRule = canonicalRules ? canonicalRules.core.hasConsistencyRule : model.consistencyRule.active;
  const consistencyPct = canonicalRules ? canonicalRules.core.consistencyPct : model.consistencyRule.maxSingleDayPct;
  let consistencyCapDollars: number | undefined;
  let isPayoutEligible = true;
  let payoutBlockReason: string | undefined;

  const currentNetProfit = Math.max(0, currentEquity - accountSize);

  if (targetPayoutAmount > 0) {
    if (currentNetProfit < targetPayoutAmount) {
      isPayoutEligible = false;
      payoutBlockReason = `Current net profit ($${currentNetProfit.toLocaleString()}) is less than requested payout ($${targetPayoutAmount.toLocaleString()}).`;
    }

    if (hasConsistencyRule && consistencyPct) {
      consistencyCapDollars = (targetPayoutAmount * consistencyPct) / 100;
    }
  }

  if (floatingLossViolation) {
    isPayoutEligible = false;
    payoutBlockReason = `Floating loss violation: Current open loss ($${currentFloatingLoss.toLocaleString()}) exceeds the ${floatingLossPct}% cap ($${maxPermittedFloatingLossDollars?.toLocaleString()}).`;
  }

  // 7. Status classification
  let status: 'safe' | 'caution' | 'danger' = 'safe';
  if (floatingLossViolation || (hasDailyLossLimit && remainingDailyLossBuffer <= dollarRiskPerTrade) || remainingTotalDrawdownBuffer <= dollarRiskPerTrade) {
    status = 'danger';
  } else if ((hasDailyLossLimit && remainingDailyLossBuffer <= dollarRiskPerTrade * 2.5) || remainingTotalDrawdownBuffer <= dollarRiskPerTrade * 3) {
    status = 'caution';
  }

  // 8. Expectancy simulation over N trades
  const winRate = winRatePct / 100;
  const lossRate = 1 - winRate;
  const winAmount = dollarRiskPerTrade * riskRewardRatio;
  const lossAmount = dollarRiskPerTrade;
  const expectedValuePerTradeDollars = winRate * winAmount - lossRate * lossAmount;
  const projectedEquityAfterSimTrades = currentEquity + expectedValuePerTradeDollars * simulatedTradesCount;

  // 9. Explicit mathematical formulas for all 9 required items
  const formulas = {
    dailyLossBuffer: hasDailyLossLimit
      ? `Current Equity ($${currentEquity.toLocaleString()}) - Daily Floor ($${dailyFloor.toLocaleString()}) = $${remainingDailyLossBuffer.toLocaleString()} [Daily Loss: ${dailyLossPct}%]`
      : 'No Daily Loss Floor Enforced on Selected Model (Intraday Freedom)',
    totalDrawdownBuffer: `Current Equity ($${currentEquity.toLocaleString()}) - Total Loss Floor ($${totalDrawdownFloor.toLocaleString()}) = $${remainingTotalDrawdownBuffer.toLocaleString()} [Max DD: ${maxDDPct}%]`,
    floatingLossBuffer: floatingLossPct
      ? `Starting Capital ($${accountSize.toLocaleString()}) * Floating Cap (${floatingLossPct}%) - Open Loss ($${currentFloatingLoss.toLocaleString()}) = $${Math.max(0, (maxPermittedFloatingLossDollars || 0) - currentFloatingLoss).toLocaleString()}`
      : 'Standard SL Management (No Model Floating Cap)',
    profitTargetDistance: targetPct > 0
      ? `Target Equity ($${targetEquity.toLocaleString()}) - Current Equity ($${currentEquity.toLocaleString()}) = $${distanceToProfitTargetDollars.toLocaleString()}`
      : 'Direct Live Master — No Evaluation Profit Target',
    payoutEligibility: `Net Closed Profit ($${currentNetProfit.toLocaleString()}) >= Requested Payout ($${targetPayoutAmount.toLocaleString()}) AND Floating Open Loss ($${currentFloatingLoss.toLocaleString()}) <= Cap`,
    consistencyCap: hasConsistencyRule && consistencyPct
      ? `Requested Payout ($${targetPayoutAmount.toLocaleString()}) * Consistency Cap (${consistencyPct}%) = $${((targetPayoutAmount * consistencyPct) / 100).toLocaleString()} (Maximum Single-Day Profit Allowed)`
      : 'No Consistency Rule (0% Cap — Single Day 100% Withdrawable)',
    lossesRemaining: hasDailyLossLimit
      ? `Remaining Daily Buffer ($${remainingDailyLossBuffer.toLocaleString()}) / Risk Per Trade ($${dollarRiskPerTrade.toLocaleString()}) = ${consecutiveLossesBeforeDailyBreach} Losses`
      : `Remaining Total Buffer ($${remainingTotalDrawdownBuffer.toLocaleString()}) / Risk Per Trade ($${dollarRiskPerTrade.toLocaleString()}) = ${consecutiveLossesBeforeTotalBreach} Losses`,
    equityStatus: `Starting Capital ($${accountSize.toLocaleString()}) + Net Closed PnL ($${(currentEquity - accountSize).toLocaleString()}) = $${currentEquity.toLocaleString()}`,
    floatingLossStatus: floatingLossPct
      ? `Current Open Floating Loss ($${currentFloatingLoss.toLocaleString()}) vs Maximum Allowed ($${(maxPermittedFloatingLossDollars || 0).toLocaleString()})`
      : `Open Floating Loss: $${currentFloatingLoss.toLocaleString()} (Governed by Daily & Total Floors)`,
  };

  // 10. Summary sentence
  let summarySentence = '';
  if (status === 'danger') {
    summarySentence = `DANGER: Account is within 1 loss ($${dollarRiskPerTrade.toLocaleString()}) of breach floor! Adjust lot sizes immediately.`;
  } else if (status === 'caution') {
    summarySentence = `CAUTION: Account has ${consecutiveLossesBeforeDailyBreach} losses buffer remaining today before daily drawdown floor.`;
  } else {
    summarySentence = `SAFE: Healthy buffer of $${remainingDailyLossBuffer.toLocaleString()} daily and $${remainingTotalDrawdownBuffer.toLocaleString()} total drawdown remaining.`;
  }

  return {
    maxPermittedDailyLossDollars,
    remainingDailyLossBuffer,
    maxTotalDrawdownDollars,
    remainingTotalDrawdownBuffer,
    maxPermittedRiskPerTradeDollars: dollarRiskPerTrade,
    consecutiveLossesBeforeDailyBreach,
    consecutiveLossesBeforeTotalBreach,
    distanceToProfitTargetDollars,
    profitTargetReached,
    floatingLossViolation,
    maxPermittedFloatingLossDollars,
    consistencyCapDollars,
    isPayoutEligible,
    payoutBlockReason,
    status,
    expectedValuePerTradeDollars,
    projectedEquityAfterSimTrades,
    summarySentence,
    isDailyLossCalculable,
    hasDailyLossLimit,
    formulas,
  };
}
