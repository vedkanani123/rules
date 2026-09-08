import React, { useMemo, useState } from 'react';
import type { AccountTier, ProgramModel, PropFirm, Rule } from '../../types/schema.ts';
import { ruleAppliesToProgram } from '../../core/pipeline/parameterRules.ts';
import {
  Check,
  X,
  Shield,
  Search,
  Eye,
  Layers,
  TrendingDown,
  Activity,
  DollarSign,
  Target,
  Building,
  Filter,
} from 'lucide-react';

export type QuickViewTab = 'challenge' | 'funded';

export interface QuickViewRow {
  label: string;
  value: string;
  matchKey: string;
}

const cap = (s: string): string => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function phaseLabel(program?: ProgramModel): string {
  if (!program) return 'Unknown';
  if (program.programType === 'Instant') return 'Instant Funding (No Challenge)';
  const n = program.stagesCount;
  if (n <= 1) return '1 Phase Challenge';
  return `${n} Phase Challenge`;
}

/**
 * Pure row builder — data-driven from the account, never hardcoded.
 * Kept for tests and backward compat. The visual table below no longer uses it.
 */
export function buildQuickViewRows(
  account: AccountTier,
  program?: ProgramModel,
  tab: QuickViewTab = 'challenge',
): QuickViewRow[] {
  const is2Step = program?.programType === '2-Step';
  const minDays = account.minimumTradingDays;
  const pct = (n: number | undefined, suffix = '%'): string =>
    n === undefined || n === null ? 'None' : `${n}${suffix}`;

  if (tab === 'challenge') {
    const rows: QuickViewRow[] = [
      { label: 'Phase', value: phaseLabel(program), matchKey: 'profit-target' },
      { label: 'Phase 1 Profit Target', value: pct(account.profitTargetPhase1), matchKey: 'profit-target' },
    ];
    if (account.profitTargetPhase2 !== undefined || is2Step) {
      rows.push({ label: 'Phase 2 Profit Target', value: pct(account.profitTargetPhase2), matchKey: 'profit-target' });
    }
    if (account.profitTargetPhase3 !== undefined) {
      rows.push({ label: 'Phase 3 Profit Target', value: pct(account.profitTargetPhase3), matchKey: 'profit-target' });
    }
    rows.push(
      {
        label: 'Daily Loss Limit',
        value: account.dailyLossLimit === 0 ? 'None (no daily cap)' : `${account.dailyLossLimit}%`,
        matchKey: 'daily',
      },
      { label: 'Maximum Loss Limit', value: `${account.maxTotalLoss}%`, matchKey: 'max' },
      { label: 'Drawdown Type', value: cap(account.drawdownType), matchKey: 'drawdown' },
      {
        label: 'Minimum Trading Days',
        value: minDays === 0 ? 'None' : `${minDays}`,
        matchKey: 'trading-day',
      },
      {
        label: 'Time Limit',
        value: account.maximumTradingDays === 'Unlimited' ? 'None' : `${account.maximumTradingDays} days`,
        matchKey: 'trading-day',
      },
      { label: 'News Trading', value: account.newsTradingRule, matchKey: 'news' },
      { label: 'EAs / Bots', value: account.eaAllowed ? 'Allowed' : 'Restricted', matchKey: 'automat' },
      {
        label: 'Consistency Rule',
        value: !account.consistencyRule || account.consistencyRule.toLowerCase().startsWith('none') ? 'None' : account.consistencyRule,
        matchKey: 'consistency',
      },
    );
    return rows;
  }

  const rows: QuickViewRow[] = [
    {
      label: 'Profit Split',
      value: account.profitSplitMaxWithAddon && account.profitSplitMaxWithAddon !== account.profitSplit
        ? `${account.profitSplit}% → ${account.profitSplitMaxWithAddon}%`
        : `${account.profitSplit}%`,
      matchKey: 'payout',
    },
    { label: 'Payout Frequency', value: account.payoutFrequency || 'Unknown', matchKey: 'payout' },
    { label: 'First Payout', value: account.firstPayoutConditions || 'Unknown', matchKey: 'payout' },
    { label: 'Minimum Payout', value: `$${account.payoutMinimum.toLocaleString()}`, matchKey: 'payout' },
    { label: 'Weekend Holding', value: account.weekendHolding ? 'Allowed' : 'Not allowed', matchKey: 'weekend' },
    { label: 'Overnight Holding', value: account.overnightHolding ? 'Allowed' : 'Not allowed', matchKey: 'holding' },
    { label: 'Copy Trading', value: account.copyTradingAllowed ? 'Allowed' : 'Restricted', matchKey: 'copy' },
    { label: 'Inactivity Limit', value: `${account.inactivityLimitDays} days`, matchKey: 'inactivity' },
    { label: 'Leverage', value: account.leverage || 'Unknown', matchKey: 'market' },
    {
      label: 'Registration Fee',
      value: account.priceUnknown ? 'Unknown' : `$${(account.discountedPrice ?? account.price).toLocaleString()}`,
      matchKey: 'payout',
    },
  ];
  return rows;
}

