import { describe, it, expect } from 'vitest';
import { buildQuickViewRows } from '../src/components/rules/RulesQuickView.tsx';
import { ruleAppliesToProgram } from '../src/core/pipeline/parameterRules.ts';
import { SHARK_FUNDED } from '../src/data/sharkFunded.ts';
import type { AccountTier, ProgramModel } from '../src/types/schema.ts';

const base: AccountTier = {
  id: 't-1', programId: 'p-1', name: '$100K Test', nominalSize: 100000, currency: 'USD',
  price: 300, refundableFee: false, profitTargetPhase1: 8, profitTargetPhase2: 5,
  dailyLossLimit: 4, dailyLossCalculation: 'higher_of_equity_balance', maxTotalLoss: 8,
  drawdownType: 'static', minimumTradingDays: 5, maximumTradingDays: 'Unlimited',
  profitSplit: 80, payoutFrequency: 'Weekly', firstPayoutConditions: '7 days',
  payoutMinimum: 100, newsTradingRule: 'Restricted', newsTradingDetail: 'x',
  weekendHolding: true, overnightHolding: true, eaAllowed: true,
  copyTradingAllowed: false, hedgingAllowed: true, inactivityLimitDays: 14,
  leverage: '1:100', platforms: ['MT5'], instruments: ['Forex'], rules: [], sources: [],
  lastVerified: '2026-09-06',
};
const prog2: ProgramModel = {
  id: 'p-1', firmId: 'f', name: 'Test 2-Step', slug: 'test-2step',
  programType: '2-Step', description: 'd', stagesCount: 2, accounts: [], keyAdvantages: [], primaryWatchouts: [],
};

describe('RulesQuickView rows', () => {
  it('renders short honest values for challenge tab', () => {
    const rows = buildQuickViewRows(base, prog2, 'challenge');
    const byLabel = Object.fromEntries(rows.map((r) => [r.label, r.value]));
    expect(byLabel['Phase']).toBe('2 Phase Challenge');
    expect(byLabel['Phase 1 Profit Target']).toBe('8%');
    expect(byLabel['Phase 2 Profit Target']).toBe('5%');
    expect(byLabel['Daily Loss Limit']).toBe('4%');
    expect(byLabel['Maximum Loss Limit']).toBe('8%');
    expect(byLabel['Drawdown Type']).toBe('Static');
    expect(byLabel['Minimum Trading Days']).toBe('5');
    expect(byLabel['Time Limit']).toBe('None');
    expect(byLabel['News Trading']).toBe('Restricted');
  });

  it('renders None for absent caps — never 0/false', () => {
    const acc = { ...base, profitTargetPhase1: undefined, profitTargetPhase2: undefined, dailyLossLimit: 0, minimumTradingDays: 0, consistencyRule: undefined };
    const rows = buildQuickViewRows(acc, { ...prog2, programType: 'Instant', stagesCount: 1 } as ProgramModel, 'challenge');
    const byLabel = Object.fromEntries(rows.map((r) => [r.label, r.value]));
    expect(byLabel['Phase']).toBe('Instant Funding (No Challenge)');
    expect(byLabel['Phase 1 Profit Target']).toBe('None');
    expect(byLabel['Daily Loss Limit']).toBe('None (no daily cap)');
    expect(byLabel['Minimum Trading Days']).toBe('None');
    expect(byLabel['Consistency Rule']).toBe('None');
    expect(JSON.stringify(rows)).not.toMatch(/":0|"false/);
  });

  it('renders Unknown fee when price is unverified', () => {
    const rows = buildQuickViewRows({ ...base, price: 0, priceUnknown: true }, prog2, 'funded');
    const fee = rows.find((r) => r.label === 'Registration Fee')!;
    expect(fee.value).toBe('Unknown');
  });

  it('renders funded tab with split, payout and holding rows', () => {
    const rows = buildQuickViewRows(base, prog2, 'funded');
    const byLabel = Object.fromEntries(rows.map((r) => [r.label, r.value]));
    expect(byLabel['Profit Split']).toBe('80%');
    expect(byLabel['Weekend Holding']).toBe('Allowed');
    expect(byLabel['Copy Trading']).toBe('Restricted');
    expect(byLabel['Minimum Payout']).toBe('$100');
  });

  it('shows plain day counts with no per-phase claim', () => {
    const rows = buildQuickViewRows(base, prog2, 'challenge');
    expect(rows.find((r) => r.label === 'Minimum Trading Days')!.value).toBe('5');
  });
});

