
import React, { useState, useMemo } from 'react';
import { RULE_GUIDES } from '../data/propFirmsData.ts';
import { RuleGuideItem } from '../types/schema.ts';
import { calculateDailyLossFloor, calculateMaxLossFloor, calculateConsistencyImpact, checkPayoutEligibility } from '../core/calculator/engine.ts';
import { BookOpen, Calculator, AlertTriangle, Building, ArrowLeft, ArrowRight, FileText, Shield, Clock, TrendingDown, Zap, Scale, Eye, Timer, Boxes, Wallet, Flame, Target, Crown, CheckCircle2, Sparkles, Activity, Info } from 'lucide-react';

interface RuleGuidePageProps { guideSlug: string; onNavigate: (path: string) => void; }

export const RuleGuidePage: React.FC<RuleGuidePageProps> = ({ guideSlug, onNavigate }) => {
  const guide: RuleGuideItem = RULE_GUIDES.find((g) => g.slug === guideSlug) || RULE_GUIDES[0];
  const allGuides = RULE_GUIDES;
  const idx = allGuides.findIndex(g=>g.slug===guide.slug);
  const prev = idx>0 ? allGuides[idx-1] : null;
  const next = idx<allGuides.length-1 ? allGuides[idx+1] : null;

  const FIRM_SLUG_MAP: Record<string, string> = {
    'goat funded trader': 'goat-funded-trader',
    'ftmo': 'ftmo',
    'funding pips': 'funding-pips',
    'fundednext': 'funded-next',
    'funded next': 'funded-next',
    'the5ers': 'the-5ers',
    'the 5ers': 'the-5ers',
    'topstep': 'topstep',
    'apex trader funding': 'apex-trader-funding',
    'apex': 'apex-trader-funding',
    'take profit trader': 'take-profit-trader',
    'alpha capital': 'alpha-capital',
  };
  const primaryFirmName = guide.firmsUsing?.[0]?.firmName ?? '';
  const primaryFirmSlug = FIRM_SLUG_MAP[primaryFirmName.trim().toLowerCase()] ?? '';
  const primaryFirmHref = primaryFirmSlug ? `/prop-firms/${primaryFirmSlug}` : '/prop-firms';

  const isNewsGuide = guide.slug === 'news-trading-restrictions' || guide.slug === 'weekend-overnight' || guide.slug === 'trading-hours-rollover' || guide.slug === 'instruments-hours-trading';
  const isPayoutGuide = guide.category === 'Payout Rules' || guide.slug.includes('payout') || guide.slug === 'profit-split-progression' || guide.slug === 'refund-chargeback';
  const isRiskGuide = guide.category === 'Risk Management';
  const caughtText = isNewsGuide
    ? 'This rule is often buried in FAQ or enforced only on funded accounts — not on the pricing page. Marketing says "allowed", FAQ says "2-min buffer" around red-folder news. Our engine flags it as Easy-to-Miss.'
    : isPayoutGuide
      ? 'Payout rules hide behind headline splits. Minimum profit, winning-day counts, consistency caps, safety buffers, and KYC must all clear — fail one and the payout button stays hidden with no explanation.'
      : isRiskGuide
        ? 'Risk floors are enforced tick by tick against live equity including spread and swaps. Server-time resets and intraday peaks shrink usable room far below what the headline percent suggests.'
        : 'This rule is often buried in FAQ or enforced only at payout review — not on the pricing page. Check the exact firm wording before assuming the headline covers your case.';
  const safeText = isNewsGuide
    ? 'Check the Source Inspector for the exact FAQ excerpt, flatten or halve size into the ±2-min window, and cancel pending stop orders before red-folder releases.'
    : isPayoutGuide
      ? 'Track winning days, best-day %, buffer distance, and KYC status in one checklist before requesting. Keep trading normally while the request queues.'
      : isRiskGuide
        ? 'Check the Source Inspector for the exact FAQ excerpt, test your equity distance in the simulator, and keep a 20% buffer above the nearest floor.'
        : 'Verify the firm terms excerpt, keep evidence logs of your setup, and test edge cases in the simulator before sizing up.';

  const relatedGuides = (guide.relatedSlugs || [])
    .map(s => allGuides.find(g => g.slug === s))
    .filter((g): g is RuleGuideItem => Boolean(g));

  return (
    <div className="bg-[#080A10] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Hero */}
        <div className="pt-8 sm:pt-10 pb-8 border-b border-[#1F2228]">
          <button onClick={() => onNavigate('/rules')} className="inline-flex items-center gap-1.5 text-[13px] text-[#8A8F98] hover:text-white transition-colors mb-5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Learning Hub
          </button>
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111318] border border-[#1F2228] text-[11px] font-semibold tracking-wide uppercase text-[#8A8F98] mb-4">
                <BookOpen className="w-3 h-3" /> {guide.category} • Visual Master Guide
              </div>
              <h1 className="text-[28px] sm:text-[40px] lg:text-[48px] font-semibold tracking-tight leading-[0.95] text-white max-w-3xl">
                {guide.name}
              </h1>
              <p className="text-[15px] leading-relaxed text-white/50 mt-4 max-w-2xl">
                {guide.shortDefinition}
              </p>
              <p className="text-[13px] leading-relaxed text-[#8A8F98] mt-3 max-w-2xl">
                {guide.detailedExplanation}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111318] border border-[#1F2228] text-xs font-medium text-[#8A8F98]"><Clock className="w-3.5 h-3.5" /> 5 min • Interactive</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400"><Eye className="w-3.5 h-3.5" /> Live visual</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111318] border border-[#1F2228] text-xs font-medium text-[#8A8F98]"><Calculator className="w-3.5 h-3.5" /> Try it</span>
              </div>
            </div>
            <div className="shrink-0 flex flex-col gap-2 lg:text-right">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111318] border border-[#1F2228] text-xs text-[#8A8F98]">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Verified vs official FAQ & Terms
              </div>
              <p className="text-[11px] text-white/30">Applies to {guide.firmsUsing.length} firms • {guide.category}</p>
              {prev && <button onClick={()=>onNavigate(`/rules/${prev.slug}`)} className="text-xs text-white/40 hover:text-white flex items-center gap-1 lg:justify-end"><ArrowLeft className="w-3 h-3" /> Prev: {prev.name.slice(0,20)}</button>}
              {next && <button onClick={()=>onNavigate(`/rules/${next.slug}`)} className="text-xs text-white/40 hover:text-white flex items-center gap-1 lg:justify-end">Next: {next.name.slice(0,20)} <ArrowRight className="w-3 h-3" /></button>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          <div className="lg:col-span-8 space-y-6">
            <section className="rounded-2xl bg-[#111318] border border-[#1F2228] p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-9 h-9 rounded-xl bg-[#080A10] border border-[#1F2228] flex items-center justify-center"><FileText className="w-4 h-4 text-[#8A8F98]" /></span>
                <div>
                  <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98]">Deep Dive</p>
                  <h2 className="text-[15px] font-semibold text-white">Why this rule exists</h2>
                </div>
              </div>
              <p className="text-[13px] leading-relaxed text-white/60">
                {guide.detailedExplanation}
              </p>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/15">
                  <p className="text-xs font-semibold text-amber-400 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Why traders get caught</p>
                  <p className="text-xs leading-relaxed text-white/50 mt-2">This rule is often buried in FAQ or enforced only at payout review — not on the pricing page. Marketing says “allowed”, FAQ says “2-min buffer”. Our engine flags it as <b className="text-amber-400">Easy-to-Miss</b>.</p>
                </div>
                <div className="p-4 rounded-xl bg-sky-500/[0.06] border border-sky-500/15">
                  <p className="text-xs font-semibold text-sky-400 flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> How to stay safe</p>
                  <p className="text-xs leading-relaxed text-white/50 mt-2">Check the Source Inspector for the exact FAQ excerpt, test your equity distance in the simulator above, and set a 20% buffer below the floor.</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-[#111318] border border-[#1F2228] p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-9 h-9 rounded-xl bg-[#080A10] border border-[#1F2228] flex items-center justify-center"><Calculator className="w-4 h-4 text-emerald-400" /></span>
                <div>
                  <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98]">Formula</p>
                  <h2 className="text-[15px] font-semibold text-white">Exact calculation</h2>
                </div>
              </div>
              <div className="rounded-xl bg-[#080A10] border border-[#1F2228] p-4 font-mono text-xs leading-relaxed text-emerald-300 whitespace-pre-wrap break-words">
                {guide.formula}
              </div>
              <div className="mt-4 rounded-xl bg-[#080A10] border border-emerald-500/15 p-4">
                <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-emerald-400 flex items-center gap-1.5"><TrendingDown className="w-3.5 h-3.5" /> Real dollar example</p>
                <p className="text-[13px] leading-relaxed text-white/60 mt-2">{guide.example}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {guide.howFirmsCalculate.map((h,i)=>(
                  <div key={i} className="flex-1 min-w-[220px] p-4 rounded-xl bg-[#080A10] border border-[#1F2228]">
                    <p className="text-xs font-semibold text-white">{h.title}</p>
                    <p className="text-xs leading-relaxed text-white/40 mt-1">{h.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-[#111318] border border-[#1F2228] p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-red-400" /></span>
                <h2 className="text-[15px] font-semibold text-white">Common mistakes — learn to avoid</h2>
              </div>
              <div className="space-y-3">
                {guide.commonMistakes.map((m,i)=>(
                  <div key={i} className="flex gap-3 p-4 rounded-xl bg-[#080A10] border border-[#1F2228]">
                    <span className="w-7 h-7 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 text-xs font-bold text-red-400">{i+1}</span>
                    <p className="text-[13px] leading-relaxed text-white/60">{m}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <button onClick={()=>onNavigate('/prop-firms/goat-funded-trader')} className="px-4 py-2.5 rounded-full bg-white text-[#080A10] text-xs font-semibold">See live rule with source →</button>
                <button onClick={()=>onNavigate('/simulator')} className="px-4 py-2.5 rounded-full bg-[#080A10] border border-[#1F2228] text-xs font-medium text-white">Test in simulator</button>
              </div>
            </section>

            <section className="rounded-2xl bg-gradient-to-br from-[#111318] to-[#0f1a2e] border border-[#1F2228] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Firms using this rule</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {guide.firmsUsing.map(f=>(
                    <span key={f.firmName} className="px-3 py-1.5 rounded-full bg-[#080A10] border border-[#1F2228] text-xs text-white/60"><Building className="w-3 h-3 inline mr-1" />{f.firmName} <span className="text-white/30">•</span> {f.modelVariation.slice(0,32)}</span>
                  ))}
                </div>
              </div>
              <button onClick={()=>onNavigate('/prop-firms')} className="shrink-0 px-4 py-2 rounded-full bg-white text-[#080A10] text-xs font-semibold">Compare firms →</button>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl bg-[#111318] border border-[#1F2228] p-4">
              <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98] mb-3">All 12 guides</p>
              <div className="space-y-1 max-h-[420px] overflow-auto pr-1">
                {allGuides.map(g => (
                  <button key={g.slug} onClick={() => onNavigate(`/rules/${g.slug}`)} className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] transition-colors flex items-center gap-2 ${g.slug===guide.slug ? 'bg-white text-[#080A10] font-medium shadow-sm' : 'text-[#8A8F98] hover:text-white hover:bg-[#080A10]'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${g.slug===guide.slug ? 'bg-[#080A10]' : 'bg-[#1F2228]'}`} />
                    <span className="truncate">{g.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#111318] border border-emerald-500/15 p-5">
              <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-emerald-400 mb-3 flex items-center gap-1.5"><Flame className="w-3.5 h-3.5" /> Try it live</p>
              <p className="text-[13px] leading-relaxed text-white/50">Simulate this rule interactively with your starting capital and drawdown constraints using our real mathematical risk engine.</p>
              <button onClick={() => onNavigate('/simulator')} className="mt-4 w-full py-3 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 min-h-[44px]"><Calculator className="w-4 h-4" /> Open Interactive Simulator</button>
              <p className="text-[11px] text-white/20 text-center mt-2">Deterministic — exact firm formulas</p>
            </div>

            <div className="rounded-2xl bg-[#111318] border border-[#1F2228] p-5">
              <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98] mb-3">Quick check</p>
              <div className="space-y-2.5 text-[13px]">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#080A10] border border-[#1F2228]"><span className="text-white/40">Category</span><span className="font-medium text-white text-xs">{guide.category}</span></div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#080A10] border border-amber-500/15"><span className="text-white/40">Risk if ignored</span><span className="font-medium text-amber-400 text-xs">High — breach</span></div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#080A10] border border-[#1F2228]"><span className="text-white/40">Source</span><span className="font-medium text-emerald-400 text-xs">FAQ + Terms ✓</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