interface RulesQuickViewProps {
  firm: PropFirm;
  program?: ProgramModel;
  account: AccountTier;
  rules: Rule[];
  accountSizeLabel: string;
  onSelectRule: (slug: string) => void;
}

const CATEGORY_LABEL: Record<string, string> = {
  RISK: 'Risk',
  TRADING: 'Trading',
  PAYOUT: 'Payout',
  ACCOUNT: 'Account',
  EVALUATION: 'Evaluation',
  COMMERCIAL: 'Commercial',
  LEGAL: 'Legal',
};

const CATEGORY_ICON: Record<string, any> = {
  RISK: TrendingDown,
  TRADING: Activity,
  PAYOUT: DollarSign,
  ACCOUNT: Building,
  EVALUATION: Target,
  COMMERCIAL: DollarSign,
  LEGAL: Shield,
};

const RISK_DOT: Record<string, string> = {
  EXTREME: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MODERATE: 'bg-amber-500',
  SAFE: 'bg-emerald-500',
};

// Determines if a rule applies to evaluation vs funded phases
function appliesToEvaluation(stageScope: string): boolean {
  const s = stageScope.toUpperCase();
  return ['ALL', 'EVALUATION', 'STEP_1', 'STEP_2', 'STEP_3'].includes(s);
}
function appliesToFunded(stageScope: string): boolean {
  const s = stageScope.toUpperCase();
  return ['ALL', 'FUNDED', 'PAYOUT', 'SCALING'].includes(s);
}
function stageBadge(scope: string): string {
  const s = scope.toUpperCase();
  if (s === 'ALL') return 'All stages';
  if (s === 'EVALUATION') return 'Evaluation';
  if (s.startsWith('STEP')) return s.replace('_', ' ');
  if (s === 'FUNDED') return 'Funded';
  if (s === 'PAYOUT') return 'Payout';
  if (s === 'SCALING') return 'Scaling';
  if (s === 'PURCHASE') return 'Purchase';
  return scope;
}

