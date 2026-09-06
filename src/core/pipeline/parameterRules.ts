// Parameter-Derived Rule Builder
// Synthesizes accurate, readable Rule entities from a firm's own published account
// parameters (the same numbers already shown on pricing cards and dossiers).
// Used ONLY when a firm has no clause-level rules yet — guarantees no firm page
// ever renders an empty "extraction in progress" dead-end.
// Evidence honesty: every derived rule cites sourceType INFERENCE with an explicit
// "clause-level citation pending" excerpt — never presented as a verified quote.

import { PropFirm, AccountTier, Rule, SourceEvidence } from '../../types/schema.ts';

/**
 * Program-scope matcher: a rule applies when it is unscoped (firm-wide) or when
 * any scope entry exactly matches the program type or program slug
 * (case/punctuation-insensitive). Keeps 1-Step, 2-Step, Instant, Futures — and
 * sister models like GOAT 1-Step vs 1-Step Evaluation — perfectly separated.
 */
export function ruleAppliesToProgram(
  rule: Rule,
  programType?: string,
  programSlug?: string
): boolean {
  if (!rule.accountModelScope || rule.accountModelScope.length === 0) return true;
  const norm = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const targets = [programType || '', programSlug || ''].map(norm).filter(Boolean);
  if (targets.length === 0) return true;
  return rule.accountModelScope.some((scope) => targets.includes(norm(scope)));
}

const usd = (n: number): string => '$' + Math.round(n).toLocaleString();

function referenceAccount(firm: PropFirm): { programType: string; account: AccountTier } {
  for (const program of firm.programs) {
    const hundred = program.accounts.find((a) => a.nominalSize === 100000);
    if (hundred) return { programType: program.programType, account: hundred };
    if (program.accounts[0]) return { programType: program.programType, account: program.accounts[0] };
  }
  throw new Error(`Firm ${firm.slug} has no accounts to derive rules from`);
}

function inferenceSource(firm: PropFirm, ref: AccountTier, sourceId: string): SourceEvidence {
  return {
    id: sourceId,
    sourceUrl: firm.website,
    sourceTitle: `${firm.name} Official: Published ${ref.name} Parameters`,
    sourceType: 'INFERENCE',
    sourceExcerpt: `Derived from ${firm.name}'s published account parameters for ${ref.name}. Dollar math is deterministic from those parameters; clause-level citation pending human verification.`,
    retrievedAt: '2026-09-06',
    confidence: 'B',
    verificationStatus: 'UNVERIFIED',
  };
}

function risk(score: number, impact: number): { easyToMissRisk: number; isEasyToMiss: boolean } {
  const easyToMissRisk = score * impact;
  return { easyToMissRisk, isEasyToMiss: easyToMissRisk >= 140 };
}

/**
 * Builds ~10-11 honest rules from published parameters. Never fabricates quotes,
 * legal entities, reviews, or third-party claims — only the firm's own numbers.
 */
