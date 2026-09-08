import React from 'react';
import { GFTChangeHistoryItem } from '../../data/goatCanonicalData.ts';
import {
  Calendar,
  History,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface GoatV3ChangeHistoryProps {
  changeHistory: GFTChangeHistoryItem[];
}

export const GoatV3ChangeHistory: React.FC<GoatV3ChangeHistoryProps> = ({
  changeHistory,
}) => {
  return (
    <section id="history" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" />
            Rule Change History & Verification Audit Trail
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Chronological audit of official policy updates, drawdown formula revisions, and product retirement cutoffs.
          </p>
        </div>
      </div>

      <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 py-2">
        {changeHistory.map((item) => (
          <div key={item.id} className="relative pl-6">
            {/* Timeline Dot */}
            <div
              className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 ${
                item.impactLevel === 'breaking'
                  ? 'bg-rose-500 border-black'
                  : 'bg-blue-500 border-black'
              }`}
            />

            <div className="p-4 rounded-xl bg-[#111318] border border-[#1F2228] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {item.date}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold uppercase ${
                      item.impactLevel === 'breaking'
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {item.impactLevel} update
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Models: {item.affectedModels.join(', ')}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white">{item.title}</h3>

              {/* Before vs After Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-rose-500/[0.06] border border-rose-500/20 space-y-1">
                  <div className="text-[10px] font-mono text-rose-300 uppercase font-bold">
                    Previous Rule:
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">{item.previousRule}</p>
                </div>

                <div className="p-3 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/20 space-y-1">
                  <div className="text-[10px] font-mono text-emerald-300 uppercase font-bold">
                    New Enforced Rule:
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed font-semibold">
                    {item.newRule}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/[0.04]">
                <div>
                  <span className="text-slate-500">Official Source:</span>{' '}
                  <strong className="text-slate-300">{item.source}</strong>
                </div>
                <div className="text-slate-400 italic">
                  Rationale: {item.explanation}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
