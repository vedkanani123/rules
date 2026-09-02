
import React, { useState, useMemo } from 'react';
import { RULE_GUIDES } from '../data/propFirmsData.ts';
import { BookOpen, Calculator, Clock, Shield, Search, Filter, TrendingDown, AlertTriangle, Zap, Scale, Eye, Activity, Timer, Boxes, FileText, Sparkles, ArrowRight, CheckCircle2, Flame, Target, Wallet, ShieldAlert, Crown } from 'lucide-react';

interface RulesHubPageProps { onNavigate: (path: string) => void; }

const categoryIcons: Record<string, any> = {
  'Risk Management': TrendingDown,
  'Execution Rules': Zap,
  'Evaluation Rules': Scale,
  'Payout Rules': Wallet,
  'Account Rules': ShieldAlert,
  'Trading Rules': Boxes,
  'Commercial & Legal': FileText,
  'Futures Specific': Activity,
};

const categoryColors: Record<string, string> = {
  'Risk Management': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Execution Rules': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Payout Rules': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Evaluation Rules': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'Account Rules': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Trading Rules': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Commercial & Legal': 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  'Futures Specific': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

// Mini visual components per slug
const VisualDaily: React.FC = () => {
  const [eq, setEq] = useState(101000);
  React.useEffect(()=>{ const id=setInterval(()=> setEq(v=> v>103000?100200: v+400), 900); return ()=>clearInterval(id); },[]);
  const floor=96000;
  const pct=Math.max(0, Math.min(100, ((eq-floor)/8000)*100));
  return (
    <div className="h-[118px] rounded-xl bg-[#080A10] border border-[#1F2228] p-3 flex flex-col gap-2 overflow-hidden relative">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wide text-white/30"><span>Balance $100K</span><span className="text-red-400">Floor $96K</span></div>
      <div className="flex-1 relative flex items-end">
        <div className="absolute left-0 right-0 h-px bg-red-500/50" style={{bottom:'20%'}} />
        <span className="absolute right-1 text-[9px] font-mono text-red-400" style={{bottom:'22%'}}>breach</span>
        <div className="w-full h-2 rounded-full bg-[#1F2228] overflow-hidden relative">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-700" style={{width: pct+'%'}} />
          <div className="absolute top-0 bottom-0 w-0.5 bg-white/60" style={{left: '50%'}} />
        </div>
      </div>
      <div className="flex gap-1 text-[10px] font-mono">
        <span className="px-2 py-1 rounded bg-[#111318] border border-[#1F2228] text-white/60">Equity ${eq.toLocaleString()}</span>
        <span className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400">Distance ${(eq-floor).toLocaleString()}</span>
      </div>
      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
    </div>
  );
};
const VisualTrailing: React.FC = () => {
  const [peak, setPeak] = useState(100000);
  React.useEffect(()=>{ const id=setInterval(()=> setPeak(v=> v>108000?100500: v+800), 800); return ()=>clearInterval(id); },[]);
  const floor=Math.min(100000, peak-6000);
  return (
    <div className="h-[118px] rounded-xl bg-[#080A10] border border-[#1F2228] p-3 flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-center justify-between text-[10px] font-mono text-white/30"><span>Peak ${peak.toLocaleString()}</span><span className="text-amber-400">Floor ${floor.toLocaleString()}</span></div>
      <svg viewBox="0 0 200 60" className="w-full h-12">
        <path d={`M0 40 Q 50 ${40 - (peak-100000)/400} 100 ${38 - (peak-100000)/500} T 200 ${35 - (peak-100000)/600}`} fill="none" stroke="#10b981" strokeWidth="2.5" />
        <path d={`M0 50 Q 50 ${50 - (floor-94000)/400} 100 ${48 - (floor-94000)/300} T 200 ${46 - (floor-94000)/350}`} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
      </svg>
      <div className="flex items-center gap-1.5 text-[10px]"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Equity <span className="w-2 h-0.5 bg-amber-500" /> Trailing floor</div>
    </div>
  );
};
const VisualNews: React.FC = () => {
  const [pos, setPos] = useState(0);
  React.useEffect(()=>{ const id=setInterval(()=> setPos(v=> (v+1)%100), 60); return ()=>clearInterval(id); },[]);
  return (
    <div className="h-[118px] rounded-xl bg-[#080A10] border border-[#1F2228] p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between text-[10px] font-mono text-white/30"><span>08:28</span><span className="text-red-400">08:30 CPI</span><span>08:32</span></div>
      <div className="relative h-8 rounded-full bg-[#1F2228] overflow-hidden flex">
        <div className="flex-1" />
        <div className="w-[36%] bg-red-500/25 border-x border-red-500/40 flex items-center justify-center text-[10px] font-bold text-red-400">±2 MIN NO TRADE</div>
        <div className="flex-1" />
        <div className="absolute top-1 bottom-1 w-0.5 bg-white transition-all duration-100" style={{left: pos+'%'}} />
      </div>
      <div className="flex gap-1 text-[10px]"><span className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400">Fill = breach</span><span className="px-2 py-1 rounded bg-[#111318] border border-[#1F2228] text-white/40">Hold = OK</span></div>
    </div>
  );
};
const VisualConsistency: React.FC = () => {
  const [best, setBest] = useState(1200);
  React.useEffect(()=>{ const id=setInterval(()=> setBest(v=> v>1800?800: v+150), 700); return ()=>clearInterval(id); },[]);
  const total=3200;
  const pct=(best/total)*100;
  const bad=pct>50;
  return (
    <div className="h-[118px] rounded-xl bg-[#080A10] border border-[#1F2228] p-3 flex items-center gap-3">
      <div className="w-16 h-16 rounded-full relative shrink-0" style={{background: `conic-gradient(${bad?'#ef4444':'#10b981'} 0 ${pct}%, #1F2228 ${pct}% 100%)`}}>
        <div className="absolute inset-2 rounded-full bg-[#080A10] flex items-center justify-center text-[10px] font-mono font-bold text-white">{pct.toFixed(0)}%</div>
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-xs font-medium text-white">Best day ${best.toLocaleString()} / ${total.toLocaleString()}</p>
        <p className={`text-[11px] ${bad?'text-red-400':'text-emerald-400'}`}>{bad?'Breach — target raised!':'Within 50% limit'}</p>
        <div className="h-1.5 rounded-full bg-[#1F2228] overflow-hidden"><div className={`h-full ${bad?'bg-red-500':'bg-emerald-500'} transition-all`} style={{width: pct+'%'}} /></div>
      </div>
    </div>
  );
};
const VisualInactivity: React.FC = () => {
  const d=18;
  return (
    <div className="h-[118px] rounded-xl bg-[#080A10] border border-[#1F2228] p-3 flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-white"><Timer className="w-3.5 h-3.5 text-amber-500" /> 30-day lock</div>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({length:30}).map((_,i)=>(
          <div key={i} className={`h-5 rounded ${i<d?'bg-emerald-500/20 border border-emerald-500/30': i===d?'bg-red-500 animate-pulse':'bg-[#1F2228] border border-white/5'}`} />
        ))}
      </div>
      <p className="text-[11px] text-white/40">Day {d} — <span className="text-amber-400">12 days left</span> • 0.01 lot resets clock</p>
    </div>
  );
};
const VisualPayout: React.FC = () => (
  <div className="h-[118px] rounded-xl bg-[#080A10] border border-[#1F2228] p-3 grid grid-cols-3 gap-2">
    {[
      {k:'Profit', v:'$420', ok:true},
      {k:'Days', v:'3/5', ok:false},
      {k:'Best', v:'62% ✗', ok:false},
      {k:'Buffer', v:'$80 ✗', ok:false},
      {k:'KYC', v:'✓', ok:true},
      {k:'Open', v:'1', ok:false},
    ].map(c=>(
      <div key={c.k} className={`rounded-lg border p-2 text-center ${c.ok?'bg-emerald-500/10 border-emerald-500/20':'bg-red-500/10 border-red-500/20'}`}>
        <p className="text-[9px] uppercase tracking-wide text-white/40">{c.k}</p>
        <p className={`text-xs font-mono font-bold ${c.ok?'text-emerald-400':'text-red-400'}`}>{c.v}</p>
      </div>
    ))}
  </div>
);
const VisualWeekend: React.FC = () => (
  <div className="h-[118px] rounded-xl bg-[#080A10] border border-[#1F2228] p-3 flex flex-col gap-2">
    <div className="flex gap-1">
      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i)=>(
        <div key={d} className={`flex-1 h-8 rounded-lg border flex flex-col items-center justify-center text-[10px] ${i===4?'bg-red-500/15 border-red-500/30 text-red-400': i>=5?'bg-[#1F2228] border-white/5 text-white/20':'bg-[#111318] border-[#1F2228] text-white/60'}`}>
          <span className="font-medium">{d}</span>
          <span className="text-[9px]">{i===4?'Flat':'•'}</span>
        </div>
      ))}
    </div>
    <p className="text-[11px] text-white/40">Fri 15:10 CT — Standard funded must flat <span className="text-white">•</span> Swing = hold</p>
  </div>
);
const VisualGeneric: React.FC<{icon:any, label:string, desc:string}> = ({icon:Icon, label, desc}) => (
  <div className="h-[118px] rounded-xl bg-[#080A10] border border-[#1F2228] p-4 flex flex-col justify-center gap-2 relative overflow-hidden">
    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"><Icon className="w-4 h-4 text-white/60" /></div>
    <p className="text-xs font-semibold text-white">{label}</p>
    <p className="text-[11px] leading-relaxed text-white/40 line-clamp-2">{desc}</p>
    <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-white/[0.03] blur-xl" />
  </div>
);