const YesNo: React.FC<{ yes: boolean; animate?: boolean }> = ({ yes, animate }) => {
  if (yes) {
    return (
      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white shadow-sm ${animate ? 'animate-pulse' : ''}`}>
        <Check className="w-4 h-4" strokeWidth={2.5} />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#1F2228] border border-white/10 text-white/35">
      <X className="w-4 h-4" strokeWidth={2} />
    </span>
  );
};

export const RulesQuickView: React.FC<RulesQuickViewProps> = ({
  firm,
  program,
  account,
  rules,
  accountSizeLabel,
  onSelectRule,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterHidden, setFilterHidden] = useState<'all' | 'hidden' | 'public'>('all');
  const [search, setSearch] = useState('');

  const programName = program?.name ?? 'Account';

  const scopedRules = useMemo(
    () => rules.filter((r) => ruleAppliesToProgram(r, program?.programType, program?.slug)),
    [rules, program],
  );

  // Order: RISK first, then EVALUATION, TRADING, ACCOUNT, PAYOUT, COMMERCIAL, LEGAL
  const categoryOrder = ['RISK', 'EVALUATION', 'TRADING', 'ACCOUNT', 'PAYOUT', 'COMMERCIAL', 'LEGAL'];
  const sortedCategories = useMemo(() => {
    const present = Array.from(new Set(scopedRules.map((r) => r.category)));
    return present.sort((a, b) => {
      const ia = categoryOrder.indexOf(a);
      const ib = categoryOrder.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }, [scopedRules]);

  const filteredRules = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scopedRules
      .filter((r) => {
        if (filterCategory !== 'ALL' && r.category !== filterCategory) return false;
        if (filterHidden === 'hidden' && !r.isEasyToMiss) return false;
        if (filterHidden === 'public' && r.isEasyToMiss) return false;
        if (q) {
          const hay = `${r.name} ${r.headlineValue} ${r.slug} ${r.category} ${r.stageScope} ${r.plainEnglish}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Critical first, then High, then category order
        const riskRank: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        const ra = riskRank[a.importance] ?? 9;
        const rb = riskRank[b.importance] ?? 9;
        if (ra !== rb) return ra - rb;
        const ca = categoryOrder.indexOf(a.category);
        const cb = categoryOrder.indexOf(b.category);
        if (ca !== cb) return (ca === -1 ? 99 : ca) - (cb === -1 ? 99 : cb);
        return a.name.localeCompare(b.name);
      });
  }, [scopedRules, filterCategory, filterHidden, search]);

  const evaluationCount = scopedRules.filter((r) => appliesToEvaluation(r.stageScope)).length;
  const fundedCount = scopedRules.filter((r) => appliesToFunded(r.stageScope)).length;
  const hiddenCount = scopedRules.filter((r) => r.isEasyToMiss).length;

  return (
    <section aria-label="Every rule before you start" className="space-y-5">
      {/* Top editorial header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-4 flex flex-col py-2">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-white/40 flex items-center gap-2">
            <Shield className="w-3 h-3" /> Rule Intelligence — Live
          </p>
          <h2 className="mt-2 text-[30px] sm:text-[38px] font-bold tracking-[-0.02em] leading-[1.08] text-white">
            Every rule
            <span className="block text-white/60">before you start</span>
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-white/55 max-w-[420px]">
            This is not a generic overview. Every row below is a <span className="text-white font-medium">real rule from {firm.name}</span> for{' '}
            <span className="text-white font-medium">{programName} · {accountSizeLabel}</span> — with its evaluation vs funded scope shown as{' '}
            <span className="inline-flex items-center gap-1">
              <span className="inline-flex w-5 h-5 rounded-full bg-emerald-500 text-white items-center justify-center"><Check className="w-3 h-3" strokeWidth={3} /></span> yes
            </span>{' '}
            /{' '}
            <span className="inline-flex items-center gap-1">
              <span className="inline-flex w-5 h-5 rounded-full bg-[#1F2228] border border-white/10 text-white/30 items-center justify-center"><X className="w-3 h-3" /></span> no
            </span>
            . Tap any row to jump to its full explanation with source & formula.
          </p>

          {/* Mini stats */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-[#111318] border border-[#1F2228] p-3 text-center">
              <p className="text-[11px] font-bold tracking-wide uppercase text-white/40">All Rules</p>
              <p className="text-xl font-bold font-mono text-white mt-1">{scopedRules.length}</p>
              <p className="text-[11px] text-white/30">for this program</p>
            </div>
            <div className="rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15 p-3 text-center">
              <p className="text-[11px] font-bold tracking-wide uppercase text-emerald-400/70">Evaluation</p>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-1">{evaluationCount}</p>
              <p className="text-[11px] text-emerald-400/50">active in eval</p>
            </div>
            <div className="rounded-xl bg-sky-500/[0.06] border border-sky-500/15 p-3 text-center">
              <p className="text-[11px] font-bold tracking-wide uppercase text-sky-400/70">Funded</p>
              <p className="text-xl font-bold font-mono text-sky-400 mt-1">{fundedCount}</p>
              <p className="text-[11px] text-sky-400/50">active when funded</p>
            </div>
          </div>

          <p className="mt-3 text-[11px] font-mono text-white/30 text-center">
            {hiddenCount} hidden · {scopedRules.length - hiddenCount} public · {firm.name}
          </p>
        </div>

        {/* Right — premium all-rules table card */}
        <div className="lg:col-span-8 min-w-0 rounded-2xl overflow-hidden bg-[#111318] border border-[#1F2228] flex flex-col">
          {/* Card header */}
          <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-[#1F2228] bg-[#0f1117]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-white tracking-tight">{programName}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-white text-[#080A10] text-[11px] font-bold font-mono">{accountSizeLabel}</span>
                  <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${program?.programType === 'Instant' ? 'bg-amber-500 text-black border-amber-500' : program?.programType === '1-Step' ? 'bg-sky-500 text-white border-sky-500' : 'bg-white/10 text-white border-white/10'}`}>
                    {program?.programType || 'Program'}
                  </span>
                  {hiddenCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-400">
                      <Eye className="w-3 h-3" /> {hiddenCount} hidden
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-white/45 mt-1.5">
                  Each row is a verified rule for this account size — dollar thresholds tied to <span className="font-mono text-white">{accountSizeLabel}</span>
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-white/40 whitespace-nowrap">
                <Layers className="w-3 h-3" /> {filteredRules.length} of {scopedRules.length} shown
              </span>
            </div>

            {/* Controls */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search rules — e.g. drawdown, news, consistency, payout..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#080A10] border border-[#1F2228] text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#2A2D35]"
                />
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="inline-flex p-1 rounded-full bg-[#080A10] border border-[#1F2228]">
                  {(['all', 'hidden', 'public'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setFilterHidden(v)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                        filterHidden === v ? 'bg-white text-[#080A10] shadow' : 'text-white/50 hover:text-white'
                      }`}
                    >
                      {v} {v === 'hidden' ? `(${hiddenCount})` : v === 'public' ? `(${scopedRules.length - hiddenCount})` : `(${scopedRules.length})`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category filter pills */}
            <div className="mt-3 flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
              <button
                onClick={() => setFilterCategory('ALL')}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  filterCategory === 'ALL' ? 'bg-white text-[#080A10] border-white shadow-sm' : 'bg-[#080A10] border-[#1F2228] text-white/50 hover:text-white hover:border-[#2A2D35]'
                }`}
              >
                <Filter className="w-3 h-3" /> All
              </button>
              {sortedCategories.map((cat) => {
                const Icon = CATEGORY_ICON[cat] || Layers;
                const active = filterCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      active ? 'bg-white text-[#080A10] border-white shadow-sm' : 'bg-[#080A10] border-[#1F2228] text-white/50 hover:text-white hover:border-[#2A2D35]'
                    }`}
                  >
                    <Icon className="w-3 h-3" /> {CATEGORY_LABEL[cat] || cat}
                    <span className={`font-mono text-[11px] ${active ? 'text-black/50' : 'text-white/30'}`}>
                      {scopedRules.filter((r) => r.category === cat).length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Table header (sticky on desktop) ── */}
          <div className="hidden sm:grid grid-cols-[1fr_92px_92px] gap-0 bg-[#080A10] border-b border-[#1F2228] text-[11px] font-bold tracking-[0.08em] uppercase">
            <div className="px-4 sm:px-5 py-2.5 text-white/40">Rule — tap for full source & formula</div>
            <div className="px-2 py-2.5 text-center text-emerald-400 border-l border-[#1F2228]">Evaluation</div>
            <div className="px-2 py-2.5 text-center text-sky-400 border-l border-[#1F2228] flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" /> Funded
            </div>
          </div>
          <div className="sm:hidden grid grid-cols-[1fr_64px_64px] gap-0 bg-[#080A10] border-b border-[#1F2228] text-[11px] font-bold tracking-wide uppercase">
            <div className="px-4 py-2.5 text-white/40">Rule</div>
            <div className="px-1 py-2.5 text-center text-emerald-400 border-l border-[#1F2228] text-[10px]">Eval</div>
            <div className="px-1 py-2.5 text-center text-sky-400 border-l border-[#1F2228] text-[10px]">Funded</div>
          </div>

          {/* ── Rows — full table, no scroll: all rules visible ── */}
          <div className="divide-y divide-white/[0.06] bg-[#111318]">
            {filteredRules.length === 0 ? (
              <div className="py-14 text-center px-6">
                <p className="text-sm font-medium text-white">No rules match this filter</p>
                <p className="text-xs text-white/40 mt-1">Try a different category or clear search.</p>
                <button
                  onClick={() => {
                    setFilterCategory('ALL');
                    setFilterHidden('all');
                    setSearch('');
                  }}
                  className="mt-4 px-4 py-2 rounded-full bg-white text-[#080A10] text-xs font-bold"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              filteredRules.map((rule) => {
                const toEval = appliesToEvaluation(rule.stageScope);
                const toFunded = appliesToFunded(rule.stageScope);
                const Icon = CATEGORY_ICON[rule.category] || Shield;
                const isHidden = rule.isEasyToMiss;
                return (
                  <button
                    key={rule.id}
                    type="button"
                    onClick={() => onSelectRule(rule.slug)}
                    className={`w-full text-left grid grid-cols-[1fr_64px_64px] sm:grid-cols-[1fr_92px_92px] gap-0 group hover:bg-[#16181E] transition-colors focus-visible:outline-none focus-visible:bg-[#16181E] ${
                      isHidden ? 'bg-amber-500/[0.02] hover:bg-amber-500/[0.06]' : ''
                    }`}
                  >
                    {/* Rule cell */}
                    <div className="px-3 sm:px-4 py-3 flex gap-2.5 sm:gap-3 items-start min-w-0 border-r border-white/[0.04]">
                      <span className="w-8 h-8 rounded-lg bg-[#080A10] border border-[#1F2228] flex items-center justify-center shrink-0 mt-0.5 group-hover:border-[#2A2D35] transition-colors">
                        <Icon className={`w-3.5 h-3.5 ${rule.category === 'RISK' ? 'text-red-400' : 'text-white/50'}`} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${RISK_DOT[rule.primaryRiskRating] || 'bg-white/20'}`} />
                          <span className="text-[11px] font-bold tracking-wide uppercase text-white/40">{CATEGORY_LABEL[rule.category] || rule.category}</span>
                          {isHidden && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400">
                              <Eye className="w-2.5 h-2.5" /> Hidden
                            </span>
                          )}
                          <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-full bg-[#080A10] border border-white/10 text-[10px] font-mono text-white/30">{stageBadge(rule.stageScope)}</span>
                        </div>
                        <p className="text-[13px] font-semibold text-white leading-tight mt-1 group-hover:text-sky-300 transition-colors line-clamp-2">{rule.name}</p>
                        <p className="text-[12px] font-mono font-medium text-white/60 mt-0.5 truncate">{rule.headlineValue}</p>
                        <p className="text-[11px] leading-relaxed text-white/35 line-clamp-1 sm:line-clamp-1 hidden sm:block mt-0.5">{rule.plainEnglish.slice(0, 110)}{rule.plainEnglish.length > 110 ? '…' : ''}</p>
                      </div>
                    </div>

                    {/* Evaluation Yes/No */}
                    <div className="flex flex-col items-center justify-center gap-1 py-3 border-l border-white/[0.04] bg-emerald-500/[0.02] group-hover:bg-emerald-500/[0.05] transition-colors">
                      <YesNo yes={toEval} />
                      <span className={`text-[11px] font-bold font-mono tracking-wide ${toEval ? 'text-emerald-400' : 'text-white/25'}`}>{toEval ? 'YES' : 'NO'}</span>
                    </div>

                    {/* Funded Yes/No */}
                    <div className="flex flex-col items-center justify-center gap-1 py-3 border-l border-white/[0.04] bg-sky-500/[0.02] group-hover:bg-sky-500/[0.05] transition-colors">
                      <YesNo yes={toFunded} />
                      <span className={`text-[11px] font-bold font-mono tracking-wide ${toFunded ? 'text-sky-400' : 'text-white/25'}`}>{toFunded ? 'YES' : 'NO'}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer legend */}
          <div className="px-4 sm:px-5 py-3 bg-[#080A10] border-t border-[#1F2228] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] leading-relaxed">
            <span className="text-white/40 font-mono">
              Showing <span className="text-white font-bold">{filteredRules.length}</span> of <span className="text-white font-bold">{scopedRules.length}</span> rules · {programName} · {accountSizeLabel}
            </span>
            <span className="flex items-center gap-3 text-white/30">
              <span className="inline-flex items-center gap-1.5"><span className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-4 h-4 text-white" strokeWidth={2.5} /></span> applies</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-7 h-7 rounded-full bg-[#1F2228] border border-white/10 flex items-center justify-center"><X className="w-4 h-4 text-white/30" /></span> not in this phase</span>
            </span>
          </div>
        </div>
      </div>

      {/* Mobile legend helper */}
      <p className="text-[11px] text-white/25 text-center lg:hidden -mt-1">Tap any rule row to jump to its detailed card with sources, formula & dollar math below.</p>
    </section>
  );
};
