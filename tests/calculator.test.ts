import { describe, it, expect } from 'vitest';
import {
  calculateDailyLossFloor,
  calculateMaxLossFloor,
  calculateProfitTarget,
  calculateProfitSplit,
  simulateAccountState,
} from '../src/core/calculator/engine.ts';

describe('Financial Calculation Engine', () => {
  it('correctly calculates static daily loss floor', () => {
    const { floor, maxAllowedLossDollars } = calculateDailyLossFloor(100000, 4);
    expect(floor).toBe(96000);
    expect(maxAllowedLossDollars).toBe(4000);
  });

  it('correctly calculates static max loss floor', () => {
    const { floor, maxAllowedLossDollars } = calculateMaxLossFloor(100000, 105000, 8, 'static');
    expect(floor).toBe(92000);
    expect(maxAllowedLossDollars).toBe(8000);
  });

  it('correctly trails max loss floor up to initial balance', () => {
    // Starts at 100k, 6% trailing = 94k floor
    const initial = calculateMaxLossFloor(100000, 100000, 6, 'trailing_equity');
    expect(initial.floor).toBe(94000);

    // Equity rises to 104k, trailing floor rises to 104k - 6k = 98k
    const trailed = calculateMaxLossFloor(100000, 104000, 6, 'trailing_equity');
    expect(trailed.floor).toBe(98000);

    // Equity rises to 110k, trailing floor caps at initial balance 100k
    const capped = calculateMaxLossFloor(100000, 110000, 6, 'trailing_equity');
    expect(capped.floor).toBe(100000);
  });

  it('calculates profit target and progress percentage', () => {
    const target = calculateProfitTarget(100000, 105000, 10);
    expect(target.targetDollars).toBe(10000);
    expect(target.targetBalance).toBe(110000);
    expect(target.remainingDollars).toBe(5000);
    expect(target.percentProgress).toBe(50);
  });

  it('calculates profit split shares accurately', () => {
    const split = calculateProfitSplit(8500, 85);
    expect(split.traderShare).toBe(7225);
    expect(split.firmShare).toBe(1275);
  });

  it('simulates SAFE account state when well above floors', () => {
    const sim = simulateAccountState({
      nominalSize: 100000,
      startingBalance: 100000,
      currentBalance: 102000,
      currentEquity: 102000,
      todayStartEquity: 100000,
      highWaterEquityToday: 102000,
      dailyLossLimitPct: 4,
      maxLossLimitPct: 8,
      drawdownType: 'static',
      openLotsRisked: 1.0,
      tradeRiskPercent: 1.0,
    });
    expect(sim.overallStatus).toBe('SAFE');
    expect(sim.dailyLossStatus).toBe('SAFE');
    expect(sim.maxLossStatus).toBe('SAFE');
    expect(sim.dailyLossFloor).toBe(96000);
    expect(sim.maxLossFloor).toBe(92000);
  });

  it('simulates BREACH when equity drops below daily loss floor', () => {
    const sim = simulateAccountState({
      nominalSize: 100000,
      startingBalance: 100000,
      currentBalance: 95500,
      currentEquity: 95500, // Below 96,000 floor
      todayStartEquity: 100000,
      highWaterEquityToday: 100000,
      dailyLossLimitPct: 4,
      maxLossLimitPct: 8,
      drawdownType: 'static',
      openLotsRisked: 2.0,
      tradeRiskPercent: 2.0,
    });
    expect(sim.overallStatus).toBe('BREACH');
    expect(sim.dailyLossStatus).toBe('BREACH');
    expect(sim.triggeredRules.length).toBeGreaterThan(0);
  });
});
