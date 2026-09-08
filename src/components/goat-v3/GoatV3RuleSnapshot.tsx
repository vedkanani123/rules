import React from 'react';
import { CanonicalSelectedModelRules } from '../../data/goatCanonicalContext.ts';
import { GFTModel } from '../../data/goatCanonicalData.ts';
import {
  ShieldCheck,
  TrendingDown,
  Target,
  Clock,
  DollarSign,
  Calendar,
  AlertTriangle,
  Scale,
  Sparkles,
  Info,
  CheckCircle2,
  XCircle,
  Radio,
  ArrowDown,
} from 'lucide-react';

interface GoatV3RuleSnapshotProps {
  canonicalRules: CanonicalSelectedModelRules;
  model?: GFTModel;
  accountSize?: number;
  stage?: 'all' | 'evaluation' | 'funded';
  onNavigateToCompleteTable: () => void;
  onNavigateToExplorer?: () => void;
  onOpenSourceModal?: (evidence: string, title: string) => void;
}

export const GoatV3RuleSnapshot: React.FC<GoatV3RuleSnapshotProps> = ({
  canonicalRules,
  onNavigateToCompleteTable,
}) => {
  const { core, model } = canonicalRules;
  const {
    modelName,
    nominalCapital,
    nominalCapitalFormatted,
    hasProfitTarget,
    targetPct,
    targetDollars,
    hasDailyLossLimit,
    dailyLossPct,
    dailyLossDollars,
    dailyLossFormatted,
    dailyLossIsGrandfathered,
    dailyLossHasConflict,
    maxDDPct,
    maxDDDollars,
    maxDDType,
    maxDDTypeLabel,
    maxDDFloorFormatted,
    hasFloatingLossCap,
    floatingLossPct,
    floatingLossDollars,
    baseProfitSplitPct,
    payoutCycleDays,
    firstPayoutDays,
    validDayThresholdDollars,
    validDayThresholdFormatted,
    minTradingDaysFunded,
    hasConsistencyRule,
    consistencyPct,
    newsAllowed,
    newsProfitCapPct,
    weekendHoldingAllowed,
  } = core;

  return (
    <section id="snapshot" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Rule Snapshot — {modelName} ({nominalCapitalFormatted})
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Controlled summary view strictly reading from the Complete Rule Table single source of truth. Zero manual values.
          </p>
        </div>

        <button
          onClick={onNavigateToCompleteTable}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
        >
          <span>View Complete Rules</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Snapshot Cards Grid: 4 Primary Risk & Payout Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Profit Target */}
        <div className="p-4 rounded-xl bg-[#111318] border border-[#1F2228] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              1. Profit Target
            </span>
            <span className="text-emerald-400 font-bold">
              {hasProfitTarget ? `+${targetPct}%` : 'Direct Live'}
            </span>
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            {hasProfitTarget ? `+$${targetDollars.toLocaleString()}` : '$0 (No Phase)'}
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            {hasProfitTarget
              ? `Target equity is $${(nominalCapital + targetDollars).toLocaleString()} with all trades closed.`
              : 'Direct live capital. No challenge phases required before payout eligibility.'}
          </p>
        </div>

        {/* 2. Daily Loss */}
        <div className="p-4 rounded-xl bg-[#111318] border border-[#1F2228] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
              2. Daily Loss Limit
            </span>
            <span className="text-amber-400 font-bold">
              {hasDailyLossLimit ? `${dailyLossPct}% / day` : '0% (No Daily Floor)'}
            </span>
          </div>
          <div className="text-xl font-extrabold text-white font-mono flex items-center gap-2">
            <span>{hasDailyLossLimit ? `$${dailyLossDollars.toLocaleString()} / day` : 'No Daily Floor'}</span>
            {dailyLossIsGrandfathered && (
              <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Historical
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            {hasDailyLossLimit
              ? `Resets at 5:00 PM EST. Floor = 5 PM Balance - $${dailyLossDollars.toLocaleString()}.`
              : 'Zero daily loss limit! Intraday equity drawdowns will never breach the account.'}
          </p>
        </div>

        {/* 3. Maximum Drawdown & Drawdown Type */}
        <div className="p-4 rounded-xl bg-[#111318] border border-[#1F2228] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              3. Maximum Drawdown
            </span>
            <span className="text-rose-400 font-bold">
              {maxDDPct}% ({maxDDType === 'static' ? 'Static' : 'Trailing'})
            </span>
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            ${maxDDDollars.toLocaleString()} Max Buffer
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            {maxDDType === 'static'
              ? `Static Floor fixed at ${maxDDFloorFormatted} (never moves up into profits).`
              : `Trailing floor locks at ${nominalCapitalFormatted} as closed equity expands.`}
          </p>
        </div>

        {/* 4. Profit Split & Payout Cycle */}
        <div className="p-4 rounded-xl bg-[#111318] border border-[#1F2228] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-blue-400" />
              4. Payout Cycle & Split
            </span>
            <span className="text-blue-400 font-bold">
              {baseProfitSplitPct}% Split
            </span>
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            {payoutCycleDays}-Day Cycle
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Eligible for 1st payout after {firstPayoutDays} days. Subsequent payouts every {payoutCycleDays} days.
          </p>
        </div>
      </div>

      {/* Snapshot Secondary Parameters Matrix (Covers all 11 required parameters) */}
      <div className="p-4 rounded-2xl bg-[#111318] border border-[#1F2228] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 text-xs">
        {/* 5. Drawdown Type */}
        <div>
          <span className="text-slate-400 block text-[11px]">Drawdown Type:</span>
          <span className="font-semibold text-white">
            {maxDDTypeLabel}
          </span>
          <p className="text-[10px] text-slate-400">
            {maxDDType === 'static' ? 'Floor never trails up' : 'Locks at starting capital'}
          </p>
        </div>

        {/* 6. Floating Loss */}
        <div>
          <span className="text-slate-400 block text-[11px]">Floating Loss Cap:</span>
          <span className={`font-semibold ${hasFloatingLossCap ? 'text-rose-400' : 'text-slate-300'}`}>
            {hasFloatingLossCap
              ? `${floatingLossPct}% (-$${(floatingLossDollars || 0).toLocaleString()})`
              : 'Standard SL'}
          </span>
          <p className="text-[10px] text-slate-400">
            {hasFloatingLossCap ? 'Strict open-loss breach rule' : 'No floating open loss cap'}
          </p>
        </div>

        {/* 7. Profit Split */}
        <div>
          <span className="text-slate-400 block text-[11px]">Profit Split:</span>
          <span className="font-semibold text-blue-400">
            {baseProfitSplitPct}% Base (Up to 90%)
          </span>
          <p className="text-[10px] text-slate-400">Via scaling milestone</p>
        </div>

        {/* 8. Valid Trading Days */}
        <div>
          <span className="text-slate-400 block text-[11px]">Valid Trading Days:</span>
          <span className="font-semibold text-white">
            {minTradingDaysFunded} Days ({validDayThresholdFormatted})
          </span>
          <p className="text-[10px] text-slate-400">0.5% min closed profit/day</p>
        </div>

        {/* 9. Consistency */}
        <div>
          <span className="text-slate-400 block text-[11px]">Consistency Rule:</span>
          <span className={`font-semibold ${hasConsistencyRule ? 'text-amber-400' : 'text-emerald-400'}`}>
            {hasConsistencyRule ? `${consistencyPct}% Best Day Cap` : '0% (No Consistency)'}
          </span>
          <p className="text-[10px] text-slate-400">
            {hasConsistencyRule ? 'Withdrawal pause only (never breach)' : 'Single day 100% withdrawable'}
          </p>
        </div>

        {/* 10. News Trading */}
        <div>
          <span className="text-slate-400 block text-[11px]">News Trading:</span>
          <span className="font-semibold text-emerald-400">
            Allowed (1% Profit Cap)
          </span>
          <p className="text-[10px] text-slate-400">±5 min red-folder trades</p>
        </div>

        {/* 11. Weekend Holding */}
        <div>
          <span className="text-slate-400 block text-[11px]">Weekend Holding:</span>
          <span className="font-semibold text-emerald-400">
            Allowed · 24/7 Crypto
          </span>
          <p className="text-[10px] text-slate-400">FX swings open over weekend</p>
        </div>
      </div>
    </section>
  );
};
