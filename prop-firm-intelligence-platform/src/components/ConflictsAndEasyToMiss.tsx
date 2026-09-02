import React, { useState } from 'react';
import {
  AlertTriangle,
  FileQuestion,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Info,
  CheckCircle2,
  FileText,
  Search,
  EyeOff,
  Copy,
  Check,
  ShieldCheck
} from 'lucide-react';
import { RuleConflict, RuleEvidenceItem } from '../types';
import { getImportanceBadgeClass } from '../lib/utils';

interface ConflictsAndEasyToMissProps {
  conflicts: RuleConflict[];
  rules: RuleEvidenceItem[];
  onOpenSourceModal: (source: any) => void;
}

export const ConflictsAndEasyToMiss: React.FC<ConflictsAndEasyToMissProps> = ({
  conflicts,
  rules,
  onOpenSourceModal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'CONFLICTS' | 'EASY_TO_MISS'>('CONFLICTS');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const easyToMissRules = rules.filter(r => r.is_easy_to_miss);
  const categories = ['ALL', ...Array.from(new Set(easyToMissRules.map(r => r.category)))];

  const filteredEasyToMiss = filterCategory === 'ALL'
    ? easyToMissRules
    : easyToMissRules.filter(r => r.category === filterCategory);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="conflicts-and-traps-container" className="space-y-6 animate-fadeIn">
      {/* Top Banner / Explanation */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-925 to-zinc-950 border border-zinc-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-100">
                Rule Discrepancies & Easy-to-Miss Traps
              </h1>
            </div>
            <p className="text-xs text-zinc-300 max-w-3xl leading-relaxed">
              Prop firm marketing frequently summarizes complex requirements into simple headlines. Our intelligence engine cross-references promotional claims against legal Terms of Service, buried FAQ articles, and historical payout dispute resolutions.
            </p>
          </div>

          {/* Sub-tab switcher */}
          <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 shrink-0">
            <button
              onClick={() => setActiveSubTab('CONFLICTS')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'CONFLICTS'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-md shadow-rose-500/10'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span>Detected Conflicts ({conflicts.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('EASY_TO_MISS')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'EASY_TO_MISS'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-md shadow-amber-500/10'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <EyeOff className="h-4 w-4 text-amber-400" />
              <span>Easy-to-Miss Rules ({easyToMissRules.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: DETECTED CONFLICTS */}
      {activeSubTab === 'CONFLICTS' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-400 font-bold">
              Cross-Document Discrepancies & Hidden Qualifications
            </h2>
            <span className="text-xs text-rose-400 font-mono font-semibold">
              {conflicts.filter(c => c.severity === 'CRITICAL' || c.severity === 'HIGH').length} High/Critical Severities Detected
            </span>
          </div>

          <div className="space-y-4">
            {conflicts.map(conflict => {
              const impClass = getImportanceBadgeClass(conflict.severity);
              return (
                <div
                  key={conflict.id}
                  className="p-6 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 shadow-xl space-y-4 transition-all"
                >
                  {/* Conflict Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-3 py-1 rounded-full text-xs font-mono font-black border ${impClass.bg} ${impClass.text} ${impClass.border}`}>
                        {conflict.severity} SEVERITY
                      </span>
                      <h3 className="font-extrabold text-base text-zinc-100">{conflict.headline}</h3>
                    </div>
                    <span className="text-xs font-mono text-zinc-400">
                      Rule Domain: <strong className="text-zinc-200">{conflict.rule_name}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">{conflict.description}</p>

                  {/* Side-by-Side Comparison Box */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Source A */}
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-cyan-400 font-bold">
                          Source A: {conflict.source_a_label}
                        </span>
                        <button
                          onClick={() => onOpenSourceModal({
                            title: conflict.source_a_label,
                            url: conflict.source_a_url,
                            source_quote: conflict.source_a_quote,
                            type: 'OFFICIAL_PROMOTIONAL'
                          })}
                          className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 font-mono cursor-pointer"
                        >
                          <FileText className="h-3 w-3" />
                          <span>View Proof</span>
                        </button>
                      </div>
                      <blockquote className="text-zinc-200 text-xs italic border-l-2 border-cyan-500 pl-3 leading-relaxed bg-zinc-900/50 p-2.5 rounded-r-xl">
                        &ldquo;{conflict.source_a_quote}&rdquo;
                      </blockquote>
                    </div>

                    {/* Source B */}
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-850 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-rose-400 font-bold">
                          Source B: {conflict.source_b_label}
                        </span>
                        <button
                          onClick={() => onOpenSourceModal({
                            title: conflict.source_b_label,
                            url: conflict.source_b_url,
                            source_quote: conflict.source_b_quote,
                            type: 'OFFICIAL_TERMS'
                          })}
                          className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 font-mono cursor-pointer"
                        >
                          <FileText className="h-3 w-3" />
                          <span>View Proof</span>
                        </button>
                      </div>
                      <blockquote className="text-zinc-200 text-xs italic border-l-2 border-rose-500 pl-3 leading-relaxed bg-zinc-900/50 p-2.5 rounded-r-xl">
                        &ldquo;{conflict.source_b_quote}&rdquo;
                      </blockquote>
                    </div>
                  </div>

                  {/* What this means & recommended action */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs space-y-1.5">
                      <span className="font-bold text-indigo-300 block font-mono">💡 What This Means For Traders:</span>
                      <p className="text-zinc-300 leading-relaxed">{conflict.what_this_means}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs space-y-1.5">
                      <span className="font-bold text-emerald-300 block font-mono">🛡️ Recommended Precaution:</span>
                      <p className="text-zinc-300 leading-relaxed">{conflict.recommended_action}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: EASY-TO-MISS RULES */}
      {activeSubTab === 'EASY_TO_MISS' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-400 font-bold">
              Rules Buried in FAQs & Terms of Service
            </h2>

            {/* Category filter pills */}
            <div className="flex gap-1.5 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEasyToMiss.map(rule => (
              <div
                key={rule.id}
                className="p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/40 transition-all shadow-lg space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                      {rule.category}
                    </span>
                    <span className="font-mono text-xs font-bold text-zinc-200">
                      {rule.normalized_value}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-zinc-100">{rule.name}</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">{rule.simple_explanation}</p>

                  {/* Verbatim quote */}
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 text-xs italic text-zinc-400 border-l-2 border-amber-500 leading-relaxed">
                    &ldquo;{rule.source_quote}&rdquo;
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-mono text-[11px]">
                    Source: <strong className="text-zinc-300">{rule.source_section}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyText(rule.id, rule.source_quote)}
                      className="p-1 text-zinc-400 hover:text-zinc-200"
                      title="Copy Quote"
                    >
                      {copiedId === rule.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => onOpenSourceModal(rule)}
                      className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-mono text-xs font-semibold cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Evidence</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