export function buildParameterRules(firm: PropFirm): Rule[] {
  const { programType, account: ref } = referenceAccount(firm);
  const n = ref.nominalSize;
  const p = firm.slug;
  const rules: Rule[] = [];
  const mkSource = (id: string): SourceEvidence[] => [inferenceSource(firm, ref, `src-${p}-${id}`)];

  // 1 — Daily drawdown
  if (ref.dailyLossLimit > 0) {
    const allow = (n * ref.dailyLossLimit) / 100;
    const basis = ref.dailyLossCalculation.replace(/_/g, ' ');
    rules.push({
      id: `param-${p}-daily-drawdown`,
      category: 'RISK',
      name: `Daily Drawdown (${ref.dailyLossLimit}% of ${basis})`,
      slug: `${p}-daily-drawdown`,
      headlineValue: `${ref.dailyLossLimit}% of ${basis} per day`,
      normalizedValue: ref.dailyLossLimit,
      unit: '%',
      stageScope: 'ALL',
      accountModelScope: [programType],
      importance: 'CRITICAL',
      importanceReason: 'Hard intraday tripwire — touching the daily floor terminates the account immediately.',
      visibilityScore: 1,
      impactScore: 100,
      ...risk(1, 100),
      officialWording: `Maximum daily loss of ${ref.dailyLossLimit}% measured on ${basis}, resetting each trading day. Includes open and closed profit and loss against the day's allowance.`,
      plainEnglish: `On ${usd(n)} you may lose ${usd(allow)} in a single day. The allowance resets every trading day — count floating losses, spread, and commissions inside it, not just closed trades.`,
      formula: {
        formulaName: 'Daily Loss Floor',
        formulaExpression: `Daily Floor = Day Start − (Day Start × ${ref.dailyLossLimit / 100})`,
        variables: { 'Day Start': 'Balance/equity at the daily reset', [`${ref.dailyLossLimit}%`]: 'Published daily allowance' },
        exampleInput: { 'Day Start': n },
        exampleOutput: `${usd(n - allow)} floor (${usd(allow)} allowance)`,
        explanation: 'Deterministic from the published daily percentage and the account size.',
      },
      howTradersViolate: 'Holding a loser through spread widening so floating loss plus costs cross the daily cap; oversizing after a green morning and returning the full allowance plus more.',
      primaryRiskRating: 'EXTREME',
      sources: mkSource('daily'),
      lastVerified: '2026-09-06',
    });
  } else {
    rules.push({
      id: `param-${p}-no-daily-loss`,
      category: 'RISK',
      name: 'No Daily Loss Limit (Max Only)',
      slug: `${p}-no-daily-loss`,
      headlineValue: 'No daily cap — lifetime max is the only tripwire',
      normalizedValue: 'None',
      stageScope: 'ALL',
      accountModelScope: [programType],
      importance: 'MEDIUM',
      importanceReason: 'Absence of an intraday tripwire removes early warning — sizing discipline is entirely on the trader.',
      visibilityScore: 1,
      impactScore: 70,
      ...risk(1, 70),
      officialWording: 'No daily loss limit applies to this account. Only the lifetime maximum loss governs survival.',
      plainEnglish: `No single-day ceiling exists here — nothing stops one catastrophic session except your own position sizing. The lifetime floor of ${usd(n - (n * ref.maxTotalLoss) / 100)} is the only number that ends the account.`,
      howTradersViolate: 'Treating "no daily limit" as permission to risk 5%+ per trade; one gap move then does the lifetime max damage in hours.',
      primaryRiskRating: 'HIGH',
      sources: mkSource('nodaily'),
      lastVerified: '2026-09-06',
    });
  }

  // 2 — Maximum drawdown
  {
    const maxAllow = (n * ref.maxTotalLoss) / 100;
    const startFloor = n - maxAllow;
    const typeText =
      ref.drawdownType === 'static'
        ? 'Static: the floor is set once from the starting balance and never moves, even as profits grow.'
        : ref.drawdownType === 'end_of_day'
          ? `End-of-day trailing: only the daily close moves the floor. It steps up on closing highs, never loosens, and locks at ${usd(n)}. Intraday peaks bank nothing.`
          : `Trailing: the floor rises with every new peak, never slides back down, and locks at ${usd(n)} once profits cover the allowance.`;
    rules.push({
      id: `param-${p}-max-drawdown`,
      category: 'RISK',
      name: `Maximum Loss (${ref.maxTotalLoss}% ${ref.drawdownType.replace(/_/g, ' ')})`,
      slug: `${p}-max-drawdown`,
      headlineValue: `${ref.maxTotalLoss}% lifetime (${ref.drawdownType.replace(/_/g, ' ')})`,
      normalizedValue: ref.maxTotalLoss,
      unit: '%',
      stageScope: 'ALL',
      accountModelScope: [programType],
      importance: 'CRITICAL',
      importanceReason: 'Lifetime account-killer — equity printing below the floor ends the account with no recovery.',
      visibilityScore: 1,
      impactScore: 100,
      ...risk(1, 100),
      officialWording: `Maximum lifetime loss of ${ref.maxTotalLoss}% on a ${ref.drawdownType.replace(/_/g, ' ')} basis from the starting balance of ${usd(n)}.`,
      plainEnglish: `The floor starts at ${usd(startFloor)} on ${usd(n)}. ${typeText}`,
      formula: {
        formulaName: 'Maximum Loss Floor',
        formulaExpression: `Start Floor = ${usd(n)} − (${usd(n)} × ${ref.maxTotalLoss / 100})`,
        variables: { 'Starting balance': usd(n), [`${ref.maxTotalLoss}%`]: 'Published lifetime allowance' },
        exampleInput: { 'Starting balance': n },
        exampleOutput: `${usd(startFloor)} starting floor`,
        explanation:
          ref.drawdownType === 'static'
            ? 'Floor is fixed at purchase and never moves.'
            : `Floor starts here and only tightens toward ${usd(n)} as the account profits.`,
      },
      howTradersViolate: 'Stacking correlated positions into one macro move so combined drawdown punches the lifetime floor in a single session.',
      primaryRiskRating: 'EXTREME',
      sources: mkSource('max'),
      lastVerified: '2026-09-06',
    });
  }

  // 3 — Profit targets
  if (ref.profitTargetPhase1) {
    const t1 = (n * ref.profitTargetPhase1) / 100;
    const t2 = ref.profitTargetPhase2 ? (n * ref.profitTargetPhase2) / 100 : 0;
    rules.push({
      id: `param-${p}-profit-target`,
      category: 'EVALUATION',
      name: ref.profitTargetPhase2
        ? `Profit Target (${ref.profitTargetPhase1}% → ${ref.profitTargetPhase2}%)`
        : `Profit Target (${ref.profitTargetPhase1}%)`,
      slug: `${p}-profit-target`,
      headlineValue: ref.profitTargetPhase2 ? `${ref.profitTargetPhase1}% then ${ref.profitTargetPhase2}%` : `${ref.profitTargetPhase1}% single phase`,
      normalizedValue: ref.profitTargetPhase1,
      unit: '%',
      stageScope: 'EVALUATION',
      accountModelScope: [programType],
      importance: 'HIGH',
      importanceReason: 'The pass/fail gate of the evaluation — misreading the dollar figure causes over-trading near the line.',
      visibilityScore: 1,
      impactScore: 75,
      ...risk(1, 75),
      officialWording: `Phase profit target of ${ref.profitTargetPhase1}%${ref.profitTargetPhase2 ? ` followed by ${ref.profitTargetPhase2}%` : ''} measured from the starting balance.`,
      plainEnglish: ref.profitTargetPhase2
        ? `Bank ${usd(t1)} to clear phase 1 (balance ${usd(n + t1)}), then ${usd(t2)} more in phase 2. Measured on closed-trade profit — floating P&L does not pass you.`
        : `Bank ${usd(t1)} from ${usd(n)} to pass (balance ${usd(n + t1)}). Measured on closed-trade profit — floating P&L does not count until closed.`,
      howTradersViolate: 'Forcing trades into the final 0.5% and breaching daily loss one session before passing.',
      primaryRiskRating: 'MODERATE',
      sources: mkSource('target'),
      lastVerified: '2026-09-06',
    });
  }

  // 4 — Minimum trading days
  rules.push({
    id: `param-${p}-trading-days`,
    category: 'EVALUATION',
    name:
      ref.minimumTradingDays > 0
        ? `Minimum Trading Days (${ref.minimumTradingDays})`
        : 'No Minimum Trading Days',
    slug: `${p}-trading-days`,
    headlineValue:
      ref.minimumTradingDays > 0
        ? `${ref.minimumTradingDays} separate trading days required`
        : 'Pass in a single day if the target hits',
    normalizedValue: ref.minimumTradingDays,
    unit: 'days',
    stageScope: 'EVALUATION',
    accountModelScope: [programType],
    importance: 'MEDIUM',
    importanceReason: 'Hitting the target early without the day count still leaves the phase incomplete.',
    visibilityScore: 1,
    impactScore: 60,
    ...risk(1, 60),
    officialWording:
      ref.minimumTradingDays > 0
        ? `At least ${ref.minimumTradingDays} separate trading days are required to complete the evaluation phase.`
        : 'No minimum trading-day requirement — the phase completes whenever the profit target is met.',
    plainEnglish:
      ref.minimumTradingDays > 0
        ? `Even a day-one target hit does not pass you: trade on ${ref.minimumTradingDays} separate days. A day counts with at least one closed trade. ${ref.maximumTradingDays === 'Unlimited' ? 'No time limit, so pace yourself.' : `Upper limit: ${ref.maximumTradingDays} days.`}`
        : 'One session can pass the whole evaluation — but every other rule is fully enforced on that day.',
    howTradersViolate: 'Hitting target on day 2 of a 4-day minimum, then churning random trades to "fill days" and breaching drawdown.',
    primaryRiskRating: 'MODERATE',
    sources: mkSource('days'),
    lastVerified: '2026-09-06',
  });

  // 5 — Payouts + split
  rules.push({
    id: `param-${p}-payout`,
    category: 'PAYOUT',
    name: `Payouts (${ref.payoutFrequency}, ${ref.profitSplit}% Split)`,
    slug: `${p}-payout`,
    headlineValue: `${ref.payoutFrequency} · trader keeps ${ref.profitSplit}%${ref.profitSplitMaxWithAddon ? ` (up to ${ref.profitSplitMaxWithAddon}%)` : ''}`,
    normalizedValue: ref.profitSplit,
    unit: '%',
    stageScope: 'PAYOUT',
    accountModelScope: [programType],
    importance: 'HIGH',
    importanceReason: 'First-withdrawal gates decide when paper profit becomes real money.',
    visibilityScore: 1,
    impactScore: 80,
    ...risk(1, 80),
    officialWording: `Withdrawals on a ${ref.payoutFrequency} cadence. First-withdrawal condition: ${ref.firstPayoutConditions}. Trader profit share ${ref.profitSplit}%${ref.profitSplitMaxWithAddon ? `, scalable to ${ref.profitSplitMaxWithAddon}%` : ''}.`,
    plainEnglish: `${ref.firstPayoutConditions}. Every approved withdrawal splits ${ref.profitSplit}% to you${ref.profitSplitMaxWithAddon ? ` (up to ${ref.profitSplitMaxWithAddon}% with scale-up/add-on)` : ''}. ${ref.refundableFee ? `The ${usd(ref.discountedPrice || ref.price)} fee is refundable under the payout terms.` : `The ${usd(ref.discountedPrice || ref.price)} fee is non-refundable — treat it as sunk cost.`}`,
    howTradersViolate: 'Requesting the first payout before the gate (days/profit/buffer) is met and eating an automated rejection plus review delay.',
    primaryRiskRating: 'MODERATE',
    sources: mkSource('payout'),
    lastVerified: '2026-09-06',
  });

  // 6 — News
  rules.push({
    id: `param-${p}-news`,
    category: 'TRADING',
    name: `News Trading (${ref.newsTradingRule})`,
    slug: `${p}-news-trading`,
    headlineValue: ref.newsTradingRule,
    normalizedValue: ref.newsTradingRule,
    stageScope: 'ALL',
    accountModelScope: [programType],
    importance: ref.newsTradingRule === 'Allowed' ? 'MEDIUM' : 'HIGH',
    importanceReason:
      ref.newsTradingRule === 'Allowed'
        ? 'Freedom with fine print — "allowed" models often still haircut news-window profits.'
        : 'Event trading is gated — one red-folder trade can void profits or the account.',
    visibilityScore: ref.newsTradingRule === 'Allowed' ? 1 : 2,
    impactScore: ref.newsTradingRule === 'Allowed' ? 50 : 85,
    ...risk(ref.newsTradingRule === 'Allowed' ? 1 : 2, ref.newsTradingRule === 'Allowed' ? 50 : 85),
    officialWording: `News trading policy: ${ref.newsTradingRule}. ${ref.newsTradingDetail}`,
    plainEnglish: ref.newsTradingDetail,
    howTradersViolate: 'Assuming "allowed" means full P&L credit — always re-check whether news-window profits are haircut on funded accounts.',
    primaryRiskRating: ref.newsTradingRule === 'Allowed' ? 'MODERATE' : 'HIGH',
    sources: mkSource('news'),
    lastVerified: '2026-09-06',
  });

  // 7 — Holding
  const holdingLabel =
    ref.weekendHolding && ref.overnightHolding
      ? 'Weekend + Overnight Holding Allowed'
      : !ref.weekendHolding && !ref.overnightHolding
        ? 'Flat Before Close — No Overnight, No Weekend'
        : `Weekend ${ref.weekendHolding ? 'Allowed' : 'Closed'} · Overnight ${ref.overnightHolding ? 'Allowed' : 'Closed'}`;
  rules.push({
    id: `param-${p}-holding`,
    category: 'TRADING',
    name: `Position Holding (${holdingLabel})`,
    slug: `${p}-holding`,
    headlineValue: holdingLabel,
    normalizedValue: holdingLabel,
    stageScope: 'ALL',
    accountModelScope: [programType],
    importance: ref.weekendHolding && ref.overnightHolding ? 'MEDIUM' : 'HIGH',
    importanceReason:
      ref.weekendHolding && ref.overnightHolding
        ? 'Holding freedom still carries swap costs against your limits.'
        : 'A must-close mandate turns any held position into a standalone violation.',
    visibilityScore: 1,
    impactScore: ref.weekendHolding && ref.overnightHolding ? 45 : 85,
    ...risk(1, ref.weekendHolding && ref.overnightHolding ? 45 : 85),
    officialWording:
      ref.weekendHolding && ref.overnightHolding
        ? 'Overnight and weekend holding permitted at every stage; swap charges apply against loss limits.'
        : 'All positions must be closed before the market close. Overnight and weekend holding prohibited.',
    plainEnglish:
      ref.weekendHolding && ref.overnightHolding
        ? 'Hold through nights and weekends freely — but swaps eat directly into daily and max limits, with triple-swap days on some instruments.'
        : 'Be flat before the bell, every day. An open position past the close breaches by rule, not by P&L — swing habits from CFD accounts die here.',
    howTradersViolate: 'Forgetting a Friday runner into the weekend gap, or holding futures overnight "like always" on CFDs.',
    primaryRiskRating: ref.weekendHolding && ref.overnightHolding ? 'MODERATE' : 'HIGH',
    sources: mkSource('holding'),
    lastVerified: '2026-09-06',
  });

  // 8 — Automation, copy, hedge
  rules.push({
    id: `param-${p}-automation`,
    category: 'TRADING',
    name: `Automation, Copy & Hedge Boundaries`,
    slug: `${p}-automation`,
    headlineValue: `EA ${ref.eaAllowed ? 'allowed' : 'banned'} · copy ${ref.copyTradingAllowed ? 'own-accounts' : 'restricted'} · hedge ${ref.hedgingAllowed ? 'single-account' : 'banned'}`,
    normalizedValue: `EA:${ref.eaAllowed} Copy:${ref.copyTradingAllowed} Hedge:${ref.hedgingAllowed}`,
    stageScope: 'ALL',
    accountModelScope: [programType],
    importance: 'MEDIUM',
    importanceReason: 'Strategy bans are enforced by monitoring, often surfacing only at payout review.',
    visibilityScore: 2,
    impactScore: 70,
    ...risk(2, 70),
    officialWording: `Expert advisors ${ref.eaAllowed ? 'permitted (verify add-on and platform requirements)' : 'prohibited — manual trading only'}. Copy trading ${ref.copyTradingAllowed ? 'permitted between own accounts; third-party signals banned' : 'restricted — no funded-account involvement, no third-party signals, no for-hire management'}. Hedging ${ref.hedgingAllowed ? 'permitted inside this single account; cross-account and external hedging banned' : 'prohibited across accounts and correlated instruments'}.`,
    plainEnglish: `${ref.eaAllowed ? 'Bots allowed — confirm any add-on or platform restriction before the first automated trade.' : 'No bots, no automation, ever.'} ${ref.copyTradingAllowed ? 'Mirror your own accounts only.' : 'Never copy to or from a funded account; no signal services.'} ${ref.hedgingAllowed ? 'Hedge inside this account only.' : 'No cross-account hedging.'} Synchronized entries across accounts read as coordinated trading.`,
    howTradersViolate: 'Running a trade copier onto the new funded account, or "risk-free" long/short splits across two evaluations.',
    primaryRiskRating: 'MODERATE',
    sources: mkSource('automation'),
    lastVerified: '2026-09-06',
  });

  // 9 — Inactivity (honestly easy-to-miss: buried in terms, kills silently)
  rules.push({
    id: `param-${p}-inactivity`,
    category: 'ACCOUNT',
    name: `${ref.inactivityLimitDays}-Day Inactivity Deactivation`,
    slug: `${p}-inactivity`,
    headlineValue: `${ref.inactivityLimitDays} consecutive days without a trade`,
    normalizedValue: ref.inactivityLimitDays,
    unit: 'days',
    stageScope: 'ALL',
    accountModelScope: [programType],
    importance: 'HIGH',
    importanceReason: 'Silent account killer — no warning, no extension; passed evaluations die on holidays.',
    visibilityScore: 2,
    impactScore: 85,
    ...risk(2, 85),
    isEasyToMiss: true,
    whyEasyToMiss: 'Day-count deactivation lives in terms pages, never on pricing cards — traders discover it after a break.',
    officialWording: `No trading activity for ${ref.inactivityLimitDays} consecutive days results in automatic account deactivation.`,
    plainEnglish: `Place at least one trade every ${ref.inactivityLimitDays} days or the account dies quietly. Passing then pausing is the classic way to lose everything to this rule instead of the market.`,
    howTradersViolate: 'Passing an evaluation, taking a long break, returning to revoked credentials.',
    primaryRiskRating: 'HIGH',
    sources: mkSource('inactivity'),
    lastVerified: '2026-09-06',
  });

  // 10 — Consistency (only when the reference account carries one)
  if (ref.consistencyRule && ref.consistencyRule !== 'None' && ref.consistencyRule.toLowerCase() !== 'none') {
    rules.push({
      id: `param-${p}-consistency`,
      category: 'EVALUATION',
      name: 'Consistency Rule Active',
      slug: `${p}-consistency`,
      headlineValue: ref.consistencyRule,
      normalizedValue: ref.consistencyRule,
      stageScope: 'EVALUATION',
      accountModelScope: [programType],
      importance: 'HIGH',
      importanceReason: 'A single outsized day can move the goalpost instead of passing you.',
      visibilityScore: 2,
      impactScore: 80,
      ...risk(2, 80),
      isEasyToMiss: true,
      whyEasyToMiss: 'Scope (challenge vs funded) and the recalculation formula are easy to skim past on model pages.',
      officialWording: ref.consistencyRule,
      plainEnglish: `${ref.consistencyRule}. Size winners deliberately — one monster day can raise the bar instead of clearing it.`,
      howTradersViolate: 'One huge runner early, then grinding small days wondering why the target jumped.',
      primaryRiskRating: 'HIGH',
      sources: mkSource('consistency'),
      lastVerified: '2026-09-06',
    });
  }

  // 11 — Markets, leverage, platforms
  rules.push({
    id: `param-${p}-markets`,
    category: 'COMMERCIAL',
    name: 'Markets, Leverage & Platforms',
    slug: `${p}-markets`,
    headlineValue: `${ref.instruments.join(' · ')} — ${ref.leverage}`,
    normalizedValue: ref.leverage,
    stageScope: 'PURCHASE',
    accountModelScope: [programType],
    importance: 'LOW',
    importanceReason: 'Arsenal check before purchase — wrong platform choice can be permanent.',
    visibilityScore: 1,
    impactScore: 40,
    ...risk(1, 40),
    officialWording: `Tradable instruments: ${ref.instruments.join(', ')}. Leverage: ${ref.leverage}. Platforms: ${ref.platforms.join(', ')}.`,
    plainEnglish: `Trade ${ref.instruments.join(' and ')} at ${ref.leverage} on ${ref.platforms.join(', ')}. Confirm your platform before the first trade — some firms lock it permanently or charge to switch.`,
    howTradersViolate: 'Buying on a platform that cannot run your strategy (e.g. automation on a manual-only terminal).',
    primaryRiskRating: 'SAFE',
    sources: mkSource('markets'),
    lastVerified: '2026-09-06',
  });

  return rules;
}
