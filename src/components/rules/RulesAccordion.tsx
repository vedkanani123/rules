import React, { useState, useMemo } from 'react';
import { Rule, SourceEvidence } from '../../types/schema.ts';
import {
  ChevronDown,
  AlertTriangle,
  FileText,
  ExternalLink,
  Shield,
  Activity,
  DollarSign,
  Clock,
  Layers,
  TrendingDown,
  Target,
  Eye,
  Building,
  Zap,
  Search,
} from 'lucide-react';

interface RulesAccordionProps {
  rules: Rule[];
  selectedCapital: number;
  programType: string;
  highlightedRuleId?: string | null;
  onOpenSource?: (evidence: SourceEvidence, ruleTitle: string) => void;
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

const RISK_DOT: Record<string, string> = {
  EXTREME: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MODERATE: 'bg-amber-500',
  SAFE: 'bg-emerald-500',
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

const CATEGORY_TAB_CONFIG: Record<string, { label: string; icon: any }> = {
  ALL: { label: 'All Rules', icon: Layers },
  RISK: { label: 'Drawdown & Loss', icon: TrendingDown },
  TRADING: { label: 'Trading Rules', icon: Activity },
  PAYOUT: { label: 'Payout', icon: DollarSign },
  ACCOUNT: { label: 'Account', icon: Building },
  EVALUATION: { label: 'Evaluation', icon: Target },
  COMMERCIAL: { label: 'Commercial', icon: DollarSign },
  LEGAL: { label: 'Legal', icon: Shield },
};

const fmt = (n: number) => `$${n.toLocaleString()}`;

export const RulesAccordion: React.FC<RulesAccordionProps> = ({
  rules,
  selectedCapital,
  programType,
  highlightedRuleId,
  onOpenSource,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [ruleScopeTab, setRuleScopeTab] = useState<'all' | 'hidden' | 'public'>('all');

  // When highlightedRuleId changes, expand and ensure it is visible
  React.useEffect(() => {
    if (highlightedRuleId) {
      const match = rules.find(r => 
        r.slug === highlightedRuleId || 
        r.id === highlightedRuleId || 
        r.slug.startsWith(highlightedRuleId) || 
        highlightedRuleId.startsWith(r.slug)
      );
      if (match) {
        setExpandedId(match.id);
        setFilterCategory('ALL');
        setFilterRisk('ALL');
        setRuleScopeTab('all');
      }
    }
  }, [highlightedRuleId, rules]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(rules.map((r) => r.category)));
    return ['ALL', ...cats];
  }, [rules]);

  const filteredByProgram = useMemo(() => {
    return rules.filter((rule) => {
      if (rule.accountModelScope && rule.accountModelScope.length > 0) {
        const progTypeLower = programType.toLowerCase().replace('-', '-');
        const matches = rule.accountModelScope.some((scope) =>
          progTypeLower.includes(scope.toLowerCase()) ||
          scope.toLowerCase().includes(programType.toLowerCase())
        );
        if (!matches) return false;
      }
      return true;
    });
  }, [rules, programType]);

  const hiddenRulesList = useMemo(() => filteredByProgram.filter((r) => r.isEasyToMiss), [filteredByProgram]);
  const publicRulesList = useMemo(() => filteredByProgram.filter((r) => !r.isEasyToMiss), [filteredByProgram]);

  const displayRules = useMemo(() => {
    return filteredByProgram.filter((rule) => {
      if (ruleScopeTab === 'hidden' && !rule.isEasyToMiss) return false;
      if (ruleScopeTab === 'public' && rule.isEasyToMiss) return false;
      if (filterCategory !== 'ALL' && rule.category !== filterCategory) return false;
      if (filterRisk !== 'ALL' && rule.primaryRiskRating !== filterRisk) return false;
      return true;
    });
  }, [filteredByProgram, ruleScopeTab, filterCategory, filterRisk]);

  const getDollarText = (rule: Rule) => {
    const slug = rule.slug || '';
    const lowerName = rule.name.toLowerCase();
    const daily = rule.category === 'RISK' && slug.includes('daily');
    const maxLoss = rule.category === 'RISK' && (slug.includes('max') || slug.includes('micro'));
    const target = slug.includes('target');
    const inactivity = slug.includes('inactivity');
    const margin80 = slug.includes('80-percent-margin') || lowerName.includes('80% margin') || lowerName.includes('margin utilization');
    const consistency = slug.includes('consistency') || lowerName.includes('consistency');
    if (margin80) {
      const maxMarginDollars = selectedCapital * 0.8;
      return `On your ${fmt(selectedCapital)} account: total used margin across all open positions must stay below ${fmt(maxMarginDollars)} (80% of margin). Exceeding once can void profits at payout review.`;
    }
    if (consistency) {
      const targetPct = 8;
      const maxSingleTradeProfit = (selectedCapital * targetPct / 100) * 0.15;
      return `On your ${fmt(selectedCapital)} account: no single trade/day should exceed 15% of the required profit. Example: if target is ${targetPct}% (${fmt(selectedCapital * targetPct/100)}), max from one trade = ${fmt(maxSingleTradeProfit)}.`;
    }
    if (daily) {
      const floor = selectedCapital * (rule.normalizedValue as number / 100);
      return `On your ${fmt(selectedCapital)} account: daily limit is ${fmt(floor)}. Floor = ${fmt(selectedCapital - floor)} (resets at 00:00 server time).`;
    }
    if (maxLoss && typeof rule.normalizedValue === 'number' && rule.unit === '%') {
      const maxLossDollars = selectedCapital * (rule.normalizedValue / 100);
      return `On your ${fmt(selectedCapital)} account: max overall loss = ${fmt(maxLossDollars)}. Floor = ${fmt(selectedCapital - maxLossDollars)}.`;
    }
    if (maxLoss && typeof rule.normalizedValue === 'number' && rule.unit === 'USD') {
      return `On your ${fmt(selectedCapital)} account: loss trigger is ${fmt(rule.normalizedValue)}.`;
    }
    if (target && typeof rule.normalizedValue === 'number') {
      const targetDollars = selectedCapital * (rule.normalizedValue / 100);
      return `On your ${fmt(selectedCapital)} account: profit target = ${fmt(targetDollars)} to pass.`;
    }
    if (inactivity) {
      return `Place at least one trade every ${rule.normalizedValue} calendar days to avoid lock.`;
    }
    return null;
  };

  const toggle = (id: string) => setExpandedId(expandedId === id ? null : id);

  return (
    <div className="space-y-6">
      {/* Header like "Every way traders blow accounts" */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-bold tracking-[0.14em] uppercase text-white/40">Rule Intelligence · Live Engine</h3>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-white leading-none">Every way traders blow accounts</h2>
            <p className="text-sm text-[#9CA3AF] mt-2 leading-relaxed max-w-xl">Each card is a verified breach trigger. Filter by category — dollar math updates live to your <span className="font-mono text-white">{fmt(selectedCapital)}</span> <span className="text-white/60">{programType}</span> account.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-[#111318] border border-[#1F2228]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-white">{fmt(selectedCapital)}</span>
              <span className="text-xs text-white/40">·</span>
              <span className="text-xs text-white/60">{programType}</span>
            </div>
            <span className="text-xs text-white/40 font-mono">{displayRules.length} rules</span>
          </div>
        </div>
      </div>

      {/* Category Tabs — Dark editorial style */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {categories.map((cat) => {
          const isActive = filterCategory === cat;
          const cfg = CATEGORY_TAB_CONFIG[cat] || { label: CATEGORY_LABEL[cat] || cat, icon: Layers };
          const Icon = cfg.icon;
          const isDrawdown = cat === 'RISK';
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium border transition-colors ${
                isActive
                  ? isDrawdown
                    ? 'bg-[#111318] border-[#1F2228] text-white shadow-sm'
                    : 'bg-white text-[#080A10] border-white shadow-sm'
                  : 'bg-[#111318] border-[#1F2228] text-[#9CA3AF] hover:text-white hover:border-[#2A2D35]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive && isDrawdown ? 'text-red-500' : isActive ? 'text-[#080A10]' : 'text-white/40'}`} />
              <span>{cfg.label}</span>
              <span className={`text-xs font-mono ${isActive ? (isDrawdown ? 'text-white/60' : 'text-[#080A10]/60') : 'text-white/30'}`}>
                ({cat === 'ALL' ? filteredByProgram.length : filteredByProgram.filter(r=>r.category===cat).length})
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="inline-flex p-1 rounded-full bg-[#111318] border border-[#1F2228]">
          <button onClick={() => setRuleScopeTab('all')} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${ruleScopeTab === 'all' ? 'bg-white text-[#080A10]' : 'text-[#9CA3AF] hover:text-white'}`}>
            All <span className="font-mono text-[11px] opacity-60">({filteredByProgram.length})</span>
          </button>
          <button onClick={() => setRuleScopeTab('hidden')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors inline-flex items-center gap-1 ${ruleScopeTab === 'hidden' ? 'bg-amber-500 text-[#080A10]' : 'text-[#9CA3AF] hover:text-white'}`}>
            <Eye className="w-3 h-3" /> Hidden <span className="font-mono text-[11px] opacity-70">({hiddenRulesList.length})</span>
          </button>
          <button onClick={() => setRuleScopeTab('public')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${ruleScopeTab === 'public' ? 'bg-white text-[#080A10]' : 'text-[#9CA3AF] hover:text-white'}`}>
            Public <span className="font-mono text-[11px] opacity-60">({publicRulesList.length})</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <select aria-label="Filter by risk level" value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)} className="px-3.5 py-2 rounded-full bg-[#111318] border border-[#1F2228] text-sm text-white focus:outline-none focus:border-[#2A2D35] font-mono text-xs">
            <option value="ALL">All risk levels</option>
            <option value="EXTREME">Extreme</option>
            <option value="HIGH">High</option>
            <option value="MODERATE">Moderate</option>
            <option value="SAFE">Safe</option>
          </select>
          {(filterCategory !== 'ALL' || filterRisk !== 'ALL' || ruleScopeTab !== 'all') && (
            <button onClick={() => { setFilterCategory('ALL'); setFilterRisk('ALL'); setRuleScopeTab('all'); }} className="text-xs text-[#9CA3AF] hover:text-white underline">Reset</button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs border-y border-[#1F2228] py-2">
        <span className="text-[#9CA3AF] font-mono">Showing <span className="text-white font-medium">{displayRules.length}</span> rules · {programType} · {fmt(selectedCapital)}</span>
        <span className="hidden sm:inline text-[#9CA3AF] text-xs">Click any card to expand sources & formula</span>
      </div>

      {displayRules.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-[#111318] border border-[#1F2228]">
          <p className="text-sm font-medium text-white">No rules match this filter</p>
          <p className="text-xs text-[#9CA3AF] mt-1">Switch to "All rules" or reset categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayRules.map((rule) => {
            const isHidden = rule.isEasyToMiss;
            const isOpen = expandedId === rule.id;
            const isHighlighted = Boolean(
              highlightedRuleId && (
                rule.slug === highlightedRuleId ||
                rule.id === highlightedRuleId ||
                rule.slug.startsWith(highlightedRuleId) ||
                highlightedRuleId.startsWith(rule.slug)
              )
            );
            const dollarText = getDollarText(rule);
            const CatIcon = CATEGORY_ICON[rule.category] || Shield;
            return (
              <div
                key={rule.id}
                id={`rule-card-${rule.slug}`}
                className={`rounded-xl border overflow-hidden transition-all duration-300 flex flex-col ${
                  isHighlighted
                    ? 'ring-2 ring-sky-400 border-sky-400/80 bg-[#141720] shadow-[0_0_25px_rgba(56,189,248,0.35)]'
                    : isOpen
                    ? 'bg-[#111318] border-[#2A2D35]'
                    : isHidden
                    ? 'bg-[#111318] border-amber-500/20 hover:border-amber-500/30'
                    : 'bg-[#111318] border-[#1F2228] hover:border-[#2A2D35]'
                }`}
              >
                <button onClick={() => toggle(rule.id)} className="w-full text-left p-4 flex gap-3 items-start">
                  {/* Icon top-left */}
                  <span className="w-9 h-9 rounded-lg bg-[#080A10] border border-[#1F2228] flex items-center justify-center shrink-0 mt-0.5">
                    <CatIcon className={`w-4 h-4 ${rule.category==='RISK' ? 'text-red-400' : 'text-[#9CA3AF]'}`} />
                  </span>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${RISK_DOT[rule.primaryRiskRating] || 'bg-white/20'}`} />
                      <span className="text-[11px] font-bold tracking-wider uppercase text-[#9CA3AF]">{CATEGORY_LABEL[rule.category] || rule.category}</span>
                      <span className="text-[11px] text-[#6B7280]">·</span>
                      <span className="text-[11px] font-mono text-[#9CA3AF]">{rule.headlineValue}</span>
                      {isHidden && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400"><Eye className="w-3 h-3" /> Hidden</span>}
                    </div>
                    <h3 className="text-sm font-semibold text-white leading-tight pr-2">{rule.name}</h3>
                    <p className="text-xs leading-relaxed text-[#9CA3AF] line-clamp-2">{rule.plainEnglish}</p>
                    {dollarText && <p className="text-xs leading-relaxed text-[#9CA3AF] bg-[#080A10] border border-[#1F2228] rounded-lg px-3 py-2 font-mono">{dollarText}</p>}
                    <div className="flex items-center gap-2 text-[11px] text-[#6B7280] font-mono">
                      <span>{rule.sources.length} sources</span>
                      <span className="w-px h-3 bg-[#1F2228]" />
                      <span>{rule.lastVerified}</span>
                      <span className="hidden sm:inline w-px h-3 bg-[#1F2228]" />
                      <span className="hidden sm:inline text-[#9CA3AF]">{rule.stageScope}</span>
                    </div>
                  </div>
                  <span className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 mt-1 transition-colors ${isOpen ? 'bg-white text-[#080A10] border-white' : 'bg-[#080A10] border-[#1F2228] text-[#9CA3AF]'}`}>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-[#1F2228] pt-4 bg-[#080A10]/40">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="p-3 rounded-lg bg-[#080A10] border border-[#1F2228]">
                        <p className="text-[11px] font-semibold tracking-wide uppercase text-[#9CA3AF]">Official wording</p>
                        <p className="text-xs leading-relaxed text-[#9CA3AF] mt-1.5 italic">"{rule.officialWording}"</p>
                      </div>
                      <div className="p-3 rounded-lg bg-[#080A10] border border-[#1F2228]">
                        <p className="text-[11px] font-semibold tracking-wide uppercase text-[#9CA3AF]">How traders violate</p>
                        <p className="text-xs leading-relaxed text-[#9CA3AF] mt-1.5">{rule.howTradersViolate}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-[#080A10] border border-[#1F2228] flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold tracking-wide uppercase text-[#9CA3AF]">Risk · Importance</p>
                          <p className="text-xs font-medium text-white mt-1.5 flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${RISK_DOT[rule.primaryRiskRating]}`} /> {rule.primaryRiskRating} · {rule.importance}</p>
                          <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">{rule.importanceReason}</p>
                        </div>
                        <span className="font-mono text-xs text-white bg-[#111318] border border-[#1F2228] px-2 py-1 rounded-full shrink-0">{rule.headlineValue}</span>
                      </div>
                    </div>

                    {rule.exceptions && rule.exceptions.length>0 && (
                      <div className="p-3 rounded-lg bg-amber-500/[0.06] border border-amber-500/15">
                        <p className="text-xs font-medium text-amber-400 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Exceptions</p>
                        <ul className="mt-2 space-y-1.5">
                          {rule.exceptions.map((ex, i)=>(
                            <li key={i} className="text-xs leading-relaxed text-[#9CA3AF]"><span className="font-medium text-white/80">{ex.condition}:</span> {ex.description}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {isHidden && rule.whyEasyToMiss && (
                      <div className="p-3 rounded-lg bg-amber-500/[0.06] border border-amber-500/15 flex gap-2">
                        <Eye className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div><p className="text-xs font-medium text-amber-400">Why this is easy to miss</p><p className="text-xs leading-relaxed text-[#9CA3AF] mt-1">{rule.whyEasyToMiss}</p></div>
                      </div>
                    )}

                    {rule.formula && (
                      <div className="p-3 rounded-lg bg-[#080A10] border border-[#1F2228]">
                        <p className="text-xs font-medium text-white flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-[#9CA3AF]" /> Formula: {rule.formula.formulaName}</p>
                        <code className="block mt-2 p-2.5 rounded-lg bg-[#111318] border border-[#1F2228] text-xs font-mono text-[#9CA3AF] leading-relaxed">{rule.formula.formulaExpression}</code>
                        <p className="text-xs text-[#9CA3AF] mt-2 leading-relaxed">{rule.formula.explanation}</p>
                        <p className="text-xs text-[#6B7280] mt-1 font-mono">Ex: {rule.formula.exampleOutput}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold tracking-wide uppercase text-[#9CA3AF]">Sources ({rule.sources.length})</p>
                      <div className="grid gap-2">
                        {rule.sources.map(s=>(
                          <div key={s.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-[#111318] border border-[#1F2228] hover:border-[#2A2D35] transition-colors">
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-white leading-tight truncate">{s.sourceTitle}</p>
                              <p className="text-xs text-[#6B7280] truncate mt-0.5 font-mono">{s.sourceUrl}</p>
                              <p className="text-xs text-[#9CA3AF] mt-1.5 line-clamp-2 leading-relaxed">"{s.sourceExcerpt.slice(0,160)}{s.sourceExcerpt.length>160?'…':''}"</p>
                              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded-full bg-[#080A10] border border-[#1F2228] text-[11px] font-mono text-[#9CA3AF]">{s.sourceType.replace(/_/g,' ')}</span>
                                <span className="px-2 py-0.5 rounded-full bg-[#080A10] border border-[#1F2228] text-[11px] font-mono text-[#9CA3AF]">Grade {s.confidence}</span>
                                <span className="text-[11px] text-[#6B7280] font-mono">{s.retrievedAt}</span>
                              </div>
                            </div>
                            {onOpenSource && <button onClick={()=>onOpenSource(s, rule.name)} className="shrink-0 w-8 h-8 rounded-full bg-white text-[#080A10] flex items-center justify-center hover:bg-white/90"><ExternalLink className="w-3.5 h-3.5" /></button>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
