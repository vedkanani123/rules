import React, { useState, useMemo } from 'react';
import {
  Scale,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  DollarSign,
  Zap,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { PROP_FIRMS_DATA } from '../../data/propFirmsData.ts';

interface GoatV3PhaseByPhaseRulesMatrixProps {
  onBackToHub?: () => void;
}

export const GoatV3PhaseByPhaseRulesMatrix: React.FC<GoatV3PhaseByPhaseRulesMatrixProps> = ({
  onBackToHub,
}) => {
  const gftFirm = useMemo(() => {
    return (
      PROP_FIRMS_DATA.find((f) => f.slug === 'goat-funded-trader') ||
      PROP_FIRMS_DATA[0]
    );
  }, []);

  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    gftFirm.programs[0]?.id || 'prog-2step-standard'
  );
  const [selectedCapital, setSelectedCapital] = useState<number>(100000);
  const [expandedRowSlug, setExpandedRowSlug] = useState<string | null>(null);

  const currentProgram = useMemo(() => {
    return (
      gftFirm.programs.find((p) => p.id === selectedProgramId) ||
      gftFirm.programs[0]
    );
  }, [gftFirm, selectedProgramId]);

  const availableSizes = useMemo(() => {
    const sizes = currentProgram?.accounts.map((a) => a.nominalSize) || [];
    const unique = Array.from(new Set(sizes)).sort((a, b) => a - b);
    return unique.length > 0 ? unique : [5000, 10000, 25000, 50000, 100000, 200000];
  }, [currentProgram]);

  const currentAccount = useMemo(() => {
    const acc = currentProgram?.accounts.find(
      (a) => a.nominalSize === selectedCapital
    );
    return acc || currentProgram?.accounts[0] || ({} as any);
  }, [currentProgram, selectedCapital]);

  const isInstant = currentProgram?.programType === 'Instant';
  const is1Step = currentProgram?.stagesCount === 1;

  const fmt = (n: number) => `$${n.toLocaleString('en-US')}`;
  const pctFmt = (pct: number, cap: number) =>
    `${pct}% (${fmt((cap * pct) / 100)})`;

  // Column definitions based on model structure
  const columnConfig = useMemo(() => {
    if (isInstant) {
      return [
        {
          key: 'funded',
          label: '⚡ Live Funded Stage',
          sub: 'Live rewards begin immediately',
          class: 'text-emerald-400 bg-emerald-950/20 border-l border-emerald-500/20',
        },
      ];
    }
    if (is1Step) {
      return [
        {
          key: 'phase1',
          label: 'Phase 1 (Evaluation)',
          sub: 'Single challenge stage',
          class: 'text-white bg-[#0f1422] border-l border-white/[0.06]',
        },
        {
          key: 'funded',
          label: '🚀 Funded Stage',
          sub: 'Live rewards begin',
          class: 'text-emerald-400 bg-emerald-950/20 border-l border-emerald-500/20',
        },
      ];
    }
    return [
      {
        key: 'phase1',
        label: 'Phase 1 (Evaluation)',
        sub: 'First challenge step',
        class: 'text-white bg-[#0f1422] border-l border-white/[0.06]',
      },
      {
        key: 'phase2',
        label: 'Phase 2 (Verification)',
        sub: 'Second challenge step',
        class: 'text-white bg-[#0f1422] border-l border-white/[0.06]',
      },
      {
        key: 'funded',
        label: '🚀 Funded Stage',
        sub: 'Live rewards begin',
        class: 'text-emerald-400 bg-emerald-950/20 border-l border-emerald-500/20',
      },
    ];
  }, [isInstant, is1Step]);

  // Master Table Rows matching Image 1
  const tableRows = useMemo(() => {
    const cap = selectedCapital;
    const acc = currentAccount;

    if (isInstant) {
      return [
        {
          label: 'Daily Drawdown Limit',
          sub: 'Max loss in 1 day (balance-based)',
          slug: 'daily-drawdown',
          isDifferent: false,
          funded: {
            val: pctFmt(acc.dailyLossLimit || 4, cap),
            note: `Floor: ${fmt(cap - (cap * (acc.dailyLossLimit || 4)) / 100)} — resets daily at 00:00 server time`,
            color: 'text-sky-300',
          },
          math: `Daily Loss Limit = ${acc.dailyLossLimit || 4}% of ${fmt(cap)} = ${fmt((cap * (acc.dailyLossLimit || 4)) / 100)}. Account balance cannot breach ${fmt(cap - (cap * (acc.dailyLossLimit || 4)) / 100)} within any 24h cycle.`,
        },
        {
          label: 'Maximum Total Drawdown',
          sub: 'Absolute account breach ceiling',
          slug: 'max-drawdown',
          isDifferent: false,
          funded: {
            val: pctFmt(acc.maxTotalLoss || 8, cap),
            note: `Static floor: ${fmt(cap - (cap * (acc.maxTotalLoss || 8)) / 100)} — never trails`,
            color: 'text-white',
          },
          math: `Total Drawdown = ${acc.maxTotalLoss || 8}% of ${fmt(cap)} = ${fmt((cap * (acc.maxTotalLoss || 8)) / 100)}. Breach trigger: ${fmt(cap - (cap * (acc.maxTotalLoss || 8)) / 100)}.`,
        },
        {
          label: 'Minimum Trading Days',
          sub: 'Days required per payout cycle',
          slug: 'min-trading-days',
          isDifferent: false,
          funded: {
            val: '🚨 4 Active Trading Days',
            note: 'Must place trades on at least 4 calendar days before payout request',
            color: 'text-amber-400',
          },
          math: '4 separate calendar days with opened/closed volume required per withdrawal cycle.',
        },
        {
          label: 'News Trading Policy',
          sub: 'High-impact red-folder event rules',
          slug: 'news-trading',
          isDifferent: true,
          funded: {
            val: '🚨 2-Minute Buffer',
            note: 'Holding permitted; NO opening or closing trades 2 min before/after red-folder releases',
            color: 'text-amber-400',
          },
          math: 'Trades opened or closed inside the ±2 minute window around red-folder news are invalidated.',
        },
        {
          label: 'EA & Algorithmic Trading',
          sub: 'Expert Advisors policy',
          slug: 'ea-trading',
          isDifferent: false,
          funded: {
            val: 'Allowed (Unique Strategy)',
            note: 'Custom algorithms allowed; shared IP copy trading clusters prohibited',
            color: 'text-emerald-400',
          },
          math: 'Must trade unique execution logic. Mass commercial signal mirroring triggers compliance review.',
        },
        {
          label: 'Weekend & Overnight Holding',
          sub: 'Hold positions over weekend?',
          slug: 'weekend-hold',
          isDifferent: false,
          funded: {
            val: 'Allowed (No Friday force-close)',
            note: 'Crypto trades 24/7; FX and index positions can remain open across weekend',
            color: 'text-emerald-400',
          },
          math: 'No forced liquidation on Friday market close. Crypto pairs trade continuously through Saturday & Sunday.',
        },
        {
          label: 'Inactivity Limit',
          sub: 'Max consecutive idle days',
          slug: 'inactivity',
          isDifferent: false,
          funded: {
            val: '30 Calendar Days',
            note: 'Account locked and forfeited if zero trades placed for 30 consecutive days',
            color: 'text-amber-300',
          },
          math: 'A single 0.01 lot trade every 29 days is sufficient to keep the account active.',
        },
        {
          label: 'Profit Split',
          sub: 'Your share of gains',
          slug: 'profit-split',
          isDifferent: false,
          funded: {
            val: `${acc.profitSplit || 65}% — ${acc.profitSplitMaxWithAddon || 80}%`,
            note: 'Standard split scales to 80% on qualified milestones',
            color: 'text-white',
          },
          math: `On $10,000 profit: Trader receives $${((10000 * (acc.profitSplit || 65)) / 100).toLocaleString()} at base split.`,
        },
        {
          label: 'Payout Schedule',
          sub: 'When can you withdraw?',
          slug: 'payout',
          isDifferent: false,
          funded: {
            val: 'Every 10 days',
            note: 'Standard rewards every 10 days after 7-day trading periods; no open trades',
            color: 'text-white',
          },
          math: 'Eligible for payout every 10 calendar days after completion of required active days.',
        },
        {
          label: 'Registration Fee',
          sub: 'Upfront capital cost',
          slug: 'fee-refund',
          isDifferent: false,
          funded: {
            val: `${fmt(acc.discountedPrice || acc.price || 499)} Upfront`,
            note: 'Non-refundable instant funding commitment fee',
            color: 'text-white/70',
          },
          math: `Direct entry cost for instant capital of ${fmt(cap)}.`,
        },
        {
          label: 'Leverage',
          sub: 'Max available ratio',
          slug: 'leverage',
          isDifferent: false,
          funded: {
            val: acc.leverage || '1:100',
            note: 'Forex 1:100, Indices 1:50, Crypto 1:2',
            color: 'text-white',
          },
          math: 'Leverage dynamically adjusted by asset class to safeguard downside.',
        },
      ];
    }

    if (is1Step) {
      return [
        {
          label: 'Profit Target',
          sub: 'Required profit to pass evaluation',
          slug: 'profit-target',
          isDifferent: false,
          phase1: {
            val: `10% (${fmt((cap * 10) / 100)})`,
            note: 'Close all trades to confirm target',
            color: 'text-white',
          },
          funded: {
            val: '✅ No Target',
            note: 'Withdraw 100% of profits freely',
            color: 'text-emerald-400',
          },
          math: `10% target on ${fmt(cap)} = ${fmt((cap * 10) / 100)}. Once balance reaches ${fmt(cap + (cap * 10) / 100)}, step is passed.`,
        },
        {
          label: 'Daily Drawdown Limit',
          sub: 'Max loss in 1 day (balance-based)',
          slug: 'daily-drawdown',
          isDifferent: false,
          phase1: {
            val: `3% (${fmt((cap * 3) / 100)})`,
            note: `Floor: ${fmt(cap - (cap * 3) / 100)}`,
            color: 'text-sky-300',
          },
          funded: {
            val: `3% (${fmt((cap * 3) / 100)})`,
            note: 'Resets daily at 00:00 server time',
            color: 'text-sky-300',
          },
          math: `Daily loss limit = 3% of ${fmt(cap)} = ${fmt((cap * 3) / 100)}.`,
        },
        {
          label: 'Maximum Total Drawdown',
          sub: 'Account breach ceiling',
          slug: 'max-drawdown',
          isDifferent: false,
          phase1: {
            val: `6% (${fmt((cap * 6) / 100)})`,
            note: `Floor: ${fmt(cap - (cap * 6) / 100)} (Trailing)`,
            color: 'text-white',
          },
          funded: {
            val: `6% (${fmt((cap * 6) / 100)})`,
            note: 'Trailing floor locks at initial balance',
            color: 'text-white',
          },
          math: `6% trailing drawdown trails up with closed profit until it locks at initial capital ${fmt(cap)}.`,
        },
        {
          label: 'Minimum Trading Days',
          sub: 'Days to pass eval / per payout cycle',
          slug: 'min-trading-days',
          isDifferent: true,
          phase1: {
            val: '0 Days ✅',
            note: 'Pass in 1 day if target hit',
            color: 'text-emerald-400',
          },
          funded: {
            val: '🚨 4 Active Trading Days',
            note: 'Required per payout cycle — easy to miss!',
            color: 'text-amber-400',
          },
          math: 'Evaluation can be passed in 1 single day. Live funded stage requires 4 separate active trading days per withdrawal.',
        },
        {
          label: 'News Trading Policy',
          sub: 'High-impact event rules',
          slug: 'news-trading',
          isDifferent: true,
          phase1: {
            val: '✅ Allowed',
            note: 'No buffer restrictions on evaluation',
            color: 'text-emerald-400',
          },
          funded: {
            val: '🚨 2-Minute Buffer',
            note: 'Holding OK; NO open/close 2 min before/after red-folder events',
            color: 'text-amber-400',
          },
          math: 'Funded accounts strictly penalize executions within 2 minutes of major news releases.',
        },
        {
          label: 'EA & Algorithmic Trading',
          sub: 'Expert Advisors policy',
          slug: 'ea-trading',
          isDifferent: false,
          phase1: {
            val: '✅ Allowed',
            note: 'Export Advisors policy',
            color: 'text-emerald-400',
          },
          funded: {
            val: 'Allowed (Unique Strategy)',
            note: 'No shared IP copy signal clusters',
            color: 'text-emerald-400',
          },
          math: 'Unique algorithmic trading is fully authorized.',
        },
        {
          label: 'Weekend & Overnight Holding',
          sub: 'Hold positions over weekend?',
          slug: 'weekend-hold',
          isDifferent: false,
          phase1: {
            val: '✅ Allowed',
            note: 'Hold positions over weekend?',
            color: 'text-emerald-400',
          },
          funded: {
            val: 'Allowed (No Friday force-close)',
            note: 'Positions stay open over weekend',
            color: 'text-emerald-400',
          },
          math: 'No weekend position closure enforced.',
        },
        {
          label: 'Inactivity Limit',
          sub: 'Max consecutive idle days',
          slug: 'inactivity',
          isDifferent: false,
          phase1: {
            val: '30 Calendar Days',
            note: 'Max consecutive idle days',
            color: 'text-amber-300',
          },
          funded: {
            val: '30 Calendar Days',
            note: 'Account forfeited if idle this long',
            color: 'text-amber-300',
          },
          math: 'Account closes after 30 days without order placement.',
        },
        {
          label: 'Profit Split',
          sub: 'Your share of gains',
          slug: 'profit-split',
          isDifferent: false,
          phase1: {
            val: 'N/A',
            note: 'Evaluation phase',
            color: 'text-white/50',
          },
          funded: {
            val: '80% — 95%',
            note: 'Scalable via profit split add-on',
            color: 'text-white',
          },
          math: 'Standard 80% split with upgrade option to 95%.',
        },
        {
          label: 'Payout Schedule',
          sub: 'When can you withdraw?',
          slug: 'payout',
          isDifferent: false,
          phase1: {
            val: 'N/A',
            note: 'Evaluation phase',
            color: 'text-white/50',
          },
          funded: {
            val: 'Every 14 days',
            note: 'Bi-weekly payout schedule',
            color: 'text-white',
          },
          math: 'Bi-weekly reward processing with 24-hour SLA guarantee.',
        },
        {
          label: 'Registration Fee',
          sub: 'Paid upfront / refundable?',
          slug: 'fee-refund',
          isDifferent: false,
          phase1: {
            val: `${fmt(acc.discountedPrice || acc.price || 394)} Upfront`,
            note: 'One-time challenge payment',
            color: 'text-white/70',
          },
          funded: {
            val: '100% Refunded on 1st Payout',
            note: 'Fee returned with reward',
            color: 'text-emerald-400',
          },
          math: '100% of the registration fee is credited back alongside your first payout.',
        },
        {
          label: 'Leverage',
          sub: 'Max ratio available',
          slug: 'leverage',
          isDifferent: false,
          phase1: {
            val: '1:30',
            note: 'Max ratio available',
            color: 'text-white',
          },
          funded: {
            val: '1:30',
            note: 'Max ratio available',
            color: 'text-white',
          },
          math: '1:30 leverage on standard assets.',
        },
      ];
    }

    // Default: 2-Step Standard (Exact match to Image 1)
    return [
      {
        label: 'Profit Target',
        sub: 'Required profit to advance',
        slug: 'profit-target',
        isDifferent: false,
        phase1: {
          val: `8% (${fmt((cap * 8) / 100)})`,
          note: 'Close all trades to confirm target',
          color: 'text-white',
        },
        phase2: {
          val: `5% (${fmt((cap * 5) / 100)})`,
          note: 'Lower target for verification',
          color: 'text-white/70',
        },
        funded: {
          val: '✅ No Target',
          note: 'Withdraw 100% of profits freely',
          color: 'text-emerald-400',
        },
        math: `Phase 1 Target = 8% ($${((cap * 8) / 100).toLocaleString()}). Phase 2 Target = 5% ($${((cap * 5) / 100).toLocaleString()}). Funded Account has 0% target.`,
      },
      {
        label: 'Daily Drawdown Limit',
        sub: 'Max loss in 1 day (balance-based)',
        slug: 'daily-drawdown',
        isDifferent: false,
        phase1: {
          val: `4% (${fmt((cap * 4) / 100)})`,
          note: `Floor: ${fmt(cap - (cap * 4) / 100)}`,
          color: 'text-sky-300',
        },
        phase2: {
          val: `4% (${fmt((cap * 4) / 100)})`,
          note: `Floor: ${fmt(cap - (cap * 4) / 100)}`,
          color: 'text-sky-300',
        },
        funded: {
          val: `4% (${fmt((cap * 4) / 100)})`,
          note: 'Resets daily at 00:00 server time',
          color: 'text-sky-300',
        },
        math: `Daily Drawdown Limit = 4% of starting balance ($${((cap * 4) / 100).toLocaleString()}). Loss floor calculated from 00:00 UTC balance.`,
      },
      {
        label: 'Maximum Total Drawdown',
        sub: 'Account breach ceiling',
        slug: 'max-drawdown',
        isDifferent: false,
        phase1: {
          val: `8% (${fmt((cap * 8) / 100)})`,
          note: `Floor: ${fmt(cap - (cap * 8) / 100)}`,
          color: 'text-white',
        },
        phase2: {
          val: `8% (${fmt((cap * 8) / 100)})`,
          note: `Floor: ${fmt(cap - (cap * 8) / 100)}`,
          color: 'text-white',
        },
        funded: {
          val: `8% (${fmt((cap * 8) / 100)})`,
          note: `Static floor: ${fmt(cap - (cap * 8) / 100)} — never trails`,
          color: 'text-white',
        },
        math: `Maximum Drawdown = 8% of initial capital ($${((cap * 8) / 100).toLocaleString()}). Breach floor remains static at $${(cap - (cap * 8) / 100).toLocaleString()} and never trails up.`,
      },
      {
        label: 'Minimum Trading Days',
        sub: 'Days to pass eval / per payout cycle',
        slug: 'min-trading-days',
        isDifferent: true,
        phase1: {
          val: '0 Days ✅',
          note: 'Pass in 1 day if target hit',
          color: 'text-emerald-400',
        },
        phase2: {
          val: '0 Days ✅',
          note: 'Pass in 1 day if target hit',
          color: 'text-emerald-400',
        },
        funded: {
          val: '🚨 4 Active Trading Days',
          note: 'Required per payout cycle — easy to miss!',
          color: 'text-amber-400',
        },
        math: 'Evaluation phases have 0 minimum trading days (passable in 24h). Funded phase mandates 4 separate trading days before payout.',
      },
      {
        label: 'News Trading Policy',
        sub: 'High-impact event rules',
        slug: 'news-trading',
        isDifferent: true,
        phase1: {
          val: '✅ Allowed',
          note: 'No buffer restrictions on evaluation',
          color: 'text-emerald-400',
        },
        phase2: {
          val: '✅ Allowed',
          note: 'No buffer restrictions on verification',
          color: 'text-emerald-400',
        },
        funded: {
          val: '🚨 2-Minute Buffer',
          note: 'Holding OK; NO open/close 2 min before/after red-folder events',
          color: 'text-amber-400',
        },
        math: 'Holding positions over news is permitted. However, opening or closing trades ±2 minutes around red-folder news is restricted on funded accounts.',
      },
      {
        label: 'EA & Algorithmic Trading',
        sub: 'Expert Advisors policy',
        slug: 'ea-trading',
        isDifferent: false,
        phase1: {
          val: '✅ Allowed',
          note: '',
          color: 'text-emerald-400',
        },
        phase2: {
          val: '✅ Allowed',
          note: '',
          color: 'text-emerald-400',
        },
        funded: {
          val: 'Allowed (Unique Strategy)',
          note: 'No shared IP copy signal clusters',
          color: 'text-emerald-400',
        },
        math: 'Custom and commercial EAs allowed. Public shared copy-trading signals across multiple accounts are prohibited.',
      },
      {
        label: 'Weekend & Overnight Holding',
        sub: 'Hold positions over weekend?',
        slug: 'weekend-hold',
        isDifferent: false,
        phase1: {
          val: '✅ Allowed',
          note: '',
          color: 'text-emerald-400',
        },
        phase2: {
          val: '✅ Allowed',
          note: '',
          color: 'text-emerald-400',
        },
        funded: {
          val: 'Allowed (No Friday force-close)',
          note: '',
          color: 'text-emerald-400',
        },
        math: 'Positions can be held across all weekends with no forced liquidation.',
      },
      {
        label: 'Inactivity Limit',
        sub: 'Max consecutive idle days',
        slug: 'inactivity',
        isDifferent: false,
        phase1: {
          val: '30 Calendar Days',
          note: '',
          color: 'text-amber-300',
        },
        phase2: {
          val: '30 Calendar Days',
          note: '',
          color: 'text-amber-300',
        },
        funded: {
          val: '30 Calendar Days',
          note: 'Account forfeited if idle this long',
          color: 'text-amber-300',
        },
        math: 'Account closes after 30 consecutive calendar days of zero trading activity.',
      },
      {
        label: 'Profit Split',
        sub: 'Your share of gains',
        slug: 'profit-split',
        isDifferent: false,
        phase1: {
          val: 'N/A',
          note: '',
          color: 'text-white/60',
        },
        phase2: {
          val: 'N/A',
          note: '',
          color: 'text-white/60',
        },
        funded: {
          val: '65% — 80%',
          note: 'Scalable via profit split add-on',
          color: 'text-white',
        },
        math: 'Standard rewards start at 65%, scaling to 70% then 80% on successive payouts. Up to 95% with add-on.',
      },
      {
        label: 'Payout Schedule',
        sub: 'When can you withdraw?',
        slug: 'payout',
        isDifferent: false,
        phase1: {
          val: 'N/A',
          note: '',
          color: 'text-white/60',
        },
        phase2: {
          val: 'N/A',
          note: '',
          color: 'text-white/60',
        },
        funded: {
          val: 'Every 10 days',
          note: 'Standard rewards every 10 days after 7-day trading periods; split steps 65% → 70% → 80% by payout; no open trades or pending orders',
          color: 'text-white',
        },
        math: 'Payout eligible every 10 calendar days after 7-day trading periods. All trades must be closed at time of request.',
      },
      {
        label: 'Registration Fee',
        sub: 'Paid upfront / refundable?',
        slug: 'fee-refund',
        isDifferent: false,
        phase1: {
          val: `${fmt(acc.discountedPrice || acc.price || 394)} Upfront`,
          note: 'One-time challenge payment',
          color: 'text-white/70',
        },
        phase2: {
          val: '$0 — Free Phase 2',
          note: 'Phase 2 has zero additional cost',
          color: 'text-white/70',
        },
        funded: {
          val: '100% Refunded on 1st Payout',
          note: '',
          color: 'text-emerald-400',
        },
        math: `Challenge fee ($${(acc.discountedPrice || acc.price || 394)}) is 100% refunded with the first successful reward withdrawal.`,
      },
      {
        label: 'Leverage',
        sub: 'Max ratio available',
        slug: 'leverage',
        isDifferent: false,
        phase1: {
          val: acc.leverage || '1:100',
          note: '',
          color: 'text-white',
        },
        phase2: {
          val: acc.leverage || '1:100',
          note: '',
          color: 'text-white',
        },
        funded: {
          val: acc.leverage || '1:100',
          note: '',
          color: 'text-white',
        },
        math: '1:100 leverage on Forex instruments across all phases.',
      },
    ];
  }, [selectedCapital, currentAccount, isInstant, is1Step]);

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* Top Model & Capital Selector Bar */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#0e111a] border border-[#1b202e] shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 block mb-1">
              Phase-by-Phase Model Switcher
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Select Evaluation Model &amp; Account Size
            </h2>
          </div>

          {onBackToHub && (
            <button
              onClick={onBackToHub}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start md:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Back to Full Rules Hub</span>
            </button>
          )}
        </div>

        {/* Model Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {gftFirm.programs.map((prog) => {
            const isSelected = prog.id === currentProgram.id;
            return (
              <button
                key={prog.id}
                onClick={() => setSelectedProgramId(prog.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20'
                    : 'bg-[#12151f] text-slate-300 hover:text-white hover:bg-[#181c2b] border-[#1d2232]'
                }`}
              >
                <span>{prog.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isSelected ? 'bg-black/20 text-white' : 'bg-white/[0.06] text-slate-400'
                  }`}
                >
                  {prog.stagesCount === 0 || prog.programType === 'Instant'
                    ? 'Instant'
                    : `${prog.stagesCount}-Step`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Capital Size Tabs */}
        <div className="pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-mono text-slate-400">
              Account Capital:
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {fmt(selectedCapital)} Active
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {availableSizes.map((size) => {
              const isSelected = size === selectedCapital;
              return (
                <button
                  key={size}
                  onClick={() => setSelectedCapital(size)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-white text-slate-950 border-white shadow-sm'
                      : 'bg-[#12151f] text-slate-300 hover:text-white border-[#1d2232]'
                  }`}
                >
                  ${(size / 1000).toFixed(0)}K
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══ THE EXACT TABLE FROM IMAGE 1 ══ */}
      <section className="space-y-4">
        {/* Table Title Header */}
        <div className="space-y-3 border-b border-white/[0.06] pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/[0.06]">
            <Scale className="w-3.5 h-3.5 shrink-0" />
            <span>
              {isInstant
                ? 'Instant Funding — Live Account Rules'
                : `${currentProgram.name} — Phase-by-Phase Rules Matrix`}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isInstant
                ? `Live Account Rules for ${fmt(selectedCapital)} Instant Funding`
                : `All Rules — ${currentProgram.name} (${fmt(selectedCapital)} Account)`}
            </h2>
            <p className="text-xs sm:text-sm text-white/50 leading-relaxed max-w-3xl">
              {isInstant
                ? 'No evaluation phases exist for Instant Funding. Below are all live account rules that apply from day one.'
                : 'Rows flagged with DIFFERENT highlight where funded-stage rules change vs evaluation. Tap any row to inspect the dollar math.'}
            </p>
          </div>
        </div>

        {/* Phase Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#1F2228] bg-[#0c0e17] shadow-2xl overflow-hidden">
          <table
            aria-label="Phase by phase rules matrix"
            className="w-full text-left border-collapse"
            style={{
              minWidth: isInstant ? '600px' : is1Step ? '700px' : '900px',
            }}
          >
            <thead>
              <tr className="border-b border-white/[0.06] bg-[#07080e] text-[11px] uppercase tracking-wider font-bold">
                <th className="p-4 w-56 sticky left-0 bg-[#07080e] z-10 text-white/50 border-r border-white/[0.06]">
                  Rule / Condition
                </th>
                {columnConfig.map((col) => (
                  <th key={col.key} className={`p-4 ${col.class}`}>
                    <span className="block text-xs font-bold">{col.label}</span>
                    <span className="text-[10px] font-normal opacity-70 normal-case tracking-normal block mt-0.5">
                      {col.sub}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#1F2228] text-xs font-sans">
              {tableRows.map((row: any) => {
                const isExpanded = expandedRowSlug === row.slug;

                return (
                  <React.Fragment key={row.slug}>
                    <tr
                      onClick={() =>
                        setExpandedRowSlug(isExpanded ? null : row.slug)
                      }
                      className={`hover:bg-white/[0.04] cursor-pointer transition-colors group ${
                        row.isDifferent ? 'bg-amber-500/[0.03]' : ''
                      }`}
                    >
                      {/* Rule Label Column (Sticky Left) */}
                      <td className="p-4 font-semibold text-white sticky left-0 bg-[#0c0e17] group-hover:bg-[#121622] z-10 border-r border-white/[0.06]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-xs text-white">
                            {row.label}
                            {row.isDifferent && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold shrink-0">
                                DIFF
                              </span>
                            )}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-600 group-hover:text-white shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-white/50 font-normal block mt-0.5">
                          {row.sub}
                        </span>
                      </td>

                      {/* Phase 1 Column (if applicable) */}
                      {!isInstant && (
                        <td className="p-4 align-top">
                          <span className={`font-bold block ${row.phase1?.color || 'text-white'}`}>
                            {row.phase1?.val}
                          </span>
                          {row.phase1?.note && (
                            <span className="text-[10px] text-white/50 block mt-0.5">
                              {row.phase1.note}
                            </span>
                          )}
                        </td>
                      )}

                      {/* Phase 2 Column (if 2-step) */}
                      {!isInstant && !is1Step && (
                        <td className="p-4 align-top">
                          <span className={`font-bold block ${row.phase2?.color || 'text-white'}`}>
                            {row.phase2?.val}
                          </span>
                          {row.phase2?.note && (
                            <span className="text-[10px] text-white/50 block mt-0.5">
                              {row.phase2.note}
                            </span>
                          )}
                        </td>
                      )}

                      {/* Funded Stage Column */}
                      <td className="p-4 align-top bg-emerald-950/10">
                        <span className={`font-bold block ${row.funded?.color || 'text-emerald-400'}`}>
                          {row.funded?.val}
                        </span>
                        {row.funded?.note && (
                          <span className="text-[10px] text-white/50 block mt-0.5">
                            {row.funded.note}
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Expandable Math & Explanation Row */}
                    {isExpanded && (
                      <tr className="bg-[#090b12] border-y border-blue-500/20">
                        <td
                          colSpan={columnConfig.length + 1}
                          className="p-4 pl-6 text-xs text-slate-300 space-y-1.5"
                        >
                          <div className="flex items-center gap-2 text-blue-400 font-bold">
                            <Info className="w-4 h-4 shrink-0" />
                            <span>Dollar Math &amp; Rule Enforcement Specification:</span>
                          </div>
                          <p className="text-slate-300 font-mono text-[11px] leading-relaxed bg-black/40 p-2.5 rounded-lg border border-white/[0.05]">
                            {row.math}
                          </p>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
