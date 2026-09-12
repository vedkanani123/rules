import React, { useState, useMemo } from 'react';
import { PropFirm, SourceEvidence } from '../../types/schema.ts';
import {
  Search,
  ArrowRight,
  LayoutGrid,
  Table as TableIcon,
  Star,
} from 'lucide-react';

interface PropFirmsTableProps {
  firms: PropFirm[];
  onNavigate: (path: string) => void;
  onOpenSource?: (evidence: SourceEvidence, ruleTitle: string) => void;
}

export const PropFirmsTable: React.FC<PropFirmsTableProps> = ({
  firms,
  onNavigate,
}) => {
  const [search, setSearch] = useState<string>('');
  const [selectedMarket, setSelectedMarket] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [sortBy, setSortBy] = useState<'rating_desc' | 'name_asc'>('rating_desc');

  const filteredFirms = useMemo(() => {
    let r = firms.filter((firm) => {
      const q = search.toLowerCase().trim();
      if (q) {
        const m = firm.name.toLowerCase().includes(q) || firm.brandName.toLowerCase().includes(q) || firm.headquarters.toLowerCase().includes(q) || firm.platforms.some((p) => p.toLowerCase().includes(q));
        if (!m) return false;
      }
      if (selectedMarket !== 'ALL' && firm.marketType && firm.marketType !== selectedMarket && firm.marketType !== 'Multi-Asset') return false;
      return true;
    });
    if (sortBy === 'rating_desc') r = [...r].sort((a,b) => b.scorecard.overallScore - a.scorecard.overallScore);
    else r = [...r].sort((a,b) => a.name.localeCompare(b.name));
    return r;
  }, [firms, search, selectedMarket, sortBy]);

  return (
    <div className="space-y-4">
      {/* Controls — Dark editorial dark */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="Filter by firm, country or platform"
            aria-label="Filter firms by name, country or platform"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111318] border border-[#1F2228] text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#2A2D35] focus:bg-[#16181E]"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select aria-label="Filter by market" value={selectedMarket} onChange={e=>setSelectedMarket(e.target.value)} className="px-3.5 py-2.5 rounded-xl bg-[#111318] border border-[#1F2228] text-sm text-white focus:outline-none focus:border-[#2A2D35] min-h-[42px]">
            <option value="ALL">All markets</option>
            <option value="Forex">Forex</option>
            <option value="Futures">Futures</option>
            <option value="Multi-Asset">Multi-Asset</option>
          </select>
          <select aria-label="Sort firms" value={sortBy} onChange={e=>setSortBy(e.target.value as any)} className="px-3.5 py-2.5 rounded-xl bg-[#111318] border border-[#1F2228] text-sm text-white focus:outline-none focus:border-[#2A2D35] min-h-[42px]">
            <option value="rating_desc">Highest rated</option>
            <option value="name_asc">Name A–Z</option>
          </select>
          <div className="hidden sm:flex items-center p-1 rounded-xl bg-[#111318] border border-[#1F2228]">
            <button onClick={()=>setViewMode('cards')} aria-label="Card view" className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${viewMode==='cards' ? 'bg-[#2563eb] text-white' : 'text-[#6B7280] hover:text-white hover:bg-[#16181E]'}`}><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={()=>setViewMode('table')} aria-label="Table view" className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${viewMode==='table' ? 'bg-[#2563eb] text-white' : 'text-[#6B7280] hover:text-white hover:bg-[#16181E]'}`}><TableIcon className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="text-[11px] font-mono tracking-widest uppercase text-[#6B7280]">{filteredFirms.length} firms · {filteredFirms.length===firms.length ? 'showing all' : 'filtered'}</div>

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredFirms.map(firm => (
            <button key={firm.id} onClick={()=>onNavigate(`/prop-firms/${firm.slug}`)} className="text-left group p-5 rounded-xl bg-[#111318] border border-[#1F2228] hover:border-[#2A2D35] hover:bg-[#16181E] transition-colors flex flex-col gap-4 min-h-[200px]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={(firm as any).logoUrl || firm.countryFlag} alt={`${firm.name} logo`} width="32" height="32" loading="lazy" decoding="async" className="w-8 h-8 rounded-lg object-contain bg-gradient-to-b from-[#1c202d] to-[#10121a] p-1 border border-[#2b3244] shrink-0" onError={(e)=>{ 
                      const target = e.currentTarget as HTMLImageElement;
                      try {
                        const domain = new URL(firm.website || '').hostname;
                        if (domain && !target.src.includes('unavatar.io')) {
                          target.src = 'https://unavatar.io/' + domain;
                          return;
                        }
                      } catch {}
                      target.src = firm.countryFlag; 
                    }} />
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-white leading-tight truncate">{firm.name}</div>
                    <div className="text-[11px] font-mono tracking-wide uppercase text-[#6B7280] leading-none mt-1">{firm.headquarters} · {firm.platforms[0]}</div>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono font-semibold tracking-widest uppercase border ${firm.status==='ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-[#080A10] text-[#6B7280] border-[#1F2228]'}`}>{firm.status}</span>
              </div>
              <p className="text-xs leading-relaxed text-[#8A8F98] line-clamp-2">{firm.tagline || firm.programs[0]?.description || 'Verified rules with source citations.'}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#080A10] border border-[#1F2228] text-xs font-mono font-medium text-[#8A8F98]">{firm.programs.length} programs</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#080A10] border border-[#1F2228] text-xs font-mono font-medium text-[#8A8F98]">{firm.programs.reduce((a,p)=>a+p.accounts.length,0)} tiers</span>
                <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-[#6B7280] ml-auto"><Star className="w-3 h-3 text-amber-500" /> {firm.scorecard.overallScore}</span>
              </div>
              <div className="mt-auto pt-3 border-t border-[#1F2228] flex items-center justify-between">
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#3A3E47]">{firm.foundedYear} · {firm.marketType || 'Multi-Asset'}</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#3b82f6] group-hover:text-white transition-colors">View dossier <ArrowRight className="w-3 h-3" /></span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#1F2228] bg-[#111318]">
          <div className="overflow-auto">
            <table className="w-full text-left border-collapse min-w-[720px]" aria-label="Prop firms directory table">
              <caption className="sr-only">Prop firms directory - scroll horizontally on mobile, use cards on small screens</caption>
              <thead>
                <tr className="border-b border-[#1F2228] bg-[#0F1014]">
                  <th scope="col" className="px-4 py-3 text-[10px] font-mono font-semibold tracking-widest uppercase text-[#6B7280]">Firm</th>
                  <th scope="col" className="px-4 py-3 text-[10px] font-mono font-semibold tracking-widest uppercase text-[#6B7280]">Programs</th>
                  <th scope="col" className="px-4 py-3 text-[10px] font-mono font-semibold tracking-widest uppercase text-[#6B7280]">Rating</th>
                  <th scope="col" className="px-4 py-3 text-[10px] font-mono font-semibold tracking-widest uppercase text-[#6B7280]">Market</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2228]/60">
                {filteredFirms.map(firm => (
                  <tr key={firm.id} className="hover:bg-[#16181E]/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={(firm as any).logoUrl || firm.countryFlag} alt={`${firm.name} logo`} width="24" height="24" loading="lazy" decoding="async" className="w-6 h-6 rounded object-contain bg-gradient-to-b from-[#1c202d] to-[#10121a] p-1 border border-[#2b3244]" onError={(e)=>{ 
                      const target = e.currentTarget as HTMLImageElement;
                      try {
                        const domain = new URL(firm.website || '').hostname;
                        if (domain && !target.src.includes('unavatar.io')) {
                          target.src = 'https://unavatar.io/' + domain;
                          return;
                        }
                      } catch {}
                      target.src = firm.countryFlag; 
                    }} />
                        <div><div className="text-sm font-medium text-white leading-none">{firm.name}</div><div className="text-[11px] font-mono text-[#6B7280] leading-none mt-1">{firm.headquarters}</div></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-[#8A8F98]">{firm.programs.length} · {firm.programs.reduce((a,p)=>a+p.accounts.length,0)} tiers</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#080A10] border border-[#1F2228] text-xs font-mono font-medium text-[#8A8F98]"><Star className="w-3 h-3 text-amber-500" /> {firm.scorecard.overallScore}</span></td>
                    <td className="px-4 py-3 text-xs font-mono text-[#6B7280]">{firm.marketType || 'Multi-Asset'}</td>
                    <td className="px-4 py-3 text-right"><button onClick={()=>onNavigate(`/prop-firms/${firm.slug}`)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium">View <ArrowRight className="w-3 h-3" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredFirms.length===0 && (
        <div className="text-center py-12 px-4 rounded-xl bg-[#111318] border border-[#1F2228]">
          <p className="text-sm font-medium text-white">No firms match your filter</p>
          <p className="text-xs font-mono text-[#6B7280] mt-1">Try a different market or clear search.</p>
          <button onClick={()=>{setSearch(''); setSelectedMarket('ALL');}} className="mt-4 px-4 py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium min-h-[44px]">Clear filters</button>
        </div>
      )}
    </div>
  );
};
