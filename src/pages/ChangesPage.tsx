import React from 'react';
import { PROP_FIRMS_DATA } from '../data/propFirmsData.ts';
import { History, ArrowRight, Calendar, AlertTriangle, Shield, Clock } from 'lucide-react';

interface ChangesPageProps { onNavigate: (path: string) => void; }

export const ChangesPage: React.FC<ChangesPageProps> = ({ onNavigate }) => {
  const [selectedFirmSlug, setSelectedFirmSlug] = React.useState<string>(PROP_FIRMS_DATA[0].slug);

  const currentFirm = React.useMemo(() => {
    return PROP_FIRMS_DATA.find(f => f.slug === selectedFirmSlug) || PROP_FIRMS_DATA[0];
  }, [selectedFirmSlug]);

  const changes = currentFirm.recentChanges || [];

  return (
    <div className="bg-[#080A10] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="pt-10 sm:pt-14 pb-10 border-b border-[#1F2228] text-center">
          <p className="text-[11px] tracking-[0.14em] uppercase font-medium text-[#8A8F98] mb-3">THE AUDIT TRAIL</p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111318] border border-[#1F2228] text-[11px] font-semibold tracking-wide uppercase text-[#8A8F98] mb-4">
            <History className="w-3 h-3" /> Audit trail · live changelog
          </div>
          <h1 className="text-[30px] sm:text-[40px] font-semibold tracking-tight leading-[0.95] text-white max-w-3xl mx-auto">Rule changes<br /><span className="text-[#8A8F98]">changelog</span></h1>
          <p className="text-[13px] leading-relaxed text-[#8A8F98] mt-3 max-w-2xl mx-auto">When a firm updates trading days, alters drawdown, or adds a policy, our snapshot diff captures what changed, when, and who is affected — with source.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <select
              aria-label="Select prop firm"
              value={selectedFirmSlug}
              onChange={e => setSelectedFirmSlug(e.target.value)}
              className="px-4 py-2 rounded-full bg-[#111318] border border-[#1F2228] text-[13px] text-white focus:outline-none focus:border-[#2A2D35] min-h-[40px]"
            >
              {PROP_FIRMS_DATA.map(f => (
                <option key={f.slug} value={f.slug}>{f.name}</option>
              ))}
            </select>
            <span className="px-3 py-2 rounded-full bg-[#111318] border border-[#1F2228] text-[13px] font-medium text-[#8A8F98] flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {changes.length} tracked changes</span>
            <span className="px-3 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[13px] font-medium text-emerald-400 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Verified Snapshot</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            {changes.map(change=>(
              <div key={change.id} className="rounded-2xl bg-[#111318] border border-[#1F2228] overflow-hidden hover:border-[#2A2D35] transition-colors">
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-[13px] font-semibold text-white">{change.firmName}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase border ${change.changeType==='MODIFIED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : change.changeType==='ADDED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-[#080A10] text-[#8A8F98] border-[#1F2228]'}`}>{change.changeType}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${change.impactLevel==='HIGH' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-[#080A10] text-[#8A8F98] border-[#1F2228]'}`}>{change.impactLevel}</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-[13px] text-[#8A8F98]"><Calendar className="w-3 h-3" /> {change.effectiveDate}</span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-white leading-tight">{change.ruleName}</h3>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
                    <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                      <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-red-400/70">Before</p>
                      <p className="text-[13px] font-medium text-white mt-1 line-through decoration-red-500/50">{change.oldValue}</p>
                    </div>
                    <span className="hidden sm:flex w-7 h-7 rounded-full bg-white text-[#080A10] items-center justify-center justify-self-center"><ArrowRight className="w-3.5 h-3.5" /></span>
                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                      <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-emerald-400/70">After</p>
                      <p className="text-[13px] font-semibold text-white mt-1">{change.newValue}</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 rounded-xl bg-[#080A10] border border-[#1F2228]">
                    <p className="text-[13px] leading-relaxed text-[#8A8F98]">{change.plainEnglishSummary}</p>
                    <p className="text-[13px] text-[#8A8F98] mt-2">Affects: <span className="text-white font-medium">{change.whoIsAffected}</span></p>
                    <a href={change.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[13px] font-medium text-[#8A8F98] hover:text-white mt-2">Source: {change.sourceTitle} <ArrowRight className="w-3 h-3" /></a>
                  </div>
                </div>
              </div>
            ))}
            {changes.length===0 && (
              <div className="text-center py-12 rounded-2xl bg-[#111318] border border-[#1F2228]">
                <p className="text-[13px] text-[#8A8F98]">No policy change records logged yet for {currentFirm.name}.</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl bg-[#111318] border border-[#1F2228] p-5">
              <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98] mb-3">How we detect</p>
              <ul className="space-y-2.5 text-[13px] leading-relaxed text-[#8A8F98]">
                <li className="flex gap-2"><span className="text-[#1F2228]">•</span><span>Crawl official domain + help center on schedule</span></li>
                <li className="flex gap-2"><span className="text-[#1F2228]">•</span><span>Hash content, diff wording + tables</span></li>
                <li className="flex gap-2"><span className="text-[#1F2228]">•</span><span>Log old vs new with effective date</span></li>
                <li className="flex gap-2"><span className="text-[#1F2228]">•</span><span>Flag impact: HIGH if drawdown/payout</span></li>
              </ul>
            </div>
            <div className="rounded-2xl bg-[#111318] border border-amber-500/20 p-5 flex gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-amber-400">Check before you buy</p>
                <p className="text-[13px] leading-relaxed text-[#8A8F98] mt-1">Rules can change after purchase date or by payout stage. Always verify the funded-stage FAQ, not just the landing page.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
