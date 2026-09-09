import React, { useState } from 'react';
import { GFTDecisionRecommendation, GFTModel } from '../../data/goatCanonicalData.ts';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Target,
  CheckCircle2,
} from 'lucide-react';

interface GoatV3QuickDecisionProps {
  recommendations: GFTDecisionRecommendation[];
  onSelectModelById: (modelId: string) => void;
  currentSelectedModelId: string;
}

export const GoatV3QuickDecision: React.FC<GoatV3QuickDecisionProps> = ({
  recommendations,
  onSelectModelById,
  currentSelectedModelId,
}) => {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const toggleExpand = (key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  return (
    <section id="decision" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Quick Decision Guide & Suitability Matrix
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Algorithmic recommendations categorized by trading style. Each choice includes explicit assumptions, criteria, and trade-offs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {recommendations.map((rec) => {
          const isExpanded = expandedKey === rec.key;
          const isSelected = currentSelectedModelId === rec.bestModelId;

          return (
            <div
              key={rec.key}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#121929] border-blue-500/60 shadow-md shadow-blue-500/10'
                  : 'bg-[#111318] hover:bg-[#151820] border-[#1F2228]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {rec.badge}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5">{rec.title}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {rec.suitabilityScore}/100
                    </span>
                    <div className="text-[10px] text-slate-400">Fit Score</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-black/30 border border-white/[0.04] mb-3">
                  <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    {rec.bestModelName} (${(rec.accountSizeRecommendation || 100000).toLocaleString()})
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {rec.whyRecommended}
                  </p>
                </div>

                {/* Expanded Details: Assumptions & Risks */}
                {isExpanded && (
                  <div className="space-y-3 pt-2 border-t border-white/[0.06] text-xs animate-fadeIn">
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Criteria & Assumptions Used:
                      </div>
                      <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px] pl-1">
                        {(rec.assumptionsUsed || []).map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <div className="font-semibold text-amber-300 flex items-center gap-1 text-[11px]">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        Risks & Trade-offs:
                      </div>
                      <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px] pl-1">
                        {(rec.risksAndLimitations || []).map((risk, idx) => (
                          <li key={idx}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.05] text-xs">
                <button
                  onClick={() => toggleExpand(rec.key)}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  {isExpanded ? (
                    <>
                      <span>Hide Rationale</span>
                      <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <span>Inspect Rationale</span>
                      <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>

                <button
                  onClick={() => onSelectModelById(rec.bestModelId || rec.recommendedModelId || '')}
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <span>{isSelected ? 'Active Model' : 'Inspect Model'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
