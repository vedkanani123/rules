import React, { useState, useRef, useEffect } from 'react';
import { PROP_FIRMS_DATA } from '../../data/propFirmsData.ts';
import { Search, Menu, X, ChevronDown, Building2, Scale, BookOpen, Sliders, History, MessageSquareQuote, Sparkles } from 'lucide-react';

interface NavbarProps { currentPath: string; onNavigate: (path: string) => void; onOpenSearch: () => void; }

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, onOpenSearch }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string|null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpenDropdown(null); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
  const isActive = (p: string) => currentPath===p || currentPath.startsWith(p+'/');
  const allFirms = PROP_FIRMS_DATA;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080A10]/90 backdrop-blur-xl border-b border-[#1F2228]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <div className="flex items-center justify-between h-[64px] gap-3">
          <button onClick={() => onNavigate('/')} className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-[#080A10] shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span className="text-[15px] font-bold tracking-[-0.015em] text-white">PropFirmRules</span>
          </button>

          <nav className="hidden lg:flex items-center gap-7">
            <button onClick={() => onNavigate('/prop-firms')} className={`text-[13px] font-medium flex items-center gap-1.5 ${isActive('/prop-firms') ? 'text-white' : 'text-[#8A8F98] hover:text-white'}`}>
              <Building2 className="w-3.5 h-3.5" /> Firms
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#111318] border border-[#1F2228] text-[#8A8F98]">{allFirms.length}</span>
            </button>
            <button onClick={() => onNavigate('/rules')} className={`text-[13px] font-medium ${isActive('/rules') ? 'text-white' : 'text-[#8A8F98] hover:text-white'}`}>Rules</button>
            <button onClick={() => onNavigate('/compare')} className={`text-[13px] font-medium ${isActive('/compare') ? 'text-white' : 'text-[#8A8F98] hover:text-white'}`}>Compare</button>
            <button onClick={() => onNavigate('/wizard')} className={`text-[13px] font-medium ${isActive('/wizard') ? 'text-white' : 'text-[#8A8F98] hover:text-white'}`}>Finder</button>
            <button onClick={() => onNavigate('/reviews')} className={`text-[13px] font-medium ${isActive('/reviews') ? 'text-white' : 'text-[#8A8F98] hover:text-white'}`}>Reviews</button>
            <button onClick={() => onNavigate('/changes')} className={`text-[13px] font-medium ${isActive('/changes') ? 'text-white' : 'text-[#8A8F98] hover:text-white'}`}>Changelog</button>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={onOpenSearch} className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#8A8F98] hover:text-white transition-colors">
              <Search className="w-3.5 h-3.5" /> Search
            </button>
            <button onClick={onOpenSearch} aria-label="Open search modal" className="sm:hidden w-10 h-10 rounded-lg flex items-center justify-center text-[#8A8F98] hover:text-white hover:bg-white/[0.04]">
              <Search className="w-4 h-4" />
            </button>
            <button onClick={() => onNavigate('/wizard')} className="hidden sm:inline-flex px-4 py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-semibold shadow-sm transition-colors">
              Find Match
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle mobile menu" className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center text-white hover:bg-white/[0.04]">
              {mobileOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
            </button>
          </div>
        </div>
      </div>
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#1F2228] bg-[#080A10] px-4 py-4 space-y-3 max-h-[85vh] overflow-y-auto">
          <button onClick={() => { onNavigate('/prop-firms'); setMobileOpen(false); }} className="w-full flex items-center justify-between p-3 rounded-xl bg-[#111318] border border-[#1F2228] text-left">
            <span className="flex items-center gap-2 text-sm font-medium text-white"><Building2 className="w-4 h-4 text-[#3b82f6]" /> All Firms Directory</span>
            <span className="text-xs text-[#8A8F98]">{allFirms.length} firms →</span>
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { onNavigate('/rules'); setMobileOpen(false); }} className="p-3 rounded-xl bg-[#111318] border border-[#1F2228] text-left text-xs font-medium text-white flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> Rules Hub
            </button>
            <button onClick={() => { onNavigate('/compare'); setMobileOpen(false); }} className="p-3 rounded-xl bg-[#111318] border border-[#1F2228] text-left text-xs font-medium text-white flex items-center gap-2">
              <Scale className="w-3.5 h-3.5 text-sky-400" /> Compare
            </button>
            <button onClick={() => { onNavigate('/reviews'); setMobileOpen(false); }} className="p-3 rounded-xl bg-[#111318] border border-[#1F2228] text-left text-xs font-medium text-white flex items-center gap-2">
              <MessageSquareQuote className="w-3.5 h-3.5 text-amber-400" /> Reviews
            </button>
            <button onClick={() => { onNavigate('/changes'); setMobileOpen(false); }} className="p-3 rounded-xl bg-[#111318] border border-[#1F2228] text-left text-xs font-medium text-white flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-purple-400" /> Changelog
            </button>
            <button onClick={() => { onNavigate('/simulator'); setMobileOpen(false); }} className="col-span-2 p-3 rounded-xl bg-[#111318] border border-[#1F2228] text-left text-xs font-medium text-white flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-rose-400" /> Risk Simulator
            </button>
          </div>

          <div className="pt-2 border-t border-[#1F2228]">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#8A8F98] mb-2">Featured Firms</p>
            {allFirms.slice(0,5).map(f => (
              <button key={f.id} onClick={() => { onNavigate(`/prop-firms/${f.slug}`); setMobileOpen(false); }} className="flex items-center gap-3 w-full text-left py-2 hover:bg-white/[0.02] rounded-lg px-1">
                <img
                  src={(f as any).logoUrl || f.countryFlag}
                  alt=""
                  className="w-5 h-5 rounded object-contain bg-white p-0.5 border border-white/10 shrink-0"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = f.countryFlag; }}
                />
                <span className="text-sm text-white truncate">{f.name}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-[#1F2228]">
            <button onClick={() => { onNavigate('/wizard'); setMobileOpen(false); }} className="w-full py-3 rounded-xl bg-[#2563eb] text-xs text-white font-semibold flex items-center justify-center gap-2 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> Find My Best Account
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
