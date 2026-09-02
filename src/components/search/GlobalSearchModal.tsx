import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PROP_FIRMS_DATA, RULE_GUIDES } from '../../data/propFirmsData.ts';
import { REAL_FIRMS } from '../../data/propFirmMatchReal.ts';
import { Search, X, Shield, ArrowRight, BookOpen, Layers, DollarSign } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
      setSelectedIndex(0);
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setSelectedIndex(0);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const searchResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q || q.length < 1) return [];
    const results: {
      type: 'firm' | 'account' | 'rule' | 'guide';
      title: string;
      subtitle: string;
      path: string;
      tag: string;
    }[] = [];

    PROP_FIRMS_DATA.forEach((firm) => {
      if (
        firm.name.toLowerCase().includes(q) ||
        firm.brandName.toLowerCase().includes(q) ||
        firm.ceoName.toLowerCase().includes(q) ||
        firm.headquarters.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'firm',
          title: firm.name,
          subtitle: `CEO: ${firm.ceoName} | Status: ${firm.status} | Rating: ${firm.reviewsOverview.averageRating}/5`,
          path: `/prop-firms/${firm.slug}`,
          tag: 'Prop Firm',
        });
      }

      firm.programs.forEach((prog) => {
        prog.accounts.forEach((acc) => {
          if (
            acc.name.toLowerCase().includes(q) ||
            prog.name.toLowerCase().includes(q) ||
            acc.drawdownType.toLowerCase().includes(q) ||
            acc.platforms.some((p) => p.toLowerCase().includes(q))
          ) {
            results.push({
              type: 'account',
              title: `${acc.name} (${firm.name})`,
              subtitle: `Daily Loss: ${acc.dailyLossLimit}% | Max Loss: ${acc.maxTotalLoss}% | Split: ${acc.profitSplit}% | Price: $${acc.price}`,
              path: `/prop-firms/${firm.slug}/accounts/${acc.id}`,
              tag: 'Account Tier',
            });
          }
        });
      });

      firm.rules.forEach((rule) => {
        if (
          rule.name.toLowerCase().includes(q) ||
          rule.plainEnglish.toLowerCase().includes(q) ||
          rule.category.toLowerCase().includes(q)
        ) {
          results.push({
            type: 'rule',
            title: `${rule.name} - ${firm.name}`,
            subtitle: `${rule.headlineValue} | Scope: ${rule.stageScope} | Importance: ${rule.importance}`,
            path: `/prop-firms/${firm.slug}#rule-card-${rule.slug}`,
            tag: rule.category,
          });
        }
      });
    });

    // Also index REAL_FIRMS so all 20 firms are searchable
    (REAL_FIRMS as any[]).forEach((rf) => {
      if (
        rf.name.toLowerCase().includes(q) ||
        rf.slug.toLowerCase().includes(q)
      ) {
        if (!results.some(r => r.path === `/prop-firms/${rf.slug}`)) {
          results.push({
            type: 'firm',
            title: rf.name,
            subtitle: `Trust Score: ${rf.trustScore}/100 | ${rf.platforms?.join(', ')} | Max Allocation: $${((rf.maxAllocation || 0) / 1000).toFixed(0)}K`,
            path: `/prop-firms/${rf.slug}`,
            tag: 'Directory Firm',
          });
        }
      }
    });

    RULE_GUIDES.forEach((guide) => {
      if (
        guide.name.toLowerCase().includes(q) ||
        guide.shortDefinition.toLowerCase().includes(q) ||
        guide.category.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'guide',
          title: `Rule Guide: ${guide.name}`,
          subtitle: guide.shortDefinition,
          path: `/rules/${guide.slug}`,
          tag: 'SEO Guide',
        });
      }
    });

    return results.slice(0, 10);
  }, [query]);

  // Handle arrow key and enter navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (searchResults.length > 0 ? (prev + 1) % searchResults.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (searchResults.length > 0 ? (prev - 1 + searchResults.length) % searchResults.length : 0));
      } else if (e.key === 'Enter') {
        if (searchResults[selectedIndex]) {
          e.preventDefault();
          onNavigate(searchResults[selectedIndex].path);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex, onNavigate, onClose]);

  // Focus trap - keep Tab inside modal
  useEffect(() => {
    if (!isOpen) return;
    const modal = overlayRef.current?.querySelector('[role="dialog"]') as HTMLElement || overlayRef.current;
    if (!modal) return;
    const getFocusable = () => Array.from(modal.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (e.shiftKey) { if (document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); } } else { if (document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); } }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-[max(16px,4vh)] sm:pt-[10vh] bg-black/80 backdrop-blur-sm overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label="Search prop firms and rules"
    >
      <div className="w-full max-w-2xl glass-card border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[min(85dvh,640px)] my-auto">
        {/* Search Input Bar */}
        <div className="flex items-center px-3 sm:px-4 py-3 sm:py-3.5 border-b border-white/[0.06] bg-[#080A10] shrink-0 gap-2">
          <Search className="w-5 h-5 text-white/60 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            spellCheck={false}
            placeholder="Search firm, account size, drawdown..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="p-2 -m-1 text-white/60 hover:text-white shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <button
            onClick={onClose}
            aria-label="Close search"
            className="hidden sm:flex items-center px-2.5 py-1.5 text-[11px] font-mono bg-slate-800 border border-slate-700 rounded-lg text-white/60 hover:text-white hover:bg-slate-700 shrink-0 min-h-[32px]"
          >
            ESC
          </button>
          <button
            onClick={onClose}
            aria-label="Close search"
            className="sm:hidden p-2 -m-1 text-white/60 hover:text-white shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-2 sm:p-3 space-y-1 pb-safe">
          {searchResults.length === 0 ? (
            <div className="py-8 sm:py-12 text-center space-y-4 px-2">
              <p className="text-sm text-white/60">
                {query ? 'No matching records found for this term.' : 'Type to search firms, accounts, formulas, or rules.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-white/60 hidden sm:inline">Popular:</span>
                {['Goat Funded Trader', 'Daily Drawdown', 'News Trading', '100k 2-Step', 'Inactivity'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-2 rounded-full bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-xs min-h-[44px] active:scale-[0.98] transition-transform"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            searchResults.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  onNavigate(item.path);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full text-left p-3 sm:p-3.5 rounded-xl cursor-pointer flex items-center justify-between gap-3 group transition-colors min-h-[64px] focus-visible:ring-2 focus-visible:ring-[#2563eb] ${
                  index === selectedIndex
                    ? 'bg-slate-800/90 ring-1 ring-[#2563eb]'
                    : 'hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 hidden xs:flex transition-colors ${index === selectedIndex ? 'bg-[#2563eb]/20 text-[#60a5fa]' : 'bg-slate-800 text-white/60 group-hover:text-brand-400'}`}>
                    {item.type === 'firm' && <Shield className="w-4 h-4" />}
                    {item.type === 'account' && <DollarSign className="w-4 h-4" />}
                    {item.type === 'rule' && <Layers className="w-4 h-4" />}
                    {item.type === 'guide' && <BookOpen className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold text-white text-sm group-hover:text-brand-300 line-clamp-1">
                        {item.title}
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-slate-800 text-white/60 border border-slate-700 shrink-0 hidden sm:inline-flex">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 line-clamp-1 sm:line-clamp-1 mt-0.5">{item.subtitle}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block" />
              </button>
            ))
          )}
        </div>

        <div className="hidden sm:flex items-center justify-between px-4 py-2.5 border-t border-white/[0.06] bg-[#080A10]/50 text-[11px] text-white/60 shrink-0">
          <span className="flex items-center gap-2"><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px]">↑↓</kbd> Navigate <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px]">↵</kbd> Select</span>
          <span>{searchResults.length} results</span>
        </div>
      </div>
    </div>
  );
};
