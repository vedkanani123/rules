import React from 'react';
import { X, ExternalLink, ShieldCheck, FileText, Calendar, Hash, Tag } from 'lucide-react';
import { getEvidenceClassBadge, getConfidenceBadgeClass } from '../lib/utils';

interface SourceViewerModalProps {
  sourceItem: any | null;
  onClose: () => void;
}

export const SourceViewerModal: React.FC<SourceViewerModalProps> = ({ sourceItem, onClose }) => {
  if (!sourceItem) return null;

  const evidenceClass = sourceItem.source_type || sourceItem.evidence_class || 'OFFICIAL';
  const badgeInfo = getEvidenceClassBadge(evidenceClass);
  const confidence = sourceItem.confidence || 'A';
  const confClass = getConfidenceBadgeClass(confidence);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-750 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider">
                EVIDENCE PROVENANCE RECORD
              </span>
              <h3 className="text-sm sm:text-base font-bold text-zinc-100 line-clamp-1">
                {sourceItem.source_title || sourceItem.title || sourceItem.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${badgeInfo.color}`}>
              {badgeInfo.label}
            </span>
            <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${confClass.bg} ${confClass.text} ${confClass.border}`}>
              Data Confidence: Grade {confidence}
            </span>
            {sourceItem.verification_status && (
              <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{sourceItem.verification_status}</span>
              </span>
            )}
          </div>

          {/* Official Verbatim Quote */}
          {sourceItem.source_quote && (
            <div className="rounded-lg bg-zinc-950 p-4 border border-zinc-800 space-y-1.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                <span>Exact Official Verbatim Quote:</span>
              </div>
              <blockquote className="text-zinc-200 text-xs sm:text-sm italic border-l-2 border-indigo-500 pl-3 leading-relaxed">
                &ldquo;{sourceItem.source_quote}&rdquo;
              </blockquote>
            </div>
          )}

          {/* Clean text excerpt */}
          {sourceItem.clean_text_snippet && (
            <div className="rounded-lg bg-zinc-950 p-4 border border-zinc-800 space-y-1.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Captured Page Text Snippet:
              </div>
              <p className="text-zinc-300 font-mono text-[11px] leading-relaxed">
                {sourceItem.clean_text_snippet}
              </p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-850/50 p-3.5 rounded-lg border border-zinc-750">
            <div>
              <span className="text-[11px] text-zinc-400 block font-mono">Source URL:</span>
              <a
                href={sourceItem.source_url || sourceItem.url}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-xs truncate mt-0.5"
              >
                <span className="truncate">{sourceItem.source_url || sourceItem.url}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>

            <div>
              <span className="text-[11px] text-zinc-400 block font-mono">Crawl / Verification Date:</span>
              <span className="text-zinc-200 font-mono flex items-center gap-1 mt-0.5">
                <Calendar className="h-3 w-3 text-zinc-400" />
                {sourceItem.retrieved_at || sourceItem.crawled_at || '2026-09-01'}
              </span>
            </div>

            {sourceItem.source_section && (
              <div>
                <span className="text-[11px] text-zinc-400 block font-mono">Document Section:</span>
                <span className="text-zinc-200 font-medium mt-0.5 block">{sourceItem.source_section}</span>
              </div>
            )}

            {sourceItem.content_hash && (
              <div>
                <span className="text-[11px] text-zinc-400 block font-mono">Content Hash (SHA-256):</span>
                <span className="text-zinc-400 font-mono text-[10px] truncate block flex items-center gap-1 mt-0.5">
                  <Hash className="h-3 w-3" />
                  {sourceItem.content_hash}
                </span>
              </div>
            )}
          </div>

          {/* Simple explanation & calculation */}
          {sourceItem.simple_explanation && (
            <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/30">
              <span className="font-semibold text-indigo-300 block mb-1">Human Explanation:</span>
              <p className="text-zinc-300 leading-relaxed">{sourceItem.simple_explanation}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-400">
          <span>Evidence Class: <strong className="text-zinc-200">{evidenceClass}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
