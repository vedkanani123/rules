import React, { useEffect, useRef } from 'react';
import { SourceEvidence } from '../../types/schema.ts';
import { X, ExternalLink, ShieldCheck, AlertCircle, FileText, Calendar, Compass } from 'lucide-react';

interface SourceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: SourceEvidence | null;
  ruleTitle?: string;
}

export const SourceViewerModal: React.FC<SourceViewerModalProps> = ({
  isOpen,
  onClose,
  evidence,
  ruleTitle,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const modal = overlayRef.current?.querySelector('[role="dialog"]') as HTMLElement || overlayRef.current;
    if (!modal) return;
    const getFocusable = () => Array.from(modal.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
    const first = getFocusable()[0];
    first?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
      } else {
        if (document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !evidence) return null;

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'OFFICIAL': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'OFFICIAL_SUPPORT': return 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20';
      case 'OFFICIAL_TERMS': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'OFFICIAL_PROMOTIONAL': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'REVIEW_PLATFORM':
      case 'TRADER_REPORT': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'CONFLICTING': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-[#080A10] text-[#8A8F98] border-[#1F2228]';
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label={`Verified source evidence for ${ruleTitle || 'rule'}`}
    >
      <div className="relative w-full max-w-[min(672px,calc(100vw-32px))] max-h-[90dvh] sm:max-h-[85vh] bg-[#111318] border border-[#1F2228] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Header with traffic lights vibe */}
        <div className="flex items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-[#1F2228] bg-[#0F1014] shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center shrink-0 sm:hidden">
              <ShieldCheck className="w-4 h-4 text-[#3b82f6]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white leading-tight">Verified Source Evidence</h3>
              <p className="text-[11px] font-mono tracking-wide uppercase text-[#6B7280] truncate">Traceable proof for {ruleTitle || 'extracted claim'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2.5 rounded-xl bg-[#111318] border border-[#1F2228] text-[#6B7280] hover:text-white hover:bg-[#16181E] transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto overscroll-contain flex-1 bg-[#111318]">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 bg-[#080A10] border border-[#1F2228] rounded-xl min-w-0">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#6B7280] font-semibold block mb-1">
                Evidence Class
              </span>
              <span className={`inline-flex px-2.5 py-1 text-xs font-mono font-medium rounded-full border max-w-full truncate ${getBadgeColor(evidence.sourceType)}`}>
                {evidence.sourceType.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="p-3 bg-[#080A10] border border-[#1F2228] rounded-xl min-w-0">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#6B7280] font-semibold block mb-1">
                Confidence
              </span>
              <span className="text-sm font-bold font-mono text-white flex flex-wrap items-center gap-1.5">
                Grade {evidence.confidence}
                <span className="text-xs font-normal text-emerald-400 hidden sm:inline">
                  {evidence.confidence === 'A' ? '(Direct)' : evidence.confidence === 'B' ? '(Help Center)' : '(3rd Party)'}
                </span>
              </span>
            </div>

            <div className="p-3 bg-[#080A10] border border-[#1F2228] rounded-xl">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#6B7280] font-semibold block mb-1">
                Verification
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                {evidence.verificationStatus}
              </span>
            </div>

            <div className="p-3 bg-[#080A10] border border-[#1F2228] rounded-xl">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#6B7280] font-semibold block mb-1">
                Retrieved
              </span>
              <span className="text-xs font-mono text-[#8A8F98] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
                {evidence.retrievedAt}
              </span>
            </div>
          </div>

          {/* Direct Source Excerpt */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase font-semibold text-[#6B7280]">
              <FileText className="w-4 h-4 text-[#3b82f6] shrink-0" />
              <span>Verbatim Official Excerpt</span>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-[#080A10] border border-[#1F2228] text-[#E5E7EB] text-sm leading-relaxed">
              <div className="text-xs font-mono text-[#6B7280] mb-2 font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="truncate">{evidence.sourceTitle}</span>
                {evidence.sourceSection && (
                  <span className="text-[#3b82f6] shrink-0">{evidence.sourceSection}</span>
                )}
              </div>
              <blockquote className="border-l-2 border-[#3b82f6] pl-3 italic text-[#E5E7EB] break-words hyphens-auto font-mono text-xs leading-relaxed">
                "{evidence.sourceExcerpt}"
              </blockquote>
            </div>
          </div>

          {/* Origin Link */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase font-semibold text-[#6B7280]">
              <Compass className="w-4 h-4 text-[#3b82f6] shrink-0" />
              <span>Direct Link to Source</span>
            </div>
            <a
              href={evidence.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#080A10] border border-[#1F2228] hover:border-[#2A2D35] hover:bg-[#16181E] text-xs sm:text-sm font-mono text-[#3b82f6] hover:text-[#60a5fa] transition-colors break-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
            >
              <span className="break-all min-w-0">{evidence.sourceUrl}</span>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </a>
          </div>

          {/* Notice */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-[#080A10] border border-[#1F2228] flex items-start gap-2.5 text-xs sm:text-sm text-[#8A8F98]">
            <AlertCircle className="w-4 h-4 text-[#6B7280] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white text-xs font-mono tracking-widest uppercase mb-1">Evidence Verification Guarantee</p>
              <p className="leading-relaxed text-xs text-[#6B7280]">
                Our crawler continuously monitors this URL. If the firm alters this wording, our snapshot diff detector logs the change to the public changelog.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 sm:px-6 py-4 border-t border-[#1F2228] bg-[#0F1014] shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 text-sm font-medium text-[#8A8F98] hover:text-white bg-[#111318] hover:bg-[#16181E] border border-[#1F2228] rounded-xl transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
