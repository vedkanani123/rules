import { describe, it, expect } from 'vitest';
import {
  calculateDailyLossFloor,
  calculateMaxLossFloor,
  calculateProfitTarget,
  calculateAllInCost,
  checkPayoutEligibility,
  calculateConsistencyImpact,
  describeAssumptions,
  toPublicEligibility,
} from '../src/core/calculator/engine.ts';

describe('Calculator edge cases & assumptions', () => {
  it('handles exactly-at-limit as breach boundary', () => {
    const { floor } = calculateDailyLossFloor(100000, 4);
    expect(floor).toBe(96000);
    // one cent below floor = breach, at floor = breach distance 0
    expect(96000 - floor).toBe(0);
    expect(95999.99 - floor).toBeLessThan(0);
  });

  it('caps trailing floor at initial and floors at static floor', () => {
    const s = calculateMaxLossFloor(100000, 100000, 8, 'trailing_equity');
    expect(s.floor).toBe(92000);
    const capped = calculateMaxLossFloor(100000, 200000, 8, 'trailing_equity');
    expect(capped.floor).toBe(100000);
    const low = calculateMaxLossFloor(100000, 50000, 8, 'trailing_equity');
    expect(low.floor).toBe(92000); // never looser than static
  });

  it('exposes assumptions instead of hiding them', () => {
    const notes = describeAssumptions({
      basis: 'equity-based', includesFloating: true, resetTime: '00:00 CET',
      includesCosts: true, lastVerified: '2026-09-06', methodSpecified: true,
    });
    expect(notes.join(' ')).toMatch(/equity-based/i);
    const unknown = describeAssumptions({
      basis: '', includesFloating: false, resetTime: '', includesCosts: false,
      lastVerified: '', methodSpecified: false,
    });
    expect(unknown[0]).toMatch(/not publicly specified/i);
  });

  it('maps eligibility to public statuses without misleading eligible', () => {
    expect(toPublicEligibility('YES', false, false)).toBe('Eligible');
    expect(toPublicEligibility('YES', true, false)).toBe('Conflicting rules');
    expect(toPublicEligibility('YES', false, true)).toBe('Insufficient information');
    expect(toPublicEligibility('CONDITIONAL', false, false)).toBe('Potentially eligible');
  });

  it('blocks payout on missing winning days and safety buffer', () => {
    const r = checkPayoutEligibility({
      currentProfit: 400, requiredProfitMinimum: 500, winningDaysCount: 2,
      requiredWinningDays: 5, bestDayProfit: 300, currentEquityDistanceToFloor: 100,
      hasSafetyBufferRule: true, safetyBufferDollars: 500,
    });
    expect(r.eligible).toBe('NO');
    expect(r.blockers.length).toBeGreaterThanOrEqual(2);
  });

  it('calculates all-in cost with refund assumption note', () => {
    const c = calculateAllInCost({ challengeFee: 499, expectedResets: 1, refundableOnFirstPayout: true });
    expect(c.totalAfterRefund).toBeLessThan(c.totalPaidBeforePayout);
    expect(c.assumptionNote).toMatch(/reset/i);
  });

  it('raises effective target on consistency breach', () => {
    const r = calculateConsistencyImpact(8000, 5000, 50, 8000);
    expect(r.breaches).toBe(true);
    expect(r.adjustedTarget).toBeGreaterThan(8000);
  });

  it('handles zero/negative profit without NaN', () => {
    const t = calculateProfitTarget(100000, 99000, 8);
    expect(t.remainingDollars).toBe(9000);
    expect(t.percentProgress).toBe(0);
  });
});
