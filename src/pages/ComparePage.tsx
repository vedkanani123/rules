import React, { useState } from 'react';
import { PROP_FIRMS_DATA } from '../data/propFirmsData.ts';
import { AccountTier, PropFirm, SourceEvidence } from '../types/schema.ts';
import { Scale, ArrowRight, Check, FileCheck, Info } from 'lucide-react';

interface ComparePageProps { onNavigate: (path: string) => void; onOpenSource?: (evidence: SourceEvidence, ruleTitle: string) => void; }

export const ComparePage: React.FC<ComparePageProps> = ({ onNavigate, onOpenSource }) => {
  const allAccounts: { firm: PropFirm; account: AccountTier }[] = [];
  PROP_FIRMS_DATA.forEach((firm) => { firm.programs.forEach((prog) => { prog.accounts.forEach((acc) => { allAccounts.push({ firm, account: acc }); }); }); });

  const [selectedAccIds, setSelectedAccIds] = useState<string[]>(['gft-standard-100k','gft-standard-50k','gft-goat-100k']);
  const [highlightDiffs, setHighlightDiffs] = useState<boolean>(true);
  const selectedItems = selectedAccIds.map((id) => allAccounts.find((item) => item.account.id === id) || allAccounts[0]).filter(Boolean);

  const handleSelectChange = (slotIndex: number, newId: string) => { if (selectedAccIds.includes(newId) && selectedAccIds[slotIndex] !== newId) return; const u=[...selectedAccIds]; u[slotIndex]=newId; setSelectedAccIds(u); };
  const addColumn = () => { if (selectedAccIds.length<4) { const n=allAccounts.find(a=>!selectedAccIds.includes(a.account.id)); if(n) setSelectedAccIds([...selectedAccIds, n.account.id]); } };
  const removeColumn = (slotIndex: number) => { if(selectedAccIds.length>2) setSelectedAccIds(selectedAccIds.filter((_,idx)=>idx!==slotIndex)); };

  const parameters = [
    { label: 'Prop Firm', getValue: (i:any)=> i.firm.name },
    { label: 'Account', getValue: (i:any)=> i.account.name },
    { label: 'Capital', getValue: (i:any)=> `$${i.account.nominalSize.toLocaleString()}` },
    { label: 'Price', getValue: (i:any)=> `$${i.account.discountedPrice || i.account.price}` },
    { label: 'Fee', getValue: (i:any)=> i.account.refundableFee ? 'Refundable' : 'Non-refundable' },
    { label: 'Target P1', getValue: (i:any)=> i.account.profitTargetPhase1 ? `${i.account.profitTargetPhase1}%` : '—' },
    { label: 'Target P2', getValue: (i:any)=> i.account.profitTargetPhase2 ? `${i.account.profitTargetPhase2}%` : '—' },
    { label: 'Daily loss', getValue: (i:any)=> `${i.account.dailyLossLimit}%` },
    { label: 'Method', getValue: (i:any)=> i.account.dailyLossCalculation.replace(/_/g,' ') },
    { label: 'Max loss', getValue: (i:any)=> `${i.account.maxTotalLoss}%` },
    { label: 'Drawdown', getValue: (i:any)=> i.account.drawdownType.replace(/_/g,' ') },
    { label: 'Min days', getValue: (i:any)=> `${i.account.minimumTradingDays}` },
    { label: 'Split', getValue: (i:any)=> i.account.profitSplitMaxWithAddon ? `${i.account.profitSplit}% → ${i.account.profitSplitMaxWithAddon}%` : `${i.account.profitSplit}%` },
    { label: 'Payout', getValue: (i:any)=> i.account.payoutFrequency },
    { label: 'News', getValue: (i:any)=> i.account.newsTradingRule },
    { label: 'Weekend', getValue: (i:any)=> i.account.weekendHolding ? 'Allowed' : 'No' },
    { label: 'EA / Bot', getValue: (i:any)=> i.account.eaAllowed ? 'Allowed' : 'No' },
    { label: 'Inactivity', getValue: (i:any)=> `${i.account.inactivityLimitDays}d` },
    { label: 'Leverage', getValue: (i:any)=> i.account.leverage },
    { label: 'Platforms', getValue: (i:any)=> i.account.platforms.join(', ') },
    { label: 'Last verified', getValue: (i:any)=> i.account.lastVerified || i.firm.lastVerified },
    { label: 'Evidence', getValue: (i:any)=> i.account.sources.length > 0 ? `✓ ${i.account.sources.length} source(s)` : i.firm.rules.length > 0 ? `${i.firm.rules.length} rules cited` : 'Official' },
  ];

  return (
    <div className="bg-[#080A10] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="pt-10 sm:pt-14 pb-10 border-b border-[#1F2228] text-center">
          <p className="text-[11px] tracking-[0.14em] uppercase font-medium text-[#8A8F98] mb-3">THE COMPARISON ENGINE</p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111318] border border-[#1F2228] text-[11px] font-semibold tracking-wide uppercase text-[#8A8F98] mb-4">
            <Scale className="w-3 h-3" /> Comparison engine
          </div>
          <h1 className="text-[30px] sm:text-[40px] font-semibold tracking-tight leading-[0.95] text-white max-w-3xl mx-auto">Compare accounts<br /><span className="text-[#8A8F98]">side by side</span></h1>
          <p className="text-[13px] leading-relaxed text-[#8A8F98] mt-3 max-w-2xl mx-auto">Select 2–4 accounts. Differences are highlighted. Every value is from official rules — program-level, not firm-level.</p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 max-w-full flex-wrap justify-center">
            <FileCheck className="w-3.5 h-3.5" /> Evidence-first: each cell links to source URL + excerpt + verification date
          </div>
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={()=>setHighlightDiffs(!highlightDiffs)} className={`px-4 py-2.5 rounded-full text-[13px] font-medium border transition-colors ${highlightDiffs ? 'bg-white text-[#080A10] border-white' : 'bg-[#111318] border-[#1F2228] text-[#8A8F98] hover:text-white'}`}>
              {highlightDiffs ? <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Highlight on</span> : 'Highlight off'}
            </button>
            {selectedAccIds.length<4 && <button onClick={addColumn} className="px-4 py-2.5 rounded-full bg-white text-[#080A10] text-[13px] font-semibold hover:bg-white/90 min-h-[44px]">+ Add Column</button>}
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block mt-8 overflow-hidden rounded-2xl border border-[#1F2228] bg-[#111318]">
          <div className="overflow-auto">
            <table className="w-full text-left border-collapse min-w-[720px]" aria-label="Compare accounts table">
              <caption className="sr-only">Compare selected accounts side by side</caption>
              <thead>
                <tr className="border-b border-[#1F2228] bg-[#080A10]">
                  <th scope="col" className="px-4 py-3 text-[11px] font-semibold tracking-[0.12em] uppercase text-[#8A8F98] sticky left-0 bg-[#080A10]">Rule</th>
                  {selectedItems.map((item, idx)=>(
                    <th key={idx} className="px-3 py-3 min-w-[180px]">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#8A8F98]">Slot {idx+1}</span>
                        {selectedItems.length>2 && (
                          <button
                            onClick={()=>removeColumn(idx)}
                            aria-label={`Remove slot ${idx+1}`}
                            className="w-8 h-8 rounded-full bg-[#080A10] border border-[#1F2228] hover:border-[#2A2D35] text-[#8A8F98] hover:text-white flex items-center justify-center text-sm transition-colors"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <select aria-label="Select account to compare" value={item.account.id} onChange={e=>handleSelectChange(idx, e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-[#080A10] border border-[#1F2228] text-xs font-medium text-white focus:outline-none min-h-[44px]">
                        {allAccounts.map(opt=> <option key={opt.account.id} value={opt.account.id}>{opt.firm.brandName} — {opt.account.name}</option>)}
                      </select>
                      <p className="text-[11px] text-[#8A8F98] mt-1.5 truncate">{item.firm.name}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2228] text-[13px]">
                {parameters.map(param=>{
                  const values = selectedItems.map(item=> param.getValue(item));
                  const diff = new Set(values).size>1;
                  return (
                    <tr key={param.label} className={`${highlightDiffs && diff ? 'bg-amber-500/[0.04]' : ''} hover:bg-[#080A10]/60`}>
                      <th className="px-4 py-3 text-[13px] font-medium text-[#8A8F98] sticky left-0 bg-[#111318] border-r border-[#1F2228] text-left">
                        <span className="flex items-center gap-1.5">{param.label} {highlightDiffs && diff && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}</span>
                      </th>
                      {values.map((v,i)=>{
                        const item = selectedItems[i];
                        const hasSource = param.label === 'Evidence' && item.account.sources && item.account.sources.length > 0 && onOpenSource;
                        return (
                          <td key={i} className={`px-4 py-3 font-mono text-[13px] ${highlightDiffs && diff ? 'text-white font-medium' : 'text-[#8A8F98]'}`}>
                            {hasSource ? (
                              <button
                                onClick={() => onOpenSource(item.account.sources[0], `${item.firm.name} — ${item.account.name}`)}
                                className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                              >
                                {v}
                              </button>
                            ) : (
                              v
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden mt-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedItems.map((item, idx)=>(
              <div key={idx} className="p-4 rounded-2xl bg-[#111318] border border-[#1F2228] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98]">Slot {idx+1} · {item.firm.brandName}</span>
                  {selectedItems.length>2 && <button onClick={()=>removeColumn(idx)} className="text-[13px] px-3 py-1.5 rounded-full bg-[#080A10] border border-[#1F2228] text-[#8A8F98] min-h-[36px]">Remove</button>}
                </div>
                <select aria-label="Select account to compare" value={item.account.id} onChange={e=>handleSelectChange(idx, e.target.value)} className="w-full px-3 py-3 rounded-xl bg-[#080A10] border border-[#1F2228] text-[13px] text-white min-h-[44px]">
                  {allAccounts.map(opt=> <option key={opt.account.id} value={opt.account.id}>{opt.firm.brandName} — {opt.account.name}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {parameters.map(param=>{
              const values = selectedItems.map(item=> param.getValue(item));
              const diff = new Set(values).size>1;
              return (
                <div key={param.label} className={`p-4 rounded-2xl border ${highlightDiffs && diff ? 'bg-amber-500/[0.04] border-amber-500/15' : 'bg-[#111318] border-[#1F2228]'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[13px] font-semibold text-white">{param.label}</span>
                    {highlightDiffs && diff && <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/20 text-[11px] font-medium text-amber-500">differs</span>}
                  </div>
                  <div className={`grid gap-2 ${selectedItems.length===2?'grid-cols-2':selectedItems.length===3?'grid-cols-3':'grid-cols-2 sm:grid-cols-4'}`}>
                    {values.map((v,i)=><div key={i} className="p-3 rounded-xl bg-[#080A10] border border-[#1F2228]"><p className="text-[11px] text-[#8A8F98] truncate">{selectedItems[i].firm.brandName}</p><p className="text-[13px] font-mono font-medium text-white mt-1 break-words">{v}</p></div>)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button onClick={()=>onNavigate('/')} className="text-[13px] text-[#8A8F98] hover:text-white inline-flex items-center gap-1.5">Back to directory <ArrowRight className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </div>
  );
};
