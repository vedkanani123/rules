import React, { useState } from 'react';
import { Rule, SourceEvidence } from '../../types/schema.ts';
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FileCheck,
  Calculator,
  ShieldAlert,
  Search,
} from 'lucide-react';

interface RuleCardProps {
  rule: Rule;
  onOpenSource: (evidence: SourceEvidence, ruleTitle: string) => void;
}

export const RuleCard: React.FC<RuleCardProps> = ({ rule, onOpenSource }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const getImportanceBadge = (importance: string) => {
    // Only hidden rules get red/orange - normal rules get neutral
    const isHidden = rule.isEasyToMiss;
    switch (importance) {
      case 'CRITICAL': return isHidden ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-slate-800 text-slate-300 border-slate-700';
      case 'HIGH': return isHidden ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-slate-800 text-white/60 border-slate-700';
      case 'MEDIUM': return 'bg-slate-800 text-white/60 border-slate-700';
      default: return 'bg-slate-800 text-white/60 border-slate-700';
    }
  };

  const isHiddenCard = rule.isEasyToMiss;
  return (
    <div id={`rule-card-${rule.slug}`} className={`glass-card/80 border rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md ${isHiddenCard ? 'border-red-900/50 hover:border-red-500/40' : 'border-white/[0.06] hover:border-slate-700/80'}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={`rule-body-${rule.slug}`}
        className="w-full text-left p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset"
      >
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {rule.category}
            </span>
            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getImportanceBadge(rule.importance)}`}>
              {rule.importance}
            </span>
            <span className="px-2 py-1 text-[10px] font-medium rounded-full bg-slate-800/60 text-white/60 border border-slate-700/60 hidden sm:inline-flex">
              Scope: {rule.stageScope}
            </span>
            {rule.isEasyToMiss && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 motion-safe:animate-pulse motion-reduce:animate-none">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                Hidden • Risk {rule.easyToMissRisk}
              </span>
            )}
          </div>
          <h4 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight pr-2">
            {rule.name}
          </h4>
          <p className="text-xs sm:text-sm text-white/60 leading-relaxed line-clamp-2 sm:line-clamp-1">
            {rule.plainEnglish}
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
          <div className="text-left sm:text-right">
            <span className="text-sm font-mono font-bold text-brand-400 block">
              {rule.headlineValue}
            </span>
            <span className="text-[11px] text-white/60">
              Verified {rule.lastVerified}
            </span>
          </div>
          <span className={`p-2 rounded-xl shrink-0 min-h-[44px] min-w-[36px] flex items-center justify-center transition-colors ${expanded ? 'bg-brand-500/20 text-brand-400' : 'bg-slate-800 text-white/60'}`}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </button>

      {/* Expanded */}
      {expanded && (
        <div id={`rule-body-${rule.slug}`} className="px-4 sm:px-5 pb-5 pt-3 border-t border-white/[0.06]/80 bg-[#080A10]/50 space-y-4 text-xs sm:text-sm animate-in fade-in duration-150">
          <div className="p-3 sm:p-3.5 rounded-xl glass-card border border-white/[0.06] space-y-1.5">
            <span className="font-bold text-slate-300 flex items-center gap-1.5 text-xs sm:text-sm">
              <FileCheck className="w-4 h-4 text-brand-400 shrink-0" />
              Plain-English Explanation
            </span>
            <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
              {rule.plainEnglish}
            </p>
          </div>

          {rule.isEasyToMiss && rule.whyEasyToMiss && (
            <div className="p-3 sm:p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-200 space-y-1.5">
              <span className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Why Traders Miss This
              </span>
              <p className="text-xs sm:text-sm leading-relaxed text-amber-200">
                {rule.whyEasyToMiss}
              </p>
            </div>
          )}

          {rule.formula && (
            <div className="p-3 sm:p-3.5 rounded-xl glass-card/90 border border-white/[0.06] space-y-2">
              <span className="font-bold text-slate-300 flex items-center gap-1.5 text-xs sm:text-sm">
                <Calculator className="w-4 h-4 text-blue-400 shrink-0" />
                Formula: {rule.formula.formulaName}
              </span>
              <div className="p-2.5 sm:p-3 rounded-xl bg-[#080A10] font-mono text-xs text-blue-300 border border-white/[0.06]/80 overflow-x-auto whitespace-pre-wrap break-words">
                {rule.formula.formulaExpression}
              </div>
              <p className="text-white/60 text-xs leading-relaxed">
                <strong className="text-slate-300">Example:</strong> {rule.formula.exampleOutput}
              </p>
            </div>
          )}

          <div className="p-3 sm:p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 space-y-1.5">
            <span className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              How Traders Violate
            </span>
            <p className="text-xs sm:text-sm text-red-200 leading-relaxed">
              {rule.howTradersViolate}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <p className="text-xs text-white/60 italic break-words">
              Official: "{rule.officialWording}"
            </p>
            {rule.sources && rule.sources.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {rule.sources.map((src, sIdx) => (
                  <button
                    key={src.id || sIdx}
                    type="button"
                    onClick={() => onOpenSource(src, `${rule.name} (Source ${sIdx + 1})`)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-medium rounded-xl bg-[#2563eb]/10 text-sky-400 border border-[#2563eb]/30 hover:bg-[#2563eb]/20 transition-colors min-h-[38px] focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    <Search className="w-3.5 h-3.5 shrink-0" />
                    <span>Inspect Source {rule.sources.length > 1 ? `#${sIdx + 1}: ${src.documentName || src.urlType}` : `(${src.documentName || 'Verified Citation'})`}</span>
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-[11px] font-mono text-white/40 italic">Verified official citation in catalog</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
