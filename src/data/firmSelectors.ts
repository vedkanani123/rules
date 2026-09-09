import {
  CanonicalFirmProfile,
  CanonicalFirmModel,
  ModelCategory,
  CANONICAL_FIRMS_REGISTRY,
  getOrCreateFirmCanonicalProfile,
} from './firmsCanonicalRegistry.ts';

export interface CategoryWithCount {
  id: ModelCategory;
  label: string;
  count: number;
}

export function getFirmCategoriesWithCounts(firm: CanonicalFirmProfile): CategoryWithCount[] {
  const categoryLabels: Record<ModelCategory, string> = {
    two_step: '2-Step Challenge',
    one_step: '1-Step Fast Track',
    three_step: '3-Step Scaler',
    instant: 'Instant Funded',
    futures: 'Futures Combine',
  };

  const map = new Map<ModelCategory, number>();
  firm.models.forEach((m) => {
    map.set(m.category, (map.get(m.category) || 0) + 1);
  });

  const order: ModelCategory[] = ['two_step', 'one_step', 'three_step', 'instant', 'futures'];
  const res: CategoryWithCount[] = [];

  order.forEach((cat) => {
    if (map.has(cat)) {
      res.push({
        id: cat,
        label: categoryLabels[cat] || cat,
        count: map.get(cat)!,
      });
    }
  });

  if (res.length === 0 && firm.models.length > 0) {
    const firstCat = firm.models[0].category;
    res.push({
      id: firstCat,
      label: categoryLabels[firstCat] || 'Evaluation',
      count: firm.models.length,
    });
  }

  return res;
}

export function getFirmModelsByCategory(
  firm: CanonicalFirmProfile,
  category: ModelCategory
): CanonicalFirmModel[] {
  return firm.models.filter((m) => m.category === category);
}

export function getFirmModelById(
  firm: CanonicalFirmProfile,
  modelId: string
): CanonicalFirmModel | undefined {
  return firm.models.find((m) => m.id === modelId) || firm.models[0];
}

export function getFirmAllPricingForModel(model: CanonicalFirmModel) {
  return model.availableSizes.map((size) => {
    const pricing = model.pricingByCurrency[size] || { usd: Math.round(size * 0.005) };
    const usd = pricing.usd;
    const discounted = pricing.discountedUsd || Math.round(usd * 0.9);
    return {
      size,
      usd,
      discountedUsd: discounted,
      savings: usd - discounted,
    };
  });
}