describe('QuickView per-program correctness (Shark, all 7 programs)', () => {
  const expectations: Record<string, Record<string, string>> = {
    'shark-lite-2step': {
      'Phase 1 Profit Target': '6%', 'Phase 2 Profit Target': '6%',
      'Daily Loss Limit': '3%', 'Maximum Loss Limit': '6%',
      'Minimum Trading Days': '7', 'News Trading': 'Restricted',
      'Profit Split': '80%', 'Registration Fee': '$214',
    },
    'shark-lite-1step': {
      'Phase 1 Profit Target': '9%', 'Daily Loss Limit': '3%',
      'Maximum Loss Limit': '6%', 'Weekend Holding': 'Allowed',
    },
    'shark-prime-2step': {
      'Phase 1 Profit Target': '9%', 'Phase 2 Profit Target': '6%',
      'Daily Loss Limit': '4%', 'Maximum Loss Limit': '10%',
    },
    'shark-prime-instant': {
      'Phase': 'Instant Funding (No Challenge)',
      'Phase 1 Profit Target': 'None',
      'Daily Loss Limit': '4%', 'Maximum Loss Limit': '7%',
    },
    'shark-lite-instant': {
      'Phase 1 Profit Target': 'None', 'Daily Loss Limit': 'None (no daily cap)',
      'Maximum Loss Limit': '3%', 'Consistency Rule': 'None',
    },
    'shark-strike-1step': {
      'Phase 1 Profit Target': '8%', 'Daily Loss Limit': 'None (no daily cap)',
      'Maximum Loss Limit': '3%', 'Weekend Holding': 'Not allowed',
    },
    'shark-bolt-instant': {
      'Daily Loss Limit': '3%', 'Maximum Loss Limit': '4%',
      'Profit Split': '70%', 'Registration Fee': 'Unknown',
    },
  };

  for (const prog of SHARK_FUNDED.programs) {
    it(`${prog.slug} shows its own numbers`, () => {
      const acc = prog.accounts[0]!;
      const rows = [...buildQuickViewRows(acc, prog, 'challenge'), ...buildQuickViewRows(acc, prog, 'funded')];
      const byLabel = Object.fromEntries(rows.map((r) => [r.label, r.value]));
      const exp = expectations[prog.slug]!;
      for (const [label, value] of Object.entries(exp)) {
        expect(`${label}=${byLabel[label]}`, ).toBe(`${label}=${value}`);
      }
    });

    it(`${prog.slug} taps resolve inside its own program scope`, () => {
      const acc = prog.accounts[0]!;
      const rows = [...buildQuickViewRows(acc, prog, 'challenge'), ...buildQuickViewRows(acc, prog, 'funded')];
      const scoped = SHARK_FUNDED.rules.filter((r) => ruleAppliesToProgram(r, prog.programType, prog.slug));
      expect(scoped.length).toBeGreaterThan(0);
      for (const row of rows) {
        const k = (row as { matchKey: string }).matchKey.toLowerCase();
        const hit = scoped.find((r) => r.slug.toLowerCase().includes(k) || r.name.toLowerCase().includes(k));
        // every tap must land on a rule visible for THIS program (or the section fallback)
        if (hit) {
          expect(ruleAppliesToProgram(hit, prog.programType, prog.slug)).toBe(true);
        }
      }
      // critical taps land on program-specific rules, not a sibling's
      const daily = rows.find((r) => r.label === 'Daily Loss Limit')!;
      const k = (daily as { matchKey: string }).matchKey.toLowerCase();
      const hit = scoped.find((r) => r.slug.toLowerCase().includes(k) || r.name.toLowerCase().includes(k));
      if (hit && hit.accountModelScope && hit.accountModelScope.length > 0) {
        const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        expect(hit.accountModelScope.some((s) => [prog.programType, prog.slug].map(norm).includes(norm(s)))).toBe(true);
      }
    });
  }
});
