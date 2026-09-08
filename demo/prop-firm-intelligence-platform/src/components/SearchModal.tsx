import React, { useState, useEffect } from 'react';
import { Search, X, ShieldAlert, AlertTriangle, FileText, ArrowRight, ExternalLink } from 'lucide-react';
import { RuleEvidenceItem, RuleConflict, PropAccountModel } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: RuleEvidenceItem[];
  conflicts: RuleConflict[];
  onSelectAccount?: (account: PropAccountModel) => void;
  onSelectSource?: (source: any) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  rules,
  conflicts,
  onSelectSource
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle search
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredRules = rules.filter(r =>
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.simple_explanation.toLowerCase().includes(query.toLowerCase()) ||
    r.official_wording.toLowerCase().includes(query.toLowerCase()) ||
    r.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredConflicts = conflicts.filter(c =>
    c.rule_name.toLowerCase().includes(query.toLowerCase()) ||
    c.headline.toLowerCase().includes(query.toLowerCase()) ||
    c.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-750 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Input Bar */}
        <div className="flex items-center px-4 border-b border-zinc-800 bg-zinc-950/50">
          <Search className="h-5 w-5 text-indigo-400 shrink-0" />
          <input
            id="search-modal-input"
            autoFocus
            type="text"
            placeholder="Search rules, margin limits, coordinated trading, payout conditions..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent px-3 py-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-zinc-400 hover:text-zinc-200">
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 px-2 py-1 text-xs rounded bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-4 text-xs">
          {/* Conflicts section */}
          {filteredConflicts.length > 0 && (
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Detected Conflicts & Traps ({filteredConflicts.length})</span>
              </div>
              <div className="space-y-2">
                {filteredConflicts.map(c => (
                  <div
                    key={c.id}
                    className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 hover:border-rose-500/60 transition-colors"
                  >
                    <div className="flex items-center justify-between font-semibold text-rose-300">
                      <span>{c.headline}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                        {c.severity} RISK
                      </span>
                    </div>
                    <p className="text-zinc-300 mt-1">{c.description}</p>
                    <div className="mt-2 text-[11px] text-rose-200/90 font-mono bg-zinc-950/60 p-2 rounded border border-rose-500/20">
                      💡 {c.what_this_means}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules section */}
          {filteredRules.length > 0 && (
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Verified Rules ({filteredRules.length})</span>
              </div>
              <div className="space-y-2">
                {filteredRules.map(r => (
                  <div
                    key={r.id}
                    className="p-3 rounded-lg bg-zinc-850/60 border border-zinc-750 hover:border-indigo-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-zinc-100 flex items-center gap-2">
                        <span>{r.name}</span>
                        {r.is_easy_to_miss && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                            EASY-TO-MISS
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-indigo-300 text-[11px] font-medium">{r.normalized_value}</span>
                    </div>
                    <p className="text-zinc-300 mt-1 text-xs">{r.simple_explanation}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Category: <strong className="text-zinc-300">{r.category}</strong></span>
                      <button
                        onClick={() => {
                          onClose();
                          onSelectSource?.(r);
                        }}
                        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-mono"
                      >
                        <FileText className="h-3 w-3" />
                        <span>Source: {r.source_title}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredConflicts.length === 0 && filteredRules.length === 0 && (
            <div className="py-12 text-center text-zinc-500">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No verified rules or conflicts match &quot;{query}&quot;</p>
              <p className="text-xs text-zinc-600 mt-1">Try searching for &quot;drawdown&quot;, &quot;margin&quot;, &quot;payout&quot;, or &quot;coordinated&quot;</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