export function getFirmRulesForModel(
  model: CanonicalFirmModel,
  selectedSize: number,
  stage: 'all' | 'evaluation' | 'funded'
) {
  const targetP1 = (selectedSize * model.targetsByStage.phase1) / 100;
  const targetP2 = model.targetsByStage.phase2 ? (selectedSize * model.targetsByStage.phase2) / 100 : undefined;
  const dailyLossAmt = (selectedSize * model.dailyLossLimit.pct) / 100;
  const maxLossAmt = (selectedSize * model.maxDrawdown.pct) / 100;

  const rules = [
    {
      id: 'target-phase-1',
      category: 'Target & Objectives',
      name: 'Phase 1 Profit Target',
      value: `${model.targetsByStage.phase1}% ($${targetP1.toLocaleString()})`,
      status: 'VERIFIED',
      description: `Reach ${model.targetsByStage.phase1}% net profit in Phase 1 to advance.`,
      stages: ['evaluation'],
    },
    ...(model.targetsByStage.phase2
      ? [
          {
            id: 'target-phase-2',
            category: 'Target & Objectives',
            name: 'Phase 2 Profit Target',
            value: `${model.targetsByStage.phase2}% ($${(targetP2 || 0).toLocaleString()})`,
            status: 'VERIFIED',
            description: `Reach ${model.targetsByStage.phase2}% net profit in Phase 2.`,
            stages: ['evaluation'],
          },
        ]
      : []),
    {
      id: 'daily-loss',
      category: 'Risk & Drawdown',
      name: 'Daily Loss Limit',
      value: `${model.dailyLossLimit.pct}% ($${dailyLossAmt.toLocaleString()})`,
      status: 'VERIFIED',
      description: model.dailyLossLimit.description,
      stages: ['evaluation', 'funded'],
    },
    {
      id: 'max-drawdown',
      category: 'Risk & Drawdown',
      name: 'Maximum Overall Drawdown',
      value: `${model.maxDrawdown.pct}% ($${maxLossAmt.toLocaleString()}) [${model.maxDrawdown.type.toUpperCase()}]`,
      status: 'VERIFIED',
      description: model.maxDrawdown.description,
      stages: ['evaluation', 'funded'],
    },
    {
      id: 'min-days',
      category: 'Trading Behavior',
      name: 'Minimum Trading Days',
      value: `${model.minTradingDaysEval} days eval / ${model.minTradingDaysFunded} days funded`,
      status: 'VERIFIED',
      description: `Minimum calendar/trading days required before passing or requesting payouts.`,
      stages: ['evaluation', 'funded'],
    },
    {
      id: 'profit-split',
      category: 'Payout & Financials',
      name: 'Profit Split Ladder',
      value: `${model.profitSplit.basePct}% to ${model.profitSplit.maxWithAddonPct}%`,
      status: 'VERIFIED',
      description: `Traders keep ${model.profitSplit.basePct}% of net profits, scaling up to ${model.profitSplit.maxWithAddonPct}%.`,
      stages: ['funded'],
    },
    {
      id: 'news-trading',
      category: 'Trading Restrictions',
      name: 'News Trading Policy',
      value: model.newsTradingAllowed ? 'Allowed' : 'Restricted (2-5 min buffer)',
      status: model.newsTradingAllowed ? 'VERIFIED' : 'RESTRICTED',
      description: model.newsTradingAllowed
        ? 'Holding and executing orders during economic news releases is fully permitted.'
        : 'Trading during high-impact news windows is prohibited or restricted on standard funded tiers.',
      stages: ['evaluation', 'funded'],
    },
    {
      id: 'weekend-holding',
      category: 'Trading Restrictions',
      name: 'Weekend Holding',
      value: model.weekendHoldingAllowed ? 'Allowed' : 'Prohibited (Close Friday)',
      status: model.weekendHoldingAllowed ? 'VERIFIED' : 'RESTRICTED',
      description: model.weekendHoldingAllowed
        ? 'Positions may be held open across weekend market close.'
        : 'All open trades must be closed prior to Friday market closing bell.',
      stages: ['evaluation', 'funded'],
    },
    {
      id: 'ea-allowed',
      category: 'Trading Restrictions',
      name: 'Expert Advisors & Algos',
      value: model.eaAllowed ? 'Allowed (No arbitrage)' : 'Restricted',
      status: 'VERIFIED',
      description: 'Systematic EAs and algorithmic execution permitted with standard latency safeguards.',
      stages: ['evaluation', 'funded'],
    },
  ];

  if (stage === 'all') return rules;
  return rules.filter((r) => r.stages.includes(stage));
}

export function getFirmDecisionRecommendations(firm: CanonicalFirmProfile) {
  const models = firm.models;
  const twoStep = models.find((m) => m.category === 'two_step') || models[0];
  const oneStep = models.find((m) => m.category === 'one_step') || twoStep;

  return [
    {
      style: 'Conservative Systematic Trader',
      recommendedModelId: twoStep.id,
      modelName: twoStep.name,
      badge: 'Best Static Runway',
      reason: `Offers ${twoStep.maxDrawdown.pct}% static maximum drawdown with no trailing high-water mark traps.`,
      keyMetrics: [
        { label: 'Max Loss', val: `${twoStep.maxDrawdown.pct}% Static` },
        { label: 'Daily Loss', val: `${twoStep.dailyLossLimit.pct}%` },
        { label: 'Split', val: `${twoStep.profitSplit.basePct}%` },
      ],
    },
    {
      style: 'Fast Track Momentum Scalper',
      recommendedModelId: oneStep.id,
      modelName: oneStep.name,
      badge: 'Fastest Funded Path',
      reason: `Single evaluation stage (${oneStep.targetsByStage.phase1}% target) with 1-2 day clearance.`,
      keyMetrics: [
        { label: 'Stages', val: `${oneStep.stagesCount} Step` },
        { label: 'Target', val: `${oneStep.targetsByStage.phase1}%` },
        { label: 'Days', val: `${oneStep.minTradingDaysEval} min` },
      ],
    },
  ];
}
