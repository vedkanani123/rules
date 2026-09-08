import { describe, it, expect } from 'vitest';
import {
  GFT_CANONICAL_MODELS,
  GFT_FUTURES_MODELS,
  GFT_PRICING_REGISTRY,
  GFT_CANONICAL_RULES,
  GFT_DECISION_RECOMMENDATIONS,
} from '../src/data/goatCanonicalData.ts';
import {
  getCategoriesWithCounts,
  getModelsByCategory,
  getModelById,
  runModelRiskSimulation,
  calculateSuitability,
} from '../src/data/goatSelectors.ts';
import { buildCanonicalSelectedRules } from '../src/data/goatCanonicalContext.ts';

describe('Goat Funded Trader Canonical Registry v3', () => {
  it('contains exactly 13 canonical models across 6 categories', () => {
    expect(GFT_CANONICAL_MODELS).toHaveLength(13);

    const categories = getCategoriesWithCounts();
    expect(categories).toHaveLength(6);

    const totalCount = categories.reduce((sum, c) => sum + c.modelCount, 0);
    expect(totalCount).toBe(13);

    // Verify each category count matches
    const payLater = categories.find((c) => c.id === 'pay_later');
    expect(payLater?.modelCount).toBe(1);

    const oneStep = categories.find((c) => c.id === 'one_step');
    expect(oneStep?.modelCount).toBe(2);

    const twoStep = categories.find((c) => c.id === 'two_step');
    expect(twoStep?.modelCount).toBe(2);

    const threeStep = categories.find((c) => c.id === 'three_step');
    expect(threeStep?.modelCount).toBe(1);

    const instant = categories.find((c) => c.id === 'instant');
    expect(instant?.modelCount).toBe(5);

    const legacy = categories.find((c) => c.id === 'legacy');
    expect(legacy?.modelCount).toBe(2);
  });

  it('verifies Pay Later has 0% daily loss in evaluation and $5 entry', () => {
    const payLater = getModelById('pay_after_pass');
    expect(payLater).toBeDefined();
    expect(payLater?.dailyLossLimit.pct).toBe(0);
    expect(payLater?.targetsByStage.phase1).toBe(4);
    expect(payLater?.maxDrawdown.pct).toBe(8);

    const pricing = GFT_PRICING_REGISTRY.find((p) => p.modelId === 'pay_after_pass');
    expect(pricing?.officialListedPrice).toBe(5);
  });

  it('verifies 2-Step Standard features 10% permanent static drawdown', () => {
    const standard = getModelById('two_step_standard');
    expect(standard).toBeDefined();
    expect(standard?.maxDrawdown.type).toBe('static');
    expect(standard?.maxDrawdown.pct).toBe(10);
    expect(standard?.dailyLossLimit.pct).toBe(5);
    expect(standard?.consistencyRule.active).toBe(false);
  });

  it('verifies Instant Premium has 10-day cycle, 0% consistency, and 1% floating loss', () => {
    const premium = getModelById('instant_premium');
    expect(premium).toBeDefined();
    expect(premium?.profitSplit.payoutCycleDays).toBe(10);
    expect(premium?.consistencyRule.active).toBe(false);
    expect(premium?.floatingLossCapPct).toBe(1);
  });

  it('verifies CME Futures are strictly segregated with no overnight holding', () => {
    expect(GFT_FUTURES_MODELS.length).toBeGreaterThanOrEqual(4);
    for (const f of GFT_FUTURES_MODELS) {
      expect(f.overnightHolding).toBe('prohibited');
      expect(f.drawdownType).toBe('trailing_eod');
      expect(f.supportedPlatforms).toContain('Volumetrica');
    }
  });

  it('verifies Risk Simulator accurately flags 1% floating loss violation on Instant Premium', () => {
    const premium = getModelById('instant_premium')!;
    const simResult = runModelRiskSimulation({
      model: premium,
      accountSize: 100000,
      startingBalance: 100000,
      currentEquity: 100000,
      currentFloatingLoss: 1200, // $1,200 is 1.2% > 1.0% cap
      riskPerTradePct: 0.8,
      stopLossPips: 20,
      winRatePct: 50,
      riskRewardRatio: 2.0,
      simulatedTradesCount: 20,
      targetPayoutAmount: 4000,
    });

    expect(simResult.floatingLossViolation).toBe(true);
    expect(simResult.status).toBe('danger');
    expect(simResult.isPayoutEligible).toBe(false);
  });

  it('verifies Risk Simulator accurately computes 0% daily loss freedom on Instant PRO', () => {
    const pro = getModelById('instant_pro')!;
    const simResult = runModelRiskSimulation({
      model: pro,
      accountSize: 100000,
      startingBalance: 100000,
      currentEquity: 98000,
      currentFloatingLoss: 400,
      riskPerTradePct: 1.0,
      stopLossPips: 20,
      winRatePct: 55,
      riskRewardRatio: 2.0,
      simulatedTradesCount: 20,
      targetPayoutAmount: 3000,
    });

    expect(simResult.consecutiveLossesBeforeDailyBreach).toBe(999);
    expect(simResult.remainingDailyLossBuffer).toBe(100000);
  });

  it('verifies all 10 Decision Recommendations have complete rationale and risk disclosures', () => {
    const recs = GFT_DECISION_RECOMMENDATIONS;
    expect(recs).toHaveLength(10);
    for (const r of recs) {
      expect(r.whyRecommended.length).toBeGreaterThan(20);
      expect(r.assumptionsUsed.length).toBeGreaterThanOrEqual(1);
      expect(r.risksAndLimitations.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('verifies 1-Step Fast canonical rule object and simulator synchronization (3% Current vs 4% Historical)', () => {
    const oneStep = getModelById('one_step')!;
    expect(oneStep).toBeDefined();

    // 1. Current terms (August 1, 2026 onwards)
    const currentRules = buildCanonicalSelectedRules(oneStep, {
      category: 'one_step',
      modelId: 'one_step',
      accountSize: 100000,
      stage: 'all',
      platform: 'all',
      purchaseDate: '2026-09-01',
      termsVersion: 'current_2026',
      tradingStyle: 'conservative',
    });

    // Core must be strictly 3% ($3,000)
    expect(currentRules.core.dailyLossPct).toBe(3);
    expect(currentRules.core.dailyLossDollars).toBe(3000);
    expect(currentRules.core.dailyLossIsGrandfathered).toBe(false);

    // Rule row must also say 3%
    const dailyRowCurrent = currentRules.allRuleItems.find((r) => r.id === 'daily-loss-rule');
    expect(dailyRowCurrent?.exactValue).toContain('3%');
    expect(dailyRowCurrent?.dollarValue).toContain('$3,000');

    // Risk Simulator must output $3,000 buffer (NEVER $4,000)
    const simCurrent = runModelRiskSimulation({
      model: oneStep,
      accountSize: 100000,
      startingBalance: 100000,
      currentEquity: 100000,
      currentFloatingLoss: 0,
      riskPerTradePct: 1.0,
      stopLossPips: 20,
      winRatePct: 50,
      riskRewardRatio: 2.0,
      simulatedTradesCount: 20,
      targetPayoutAmount: 4000,
      canonicalRules: currentRules,
    });
    expect(simCurrent.maxPermittedDailyLossDollars).toBe(3000);
    expect(simCurrent.remainingDailyLossBuffer).toBe(3000);

    // 2. Pre-August 1, 2026 grandfathered terms
    const historicalRules = buildCanonicalSelectedRules(oneStep, {
      category: 'one_step',
      modelId: 'one_step',
      accountSize: 100000,
      stage: 'all',
      platform: 'all',
      purchaseDate: '2026-07-15',
      termsVersion: 'pre_aug_2026',
      tradingStyle: 'conservative',
    });

    // Core must be strictly 4% ($4,000)
    expect(historicalRules.core.dailyLossPct).toBe(4);
    expect(historicalRules.core.dailyLossDollars).toBe(4000);
    expect(historicalRules.core.dailyLossIsGrandfathered).toBe(true);

    const dailyRowHistorical = historicalRules.allRuleItems.find((r) => r.id === 'daily-loss-rule');
    expect(dailyRowHistorical?.exactValue).toContain('4%');
    expect(dailyRowHistorical?.dollarValue).toContain('$4,000');
    expect(dailyRowHistorical?.verificationStatus).toBe('historical_rule');

    // Simulator must output $4,000 buffer for historical
    const simHistorical = runModelRiskSimulation({
      model: oneStep,
      accountSize: 100000,
      startingBalance: 100000,
      currentEquity: 100000,
      currentFloatingLoss: 0,
      riskPerTradePct: 1.0,
      stopLossPips: 20,
      winRatePct: 50,
      riskRewardRatio: 2.0,
      simulatedTradesCount: 20,
      targetPayoutAmount: 4000,
      canonicalRules: historicalRules,
    });
    expect(simHistorical.maxPermittedDailyLossDollars).toBe(4000);
    expect(simHistorical.remainingDailyLossBuffer).toBe(4000);
  });

  it('verifies row-level verification statuses and statusBreakdown integrity', () => {
    const twoStep = getModelById('two_step_standard')!;
    const canonical = buildCanonicalSelectedRules(twoStep, {
      category: 'two_step',
      modelId: 'two_step_standard',
      accountSize: 100000,
      stage: 'all',
      platform: 'all',
      purchaseDate: '2026-09-01',
      termsVersion: 'current_2026',
      tradingStyle: 'conservative',
    });

    expect(canonical.allRuleItems.length).toBeGreaterThanOrEqual(20);
    expect(canonical.statusBreakdown.totalRulesCount).toBe(canonical.allRuleItems.length);
    expect(canonical.statusBreakdown.officiallyVerifiedCount).toBeGreaterThan(10);

    // Every rule item must have all 17 required properties
    for (const item of canonical.allRuleItems) {
      expect(item.ruleName).toBeTruthy();
      expect(item.exactValue).toBeTruthy();
      expect(item.plainEnglishExplanation).toBeTruthy();
      expect(item.calculationBasis).toBeTruthy();
      expect(item.breachTrigger).toBeTruthy();
      expect(item.example).toBeTruthy();
      expect(item.appliesTo).toBeTruthy();
      expect(item.effectiveDate).toBeTruthy();
      expect(item.verificationStatus).toBeTruthy();
      expect(item.statusLabel).toBeTruthy();
      expect(item.sourceDoc).toBeTruthy();
      expect(item.confidence).toBeGreaterThan(0);
      expect(item.conflictStatus).toBeDefined();
    }
  });
});
