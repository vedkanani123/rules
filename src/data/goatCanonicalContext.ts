/**
 * Single Canonical Rule Object Builder
 * 
 * Generates ONE unified, strictly synchronized rule object for the exact selected context:
 * - Category
 * - Model
 * - Account Size
 * - Stage
 * - Platform
 * - Purchase Date
 * - Terms Version
 * - Trading Style
 * 
 * All UI sections (Complete Rule Table, Rule Snapshot, Comparison Table, Risk Simulator,
 * Payout Calculator, Warnings, Reviews, Trust Center) read exclusively from this canonical
 * object to eliminate duplicate or contradictory data.
 */

import {
  GFTCategory,
  GFTModel,
  TradingPlatform,
  TradingStyle,
  VerificationStatus,
  GFT_CANONICAL_MODELS,
} from './goatCanonicalData.ts';

export interface ActiveSelectedContext {
  category: GFTCategory;
  modelId: string;
  accountSize: number;
  stage: 'all' | 'evaluation' | 'funded';
  platform: 'all' | TradingPlatform;
  purchaseDate: string;
  termsVersion: 'current_2026' | 'pre_aug_2026';
  tradingStyle: TradingStyle;
}

export interface RuleConflictDetails {
  hasConflict: boolean;
  currentSource: string;
  currentValue: string;
  alternativeSource: string;
  alternativeValue: string;
  difference: string;
  status: string;
  userAction: string;
}

export interface CanonicalRuleItemDetail {
  id: string;
  category:
    | 'account_structure'
    | 'profit_target'
    | 'daily_loss'
    | 'max_drawdown'
    | 'floating_loss'
    | 'payouts'
    | 'consistency'
    | 'restrictions'
    | 'instruments_leverage'
    | 'platform'
    | 'scaling'
    | 'breach_conditions'
    | 'legal_operational';
  categoryLabel: string;
  ruleName: string;
  exactValue: string;
  dollarValue: string;
  appliesTo: string;
  accountSize: number;
  stage: string;
  platform: string;
  termsVersion: string;
  effectiveDate: string;
  calculationBasis: string;
  plainEnglishExplanation: string;
  breachTrigger: string;
  example: string;
  verificationStatus: VerificationStatus;
  statusLabel: string;
  evidence: string;
  sourceDoc: string;
  sourceUrl: string;
  lastVerifiedDate: string;
  confidence: number;
  conflictStatus: RuleConflictDetails;
  hasCalculationAction?: boolean;
  calcInputs?: {
    formula: string;
    inputs: Record<string, string>;
    result: string;
    remainingBuffer?: string;
    breachPoint?: string;
    isEstimated: boolean;
  };
}

export interface CanonicalSelectedModelRules {
  context: ActiveSelectedContext;
  model: GFTModel;

  // Direct parameter snapshots for UI synchronization
  core: {
    modelName: string;
    categoryLabel: string;
    stageLabel: string;
    platformLabel: string;
    termsVersionLabel: string;
    nominalCapital: number;
    nominalCapitalFormatted: string;

    // Profit Target
    hasProfitTarget: boolean;
    targetPct: number;
    targetDollars: number;
    targetFormatted: string;
    targetDisplayString: string;

    // Daily Loss
    hasDailyLossLimit: boolean;
    dailyLossPct: number;
    dailyLossDollars: number;
    dailyLossFormatted: string;
    dailyLossBreachFloor: number;
    dailyLossBreachFloorFormatted: string;
    dailyLossResetTime: string;
    dailyLossIsGrandfathered: boolean;
    dailyLossHasConflict: boolean;
    dailyLossConflictDescription?: string;

    // Max Drawdown
    maxDDPct: number;
    maxDDDollars: number;
    maxDDFormatted: string;
    maxDDType: 'static' | 'trailing_eod' | 'trailing_intraday' | 'trailing_locked' | 'eod' | 'eod_trailing';
    maxDDTypeLabel: string;
    maxDDFloorDollars: number;
    maxDDFloorFormatted: string;

    // Floating Loss
    hasFloatingLossCap: boolean;
    floatingLossPct?: number;
    floatingLossDollars?: number;
    floatingLossFormatted: string;

    // Payout & Rewards
    baseProfitSplitPct: number;
    maxProfitSplitPct: number;
    payoutCycleDays: number;
    firstPayoutDays: number;
    minTradingDaysFunded: number;
    validDayThresholdDollars: number;
    validDayThresholdFormatted: string;
    dailyProfitCapFunded?: number;

    // Consistency
    hasConsistencyRule: boolean;
    consistencyPct?: number;
    consistencyFormatted: string;

    // Trading Style & Restrictions
    newsAllowed: boolean;
    newsProfitCapPct: number;
    weekendHoldingAllowed: boolean;
    eaAllowed: boolean;
    copyTradingScope: string;
    vpsAllowed: boolean;
    vpsPolicySummary: string;

    // Leverage & Refunds
    forexLeverage: string;
    refundableFee: boolean;
    refundConditions: string;
  };

  // Complete exhaustive list of categorized row items
  allRuleItems: CanonicalRuleItemDetail[];

  // Epistemic verification count breakdown across the 9 row-level statuses
  statusBreakdown: {
    officiallyVerifiedCount: number;
    officialAmbiguousCount: number;
    historicalCount: number;
    conflictingCount: number;
    thirdPartyReportCount: number;
    communityReportedCount: number;
    unverifiedCount: number;
    notApplicableCount: number;
    notAvailableCount: number;
    totalRulesCount: number;
  };
}

export function getStatusBadgeInfo(status: VerificationStatus): {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  switch (status) {
    case 'officially_verified':
      return {
        label: 'Officially Verified',
        bgClass: 'bg-emerald-500/10',
        textClass: 'text-emerald-400',
        borderClass: 'border-emerald-500/20',
      };
    case 'official_ambiguous':
      return {
        label: 'Official but Ambiguous',
        bgClass: 'bg-amber-500/10',
        textClass: 'text-amber-400',
        borderClass: 'border-amber-500/20',
      };
    case 'historical_rule':
      return {
        label: 'Historical / Grandfathered',
        bgClass: 'bg-purple-500/10',
        textClass: 'text-purple-300',
        borderClass: 'border-purple-500/20',
      };
    case 'conflicting_sources':
      return {
        label: 'Conflicting Sources',
        bgClass: 'bg-rose-500/10',
        textClass: 'text-rose-400',
        borderClass: 'border-rose-500/20',
      };
    case 'third_party_report':
      return {
        label: 'Third-Party Report',
        bgClass: 'bg-sky-500/10',
        textClass: 'text-sky-400',
        borderClass: 'border-sky-500/20',
      };
    case 'community_reported':
      return {
        label: 'Community-Reported',
        bgClass: 'bg-indigo-500/10',
        textClass: 'text-indigo-400',
        borderClass: 'border-indigo-500/20',
      };
    case 'unverified':
    case 'unverified_claim':
      return {
        label: 'Unverified',
        bgClass: 'bg-slate-500/10',
        textClass: 'text-slate-400',
        borderClass: 'border-slate-500/20',
      };
    case 'not_applicable':
      return {
        label: 'Not Applicable',
        bgClass: 'bg-slate-800/40',
        textClass: 'text-slate-400',
        borderClass: 'border-slate-700/40',
      };
    case 'not_available':
    default:
      return {
        label: 'Not Available',
        bgClass: 'bg-slate-800/40',
        textClass: 'text-slate-400',
        borderClass: 'border-slate-700/40',
      };
  }
}

/**
 * Single source of truth factory function.
 * Given an active context, produces the ONE synchronized CanonicalSelectedModelRules object.
 */
