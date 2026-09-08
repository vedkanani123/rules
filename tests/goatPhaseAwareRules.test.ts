import { describe, it, expect } from 'vitest';
import {
  buildPhaseAwareRuleTable,
  calculatePercentageAmount,
  calculatePercentAmount,
  calculateBreachFloor,
  calculateDailyLossAmount,
  calculateProfitTargetAmount,
  calculateFloatingLossAmount,
  calculatePayoutAmount,
  calculateScalingAmount,
  validateModelPhaseRules,
  RULE_CATEGORIES,
} from '../src/data/goatPhaseAwareRules';
import { GFT_CANONICAL_MODELS } from '../src/data/goatCanonicalData';

describe('Goat Phase-Aware Complete Rules Engine', () => {
  it('should have all 28 categories defined from A to AB', () => {
    expect(RULE_CATEGORIES.length).toBe(28);
    expect(RULE_CATEGORIES[0].id).toBe('A');
    expect(RULE_CATEGORIES[0].name).toBe('Account and Evaluation Structure');
    expect(RULE_CATEGORIES[27].id).toBe('AB');
    expect(RULE_CATEGORIES[27].name).toBe('Evidence and Source History');
  });

  it('should compute dollar amounts accurately across all account sizes via canonical calculation utilities', () => {
    const sizes = [5000, 10000, 25000, 50000, 100000, 200000];

    sizes.forEach((size) => {
      // 5% daily loss
      expect(calculateDailyLossAmount(size, 5)).toBe(size * 0.05);
      // 10% target
      expect(calculateProfitTargetAmount(size, 10)).toBe(size * 0.1);
      // 8% drawdown
      expect(calculatePercentageAmount(size, 8)).toBe(size * 0.08);
      // 2% floating loss
      expect(calculateFloatingLossAmount(size, 2)).toBe(size * 0.02);
      // 80% payout on $5,000 profit
      expect(calculatePayoutAmount(5000, 80)).toBe(4000);
      // 25% scaling
      expect(calculateScalingAmount(size, 25)).toBe(size * 1.25);
    });
  });

  it('should calculate static and trailing breach floors correctly', () => {
    // Static $100k account with 10% max DD
    expect(calculateBreachFloor(100000, 10, 'static', 0)).toBe(90000);
    expect(calculateBreachFloor(100000, 10, 'static', 5000)).toBe(90000);

    // Trailing locked at initial: $100k account with 8% max DD ($8,000)
    // Starting balance: high water = $100k, floor = $92k
    expect(calculateBreachFloor(100000, 8, 'trailing_locked', 0)).toBe(92000);
    // After $4k profit: high water = $104k, floor = $96k
    expect(calculateBreachFloor(100000, 8, 'trailing_locked', 4000)).toBe(96000);
    // After $10k profit: high water = $110k, raw floor = $102k -> locks at $100k
    expect(calculateBreachFloor(100000, 8, 'trailing_locked', 10000)).toBe(100000);
  });

  it('should generate phase rules for a 1-phase model (one_step) without phase fabrication', () => {
    const oneStep = GFT_CANONICAL_MODELS.find((m) => m.id === 'one_step')!;
    expect(oneStep).toBeDefined();

    const { allRows, validationReport } = buildPhaseAwareRuleTable(oneStep, {
      accountSize: 100000,
      stage: 'all',
      platform: 'all',
      termsVersion: 'current_2026',
      tradingStyle: 'discretionary',
    });
    expect(allRows.length).toBeGreaterThanOrEqual(28);
    expect(validationReport.isValid).toBe(true);

    // Target rule (Category B)
    const targetRule = allRows.find((r) => r.categoryKey === 'B' && r.ruleName.includes('Target'))!;
    expect(targetRule).toBeDefined();
    expect(targetRule.phase1).toContain('10%');
    expect(targetRule.phase1).toContain('$10,000');
    expect(targetRule.phase2).toContain('N/A');
    expect(targetRule.phase3).toContain('N/A');
    expect(targetRule.masterAccount).toContain('No Target');

    // Daily loss rule (Category D) - 3% in current terms
    const dailyLoss = allRows.find((r) => r.categoryKey === 'D')!;
    expect(dailyLoss.phase1).toContain('3%');
    expect(dailyLoss.phase1).toContain('$3,000');
    expect(dailyLoss.phase2).toContain('N/A');
    expect(dailyLoss.masterAccount).toContain('3%');
    expect(dailyLoss.masterAccount).toContain('$3,000');
  });

  it('should generate phase rules for a 2-phase model (two_step_standard)', () => {
    const twoStep = GFT_CANONICAL_MODELS.find((m) => m.id === 'two_step_standard')!;
    expect(twoStep).toBeDefined();

    const { allRows } = buildPhaseAwareRuleTable(twoStep, {
      accountSize: 100000,
      stage: 'all',
      platform: 'all',
      termsVersion: 'current_2026',
      tradingStyle: 'discretionary',
    });
    const targetRule = allRows.find((r) => r.categoryKey === 'B' && r.ruleName.includes('Target'))!;
    expect(targetRule.phase1).toContain('10%');
    expect(targetRule.phase1).toContain('$10,000');
    expect(targetRule.phase2).toContain('5%');
    expect(targetRule.phase2).toContain('$5,000');
    expect(targetRule.phase3).toContain('N/A');
    expect(targetRule.masterAccount).toContain('No Target');
  });

  it('should generate phase rules for a 3-phase model (three_step)', () => {
    const threeStep = GFT_CANONICAL_MODELS.find((m) => m.id === 'three_step')!;
    expect(threeStep).toBeDefined();

    const { allRows } = buildPhaseAwareRuleTable(threeStep, {
      accountSize: 100000,
      stage: 'all',
      platform: 'all',
      termsVersion: 'current_2026',
      tradingStyle: 'discretionary',
    });
    const targetRule = allRows.find((r) => r.categoryKey === 'B' && r.ruleName.includes('Target'))!;
    expect(targetRule.phase1).toContain('6%');
    expect(targetRule.phase2).toContain('6%');
    expect(targetRule.phase3).toContain('6%');
    expect(targetRule.masterAccount).toContain('No Target');
  });

  it('should generate phase rules for an Instant Funding model (instant_pro)', () => {
    const instant = GFT_CANONICAL_MODELS.find((m) => m.id === 'instant_pro')!;
    expect(instant).toBeDefined();

    const { allRows } = buildPhaseAwareRuleTable(instant, {
      accountSize: 100000,
      stage: 'all',
      platform: 'all',
      termsVersion: 'current_2026',
      tradingStyle: 'discretionary',
    });
    const targetRule = allRows.find((r) => r.categoryKey === 'B' && r.ruleName.includes('Target'))!;
    expect(targetRule.phase1).toContain('N/A');
    expect(targetRule.phase2).toContain('N/A');
    expect(targetRule.phase3).toContain('N/A');
    expect(targetRule.masterAccount).toContain('No Target');

    const dailyLoss = allRows.find((r) => r.categoryKey === 'D')!;
    expect(dailyLoss.phase1).toContain('N/A');
    expect(dailyLoss.masterAccount).toContain('No Daily Loss Limit');
  });

  it('should generate phase rules for Pay Later with 0% eval daily loss and funded daily loss', () => {
    const payLater = GFT_CANONICAL_MODELS.find((m) => m.id === 'pay_after_pass')!;
    expect(payLater).toBeDefined();

    const { allRows } = buildPhaseAwareRuleTable(payLater, {
      accountSize: 100000,
      stage: 'all',
      platform: 'all',
      termsVersion: 'current_2026',
      tradingStyle: 'discretionary',
    });
    const dailyLoss = allRows.find((r) => r.categoryKey === 'D')!;
    expect(dailyLoss.phase1).toContain('No Daily Loss');
    expect(dailyLoss.masterAccount).toContain('3%');
    expect(dailyLoss.masterAccount).toContain('$3,000');
  });

  it('should separate decision value from verification status and calculation data', () => {
    const twoStep = GFT_CANONICAL_MODELS.find((m) => m.id === 'two_step_standard')!;
    const { allRows } = buildPhaseAwareRuleTable(twoStep, {
      accountSize: 100000,
      stage: 'all',
      platform: 'all',
      termsVersion: 'current_2026',
      tradingStyle: 'discretionary',
    });

    const newsRule = allRows.find((r) => r.categoryKey === 'N')!;
    expect(newsRule.decision).toBe('LIMITED');
    expect(newsRule.verification).toBe('Verified');
    expect(newsRule.calculation).toContain('1%');
    expect(newsRule.formula).toContain('1%');

    const eaRule = allRows.find((r) => r.categoryKey === 'P')!;
    expect(eaRule.decision).toBe('LIMITED'); // Prohibits HFT/latency arb

    const weekendRule = allRows.find((r) => r.categoryKey === 'O')!;
    expect(weekendRule.decision).toBe('YES');
  });

  it('should reflect grandfathered terms when pre_aug_2026 version is chosen', () => {
    const oneStep = GFT_CANONICAL_MODELS.find((m) => m.id === 'one_step')!;
    const { allRows } = buildPhaseAwareRuleTable(oneStep, {
      accountSize: 100000,
      stage: 'all',
      platform: 'all',
      termsVersion: 'pre_aug_2026',
      tradingStyle: 'discretionary',
    });

    const dailyLoss = allRows.find((r) => r.categoryKey === 'D')!;
    expect(dailyLoss.phase1).toContain('4%');
    expect(dailyLoss.phase1).toContain('$4,000');
    expect(dailyLoss.termsVersion).toBe('Pre-August 2026');
  });

  it('should pass developer validation engine for all 13 canonical models without critical errors', () => {
    const issues = validateModelPhaseRules(GFT_CANONICAL_MODELS, 100000);
    const criticalErrors = issues.filter((i) => i.severity === 'error');
    expect(criticalErrors).toHaveLength(0);
  });
});
