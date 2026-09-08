import React, { useState } from 'react';
import { GFTRuleDetail, VerificationStatus } from '../../data/goatCanonicalData.ts';
import {
  Scale,
  Search,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';

interface GoatV3RuleExplorerProps {
  rules: GFTRuleDetail[];
  accountSize: number;
  onOpenSourceModal: (evidence: string, title: string, sourceUrl?: string) => void;
}

export const GoatV3RuleExplorer: React.FC<GoatV3RuleExplorerProps> = ({
  rules,
  accountSize,
  onOpenSourceModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>('rule-daily-drawdown');

  const categories = [
    { id: 'all', label: 'All Rules' },
    { id: 'drawdown', label: 'Drawdown Engine' },
    { id: 'funded', label: 'Funded & Payouts' },
    { id: 'trading_style', label: 'Trading Styles & News' },
    { id: 'prohibited', label: 'Prohibited & VPS' },
  ];

  const filteredRules = rules.filter((r) => {
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.summary.toLowerCase().includes(q) ||
      r.exactClause.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'officially_verified':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-2.5 h-2.5" /> Officially Verified
          </span>
        );
      case 'conflicting_sources':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-2.5 h-2.5" /> Conflicting Sources
          </span>
        );
      case 'historical_rule':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
            Historical Rule
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            Audit Pending
          </span>
        );
    }
  };

  return (
    <section id="explorer" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-400" />
            Full Rule Explorer & Verification Audit
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Detailed breakdown of every rule with official legal clauses, calculation mathematics, breach triggers, and source references.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search rules, clauses, terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111318] border border-[#1F2228] rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                : 'bg-[#111318] hover:bg-[#16181E] text-slate-400 border-[#1F2228]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-2">
        {filteredRules.map((rule) => {
          const isExpanded = expandedRuleId === rule.id;

          return (
            <div
              key={rule.id}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? 'bg-[#111318] border-blue-500/50 shadow-md shadow-blue-500/5'
                  : 'bg-[#111318] hover:bg-[#14161d] border-[#1F2228]'
              }`}
            >
              {/* Header */}
              <button
                onClick={() => setExpandedRuleId(isExpanded ? null : rule.id)}
                className="w-full p-4 text-left flex items-start justify-between gap-3 cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{rule.title}</h3>
                    {getStatusBadge(rule.verificationStatus)}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {rule.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{rule.summary}</p>
                </div>

                <div className="text-slate-400 pt-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-blue-400" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expanded Body */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-white/[0.05] space-y-3 text-xs animate-fadeIn">
                  {/* Exact Clause Box */}
                  <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06] space-y-1">
                    <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
                      <FileText className="w-3 h-3 text-sky-400" />
                      Official Exact Clause / Text:
                    </div>
                    <blockquote className="text-slate-300 italic text-xs leading-relaxed border-l-2 border-sky-500/50 pl-2.5">
                      "{rule.exactClause}"
                    </blockquote>
                  </div>

                  {/* Mathematics & Concrete Example */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-[#16181E] border border-[#1F2228] space-y-1">
                      <div className="text-[11px] font-semibold text-slate-300">How It Is Calculated:</div>
                      <p className="text-slate-400 text-xs leading-relaxed">{rule.howItIsCalculated}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#16181E] border border-[#1F2228] space-y-1">
                      <div className="text-[11px] font-semibold text-emerald-300">
                        Live Dollar Example (${accountSize.toLocaleString()}):
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed font-mono">
                        {rule.concreteExample(accountSize)}
                      </p>
                    </div>
                  </div>

                  {/* Breach Consequence */}
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-300 text-xs block">
                        Consequence of Violation:
                      </span>
                      <span className="text-rose-200/90 text-xs leading-relaxed">
                        {rule.consequenceDescription}
                      </span>
                    </div>
                  </div>

                  {/* Conflicting Info Notice if present */}
                  {rule.conflictInfo && rule.conflictInfo.hasConflict && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Conflicting Documentation Notice:
                      </div>
                      <p className="text-xs text-amber-200/90 leading-relaxed">
                        {rule.conflictInfo.description}
                      </p>
                      <div className="text-[11px] text-amber-300/80">
                        <span className="font-semibold">Recommendation:</span> {rule.conflictInfo.recommendation}
                      </div>
                    </div>
                  )}

                  {/* Verification Source Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.04] text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Last Verified: <strong className="text-slate-300">{rule.verificationDate}</strong></span>
                      <span>·</span>
                      <span>Source: <strong className="text-slate-300">{rule.sourceName}</strong></span>
                    </div>

                    <button
                      onClick={() => onOpenSourceModal(rule.exactClause, rule.title, rule.sourceUrl)}
                      className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Inspect Source Evidence
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
