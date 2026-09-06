import React from 'react';
import { PropFirm, AccountTier, SourceEvidence } from '../types/schema.ts';
import { RiskSimulator } from '../components/simulator/RiskSimulator.tsx';
import { RuleCard } from '../components/rules/RuleCard.tsx';
import { ShieldAlert, ArrowLeft, Receipt, Wallet, Calculator, Info, FileCheck2 } from 'lucide-react';
import { calculateAllInCost } from '../core/calculator/engine.ts';
import { ruleAppliesToProgram } from '../core/pipeline/parameterRules.ts';
import { SameTradeVisual } from '../components/comparison/SameTradeVisual.tsx';

interface AccountDetailPageProps {
  firm: PropFirm;
  account: AccountTier;
  onNavigate: (path: string) => void;
  onOpenSource: (evidence: SourceEvidence, ruleTitle: string) => void;
}

interface InfoCard {
  badge: string;
  title: string;
  desc: string;
  foot: string | null;
  color: string;
}

const usd = (n: number): string => '$' + Math.round(n).toLocaleString();

/* Shared card — identical UI for "How Can I Fail" + "Every Rule" sections */
const InfoCardView: React.FC<{
  card: InfoCard;
  source?: SourceEvidence | null;
  sourceLabel?: string;
  onOpenSource?: (evidence: SourceEvidence, ruleTitle: string) => void;
}> = ({ card, source, sourceLabel, onOpenSource }) => (
  <div className={`p-5 bg-[#080A10] border ${card.color} rounded-2xl space-y-2.5 flex flex-col`}>
    <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-[#111318] text-[#8A8F98] border border-[#1F2228] self-start tracking-wide">{card.badge}</span>
    <h3 className="text-[13px] font-bold text-white leading-tight">{card.title}</h3>
    <p className="text-[13px] text-[#8A8F98] leading-relaxed flex-1">{card.desc}</p>
    {card.foot && <div className="p-2.5 rounded-xl bg-[#111318] border border-[#1F2228] text-[13px] text-[#8A8F98] leading-relaxed">{card.foot}</div>}
    {source && onOpenSource && (
      <button
        onClick={() => onOpenSource(source, card.title)}
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-sky-400 hover:text-sky-300 transition-colors self-start min-h-[32px]"
      >
        <FileCheck2 className="w-3.5 h-3.5" />
        {sourceLabel || 'View official source'}
      </button>
    )}
  </div>
);

/* Build one fail-style card per rule, with THIS account's exact numbers */
function buildAccountRuleCards(firm: PropFirm, account: AccountTier): InfoCard[] {
  const n = account.nominalSize;
  const cards: InfoCard[] = [];
  const isEOD = account.drawdownType === 'end_of_day';
  const isTrailing = account.drawdownType === 'trailing_balance' || account.drawdownType === 'trailing_equity' || account.drawdownType === 'intraday_equity';

  // 1 — Daily drawdown
  if (account.dailyLossLimit > 0) {
    const allow = (n * account.dailyLossLimit) / 100;
    if (isEOD) {
      cards.push({
        badge: 'Daily cap · Soft breach',
        title: `Daily Loss Limit: ${account.dailyLossLimit}% (${usd(allow)}/day)`,
        desc: `Touching the daily cap does NOT kill this account — trading pauses for the rest of the session and resumes the next day. The cap resets at 5:00 PM CT, not midnight server time. The lifetime EOD-trailing max still applies underneath.`,
        foot: `Lose ${usd(allow)} in one session = locked out till tomorrow. Account survives.`,
        color: 'border-amber-500/20',
      });
    } else {
      cards.push({
        badge: 'Critical · Daily',
        title: `Daily Loss Limit: ${account.dailyLossLimit}% (${usd(allow)}/day)`,
        desc: `Your daily allowance is fixed off the starting balance and counts open + closed P&L. It resets at 0:00 server time. Intraday profits temporarily widen the buffer, but the base never changes — lose the full allowance in 24 hours and the account is terminated on the spot.`,
        foot: `Floor today: ${usd(n - allow)} on ${usd(n)}. A single red day of ${usd(allow)} = immediate breach.`,
        color: 'border-red-500/20',
      });
    }
  } else {
    const maxFloor = n - (n * account.maxTotalLoss) / 100;
    cards.push({
      badge: 'No daily cap',
      title: 'No Daily Loss Limit',
      desc: `There is no intraday tripwire on this account — no early warning before the end. Only the lifetime maximum protects you, which also means nothing stops a single catastrophic session except your own sizing.`,
      foot: `The only number that can kill this account: ${usd(maxFloor)} (${account.maxTotalLoss}% max).`,
      color: 'border-[#1F2228]',
    });
  }

  // 2 — Max drawdown
  {
    const maxAllow = (n * account.maxTotalLoss) / 100;
    const startFloor = n - maxAllow;
    const typeLine =
      account.drawdownType === 'static'
        ? 'Static: the floor is set once from your starting balance and never moves — profits never drag it up behind you.'
        : isEOD
          ? `End-of-day trailing: only your daily CLOSE moves the floor. It steps up on closing highs, never loosens, and locks at ${usd(n)}. Intraday peaks bank nothing.`
          : `Trailing: the floor rises with every new peak, never slides back down, and locks at ${usd(n)} once profits cover the full allowance.`;
    cards.push({
      badge: 'Critical · Max',
      title: `Maximum Loss: ${account.maxTotalLoss}% (floor starts at ${usd(startFloor)})`,
      desc: `${typeLine} Across the whole lifetime of the account, equity can never print below the current floor.`,
      foot: `Starting floor: ${usd(startFloor)} on ${usd(n)}${account.drawdownType === 'static' ? ' — forever.' : ` — tightens toward ${usd(n)} as you profit.`}`,
      color: 'border-red-500/20',
    });
  }

  // 3 — Profit targets
  if (account.profitTargetPhase1) {
    const t1 = (n * account.profitTargetPhase1) / 100;
    const t2 = account.profitTargetPhase2 ? (n * account.profitTargetPhase2) / 100 : 0;
    cards.push({
      badge: account.profitTargetPhase2 ? 'Phase 1 + Phase 2' : 'Single phase',
      title: account.profitTargetPhase2
        ? `Profit Target: ${account.profitTargetPhase1}% (${usd(t1)}) → ${account.profitTargetPhase2}% (${usd(t2)})`
        : `Profit Target: ${account.profitTargetPhase1}% (${usd(t1)})`,
      desc: account.profitTargetPhase2
        ? `Bank ${usd(t1)} to clear phase 1, then ${usd(t2)} more in phase 2. Targets are measured on closed-trade profit from the starting balance — open floating P&L does not pass you.`
        : `Bank ${usd(t1)} from the starting balance to pass. Measured on closed-trade profit — floating P&L does not count until you close.`,
      foot: `Target balance: ${usd(n + t1)}${t2 ? `, then ${usd(n + t1 + t2)} overall.` : '.'}`,
      color: 'border-emerald-500/20',
    });
  } else {
    cards.push({
      badge: 'Instant funding',
      title: 'No Profit Target',
      desc: `This account is funded from day one — there is nothing to pass. Your only job is protecting the trailing maximum while growing toward an on-demand withdrawal.`,
      foot: null,
      color: 'border-emerald-500/20',
    });
  }

  // 4 — Trading days
  if (account.minimumTradingDays > 0) {
    cards.push({
      badge: 'Evaluation gate',
      title: `Minimum Trading Days: ${account.minimumTradingDays}`,
      desc: `You must trade on at least ${account.minimumTradingDays} separate days before the phase counts as passed — even if you hit the profit target on day one. A trading day counts when you place at least one trade that closes with non-zero P&L.`,
      foot: account.maximumTradingDays === 'Unlimited' ? 'No time limit — take as many days as you need.' : `Time limit: ${account.maximumTradingDays} days maximum.`,
      color: 'border-[#1F2228]',
    });
  } else {
    cards.push({
      badge: 'No day minimum',
      title: 'No Minimum Trading Days',
      desc: `Hit the target in a single session and you pass — no forced grinding. Discipline still applies: every other rule (drawdown, consistency where active, strategy bans) is fully enforced on that one day.`,
      foot: account.maximumTradingDays === 'Unlimited' ? 'No time limit either — but no reason to wait.' : `Time limit still applies: ${account.maximumTradingDays} days maximum.`,
      color: 'border-[#1F2228]',
    });
  }

  // 5 — Payouts
  cards.push({
    badge: 'Payout gate',
    title: `Payouts: ${account.payoutFrequency} · ${account.profitSplit}% split`,
    desc: `${account.firstPayoutConditions}. Your share of every approved withdrawal is ${account.profitSplit}%${account.profitSplitMaxWithAddon ? `, up to ${account.profitSplitMaxWithAddon}% with the scale-up/add-on` : ''}.`,
    foot: account.refundableFee
      ? `Fee ${usd(account.discountedPrice || account.price)} — refundable under the payout terms above.`
      : `Fee ${usd(account.discountedPrice || account.price)} — non-refundable. Treat it as sunk cost.`,
    color: 'border-[#1F2228]',
  });

  // 6 — News
  cards.push({
    badge: account.newsTradingRule === 'Allowed' ? 'News · Allowed' : account.newsTradingRule === 'Restricted' ? 'News · Conditional' : 'News · Banned',
    title: `News Trading: ${account.newsTradingRule}`,
    desc: account.newsTradingDetail,
    foot: null,
    color: account.newsTradingRule === 'Allowed' ? 'border-emerald-500/20' : account.newsTradingRule === 'Restricted' ? 'border-amber-500/20' : 'border-red-500/20',
  });

  // 7 — Holding
  if (account.weekendHolding && account.overnightHolding) {
    cards.push({
      badge: 'Holding · Free',
      title: 'Weekend + Overnight Holding: Allowed',
      desc: `Positions may stay open overnight and over the weekend at every stage. Swap charges still apply — and swap counts against your daily and maximum loss limits, with triple-swap days on some instruments.`,
      foot: null,
      color: 'border-emerald-500/20',
    });
  } else if (!account.weekendHolding && !account.overnightHolding) {
    cards.push({
      badge: 'Holding · Strict',
      title: 'Flat Before Close — No Overnight, No Weekend',
      desc: `Every position must be closed before the market close. Being in a trade past the close is itself a rule violation — independent of profit or loss. Swing strategies built for CFD holding will breach here by habit, not by P&L.`,
      foot: 'Close everything before the bell. No exceptions.',
      color: 'border-red-500/20',
    });
  } else {
    cards.push({
      badge: 'Holding · Mixed',
      title: `Holding: Weekend ${account.weekendHolding ? 'Allowed' : 'Closed'} · Overnight ${account.overnightHolding ? 'Allowed' : 'Closed'}`,
      desc: account.newsTradingDetail,
      foot: null,
      color: 'border-amber-500/20',
    });
  }

  // 8 — EAs
  cards.push({
    badge: 'Automation',
    title: `Expert Advisors / Bots: ${account.eaAllowed ? 'Allowed' : 'Not Allowed'}`,
    desc: account.eaAllowed
      ? `Automation is permitted — but verify whether your firm requires a paid add-on, platform restriction (MT4/MT5 only at some firms), or bot registration before the first automated trade. Unauthorized automation is a standalone violation.`
      : `Manual trading only. Any EA, bot, or automation layer is prohibited on this account.`,
    foot: null,
    color: account.eaAllowed ? 'border-[#1F2228]' : 'border-amber-500/20',
  });

  // 9 — Copy & hedge
  cards.push({
    badge: 'Boundaries',
    title: 'Copy Trading & Hedging Boundaries',
    desc: `${account.copyTradingAllowed ? 'Copy trading between your own accounts is permitted — third-party signals and for-hire management stay banned.' : 'Copy trading involving a funded account (either direction), third-party signals, and for-hire account management are prohibited.'} ${account.hedgingAllowed ? 'Hedging inside this single account is fine; mirrored positions across accounts or external brokers are banned.' : 'Cross-account and correlated-instrument hedging are banned.'}`,
    foot: 'Identical-trade monitoring flags synchronized entries across accounts.',
    color: 'border-amber-500/20',
  });

  // 10 — Inactivity
  cards.push({
    badge: 'Silent killer',
    title: `Inactivity: ${account.inactivityLimitDays} Days`,
    desc: `Place at least one trade every ${account.inactivityLimitDays} consecutive days or the account is automatically deactivated — no warning email, no extension. This kills more passed evaluations than any market move: traders pass, take a break, and return to revoked credentials.`,
    foot: 'Mitigation: set a calendar reminder or place a 0.01 micro-lot trade.',
    color: 'border-orange-500/20',
  });

  // 11 — Consistency (only when the account carries one)
  if (account.consistencyRule && account.consistencyRule !== 'None') {
    cards.push({
      badge: 'Consistency',
      title: 'Consistency Rule Active',
      desc: account.consistencyRule,
      foot: 'One monster day can move the goalpost instead of failing you — size winners deliberately.',
      color: 'border-amber-500/20',
    });
  }

  // 12 — Markets, leverage, platforms
  cards.push({
    badge: 'Arsenal',
    title: 'Markets, Leverage & Platforms',
    desc: `Trade ${account.instruments.join(' · ')}. Leverage: ${account.leverage}. Platforms: ${account.platforms.join(', ')}.`,
    foot: firm.slug === 'funded-next' && isEOD ? 'Futures run on Tradovate — use the same email as your dashboard.' : null,
    color: 'border-[#1F2228]',
  });

  return cards;
}

/* Four biggest account-killers, derived from THIS account's real numbers */
function buildFailCards(firm: PropFirm, account: AccountTier): InfoCard[] {
  const n = account.nominalSize;
  const isEOD = account.drawdownType === 'end_of_day';
  const cards: InfoCard[] = [];

  if (account.dailyLossLimit > 0 && !isEOD) {
    const allow = (n * account.dailyLossLimit) / 100;
    cards.push({
      badge: '#1 Biggest Risk',
      title: 'Daily Loss at 00:00 Rollover',
      desc: 'Daily loss is calculated against your day-starting balance/equity. Holding floating drawdown into the 00:00 server reset can breach on spread widening alone.',
      foot: `Limit: losing ${usd(allow)} in 24h = immediate breach.`,
      color: 'border-red-500/20',
    });
  } else if (isEOD) {
    const maxAllow = (n * account.maxTotalLoss) / 100;
    cards.push({
      badge: '#1 Biggest Risk',
      title: 'EOD Floor Steps Up Behind You',
      desc: 'Only your daily close moves the maximum-loss floor — intraday peaks bank nothing, but every closing high permanently tightens your room. Grinding up slowly then holding losers overnight is how EOD accounts die.',
      foot: `Floor starts at ${usd(n - maxAllow)} and can only tighten toward ${usd(n)}.`,
      color: 'border-red-500/20',
    });
  } else {
    const maxAllow = (n * account.maxTotalLoss) / 100;
    cards.push({
      badge: '#1 Biggest Risk',
      title: 'Trailing Max Squeeze After Green Runs',
      desc: 'With no daily loss to warn you, the trailing maximum is the only tripwire. Early profits ratchet the floor up — then a normal pullback from the new high tags it.',
      foot: `Floor starts at ${usd(n - maxAllow)} and locks at ${usd(n)}. Size for the trailed floor, not the peak.`,
      color: 'border-red-500/20',
    });
  }

  cards.push({
    badge: '#2 Second Risk',
    title: `${account.inactivityLimitDays}-Day Inactivity Forfeiture`,
    desc: `${account.inactivityLimitDays} consecutive days without a trade = automatic lock and revoked credentials. Many pass the evaluation and pause before the next step, losing all progress.`,
    foot: 'Mitigation: set a reminder or place a 0.01 micro-lot trade.',
    color: 'border-orange-500/20',
  });

  cards.push({
    badge: 'Payout Trap',
    title: 'Withdrawal Gates Bite After Passing',
    desc: account.firstPayoutConditions,
    foot: 'Open positions or pending orders at withdrawal time = automated rejection at most firms. Go flat first.',
    color: 'border-amber-500/20',
  });

  cards.push({
    badge: 'Strategy Trap',
    title: 'Banned Patterns Pass Silently, Fail at Payout',
    desc: 'Grid, martingale, all-in sizing, copied signals, and cross-account hedging often trigger no dashboard warning during evaluation — the review lands when you request real money.',
    foot: null,
    color: 'border-[#1F2228]',
  });

  return cards;
}

export const AccountDetailPage: React.FC<AccountDetailPageProps> = ({ firm, account, onNavigate, onOpenSource }) => {
  const ruleCards = buildAccountRuleCards(firm, account);
  const failCards = buildFailCards(firm, account);
  const primarySource: SourceEvidence | null = account.sources[0] || firm.rules[0]?.sources[0] || null;
  // Program-scoped clause rules: this account's program only (e.g. GOAT 1-Step
  // never shows 2-Step Standard rails, Instant never shows evaluation targets).
  const accountProgram = firm.programs.find((p) => p.accounts.some((a) => a.id === account.id));
  const scopedClauseRules = firm.rules.filter((r) =>
    ruleAppliesToProgram(r, accountProgram?.programType, accountProgram?.slug)
  );

  return (
    <div className="bg-[#080A10] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Eyebrow */}
        <div className="pt-10 sm:pt-12 pb-8 border-b border-[#1F2228]">
          <button onClick={() => onNavigate(`/prop-firms/${firm.slug}`)} className="inline-flex items-center gap-1.5 text-[13px] text-[#8A8F98] hover:text-white transition-colors min-h-[44px] px-2 -mx-2 rounded-xl mb-4">
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Back to {firm.name} Dossier</span>
          </button>
          <p className="text-[11px] tracking-[0.14em] uppercase font-medium text-[#8A8F98] mb-3">THE DOSSIER — ACCOUNT DEEP-DIVE</p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#111318] border border-[#1F2228] text-white">{firm.name}</span>
                <span className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98]">Account deep-dive</span>
              </div>
              <h1 className="text-[26px] sm:text-[36px] font-semibold text-white tracking-tight leading-tight">{account.name}</h1>
              <p className="text-[13px] text-[#8A8F98] mt-2 max-w-2xl">Exact dollar thresholds, breach math, and verified sources for this tier.</p>
            </div>
            <div className="shrink-0 bg-[#111318] border border-[#1F2228] rounded-2xl p-4 min-w-[180px]">
              <span className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98] block">Registration Fee</span>
              <span className="text-2xl font-semibold font-mono text-white block mt-1">${account.discountedPrice || account.price}</span>
              {account.refundableFee
                ? <span className="text-[13px] text-emerald-400 block font-medium mt-1">✓ Refundable — see payout terms</span>
                : <span className="text-[13px] text-amber-400 block font-medium mt-1">Non-refundable fee</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8 p-4 rounded-2xl bg-[#111318] border border-[#1F2228]">
          {[
            { label: 'Nominal Capital', value: `$${account.nominalSize.toLocaleString()}`, sub: null },
            { label: 'Daily Drawdown', value: account.dailyLossLimit > 0 ? `${account.dailyLossLimit}%` : 'None', sub: account.dailyLossLimit > 0 ? `$${(account.nominalSize * account.dailyLossLimit / 100).toLocaleString()} • ${account.dailyLossCalculation.replace(/_/g, ' ')}` : 'Only max applies' },
            { label: 'Max Total Loss', value: `${account.maxTotalLoss}%`, sub: `$${(account.nominalSize * account.maxTotalLoss / 100).toLocaleString()} • ${account.drawdownType.replace(/_/g,' ')}` },
            { label: 'Profit Split', value: `${account.profitSplit}%`, sub: account.profitSplitMaxWithAddon ? `Up to ${account.profitSplitMaxWithAddon}%` : 'Trader share' },
            { label: 'Profit Targets', value: account.profitTargetPhase1 ? `P1: ${account.profitTargetPhase1}%` : 'No Target', sub: account.profitTargetPhase2 ? `P2: ${account.profitTargetPhase2}%` : account.profitTargetPhase1 ? 'Single phase' : 'Instant funding' },
            { label: 'Leverage', value: account.leverage, sub: null },
            { label: 'Platforms', value: account.platforms.slice(0,2).join(', '), sub: account.platforms.length>2 ? `+${account.platforms.length-2} more` : null },
            { label: 'Payout Cycle', value: account.payoutFrequency, sub: null },
          ].map((item) => (
            <div key={item.label} className="p-3.5 bg-[#080A10] rounded-xl border border-[#1F2228] space-y-1 min-w-0">
              <span className="text-[11px] text-[#8A8F98] font-medium tracking-[0.08em] uppercase block leading-tight">{item.label}</span>
              <span className="text-[13px] sm:text-[15px] font-semibold text-white block font-mono leading-tight break-words">{item.value}</span>
              {item.sub && <span className="text-[11px] text-[#8A8F98] block leading-tight break-words">{item.sub}</span>}
            </div>
          ))}
        </div>

        {/* All-In Cost to First Payout — Section 26 */}
        {(() => {
          const cost = calculateAllInCost({
            challengeFee: account.price,
            expectedResets: 0,
            activationFee: (account as any).activationFee ?? 0,
            dataFeeMonthly: 0,
            monthsToPayout: 1,
            addOnCost: 0,
            refundableOnFirstPayout: account.refundableFee,
          });
          const realistic = calculateAllInCost({
            challengeFee: account.price,
            expectedResets: 1,
            activationFee: (account as any).activationFee ?? 0,
            dataFeeMonthly: 0,
            monthsToPayout: 1,
            addOnCost: 0,
            refundableOnFirstPayout: account.refundableFee,
          });
          return (
            <section className="mt-8 rounded-2xl bg-[#111318] border border-[#1F2228] overflow-hidden">
              <div className="px-6 sm:px-8 py-5 border-b border-[#1F2228] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"><Receipt className="w-4 h-4 text-emerald-400" /></span>
                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-tight">All-In Cost to First Payout</h3>
                    <p className="text-xs text-white/40 mt-0.5">Sticker price vs real cost — All-In Quantitative Fee Model</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#080A10] text-xs font-semibold">Evidence-based • No affiliate markup</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-[#1F2228]">
                <div className="p-6 space-y-3">
                  <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-white/40">If you pass first try</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-mono font-semibold text-white">${cost.totalPaidBeforePayout.toLocaleString()}</span>
                    <span className="text-xs text-white/40">paid upfront</span>
                  </div>
                  {account.refundableFee && <p className="text-xs font-medium text-emerald-400">→ ${cost.totalAfterRefund.toLocaleString()} net after refund on 1st payout</p>}
                  <div className="space-y-1 pt-2">
                    {cost.breakdown.map(b => (
                      <div key={b.label} className="flex justify-between text-xs"><span className="text-white/40">{b.label}</span><span className={`font-mono ${b.amount<0?'text-emerald-400':'text-white/70'}`}>{b.amount<0?'-':''}${Math.abs(b.amount).toLocaleString()}</span></div>
                    ))}
                  </div>
                  <p className="text-[11px] leading-relaxed text-white/30 pt-2 border-t border-[#1F2228] mt-2">{cost.assumptionNote}</p>
                </div>
                <div className="p-6 space-y-3 bg-amber-500/[0.03]">
                  <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-amber-400">Realistic (1 reset avg)</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-mono font-semibold text-white">${realistic.totalPaidBeforePayout.toLocaleString()}</span>
                    <span className="text-xs text-white/40">paid upfront</span>
                  </div>
                  {account.refundableFee && <p className="text-xs font-medium text-emerald-400">→ ${realistic.totalAfterRefund.toLocaleString()} net after refund</p>}
                  {!account.refundableFee && <p className="text-xs font-medium text-amber-400">Non-refundable — every reset is sunk cost</p>}
                  <div className="space-y-1 pt-2">
                    {realistic.breakdown.map(b => (
                      <div key={b.label} className="flex justify-between text-xs"><span className="text-white/40">{b.label}</span><span className={`font-mono ${b.amount<0?'text-emerald-400':'text-white/70'}`}>{b.amount<0?'-':''}${Math.abs(b.amount).toLocaleString()}</span></div>
                    ))}
                  </div>
                  <p className="text-[11px] leading-relaxed text-white/30 pt-2 border-t border-[#1F2228] mt-2">{realistic.assumptionNote} FPFX base rate: ~7% ever get payout — budget for resets.</p>
                </div>
              </div>
              <div className="px-6 py-3 bg-[#080A10] border-t border-[#1F2228] flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                <p className="text-[11px] leading-relaxed text-white/35">Methodology: challenge + resets + activation + data + add-ons − documented refund. Futures add $38/mo data + $149 activation where applicable. We never hide reset cost behind “bonus” language.</p>
              </div>
            </section>
          );
        })()}

        <section className="mt-8 rounded-2xl bg-[#111318] border border-red-500/20 p-6 sm:p-8 space-y-6">
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <p className="text-[11px] tracking-[0.14em] uppercase font-medium text-red-400">RISK ANALYSIS</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20 mx-auto">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Essential Pre-Purchase Risk Analysis</span>
            </div>
            <h2 className="text-[22px] sm:text-[28px] font-semibold text-white tracking-tight">How Can I Fail This Account?</h2>
            <p className="text-[13px] text-[#8A8F98] leading-relaxed">Before spending capital on this evaluation, these are the exact mathematical and operational tripwires that disqualify traders on this specific model.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {failCards.map((card) => (
              <InfoCardView key={card.title} card={card} source={primarySource} onOpenSource={onOpenSource} />
            ))}
          </div>
        </section>

        {/* ══ EVERY RULE ON THIS ACCOUNT — same fail-card UI, one card per rule ══ */}
        <section className="mt-8 rounded-2xl bg-[#111318] border border-[#1F2228] p-6 sm:p-8 space-y-6">
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <p className="text-[11px] tracking-[0.14em] uppercase font-medium text-emerald-400">COMPLETE RULEBOOK</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 mx-auto">
              <Wallet className="w-4 h-4 shrink-0" />
              <span>{ruleCards.length} Rules · Read Before You Buy</span>
            </div>
            <h2 className="text-[22px] sm:text-[28px] font-semibold text-white tracking-tight">Every Rule on This Account</h2>
            <p className="text-[13px] text-[#8A8F98] leading-relaxed">Daily drawdown, max drawdown, targets, trading days, payouts, news, holding, automation, inactivity — each rule translated to this {account.nominalSize.toLocaleString()} account's exact dollar numbers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ruleCards.map((card) => (
              <InfoCardView key={card.title} card={card} source={primarySource} onOpenSource={onOpenSource} />
            ))}
          </div>
        </section>

        <section className="mt-8 space-y-4">
          <div className="space-y-1 text-center max-w-2xl mx-auto">
            <p className="text-[11px] tracking-[0.14em] uppercase font-medium text-[#8A8F98]">SIMULATOR</p>
            <h2 className="text-[20px] font-semibold text-white flex items-center justify-center gap-2">Interactive Drawdown Simulator</h2>
            <p className="text-[13px] text-[#8A8F98] leading-relaxed">Pre-configured for {account.nominalSize.toLocaleString()} • {account.dailyLossLimit}% daily, {account.maxTotalLoss}% max — adjust equity to test breach.</p>
          </div>
          <RiskSimulator initialNominalSize={account.nominalSize} initialDailyLossPct={account.dailyLossLimit} initialMaxLossPct={account.maxTotalLoss} initialDrawdownType={account.drawdownType} />
        </section>

        {/* Same-Trade Visual — Signature Moat (Section 27) */}
        <section className="mt-8 space-y-3">
          <div className="text-center">
            <p className="text-[11px] tracking-[0.14em] uppercase font-medium text-[#8A8F98]">SIGNATURE VISUAL</p>
            <h3 className="text-[18px] font-semibold text-white tracking-tight mt-1">Same trade, different fate — see why</h3>
            <p className="text-[13px] text-[#8A8F98] max-w-2xl mx-auto">
              This +1.8% win (+${Math.round(account.nominalSize * 0.018).toLocaleString()}) followed by a -0.5% loss with an intraday dip is replayed against each program's real drawdown math.
            </p>
          </div>
          <SameTradeVisual
            startingEquity={account.nominalSize}
            trades={[
              { label: 'Day 1 Win (+1.8%)', pnl: Math.round(account.nominalSize * 0.018) },
              { label: 'Day 2 Loss (-0.5%)', pnl: Math.round(account.nominalSize * -0.005), equityDip: Math.round(account.nominalSize * 0.965) },
              { label: 'Day 3 Overnight (+0.3%)', pnl: Math.round(account.nominalSize * 0.003), equityDip: Math.round(account.nominalSize * 0.99) },
            ]}
            accounts={(() => {
              const sets = firm.programs.slice(0,4).map(p => {
                const acc = p.accounts.find(a=>a.nominalSize===account.nominalSize) || p.accounts[0] || account;
                return { name: `${firm.brandName} ${p.name}`, account: acc, color: '#2563eb' };
              });
              // Ensure at least 2 distinct examples
              if (sets.length === 1) {
                sets.push({ name: `${firm.brandName} Instant (5% trail)`, account: { ...account, maxTotalLoss: 5, drawdownType: 'trailing_equity' as const }, color: '#f59e0b' });
              }
              return sets.slice(0,4);
            })()}
          />
        </section>

        <section className="mt-10 space-y-4">
          <div className="space-y-1 border-b border-[#1F2228] pb-4 text-center">
            <p className="text-[11px] tracking-[0.14em] uppercase font-medium text-[#8A8F98]">THE RULES · {scopedClauseRules.length} APPLY TO THIS {accountProgram ? accountProgram.name.toUpperCase() : 'ACCOUNT'}</p>
            <h2 className="text-[20px] font-semibold text-white">Explain the Rules</h2>
            <p className="text-[13px] text-[#8A8F98] leading-relaxed max-w-xl mx-auto">Exact formulas, plain translations, and verified source citations — filtered to {scopedClauseRules.length} of {firm.rules.length} firm rules that govern this program.</p>
          </div>
          <div className="space-y-3">
            {scopedClauseRules.map((rule) => (
              <RuleCard key={rule.id} rule={rule} onOpenSource={onOpenSource} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
