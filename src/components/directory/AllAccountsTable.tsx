import React, { useState, useMemo } from 'react';
import { PropFirm, ProgramModel, AccountTier } from '../../types/schema.ts';
import { Search, ArrowRight, LayoutGrid, Table as TableIcon } from 'lucide-react';

export interface FlatAccountItem { firm: PropFirm; program: ProgramModel; account: AccountTier; }

export const AllAccountsTable: React.FC<{ firms: PropFirm[]; onNavigate: (path: string) => void }> = ({ firms, onNavigate }) => {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table'|'cards'>('cards');
  const allAccountItems: FlatAccountItem[] = useMemo(()=>{ const items: FlatAccountItem[]=[]; firms.forEach(f=>f.programs.forEach(p=>p.accounts.forEach(a=>items.push({firm:f, program:p, account:a})))); return items;},[firms]);
  const filtered = useMemo(()=> allAccountItems.filter(it=>{
    const q=search.toLowerCase().trim();
    if(q && !(`${it.firm.name} ${it.account.name} ${it.account.nominalSize}`.toLowerCase().includes(q))) return false;
    return true;
  }),[allAccountItems, search]);
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Filter accounts, e.g. $100k, 2-Step" aria-label="Filter accounts" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111318] border border-[#1F2228] text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#2A2D35] focus:bg-[#16181E]" />
        </div>
        <div className="flex items-center p-1 rounded-xl bg-[#111318] border border-[#1F2228] self-start">
          <button onClick={()=>setViewMode('cards')} aria-label="Card view" className={`w-9 h-9 rounded-lg flex items-center justify-center ${viewMode==='cards'?'bg-[#2563eb] text-white':'text-[#6B7280] hover:text-white hover:bg-[#16181E]'}`}><LayoutGrid className="w-4 h-4" /></button>
          <button onClick={()=>setViewMode('table')} aria-label="Table view" className={`w-9 h-9 rounded-lg flex items-center justify-center ${viewMode==='table'?'bg-[#2563eb] text-white':'text-[#6B7280] hover:text-white hover:bg-[#16181E]'}`}><TableIcon className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="text-[11px] font-mono tracking-widest uppercase text-[#6B7280]">{filtered.length} accounts · {filtered.length===allAccountItems.length ? 'showing all' : 'filtered'}</div>
      {viewMode==='cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(it=>(
            <button key={it.account.id} onClick={()=>onNavigate(`/prop-firms/${it.firm.slug}/accounts/${it.account.id}`)} className="text-left p-5 rounded-xl bg-[#111318] border border-[#1F2228] hover:border-[#2A2D35] hover:bg-[#16181E] transition-colors space-y-3 group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-1 rounded-full bg-[#080A10] border border-[#1F2228] text-[#6B7280]">{it.firm.brandName}</span>
                <span className="text-xs font-mono font-medium text-white">{it.account.priceUnknown ? 'Unknown' : `$${it.account.price}`}</span>
              </div>
              <div className="text-[13px] font-semibold text-white leading-tight">{it.account.name}</div>
              <div className="text-[11px] font-mono tracking-wide uppercase text-[#6B7280]">{it.program.programType} · ${it.account.nominalSize.toLocaleString()}</div>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-[#080A10] border border-[#1F2228] text-xs font-mono font-medium text-[#8A8F98]">{it.account.dailyLossLimit}% daily</span>
                <span className="px-2 py-1 rounded-full bg-[#080A10] border border-[#1F2228] text-xs font-mono font-medium text-[#8A8F98]">{it.account.maxTotalLoss}% max</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-[#3b82f6] group-hover:text-white pt-2 border-t border-[#1F2228] transition-colors">View details <ArrowRight className="w-3 h-3" /></div>
            </button>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#1F2228] bg-[#111318] overflow-auto">
          <table className="w-full text-left min-w-[640px]" aria-label="All accounts table">
            <caption className="sr-only">All accounts - compare across firms</caption>
            <thead><tr className="border-b border-[#1F2228] bg-[#0F1014]"><th scope="col" className="px-4 py-3 text-[10px] font-mono font-semibold tracking-widest uppercase text-[#6B7280]">Account</th><th scope="col" className="px-4 py-3 text-[10px] font-mono font-semibold tracking-widest uppercase text-[#6B7280]">Daily</th><th scope="col" className="px-4 py-3 text-[10px] font-mono font-semibold tracking-widest uppercase text-[#6B7280]">Max</th><th className="px-4 py-3"></th></tr></thead>
            <tbody className="divide-y divide-[#1F2228]/60">
              {filtered.map(it=>(
                <tr key={it.account.id} className="hover:bg-[#16181E]/60"><td className="px-4 py-3 text-sm text-white font-medium">{it.account.name} <span className="text-[#6B7280] font-mono text-xs">· {it.firm.name}</span></td><td className="px-4 py-3 text-sm font-mono text-[#8A8F98]">{it.account.dailyLossLimit}%</td><td className="px-4 py-3 text-sm font-mono text-[#8A8F98]">{it.account.maxTotalLoss}%</td><td className="px-4 py-3 text-right"><button onClick={()=>onNavigate(`/prop-firms/${it.firm.slug}/accounts/${it.account.id}`)} className="px-3 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium">View</button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
