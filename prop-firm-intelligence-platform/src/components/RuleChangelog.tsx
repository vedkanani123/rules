import React from 'react';
import { History, ArrowRight, ShieldCheck, AlertTriangle, Calendar, Tag } from 'lucide-react';
import { RuleChangeHistory } from '../types';

interface RuleChangelogProps {
  changes: RuleChangeHistory[];
  onOpenSourceModal: (source: any) => void;
}

export const RuleChangelog: React.FC<RuleChangelogProps> = ({ changes, onOpenSourceModal }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <History className="h-6 w-6 text-indigo-400" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-100">
            Official Rule Modification Changelog & History
          </h1>
        </div>
        <p className="text-xs text-zinc-400 max-w-3xl">
          Prop firm trading rules and policies change over time. This immutable audit ledger logs verified rule updates, changes to minimum trading days, margin restrictions, and fee refund timelines.
        </p>
      </div>

      {/* Timeline List */}
      <div className="space-y-4 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-zinc-800">
        {changes.map((change, idx) => (
          <div key={change.id} className="relative pl-12 sm:pl-16">
            {/* Timeline Dot */}
            <div className="absolute left-4 sm:left-4 top-5 -translate-x-1/2 h-5 w-5 rounded-full bg-zinc-950 border-2 border-indigo-500 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-indigo-400" />
            </div>

            {/* Card */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 shadow-xl space-y-3 transition-all">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    change.change_type === 'MODIFIED'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : change.change_type === 'ADDED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {change.change_type}
                  </span>
                  <h3 className="font-bold text-sm text-zinc-100">{change.rule_name}</h3>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Effective: <strong className="text-zinc-200">{change.effective_date}</strong></span>
                </div>
              </div>

              {/* Before vs After Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850">
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1">Previous Rule Policy:</span>
                  <span className="text-rose-400 font-semibold">{change.previous_value}</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850">
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1">New Verified Policy:</span>
                  <span className="text-emerald-400 font-semibold">{change.new_value}</span>
                </div>
              </div>

              {/* Explanation & Impact */}
              <p className="text-xs text-zinc-300 leading-relaxed">{change.human_explanation}</p>

              {/* Footer */}
              <div className="pt-2 border-t border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-zinc-400">
                <span className="font-mono">
                  Affected Accounts: <strong className="text-zinc-300">{change.affected_accounts.join(', ')}</strong>
                </span>
                <span className="font-mono">
                  Impact Rating: <strong className="text-amber-400">{change.impact}</strong>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