export function buildCanonicalSelectedRules(
  model: GFTModel,
  context: ActiveSelectedContext
): CanonicalSelectedModelRules {
  const { accountSize, stage, platform, termsVersion, tradingStyle } = context;
  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

  // Stage display label
  const stageLabel =
    stage === 'all'
      ? model.isEvaluation
        ? 'All Stages (Evaluation + Funded)'
        : 'Funded Live Stage'
      : stage === 'evaluation'
      ? 'Evaluation Stage'
      : 'Funded Master Stage';

  const platformLabel = platform === 'all' ? 'All Platforms' : platform.toUpperCase();
  const termsVersionLabel =
    termsVersion === 'current_2026' ? 'Current Terms (Sept 2026)' : 'Pre-Aug 2026 (Grandfathered)';

  // 1. Profit Target resolution
  const hasProfitTarget = model.isEvaluation && (model.targetsByStage.phase1 || 0) > 0;
  const targetPct = hasProfitTarget ? model.targetsByStage.phase1 || 0 : 0;
  const targetDollars = (accountSize * targetPct) / 100;
  const targetFormatted = hasProfitTarget ? `+${targetPct}% (+${fmt(targetDollars)})` : 'Profit target not applicable.';
  const targetDisplayString = hasProfitTarget ? `+${targetPct}%` : 'Not Applicable';

  // 2. Daily Loss resolution (Handling 1-Step Fast & Historical cutoffs)
  let dailyLossPct = model.dailyLossLimit.pct;
  let dailyLossIsGrandfathered = false;
  let dailyLossHasConflict = false;
  let dailyLossConflictDescription: string | undefined;

  if (model.id === 'one_step') {
    dailyLossHasConflict = true;
    if (termsVersion === 'pre_aug_2026') {
      dailyLossPct = 4;
      dailyLossIsGrandfathered = true;
      dailyLossConflictDescription =
        'Historical grandfathered terms: 4% daily loss applies to accounts purchased before August 1, 2026.';
    } else {
      dailyLossPct = 3;
      dailyLossIsGrandfathered = false;
      dailyLossConflictDescription =
        'Current verified terms: 3% daily loss applies to all 1-Step accounts purchased from August 1, 2026 onwards.';
    }
  }

  // Pay Later challenge phase has 0% daily DD; in funded stage it has 3%
  if (model.id === 'pay_after_pass') {
    if (stage === 'funded') {
      dailyLossPct = 3;
    } else if (stage === 'evaluation') {
      dailyLossPct = 0;
    } else {
      dailyLossPct = 0; // default view emphasizes eval 0%
    }
  }

  const hasDailyLossLimit = dailyLossPct > 0;
  const dailyLossDollars = (accountSize * dailyLossPct) / 100;
  const dailyLossFormatted = hasDailyLossLimit
    ? `${dailyLossPct}% (-${fmt(dailyLossDollars)} / day)`
    : 'No daily loss limit verified.';
  const dailyLossBreachFloor = hasDailyLossLimit ? accountSize - dailyLossDollars : 0;
  const dailyLossBreachFloorFormatted = hasDailyLossLimit ? fmt(dailyLossBreachFloor) : 'No Daily Floor';

  // 3. Max Drawdown resolution
  const maxDDPct = model.maxDrawdown.pct;
  const maxDDDollars = (accountSize * maxDDPct) / 100;
  const maxDDFormatted = `${maxDDPct}% (-${fmt(maxDDDollars)} buffer)`;
  const maxDDType = model.maxDrawdown.type;
  const maxDDTypeLabel =
    maxDDType === 'static'
      ? 'Permanent Static Floor'
      : maxDDType === 'trailing_locked'
      ? 'Trailing Floor (Locks at Initial Capital)'
      : 'Trailing Floor';
  const maxDDFloorDollars = accountSize - maxDDDollars;
  const maxDDFloorFormatted = fmt(maxDDFloorDollars);

  // 4. Floating Loss resolution
  let floatingLossPct = model.floatingLossCapPct;
  let floatingLossHasConflict = false;
  let floatingLossConflictDesc = '';

  if (model.id === 'instant_premium') {
    floatingLossHasConflict = true;
    if (termsVersion === 'pre_aug_2026') {
      floatingLossPct = 1.5;
      floatingLossConflictDesc = 'Prior terms allowed 1.5% floating loss; tightened to 1.0% on Sept 2, 2026.';
    } else {
      floatingLossPct = 1.0;
      floatingLossConflictDesc = 'Current terms: strictly 1.0% maximum open floating loss.';
    }
  }

  const hasFloatingLossCap = Boolean(floatingLossPct);
  const floatingLossDollars = floatingLossPct ? (accountSize * floatingLossPct) / 100 : undefined;
  const floatingLossFormatted = hasFloatingLossCap
    ? `${floatingLossPct}% (-${fmt(floatingLossDollars || 0)} max open loss)`
    : 'No Floating Cap (Standard SL)';

  // 5. Valid Days
  const validDayThresholdDollars = (accountSize * model.validDayThresholdPct) / 100;
  const validDayThresholdFormatted = `≥${fmt(validDayThresholdDollars)} profit/day`;

  // 6. Consistency
  const hasConsistencyRule = model.consistencyRule.active;
  const consistencyPct = model.consistencyRule.maxSingleDayPct;
  const consistencyFormatted = hasConsistencyRule
    ? `${consistencyPct}% Single-Day Cap (Withdrawal Pause Only)`
    : '0% (No Consistency Rule)';

  // 7. VPS Rule
  const vpsAllowed = model.allowedStyles.vpsAllowed;
  const vpsPolicySummary = vpsAllowed
    ? 'VPS permitted with dedicated static residential IP'
    : 'Data-center VPS & VPN prohibited (Aug 12, 2026 Directive)';

  // ── Construct Exhaustive Row Items with Row-Level Status ──
  const allRuleItems: CanonicalRuleItemDetail[] = [];

  const defaultConflict: RuleConflictDetails = {
    hasConflict: false,
    currentSource: '',
    currentValue: '',
    alternativeSource: '',
    alternativeValue: '',
    difference: '',
    status: '',
    userAction: '',
  };

  // 1. Account Structure
  allRuleItems.push({
    id: 'acc-model-name',
    category: 'account_structure',
    categoryLabel: '1. Account & Evaluation Structure',
    ruleName: 'Model Identity & Catalog Classification',
    exactValue: model.name,
    dollarValue: fmt(accountSize),
    appliesTo: 'All account accounts under this model',
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: model.purchaseDateApplicability,
    calculationBasis: 'Catalog category designation',
    plainEnglishExplanation: `${model.name} operates under the ${model.categoryLabel} product family.`,
    breachTrigger: 'Not applicable — informational account identity.',
    example: `Selecting ${model.name} with ${fmt(accountSize)} capital applies specific drawdown rules.`,
    verificationStatus: 'officially_verified',
    statusLabel: 'Officially Verified',
    evidence: model.sourceDoc,
    sourceDoc: model.sourceDoc,
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    confidence: model.confidenceScore,
    conflictStatus: defaultConflict,
  });

  allRuleItems.push({
    id: 'acc-evaluation-type',
    category: 'account_structure',
    categoryLabel: '1. Account & Evaluation Structure',
    ruleName: 'Funding / Evaluation Structure',
    exactValue: model.isEvaluation
      ? `${model.stagesCount - 1}-Phase Evaluation Challenge`
      : 'Direct Instant Simulated Live Capital (No Evaluation)',
    dollarValue: model.isEvaluation ? `Phase 1 Target: ${targetFormatted}` : 'Immediate Live Payout Eligibility',
    appliesTo: stageLabel,
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'Active',
    calculationBasis: model.isEvaluation ? `${model.stagesCount - 1} Target Phases` : 'Immediate contract activation',
    plainEnglishExplanation: model.isEvaluation
      ? `Traders must successfully reach the profit target in ${model.stagesCount - 1} phase(s) without violating daily or maximum drawdown floors to advance.`
      : 'Direct live simulated account access upon purchase. No challenge phase required before payout qualification.',
    breachTrigger: model.isEvaluation
      ? 'Violating daily loss or total drawdown resets phase progress.'
      : 'Violating drawdown floors terminates the live simulated contract.',
    example: model.isEvaluation
      ? 'Pass Phase 1 target and advance to funded contract.'
      : 'Trade immediately towards the first payout window.',
    verificationStatus: 'officially_verified',
    statusLabel: 'Officially Verified',
    evidence: model.sourceDoc,
    sourceDoc: model.sourceDoc,
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    confidence: 96,
    conflictStatus: defaultConflict,
  });

  allRuleItems.push({
    id: 'acc-starting-capital',
    category: 'account_structure',
    categoryLabel: '1. Account & Evaluation Structure',
    ruleName: 'Nominal Account Starting Balance',
    exactValue: fmt(accountSize),
    dollarValue: fmt(accountSize),
    appliesTo: 'Base account balance',
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'Active',
    calculationBasis: 'Account capital tier chosen at checkout',
    plainEnglishExplanation: `Baseline account capital is ${fmt(accountSize)}. All drawdown thresholds scale strictly from this capital size.`,
    breachTrigger: 'All loss floors and target dollar levels are derived from this capital amount.',
    example: `On a ${fmt(accountSize)} account, a 4% loss is -$${((accountSize * 0.04)).toLocaleString()}; on $50,000 it is -$2,000.`,
    verificationStatus: 'officially_verified',
    statusLabel: 'Officially Verified',
    evidence: 'GFT Catalog Pricing Matrix',
    sourceDoc: 'GFT Catalog Pricing Matrix',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    confidence: 98,
    conflictStatus: defaultConflict,
  });

  allRuleItems.push({
    id: 'acc-trading-days',
    category: 'account_structure',
    categoryLabel: '1. Account & Evaluation Structure',
    ruleName: 'Minimum Valid Trading Days',
    exactValue: model.isEvaluation
      ? `Eval: ${model.minTradingDaysEval} Days | Funded: ${model.minTradingDaysFunded} Valid Days`
      : `Funded: ${model.minTradingDaysFunded} Valid Days`,
    dollarValue: validDayThresholdFormatted,
    appliesTo: stageLabel,
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'Active',
    calculationBasis: `Valid Day Threshold = ${fmt(accountSize)} * ${model.validDayThresholdPct}% = ${fmt(validDayThresholdDollars)}`,
    plainEnglishExplanation: `Must trade at least ${model.minTradingDaysFunded} days where net closed profit is ≥${model.validDayThresholdPct}% of starting capital (${validDayThresholdFormatted}). Micro-lot or token trades do not satisfy this requirement.`,
    breachTrigger: 'Advancement or payout request is delayed until required valid days are logged. Never breaches the account.',
    example: `On ${fmt(accountSize)}, a trading day with $100 profit does not count if the threshold is $500.`,
    verificationStatus: 'officially_verified',
    statusLabel: 'Officially Verified',
    evidence: 'GFT FAQ 14190822',
    sourceDoc: 'GFT FAQ 14190822',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-09-02',
    confidence: 95,
    conflictStatus: defaultConflict,
  });

  allRuleItems.push({
    id: 'acc-inactivity-policy',
    category: 'account_structure',
    categoryLabel: '1. Account & Evaluation Structure',
    ruleName: '30-Day Inactivity Soft Breach Rule',
    exactValue: '30 Calendar Days Without Trade',
    dollarValue: 'Soft lock — Reactivatable via ticket',
    appliesTo: 'All non-active accounts',
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'Active',
    calculationBasis: 'Timestamp of last opened or closed position',
    plainEnglishExplanation: 'If no trades are executed for 30 consecutive calendar days, the account is placed on soft-lock status. The account is NOT terminated; a support ticket can reactivate credentials.',
    breachTrigger: '30 consecutive days of inactivity locks account access.',
    example: 'Placing a 0.01 lot trade every 25 days prevents inactivity lock.',
    verificationStatus: 'officially_verified',
    statusLabel: 'Officially Verified',
    evidence: 'GFT Trading Terms Clause 8.2',
    sourceDoc: 'GFT Trading Terms Clause 8.2',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-08-20',
    confidence: 95,
    conflictStatus: defaultConflict,
  });

  // 2. Profit Target Requirements
  allRuleItems.push({
    id: 'target-phase-1',
    category: 'profit_target',
    categoryLabel: '2. Profit Target Requirements',
    ruleName: 'Phase 1 Profit Target',
    exactValue: hasProfitTarget ? `+${targetPct}%` : 'Profit target not applicable.',
    dollarValue: hasProfitTarget ? `+${fmt(targetDollars)}` : '$0 (Direct Live)',
    appliesTo: model.isEvaluation ? 'Phase 1 Evaluation' : 'Direct Live Stage',
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'Active',
    calculationBasis: hasProfitTarget
      ? `Target Equity = Starting Capital + (${fmt(accountSize)} * ${targetPct}%) = ${fmt(accountSize + targetDollars)}`
      : 'No profit target enforced',
    plainEnglishExplanation: hasProfitTarget
      ? `Must reach a net closed profit of +${targetPct}% (+${fmt(targetDollars)}) with all open orders closed to pass Phase 1.`
      : 'Direct live master account. There is no evaluation profit target; profits are withdrawable after the payout cycle.',
    breachTrigger: hasProfitTarget ? 'Phase remains active until target equity is closed.' : 'Not applicable.',
    example: hasProfitTarget
      ? `Reaching $${(accountSize + targetDollars).toLocaleString()} closed equity passes Phase 1.`
      : 'All profits can be requested on payout day.',
    verificationStatus: hasProfitTarget ? 'officially_verified' : 'not_applicable',
    statusLabel: hasProfitTarget ? 'Officially Verified' : 'Not Applicable',
    evidence: model.sourceDoc,
    sourceDoc: model.sourceDoc,
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    confidence: 96,
    conflictStatus: defaultConflict,
    hasCalculationAction: hasProfitTarget,
    calcInputs: hasProfitTarget
      ? {
          formula: 'Target Equity = Starting Capital + (Starting Capital * Target %)',
          inputs: { 'Starting Capital': fmt(accountSize), 'Target %': `+${targetPct}%` },
          result: fmt(accountSize + targetDollars),
          breachPoint: 'N/A (Goal Target)',
          isEstimated: false,
        }
      : undefined,
  });

  const p2Target = model.targetsByStage.phase2;
  const hasP2 = Boolean(p2Target && p2Target > 0);
  const p2TargetDollars = hasP2 ? (accountSize * (p2Target || 0)) / 100 : 0;
  allRuleItems.push({
    id: 'target-phase-2',
    category: 'profit_target',
    categoryLabel: '2. Profit Target Requirements',
    ruleName: 'Phase 2 Profit Target',
    exactValue: hasP2 ? `+${p2Target}%` : 'Not Applicable (1-Phase or Instant)',
    dollarValue: hasP2 ? `+${fmt(p2TargetDollars)}` : 'Not Applicable',
    appliesTo: hasP2 ? 'Phase 2 Evaluation' : 'Not Applicable',
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'Active',
    calculationBasis: hasP2
      ? `Target Equity = Starting Capital + (${fmt(accountSize)} * ${p2Target}%) = ${fmt(accountSize + p2TargetDollars)}`
      : 'Not applicable for this model',
    plainEnglishExplanation: hasP2
      ? `Must reach a net closed profit of +${p2Target}% (+${fmt(p2TargetDollars)}) in Phase 2.`
      : 'This account model does not have a Phase 2 challenge stage.',
    breachTrigger: hasP2 ? 'Phase remains open until target equity is reached.' : 'Not applicable.',
    example: hasP2 ? `Reaching +${fmt(p2TargetDollars)} in Phase 2 advances to funded stage.` : 'Not applicable.',
    verificationStatus: hasP2 ? 'officially_verified' : 'not_applicable',
    statusLabel: hasP2 ? 'Officially Verified' : 'Not Applicable',
    evidence: model.sourceDoc,
    sourceDoc: model.sourceDoc,
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: model.lastVerifiedDate,
    confidence: 96,
    conflictStatus: defaultConflict,
  });

  allRuleItems.push({
    id: 'target-funded-stage',
    category: 'profit_target',
    categoryLabel: '2. Profit Target Requirements',
    ruleName: 'Funded Master Profit Ceiling',
    exactValue: 'No Profit Cap / Ceiling',
    dollarValue: 'Unlimited Profit Potential',
    appliesTo: 'Funded Master Accounts',
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'Active',
    calculationBasis: 'Full net closed profit eligible for payout split',
    plainEnglishExplanation: 'Once funded, there is no maximum profit ceiling. Traders can generate and withdraw any amount compliant with risk rules and consistency caps.',
    breachTrigger: 'None.',
    example: 'Generating 15% profit on a funded account allows requesting the trader share on the payout date.',
    verificationStatus: 'officially_verified',
    statusLabel: 'Officially Verified',
    evidence: 'GFT Funded Trader FAQ',
    sourceDoc: 'GFT Funded Trader FAQ',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-09-01',
    confidence: 96,
    conflictStatus: defaultConflict,
  });

  // 3. Daily Loss Limit Mechanics
  const dailyLossConflict: RuleConflictDetails = model.id === 'one_step'
    ? {
        hasConflict: true,
        currentSource: '3% daily loss limit (accounts purchased from August 1, 2026 onwards)',
        currentValue: '3% daily loss (-$3,000 on $100k)',
        alternativeSource: '4% daily loss limit (accounts purchased prior to August 1, 2026)',
        alternativeValue: '4% daily loss (-$4,000 on $100k)',
        difference: 'Goat Funded Trader tightened the 1-Step daily loss limit from 4% to 3% effective August 1, 2026. Pre-existing accounts remain grandfathered at 4%.',
        status: 'Conflicting Sources / Date Cutoff',
        userAction: 'Confirm your exact account purchase date in the Goat client dashboard before setting daily stop losses.',
      }
    : defaultConflict;

  const dailyStatus: VerificationStatus =
    model.id === 'one_step'
      ? termsVersion === 'pre_aug_2026'
        ? 'historical_rule'
        : 'officially_verified'
      : hasDailyLossLimit
      ? 'officially_verified'
      : 'officially_verified';

  const dailyStatusLabel: string =
    model.id === 'one_step'
      ? termsVersion === 'pre_aug_2026'
        ? 'Historical / Grandfathered'
        : 'Officially Verified'
      : hasDailyLossLimit
      ? 'Officially Verified'
      : 'Officially Verified';

  allRuleItems.push({
    id: 'daily-loss-rule',
    category: 'daily_loss',
    categoryLabel: '3. Daily Loss Limit Mechanics',
    ruleName: 'Daily Loss Limit & Breach Floor',
    exactValue: dailyLossFormatted,
    dollarValue: hasDailyLossLimit ? `-$${dailyLossDollars.toLocaleString()} / day` : 'No Daily Floor',
    appliesTo: stageLabel,
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate:
      model.id === 'one_step'
        ? termsVersion === 'pre_aug_2026'
          ? 'Pre-August 1, 2026 (Grandfathered)'
          : 'August 1, 2026 (Active)'
        : 'Active',
    calculationBasis: hasDailyLossLimit
      ? `Daily Floor = 5 PM EST Rollover Balance - (${fmt(accountSize)} * ${dailyLossPct}%) = ${fmt(dailyLossBreachFloor)}`
      : 'No daily loss limit enforced on this model',
    plainEnglishExplanation: hasDailyLossLimit
      ? `Daily loss limit is ${dailyLossPct}% (-${fmt(dailyLossDollars)}). Resets daily at 5:00 PM EST (00:00 server). Calculated from starting balance at 5 PM EST rollover.`
      : `${model.name} has NO daily drawdown limit! Intraday equity pullbacks will never breach the account. Only total max drawdown applies.`,
    breachTrigger: hasDailyLossLimit
      ? `If floating equity touches ${fmt(dailyLossBreachFloor)} during active trading, account is closed immediately.`
      : 'No breach possible on intraday daily swings.',
    example: hasDailyLossLimit
      ? `On ${fmt(accountSize)}, losing -$${(dailyLossDollars + 50).toLocaleString()} during one day breaches the account.`
      : 'Losing 3% intraday does not breach Instant PRO as long as total drawdown is safe.',
    verificationStatus: dailyStatus,
    statusLabel: dailyStatusLabel,
    evidence: model.sourceDoc,
    sourceDoc: model.sourceDoc,
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-09-02',
    confidence: 94,
    conflictStatus: dailyLossConflict,
    hasCalculationAction: hasDailyLossLimit,
    calcInputs: hasDailyLossLimit
      ? {
          formula: 'Daily Breach Floor = 5 PM EST Rollover Balance - (Starting Capital * Daily Loss %)',
          inputs: {
            'Starting Capital': fmt(accountSize),
            'Daily Loss %': `${dailyLossPct}%`,
            'Daily Loss Amount': fmt(dailyLossDollars),
            'Reset Time': '5:00 PM EST / 00:00 Server',
          },
          result: fmt(dailyLossBreachFloor),
          remainingBuffer: fmt(dailyLossDollars),
          breachPoint: fmt(dailyLossBreachFloor),
          isEstimated: false,
        }
      : undefined,
  });

  allRuleItems.push({
    id: 'daily-loss-reset-timing',
    category: 'daily_loss',
    categoryLabel: '3. Daily Loss Limit Mechanics',
    ruleName: 'Daily Reset Time & Balance Snapshot',
    exactValue: '5:00 PM EST (00:00 Server Time)',
    dollarValue: 'Resets daily balance benchmark',
    appliesTo: 'All models with daily loss limits',
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'Active',
    calculationBasis: 'Automated server time snapshot',
    plainEnglishExplanation: 'The daily loss limit resets precisely at 5:00 PM EST (New York close). The balance at this exact second becomes the benchmark for the next trading day’s daily loss floor.',
    breachTrigger: 'Floating loss carried through rollover counts towards the new day’s loss floor.',
    example: 'Holding open floating losses at 4:59 PM EST into 5:01 PM EST consumes part of the next day’s buffer.',
    verificationStatus: 'officially_verified',
    statusLabel: 'Officially Verified',
    evidence: 'GFT Rollover Policy FAQ',
    sourceDoc: 'GFT Rollover Policy FAQ',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-09-01',
    confidence: 96,
    conflictStatus: defaultConflict,
  });

  // 4. Maximum Drawdown Engine
  allRuleItems.push({
    id: 'max-drawdown-rule',
    category: 'max_drawdown',
    categoryLabel: '4. Maximum Drawdown Engine',
    ruleName: 'Maximum Drawdown Floor & Type',
    exactValue: `${maxDDPct}% ${maxDDTypeLabel}`,
    dollarValue: `-$${maxDDDollars.toLocaleString()} Max Buffer`,
    appliesTo: stageLabel,
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'Active',
    calculationBasis:
      maxDDType === 'static'
        ? `Static Floor = ${fmt(accountSize)} - (${fmt(accountSize)} * ${maxDDPct}%) = ${fmt(maxDDFloorDollars)}`
        : `Trailing Floor = High-Water Mark - (${fmt(accountSize)} * ${maxDDPct}%). Locks at ${fmt(accountSize)}`,
    plainEnglishExplanation:
      maxDDType === 'static'
        ? `Permanent Static Floor: Stays fixed forever at ${fmt(maxDDFloorDollars)} regardless of profits.`
        : `Trailing Drawdown: Starts at ${fmt(maxDDFloorDollars)} and trails high-water equity until locking at starting capital (${fmt(accountSize)}).`,
    breachTrigger: `If equity touches ${fmt(maxDDFloorDollars)}, account is liquidated immediately.`,
    example: `On ${fmt(accountSize)} with ${maxDDPct}% drawdown, dropping to ${fmt(maxDDFloorDollars)} breaches the account.`,
    verificationStatus: 'officially_verified',
    statusLabel: 'Officially Verified',
    evidence: 'GFT FAQ 10742114',
    sourceDoc: 'GFT FAQ 10742114',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-09-02',
    confidence: 98,
    conflictStatus: defaultConflict,
    hasCalculationAction: true,
    calcInputs: {
      formula:
        maxDDType === 'static'
          ? 'Static Floor = Starting Capital - (Starting Capital * Max DD %)'
          : 'Trailing Floor = High-Water Mark - (Starting Capital * Max DD %)',
      inputs: {
        'Initial Capital': fmt(accountSize),
        'Max Drawdown %': `${maxDDPct}%`,
        'Allowed Total Loss': fmt(maxDDDollars),
        'Floor Mechanics': maxDDTypeLabel,
      },
      result: fmt(maxDDFloorDollars),
      remainingBuffer: fmt(maxDDDollars),
      breachPoint: fmt(maxDDFloorDollars),
      isEstimated: false,
    },
  });

  allRuleItems.push({
    id: 'max-drawdown-locking',
    category: 'max_drawdown',
    categoryLabel: '4. Maximum Drawdown Engine',
    ruleName: 'Trailing Drawdown Lock at Starting Capital',
    exactValue: maxDDType === 'trailing_locked' ? `Locks at ${fmt(accountSize)}` : maxDDType === 'static' ? 'Static (Never Trails)' : 'Continuous Trailing',
    dollarValue: maxDDType === 'trailing_locked' ? `Floor stops at ${fmt(accountSize)}` : 'N/A',
    appliesTo: stageLabel,
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'Active',
    calculationBasis: 'High-water equity threshold tracking',
    plainEnglishExplanation: maxDDType === 'trailing_locked'
      ? `Once closed equity reaches ${fmt(accountSize + maxDDDollars)}, the trailing floor locks permanently at starting capital (${fmt(accountSize)}). It will never trail higher into your profits.`
      : maxDDType === 'static'
      ? 'Static accounts never trail up. Profits are 100% secured as additional drawdown buffer.'
      : 'Drawdown trails high-water equity.',
    breachTrigger: 'Touching the locked floor terminates the contract.',
    example: `Once account reaches ${fmt(accountSize + maxDDDollars)}, the loss floor stays at ${fmt(accountSize)} forever.`,
    verificationStatus: 'officially_verified',
    statusLabel: 'Officially Verified',
    evidence: 'GFT Trailing Rule Addendum',
    sourceDoc: 'GFT Trailing Rule Addendum',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-09-01',
    confidence: 96,
    conflictStatus: defaultConflict,
  });

  // 5. Floating Loss Risk Engine
  const floatingConflict: RuleConflictDetails = model.id === 'instant_premium'
    ? {
        hasConflict: true,
        currentSource: '1.0% floating loss limit (enforced from September 2, 2026)',
        currentValue: '1.0% max floating open loss',
        alternativeSource: '1.5% floating loss limit (prior terms)',
        alternativeValue: '1.5% max floating open loss',
        difference: 'GFT tightened the Instant Premium open floating loss cap from 1.5% to 1.0% on September 2, 2026.',
        status: 'Conflicting Sources / Revised Term',
        userAction: 'Set stop losses strictly within 0.8% to leave buffer for spread widening.',
      }
    : defaultConflict;

  const floatingStatus: VerificationStatus =
    model.id === 'instant_premium'
      ? termsVersion === 'pre_aug_2026'
        ? 'historical_rule'
        : 'officially_verified'
      : hasFloatingLossCap
      ? 'officially_verified'
      : 'not_applicable';

  const floatingStatusLabel: string =
    model.id === 'instant_premium'
      ? termsVersion === 'pre_aug_2026'
        ? 'Historical / Grandfathered'
        : 'Officially Verified'
      : hasFloatingLossCap
      ? 'Officially Verified'
      : 'Not Applicable';

  allRuleItems.push({
    id: 'floating-loss-rule',
    category: 'floating_loss',
    categoryLabel: '5. Floating Loss Risk Engine',
    ruleName: 'Maximum Floating Unrealized Open Loss',
    exactValue: floatingLossFormatted,
    dollarValue: hasFloatingLossCap ? `-$${((accountSize * (floatingLossPct || 0)) / 100).toLocaleString()}` : 'Not Applicable',
    appliesTo: hasFloatingLossCap ? 'Funded Live Accounts' : 'Not Applicable',
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate:
      model.id === 'instant_premium'
        ? termsVersion === 'pre_aug_2026'
          ? 'Prior to September 2, 2026'
          : 'September 2, 2026 (Active)'
        : 'Active',
    calculationBasis: hasFloatingLossCap
      ? `Max Open Loss = ${fmt(accountSize)} * ${floatingLossPct}% = -$${((accountSize * (floatingLossPct || 0)) / 100).toLocaleString()}`
      : 'No floating loss cap enforced',
    plainEnglishExplanation: hasFloatingLossCap
      ? `On ${model.name}, the aggregate floating unrealized loss across all open trades must NEVER exceed ${floatingLossPct}% of starting capital (-$${((accountSize * (floatingLossPct || 0)) / 100).toLocaleString()}) at any moment.`
      : 'Standard evaluation models do not enforce a floating loss rule; standard stop-loss management applies.',
    breachTrigger: hasFloatingLossCap
      ? `Touching -$${((accountSize * (floatingLossPct || 0)) / 100 + 1).toLocaleString()} floating loss for even 1 second triggers immediate liquidation or account breach.`
      : 'None.',
    example: hasFloatingLossCap
      ? `On ${fmt(accountSize)}, holding open positions down -$${((accountSize * (floatingLossPct || 0)) / 100 + 10).toLocaleString()} breaches the account immediately.`
      : 'Positions can float down to the daily loss limit.',
    verificationStatus: floatingStatus,
    statusLabel: floatingStatusLabel,
    evidence: 'GFT Instant Risk FAQ',
    sourceDoc: 'GFT Instant Risk FAQ',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-09-02',
    confidence: 94,
    conflictStatus: floatingConflict,
    hasCalculationAction: hasFloatingLossCap,
    calcInputs: hasFloatingLossCap
      ? {
          formula: 'Max Floating Loss = Starting Capital * Floating Loss %',
          inputs: {
            'Starting Capital': fmt(accountSize),
            'Floating Loss %': `${floatingLossPct}%`,
          },
          result: `-$${((accountSize * (floatingLossPct || 0)) / 100).toLocaleString()}`,
          breachPoint: `Open loss exceeding -$${((accountSize * (floatingLossPct || 0)) / 100).toLocaleString()}`,
          isEstimated: false,
        }
      : undefined,
  });

  // 6. Payout & Reward Structure
  allRuleItems.push({
    id: 'payout-cycle-rule',
    category: 'payouts',
    categoryLabel: '6. Payout & Reward Structure',
    ruleName: 'Reward Cycle & Base Profit Split',
    exactValue: `${model.profitSplit.basePct}% Base Split · Every ${model.profitSplit.payoutCycleDays} Days`,
    dollarValue: `Trader keeps ${model.profitSplit.basePct}% of net gains`,
    appliesTo: 'Funded Master Stage',
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'Active',
    calculationBasis: `Trader Payout = Net Approved Profit * ${model.profitSplit.basePct}%`,
    plainEnglishExplanation: `First payout request is eligible ${model.profitSplit.firstPayoutDays} days after first funded trade. Subsequent payouts occur every ${model.profitSplit.payoutCycleDays} calendar days. Base profit split is ${model.profitSplit.basePct}%.`,
    breachTrigger: 'Requesting payout before cycle elapses displays a locked timer in dashboard.',
    example: `On a $10,000 profit month, trader receives $${((10000 * model.profitSplit.basePct) / 100).toLocaleString()}.`,
    verificationStatus: 'officially_verified',
    statusLabel: 'Officially Verified',
    evidence: 'GFT Reward Terms',
    sourceDoc: 'GFT Reward Terms',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-09-01',
    confidence: 96,
    conflictStatus: defaultConflict,
  });

  allRuleItems.push({
    id: 'payout-sla-guarantee',
    category: 'payouts',
    categoryLabel: '6. Payout & Reward Structure',
    ruleName: '48-Hour SLA Payout Policy ($1,000 Compensation)',
    exactValue: '2 Business Days SLA ($1,000 Bonus if Breached)',
    dollarValue: '+$1,000 delay compensation',
    appliesTo: 'Approved Payout Requests',
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'Active',
    calculationBasis: '48 business hours from compliant submission',
    plainEnglishExplanation: 'GFT guarantees processing of compliant payout requests within 48 business hours. If delayed due to internal operational delay, GFT adds a $1,000 compensation bonus.',
    breachTrigger: 'Does not apply if trader has pending KYC, open trades, or rule inquiries.',
    example: 'Payout submitted Monday 9 AM processed by Wednesday 9 AM.',
    verificationStatus: 'officially_verified',
    statusLabel: 'Officially Verified',
    evidence: 'GFT Payout Policy SLA Document',
    sourceDoc: 'GFT Payout Policy SLA Document',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-09-01',
    confidence: 92,
    conflictStatus: defaultConflict,
  });

  allRuleItems.push({
    id: 'payout-min-withdrawal',
    category: 'payouts',
    categoryLabel: '6. Payout & Reward Structure',
    ruleName: 'Minimum Payout Withdrawal Threshold',
    exactValue: '$100 Net Trader Share',
    dollarValue: '$100 Minimum',
    appliesTo: 'Funded Master Accounts',
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'Active',
    calculationBasis: 'Net closed profit after profit split application',
    plainEnglishExplanation: 'The minimum net withdrawable trader share is $100. Payout amounts below $100 roll over automatically to the next payout cycle.',
    breachTrigger: 'Requests under $100 cannot be submitted in client portal.',
    example: '$80 profit cannot be withdrawn; rolls over until next cycle.',
    verificationStatus: 'officially_verified',
    statusLabel: 'Officially Verified',
    evidence: 'GFT Withdrawal Guide',
    sourceDoc: 'GFT Withdrawal Guide',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-08-15',
    confidence: 96,
    conflictStatus: defaultConflict,
  });

  // 7. Consistency Rules
  allRuleItems.push({
    id: 'consistency-rule',
    category: 'consistency',
    categoryLabel: '7. Consistency Rules',
    ruleName: 'Single-Day Consistency Cap',
    exactValue: consistencyFormatted,
    dollarValue: hasConsistencyRule ? `Max single day = ${consistencyPct}% of requested payout` : 'Full freedom (0% Cap)',
    appliesTo: hasConsistencyRule ? 'Funded Payout Requests' : 'All Stages',
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'Active',
    calculationBasis: hasConsistencyRule
      ? `Max Best Day = Requested Payout * ${consistencyPct}%`
      : 'No consistency formula',
    plainEnglishExplanation: hasConsistencyRule
      ? `Your most profitable day cannot exceed ${consistencyPct}% of requested payout. CRITICAL: Violating consistency NEVER breaches the account; your withdrawal is simply paused until balanced.`
      : `${model.name} has ZERO consistency rule! Profits from a single trading session can be 100% withdrawn.`,
    breachTrigger: hasConsistencyRule
      ? 'If best day represents >20%, trade additional days to balance ratio before withdrawal.'
      : 'None.',
    example: hasConsistencyRule
      ? 'If requesting $5,000 payout, no single day can have >$1,000 profit.'
      : 'Earn $10,000 in one day and withdraw the entire amount.',
    verificationStatus: 'officially_verified',
    statusLabel: hasConsistencyRule ? 'Withdrawal Pause Only' : 'Officially Verified',
    evidence: 'GFT FAQ 15290379',
    sourceDoc: 'GFT FAQ 15290379',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-09-02',
    confidence: 96,
    conflictStatus: defaultConflict,
  });

  // 8. Trading Restrictions & Guardrails
  allRuleItems.push({
    id: 'restrictions-news-trading',
    category: 'restrictions',
    categoryLabel: '8. Trading Restrictions & Guardrails',
    ruleName: 'News Trading & Red Folder 1% Profit Cap',
    exactValue: 'Allowed (1% Profit Cap on Red Folders on Funded)',
    dollarValue: `Max credited news gain: $${((accountSize * 0.01)).toLocaleString()}`,
    appliesTo: 'Funded Master Accounts',
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'Active',
    calculationBasis: `Credited Profit = Min(Actual Profit, ${fmt(accountSize)} * 1%)`,
    plainEnglishExplanation: 'News trading is permitted. However, on funded accounts, any profit generated from positions opened or closed within ±5 minutes of high-impact news (red folder) is capped at 1% of account size.',
    breachTrigger: `Excess news profit above $${((accountSize * 0.01)).toLocaleString()} is deducted during payout review; account is NOT breached.`,
    example: `Making $4,000 on NFP on a ${fmt(accountSize)} funded account credits $1,000; excess $3,000 is removed during payout review.`,
    verificationStatus: 'officially_verified',
    statusLabel: 'Important Guardrail',
    evidence: 'GFT News Policy FAQ 11849204',
    sourceDoc: 'GFT News Policy FAQ 11849204',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-09-01',
    confidence: 95,
    conflictStatus: defaultConflict,
  });

  allRuleItems.push({
    id: 'restrictions-vps-vpn',
    category: 'restrictions',
    categoryLabel: '8. Trading Restrictions & Guardrails',
    ruleName: 'VPS / Commercial VPN & IP Cluster Policy',
    exactValue: vpsPolicySummary,
    dollarValue: 'Residential IP Required',
    appliesTo: 'All active accounts',
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'August 12, 2026 Directive',
    calculationBasis: 'Automated ASN and data-center IP detection',
    plainEnglishExplanation: vpsAllowed
      ? 'VPS hosting is allowed on this specific tier with static dedicated IP.'
      : 'Commercial data-center VPS (Contabo, AWS, Hetzner) and generic VPN IP pools are prohibited as of August 12, 2026 to prevent syndicate copy trading. Residential IP required.',
    breachTrigger: 'Logging in from flagged data-center hosting providers triggers automated security freeze and KYC re-verification.',
    example: 'Running an EA from an AWS EC2 instance will freeze account pending verification.',
    verificationStatus: 'officially_verified',
    statusLabel: 'Important Restriction',
    evidence: 'GFT Security Bulletin Aug 12, 2026',
    sourceDoc: 'GFT Security Bulletin Aug 12, 2026',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-08-12',
    confidence: 94,
    conflictStatus: defaultConflict,
  });

  allRuleItems.push({
    id: 'restrictions-ea-bots',
    category: 'restrictions',
    categoryLabel: '8. Trading Restrictions & Guardrails',
    ruleName: 'Expert Advisors (EAs) & Algorithmic Trading',
    exactValue: 'Allowed (Commercial Shared EAs Banned)',
    dollarValue: 'Proprietary EAs Only',
    appliesTo: 'All active accounts',
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'Active',
    calculationBasis: 'Trading pattern similarity and order book hash matching',
    plainEnglishExplanation: 'EAs and bots are permitted provided they are proprietary or uniquely customized. Mass-market off-the-shelf EAs running identical trades across multiple traders are banned as group trading.',
    breachTrigger: 'Synchronized trade matching across multiple accounts triggers termination.',
    example: 'Running a private bespoke algorithm is permitted; running an unmodified MQL5 commercial bot is flagged.',
    verificationStatus: 'officially_verified',
    statusLabel: 'Officially Verified',
    evidence: 'GFT Algorithmic Trading Policy',
    sourceDoc: 'GFT Algorithmic Trading Policy',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-08-28',
    confidence: 94,
    conflictStatus: defaultConflict,
  });

  allRuleItems.push({
    id: 'restrictions-copy-trading',
    category: 'restrictions',
    categoryLabel: '8. Trading Restrictions & Guardrails',
    ruleName: 'Account Copy Trading Scope',
    exactValue: 'Permitted Between Accounts Owned by Same KYC',
    dollarValue: 'Same-owner accounts only',
    appliesTo: 'Multi-account traders',
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'Active',
    calculationBasis: 'KYC identity verification match',
    plainEnglishExplanation: 'Copy trading is allowed ONLY between accounts registered under the identical verified trader identity. Account management services and signal-copier networks between different people are strictly prohibited.',
    breachTrigger: 'Copy trading between different KYC profiles causes immediate account termination.',
    example: 'Copying trades from your 1-Step to your 2-Step account is allowed if both are in your name.',
    verificationStatus: 'officially_verified',
    statusLabel: 'Officially Verified',
    evidence: 'GFT Terms Clause 9.4',
    sourceDoc: 'GFT Terms Clause 9.4',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-08-15',
    confidence: 96,
    conflictStatus: defaultConflict,
  });

  // 9. Instruments and Leverage Limits
  allRuleItems.push({
    id: 'instruments-leverage-forex',
    category: 'instruments_leverage',
    categoryLabel: '9. Instruments & Leverage Limits',
    ruleName: 'Simulated Forex Leverage',
    exactValue: model.leverage.forex,
    dollarValue: `1:${model.leverage.forex.replace('1:', '')} Purchasing Power`,
    appliesTo: 'FX Major and Minor Pairs',
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'Active',
    calculationBasis: 'Margin Required = Notional Size / Leverage',
    plainEnglishExplanation: `Forex pairs trade at ${model.leverage.forex} simulated leverage across all platforms.`,
    breachTrigger: 'Margin call occurs if available margin drops below required margin.',
    example: `On ${model.leverage.forex}, 1 standard lot EUR/USD ($100,000) requires $1,000 or $2,000 margin.`,
    verificationStatus: 'officially_verified',
    statusLabel: 'Officially Verified',
    evidence: 'GFT Instrument Matrix',
    sourceDoc: 'GFT Instrument Matrix',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-09-02',
    confidence: 96,
    conflictStatus: defaultConflict,
  });

  allRuleItems.push({
    id: 'instruments-leverage-crypto',
    category: 'instruments_leverage',
    categoryLabel: '9. Instruments & Leverage Limits',
    ruleName: 'Simulated Crypto Leverage & 24/7 Execution',
    exactValue: `${model.leverage.crypto} (24/7 Weekend Trading)`,
    dollarValue: '1:5 Margin Ratio',
    appliesTo: 'Crypto Pairs (BTC, ETH, SOL)',
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'Active',
    calculationBasis: 'Margin = Position Notional * 20%',
    plainEnglishExplanation: 'Cryptocurrency contracts trade at 1:5 simulated leverage with 24/7 market access including Saturdays and Sundays.',
    breachTrigger: 'Over-leveraging on crypto volatility can accelerate drawdown breaches.',
    example: 'Holding BTC/USD over the weekend is allowed; rollover swap rates apply.',
    verificationStatus: 'officially_verified',
    statusLabel: 'Officially Verified',
    evidence: 'GFT Crypto Trading Terms',
    sourceDoc: 'GFT Crypto Trading Terms',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-09-01',
    confidence: 95,
    conflictStatus: defaultConflict,
  });

  // 10. Platform Rules & Regional Access
  allRuleItems.push({
    id: 'platform-supported-tech',
    category: 'platform',
    categoryLabel: '10. Platform Rules & Regional Access',
    ruleName: 'Supported Trading Platforms & US Regional Access',
    exactValue: model.supportedPlatforms.map((p) => p.toUpperCase()).join(', '),
    dollarValue: 'No platform migration fee',
    appliesTo: platformLabel,
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'Active',
    calculationBasis: 'Broker server routing',
    plainEnglishExplanation: `Available platforms: ${model.supportedPlatforms.map((p) => p.toUpperCase()).join(', ')}. MT5 is restricted for US residents; TradeLocker and Match-Trader are accessible globally including US.`,
    breachTrigger: 'Attempting to access MT5 from a US IP address is blocked by platform gateway.',
    example: 'US traders must select TradeLocker or Match-Trader during checkout.',
    verificationStatus: 'officially_verified',
    statusLabel: 'Officially Verified',
    evidence: 'GFT Platform Guide',
    sourceDoc: 'GFT Platform Guide',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-09-02',
    confidence: 96,
    conflictStatus: defaultConflict,
  });

  // 11. Scaling Plan & Growth
  allRuleItems.push({
    id: 'scaling-plan-milestones',
    category: 'scaling',
    categoryLabel: '11. Scaling Plan & Growth',
    ruleName: 'Capital Scaling Plan Milestones',
    exactValue: '+25% Capital Every 3 Months (Up to $2,000,000)',
    dollarValue: `Next tier: ${fmt(accountSize * 1.25)}`,
    appliesTo: 'Funded Master Accounts',
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'Active',
    calculationBasis: `New Capital = Current Capital * 1.25 (${fmt(accountSize)} -> ${fmt(accountSize * 1.25)})`,
    plainEnglishExplanation: 'Traders who achieve an aggregate 8% net profit across 3 consecutive months with at least 2 successful payouts receive a +25% capital increase and a 90% profit split boost.',
    breachTrigger: 'Scaling eligibility resets if a breach occurs.',
    example: `A ${fmt(accountSize)} account scales to ${fmt(accountSize * 1.25)} after 3 profitable months.`,
    verificationStatus: 'officially_verified',
    statusLabel: 'Officially Verified',
    evidence: 'GFT Scaling Policy Document',
    sourceDoc: 'GFT Scaling Policy Document',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-09-01',
    confidence: 92,
    conflictStatus: defaultConflict,
  });

  // 12. Breach Conditions & Account Termination
  allRuleItems.push({
    id: 'breach-hard-soft',
    category: 'breach_conditions',
    categoryLabel: '12. Breach Conditions & Account Termination',
    ruleName: 'Hard Breach vs Soft Breach Termination Engine',
    exactValue: 'Hard: Drawdown & Floating Loss | Soft: 30-Day Inactivity',
    dollarValue: 'Account Liquidation Thresholds',
    appliesTo: 'All active accounts',
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'Active',
    calculationBasis: 'Automated tick-by-tick risk monitoring daemon',
    plainEnglishExplanation: 'Hard breaches (touching daily loss floor or total drawdown floor) immediately close all open orders and terminate the contract. Soft breaches (inactivity) pause account access without contract forfeiture.',
    breachTrigger: 'Breaching daily floor closes account instantaneously.',
    example: 'Touching maximum drawdown floor constitutes an irreversible hard breach.',
    verificationStatus: 'officially_verified',
    statusLabel: 'Officially Verified',
    evidence: 'GFT Terms Clause 11',
    sourceDoc: 'GFT Terms Clause 11',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-09-02',
    confidence: 98,
    conflictStatus: defaultConflict,
  });

  // 13. Legal Terms & Verification Audit Trail
  allRuleItems.push({
    id: 'legal-terms-version',
    category: 'legal_operational',
    categoryLabel: '13. Legal Terms & Verification Audit Trail',
    ruleName: 'Active Terms Version & Enforcement Cutoff',
    exactValue: termsVersionLabel,
    dollarValue: 'Enforced legal contract version',
    appliesTo: termsVersionLabel,
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: termsVersion === 'pre_aug_2026' ? 'Prior to August 2026' : 'September 2026 Active',
    calculationBasis: 'Purchase date timestamp mapping',
    plainEnglishExplanation: `Active legal rules version for this selected context. Documented enforcement cutoffs: Aug 1, 2026 (1-Step 3% daily DD), Aug 12, 2026 (VPS IP prohibition), Sept 2, 2026 (1.0% floating loss rule).`,
    breachTrigger: 'Accounts created before cutoffs retain grandfathered rules where officially documented.',
    example: 'Selecting Pre-Aug 2026 loads historical 4% 1-Step daily loss rules.',
    verificationStatus: 'officially_verified',
    statusLabel: 'Officially Verified',
    evidence: 'GFT Legal Terms Archive',
    sourceDoc: 'GFT Legal Terms Archive',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-09-02',
    confidence: 96,
    conflictStatus: defaultConflict,
  });

  allRuleItems.push({
    id: 'legal-refundable-fee',
    category: 'legal_operational',
    categoryLabel: '13. Legal Terms & Verification Audit Trail',
    ruleName: 'Registration Fee Refundability Policy',
    exactValue: model.refundableFee ? '100% Refundable with First Payout' : 'Non-Refundable Instant Access',
    dollarValue: model.refundableFee ? 'Full initial registration fee refunded' : 'Zero refund',
    appliesTo: model.isEvaluation ? 'Challenge Accounts' : 'Instant Direct Accounts',
    accountSize,
    stage: stageLabel,
    platform: platformLabel,
    termsVersion: termsVersionLabel,
    effectiveDate: 'Active',
    calculationBasis: 'First funded payout invoice addition',
    plainEnglishExplanation: model.refundableFee
      ? 'The initial registration fee is 100% reimbursed to the trader along with their first approved payout on the funded stage.'
      : 'Instant funding accounts provide immediate capital access without evaluation and do not offer registration fee refunds.',
    breachTrigger: 'If an evaluation account is breached prior to funded payout, registration fee is forfeited.',
    example: 'Earn first funded payout of $2,000 + receive 100% registration fee refund.',
    verificationStatus: 'officially_verified',
    statusLabel: 'Officially Verified',
    evidence: 'GFT Fee Refund Terms',
    sourceDoc: 'GFT Fee Refund Terms',
    sourceUrl: model.sourceUrl,
    lastVerifiedDate: '2026-09-01',
    confidence: 96,
    conflictStatus: defaultConflict,
  });

  // Calculate status breakdown from actual row-level statuses
  const statusBreakdown = {
    officiallyVerifiedCount: allRuleItems.filter((r) => r.verificationStatus === 'officially_verified').length,
    officialAmbiguousCount: allRuleItems.filter((r) => r.verificationStatus === 'official_ambiguous').length,
    historicalCount: allRuleItems.filter((r) => r.verificationStatus === 'historical_rule').length,
    conflictingCount: allRuleItems.filter((r) => r.verificationStatus === 'conflicting_sources' || r.conflictStatus.hasConflict).length,
    thirdPartyReportCount: allRuleItems.filter((r) => r.verificationStatus === 'third_party_report').length,
    communityReportedCount: allRuleItems.filter((r) => r.verificationStatus === 'community_reported').length,
    unverifiedCount: allRuleItems.filter((r) => r.verificationStatus === 'unverified' || r.verificationStatus === 'unverified_claim').length,
    notApplicableCount: allRuleItems.filter((r) => r.verificationStatus === 'not_applicable' || r.exactValue.toLowerCase().includes('not applicable')).length,
    notAvailableCount: allRuleItems.filter((r) => r.verificationStatus === 'not_available').length,
    totalRulesCount: allRuleItems.length,
  };

  return {
    context,
    model,
    core: {
      modelName: model.name,
      categoryLabel: model.categoryLabel,
      stageLabel,
      platformLabel,
      termsVersionLabel,
      nominalCapital: accountSize,
      nominalCapitalFormatted: fmt(accountSize),
      hasProfitTarget,
      targetPct,
      targetDollars,
      targetFormatted,
      targetDisplayString,
      hasDailyLossLimit,
      dailyLossPct,
      dailyLossDollars,
      dailyLossFormatted,
      dailyLossBreachFloor,
      dailyLossBreachFloorFormatted,
      dailyLossResetTime: '5:00 PM EST (00:00 server)',
      dailyLossIsGrandfathered,
      dailyLossHasConflict,
      dailyLossConflictDescription,
      maxDDPct,
      maxDDDollars,
      maxDDFormatted,
      maxDDType,
      maxDDTypeLabel,
      maxDDFloorDollars,
      maxDDFloorFormatted,
      hasFloatingLossCap,
      floatingLossPct,
      floatingLossDollars,
      floatingLossFormatted,
      baseProfitSplitPct: model.profitSplit.basePct,
      maxProfitSplitPct: model.profitSplit.maxWithAddonPct,
      payoutCycleDays: model.profitSplit.payoutCycleDays,
      firstPayoutDays: model.profitSplit.firstPayoutDays,
      minTradingDaysFunded: model.minTradingDaysFunded,
      validDayThresholdDollars,
      validDayThresholdFormatted,
      dailyProfitCapFunded: model.dailyProfitCapFunded,
      hasConsistencyRule,
      consistencyPct,
      consistencyFormatted,
      newsAllowed: true,
      newsProfitCapPct: 1,
      weekendHoldingAllowed: true,
      eaAllowed: true,
      copyTradingScope: 'Own accounts only',
      vpsAllowed,
      vpsPolicySummary,
      forexLeverage: model.leverage.forex,
      refundableFee: model.refundableFee,
      refundConditions: model.refundConditions,
    },
    allRuleItems,
    statusBreakdown,
  };
}