const visuals: Record<string, React.FC> = {
  'daily-drawdown': VisualDaily,
  'trailing-drawdown': VisualTrailing,
  'news-trading-restrictions': VisualNews,
  'consistency-rule': VisualConsistency,
  'inactivity-rule': VisualInactivity,
  'payout-gates': VisualPayout,
  'weekend-overnight': VisualWeekend,
};

export const RulesHubPage: React.FC<RulesHubPageProps> = ({ onNavigate }) => {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('All');
  const cats = ['All', ...Array.from(new Set(RULE_GUIDES.map(g=>g.category)))];
  const filtered = useMemo(()=>{
    return RULE_GUIDES.filter(g=>{
      if (cat!=='All' && g.category!==cat) return false;
      if (q && !(`${g.name} ${g.shortDefinition} ${g.slug}`.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
  },[q,cat]);

  return (
    <div className="bg-[#080A10] min-h-screen">
      {/* Hero */}
      <div className="border-b border-[#1F2228] bg-[#080A10]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <p className="text-[11px] tracking-[0.14em] uppercase font-medium text-[#8A8F98] flex items-center gap-2 mb-3"><BookOpen className="w-3 h-3" /> Learning Hub — Evidence-First</p>
              <h1 className="text-[28px] sm:text-[36px] font-semibold tracking-tight text-white leading-tight">Every rule, <span className="text-[#8A8F98]">visually decoded.</span></h1>
              <p className="text-[13px] leading-relaxed text-[#8A8F98] mt-3 max-w-2xl">Not a blog. An interactive learning system — every rule has a live visual, formula, real dollar example, and the exact firm wording that traps traders.</p>
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400"><Shield className="w-3 h-3" />12 guides</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111318] border border-[#1F2228] text-xs text-[#8A8F98]"><Calculator className="w-3 h-3" />30+ rules</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111318] border border-[#1F2228] text-xs text-[#8A8F98]"><Eye className="w-3 h-3" />Live visuals</span>
                <span className="text-[11px] text-[#6B7280] hidden sm:inline">• No affiliate fluff • Source-backed</span>
              </div>
            </div>
            <div className="shrink-0 rounded-2xl bg-[#111318] border border-[#1F2228] p-4 min-w-[280px]">
              <p className="text-[11px] tracking-[0.08em] uppercase font-medium text-[#8A8F98]">Source → Rule → Risk → Decision</p>
              <div className="flex items-center gap-1 mt-3">
                {['Source','Rule','Risk','Decision'].map((s,i)=>(
                  <React.Fragment key={s}>
                    <span className={`px-2.5 py-1.5 rounded-full border text-[11px] font-mono ${i===2?'bg-amber-500 text-black border-amber-500': i===1?'bg-sky-500 text-white border-sky-500':'bg-[#080A10] border-[#1F2228] text-white/60'}`}>{s}</span>
                    {i<3 && <span className="text-white/20">→</span>}
                  </React.Fragment>
                ))}
              </div>
              <p className="text-[11px] text-white/30 mt-2">This hub teaches the loop every trader must master before paying.</p>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-7 flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search rules, e.g. drawdown, news, consistency, payout..." className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#111318] border border-[#1F2228] text-[13px] text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#2A2D35]" />
            </div>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide p-1 rounded-xl bg-[#111318] border border-[#1F2228] shrink-0">
              {cats.map(c=>(
                <button key={c} onClick={()=>setCat(c)} className={`whitespace-nowrap px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${cat===c?'bg-white text-[#080A10] shadow-sm':'text-[#8A8F98] hover:text-white'}`}>{c}</button>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-[#6B7280] mt-2">{filtered.length} guides • Covering every single rule from daily loss to hidden conditions • Click any card to learn with animation</p>
        </div>
      </div>

      {/* All Rules at a Glance - clear topics strip */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="rounded-2xl bg-[#111318] border border-[#1F2228] p-4">
          <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98] flex items-center gap-2 mb-3"><Sparkles className="w-3.5 h-3.5 text-[#3b82f6]" /> All rules at a glance — every single rule topic</p>
          <div className="flex flex-wrap gap-2">
            {RULE_GUIDES.map((g, idx)=>{
              const Icon = categoryIcons[g.category] || BookOpen;
              return (
                <button key={g.slug} onClick={()=>onNavigate(`/rules/${g.slug}`)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#080A10] border border-[#1F2228] hover:border-[#2A2D35] hover:bg-[#16181E] text-xs font-medium text-white/70 hover:text-white transition-colors">
                  <span className="w-5 h-5 rounded-full bg-white text-[#080A10] flex items-center justify-center text-[10px] font-bold">{String(idx+1).padStart(2,'0')}</span>
                  <Icon className="w-3 h-3" /> {g.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((guide, idx)=>{
            const Icon = categoryIcons[guide.category] || BookOpen;
            const Visual = visuals[guide.slug] || (()=> <VisualGeneric icon={Icon} label={guide.name} desc={guide.shortDefinition} />);
            const globalIdx = RULE_GUIDES.findIndex(g=>g.slug===guide.slug);
            return (
              <button key={guide.slug} onClick={()=>onNavigate(`/rules/${guide.slug}`)} className="text-left rounded-2xl bg-[#111318] border border-[#1F2228] overflow-hidden hover:border-sky-500/30 hover:bg-[#16181E] hover:shadow-[0_8px_32px_rgba(59,130,246,0.08)] transition-all group flex flex-col">
                <div className="p-4">
                  <Visual />
                </div>
                <div className="px-5 pb-5 flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-white text-[#080A10] flex items-center justify-center text-xs font-bold shadow-sm">{String(globalIdx+1).padStart(2,'0')}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${categoryColors[guide.category] || 'bg-white/5 text-white/60 border-[#1F2228]'}`}>
                      <Icon className="w-3 h-3" /> {guide.category}
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400"><Eye className="w-3 h-3" /> Visual</span>
                  </div>
                  <h3 className="text-[18px] font-bold text-white leading-tight group-hover:text-sky-400 transition-colors">{guide.name}</h3>
                  <p className="text-[13px] leading-relaxed text-white/45 line-clamp-2">{guide.shortDefinition}</p>
                  <div className="rounded-xl bg-[#080A10] border border-[#1F2228] px-3 py-2.5 font-mono text-[11px] leading-relaxed text-sky-300/80 line-clamp-2">
                    {guide.formula}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-medium text-[#8A8F98] flex items-center gap-1"><Clock className="w-3 h-3" />5 min • {guide.firmsUsing[0]?.firmName} <span className="w-1 h-1 rounded-full bg-white/20" /> {guide.firmsUsing.length} firms</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#080A10] text-xs font-bold group-hover:bg-sky-500 group-hover:text-white transition-colors">Learn <ArrowRight className="w-3 h-3" /></span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {filtered.length===0 && (
          <div className="mt-8 p-8 rounded-2xl bg-[#111318] border border-[#1F2228] text-center">
            <p className="text-sm text-white">No guides match “{q}”</p>
            <button onClick={()=>{setQ(''); setCat('All');}} className="mt-3 px-4 py-2 rounded-full bg-white text-[#080A10] text-xs font-medium">Clear filters</button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-8 rounded-2xl bg-gradient-to-br from-[#111318] to-[#0f1a2e] border border-[#1F2228] p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h4 className="text-[16px] font-semibold text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#3b82f6]" /> Test your knowledge live</h4>
            <p className="text-[13px] leading-relaxed text-white/50 mt-1 max-w-xl">Try the interactive drawdown simulator with real firm floors — see the same trade live vs breach across programs.</p>
          </div>
          <button onClick={()=>onNavigate('/simulator')} className="shrink-0 px-5 py-3 rounded-xl bg-white text-[#080A10] text-sm font-semibold flex items-center gap-2 hover:bg-white/90">Open simulator <Calculator className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};
