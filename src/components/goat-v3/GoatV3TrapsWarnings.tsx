import React, { useState } from 'react';
import { GFTWarningItem } from '../../data/goatCanonicalData.ts';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  ShieldAlert,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';

interface GoatV3TrapsWarningsProps {
  warnings: GFTWarningItem[];
  selectedModelId: string;
}

export const GoatV3TrapsWarnings: React.FC<GoatV3TrapsWarningsProps> = ({
  warnings,
  selectedModelId,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedWarningId, setExpandedWarningId] = useState<string | null>('trap-floating-loss');

  const filteredWarnings = warnings.filter((w) => {
    if (filterType === 'all') return true;
    return w.classification === filterType;
  });

  const getBadgeStyle = (classification: string) => {
    switch (classification) {
      case 'High-risk condition':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'Important restriction':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Conflicting wording':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'Potential misunderstanding':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <section id="traps" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Watchouts, Restrictions & Rule Clarifications
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Objective operational traps and critical conditions that cause unexpected rule breaches or profit deductions.
          </p>
        </div>

        {/* Filter by Classification */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#111318] border border-[#1F2228] rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Classifications ({warnings.length})</option>
            <option value="High-risk condition">High-Risk Conditions</option>
            <option value="Important restriction">Important Restrictions</option>
            <option value="Conflicting wording">Conflicting Wording</option>
            <option value="Potential misunderstanding">Potential Misunderstandings</option>
          </select>
        </div>
      </div>

      <div className="space-y-2.5">
        {filteredWarnings.map((w) => {
          const isExpanded = expandedWarningId === w.id;
          const affectsCurrentModel =
            w.affectedModelIds.includes('all') || w.affectedModelIds.includes(selectedModelId);

          return (
            <div
              key={w.id}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? 'bg-[#111318] border-rose-500/40 shadow-lg shadow-rose-500/5'
                  : 'bg-[#111318] hover:bg-[#151820] border-[#1F2228]'
              }`}
            >
              <button
                onClick={() => setExpandedWarningId(isExpanded ? null : w.id)}
                className="w-full p-4 text-left flex items-start justify-between gap-3 cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${getBadgeStyle(w.classification)}`}>
                      {w.classification}
                    </span>
                    <h3 className="text-sm font-bold text-white">{w.title}</h3>
                    {affectsCurrentModel && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-semibold">
                        Affects Active Model
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">{w.whatTheIssueIs}</p>
                </div>

                <div className="text-slate-400 pt-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-rose-400" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-white/[0.05] space-y-3 text-xs animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-[#16181E] border border-[#1F2228] space-y-1">
                      <span className="text-slate-400 block font-semibold text-[11px]">Who It Affects:</span>
                      <p className="text-slate-200 text-xs leading-relaxed">{w.whoItAffects}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#16181E] border border-[#1F2228] space-y-1">
                      <span className="text-amber-400 block font-semibold text-[11px]">Why It Matters:</span>
                      <p className="text-slate-200 text-xs leading-relaxed">{w.whyItMatters}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/30 space-y-1">
                      <span className="text-blue-300 block font-semibold text-[11px]">What You Must Verify:</span>
                      <p className="text-slate-200 text-xs leading-relaxed">{w.whatUserShouldVerify}</p>
                    </div>
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
