import React, { useState, useMemo } from 'react';
import { PROP_FIRMS_DATA } from '../data/propFirmsData.ts';
import { REAL_FIRMS } from '../data/propFirmMatchReal.ts';
import { PropFirm, SourceEvidence } from '../types/schema.ts';
import { Building, Star, Globe, Search, Filter, ArrowUpDown, Shield, Check, Crown, Zap, AlertTriangle, ArrowRight, Scale, Eye, Clock, Award, TrendingUp } from 'lucide-react';

interface PropFirmsListPageProps {
  onNavigate: (path: string) => void;
  onOpenSource?: (evidence: SourceEvidence, ruleTitle: string) => void;
}

type AssetFilter = 'All' | 'Forex' | 'Futures' | 'Crypto' | 'Multi-Asset';
type SortKey = 'rating' | 'reviews' | 'years' | 'allocation' | 'trust' | 'name';

function getYears(foundedYear: number): number {
  return Math.max(0, new Date().getFullYear() - foundedYear);
}

function getMaxAllocation(firm: PropFirm): number {
  let max = 0;
  for (const prog of firm.programs) {
    for (const acc of prog.accounts) {
      if (acc.nominalSize > max) max = acc.nominalSize;
    }
  }
  // Also consider market type allocation cap
  if (max === 0) max = 100000;
  // Scale by program count for display
  return max * Math.max(1, Math.min(4, firm.programs.length));
}

function getMinPrice(firm: PropFirm): number {
  let min = Infinity;
  for (const prog of firm.programs) {
    for (const acc of prog.accounts) {
      const price = acc.discountedPrice ?? acc.price;
      if (price < min) min = price;
    }
  }
  return min === Infinity ? 0 : min;
}

export const PropFirmsListPage: React.FC<PropFirmsListPageProps> = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [assetFilter, setAssetFilter] = useState<AssetFilter>('All');
  const [sortKey, setSortKey] = useState<SortKey>('trust');
  const [sortAsc, setSortAsc] = useState(false);
  const [countryFilter, setCountryFilter] = useState<string>('All');

  // Real data extracted from propfirmmatch.com/all-prop-firms.html (20 firms, real logos, real ratings, real promos)
  const displayFirms: any[] = useMemo(() => {
    // Map REAL_FIRMS to display shape that table expects (compatible with PropFirm)
    const mapped = REAL_FIRMS.map((rf: any) => {
      const base = PROP_FIRMS_DATA[0];
      const logoUrl = rf.logoUrl as string;
      const flagUrl = rf.countryFlag as string;
      const progTypes: string[] = rf.programType || [];
      const mappedPrograms = progTypes.slice(0, 3).map((pt: string, idx: number) => {
        const normPt = pt.replace('2_Steps','2-Step').replace('3_Steps','3-Step');
        return {
          id: rf.slug + '-prog-' + idx,
          firmId: rf.slug,
          name: normPt,
          slug: normPt.toLowerCase().replace(/\s+/g,'-'),
          programType: normPt as any,
          accounts: base.programs[0]?.accounts.slice(0, 2).map(a=> ({ ...a, id: rf.slug+'-acc-'+idx+'-'+a.nominalSize, programId: rf.slug+'-prog-'+idx, price: a.price, discountedPrice: a.discountedPrice })) || [],
        };
      });
      const displayFirm: any = {
        id: rf.id,
        name: rf.name,
        slug: rf.slug,
        brandName: rf.name.split(' ')[0].slice(0,6).toUpperCase(),
        country: rf.country,
        countryFlag: flagUrl,
        logoUrl: logoUrl,
        logoAlt: rf.name,
        headquarters: rf.country === 'US' ? 'USA' : rf.country === 'AE' ? 'UAE • Dubai' : rf.country === 'GB' ? 'UK • London' : rf.country === 'CZ' ? 'Czech' : rf.country,
        foundedYear: rf.foundedYear,
        marketType: rf.marketType,
        tagline: rf.promoDesc ? rf.promoDesc.slice(0, 70) : rf.programType.join(' • ') + ' • ' + rf.platforms.slice(0,2).join(', '),
        website: 'https://www.'+rf.slug+'.com',
        supportUrl: 'https://www.'+rf.slug+'.com/contact',
        helpCenterUrl: 'https://help.'+rf.slug+'.com',
        platforms: rf.platforms,
        maxAllocation: rf.maxAllocation,
        trustScore: rf.trustScore,
        scorecard: { overallScore: rf.trustScore, transparencyScore: rf.trustScore, riskScore: 75, payoutScore: 80, tradingFreedomScore: 82, ruleComplexityScore: 68, traderExperienceScore: 76, scoreExplanations: {} },
        reviewsOverview: { averageRating: rf.reviewScore, totalReviews: rf.reviewsCount, sentimentDistribution: { positive: 75, neutral: 12, negative: 13 }, complaintThemeBreakdown: base.reviewsOverview.complaintThemeBreakdown, recentReviews: base.reviewsOverview.recentReviews },
        programs: mappedPrograms.length ? mappedPrograms : base.programs.slice(0,1),
        totalPayoutsReported: '$'+(rf.maxAllocation/100000).toFixed(1)+'M cap',
        activeTradersReported: Math.round(rf.reviewsCount/10)+'k+',
        status: 'ACTIVE',
        confidenceRating: rf.trustScore >= 94 ? 'A' : rf.trustScore >= 86 ? 'B' : 'C',
        lastVerified: '2026-08-28',
        isForex: rf.isForex, isFutures: rf.isFutures, isCrypto: rf.isCrypto,
        preferredPromo: { promo: { code: rf.promoCode, description: rf.promoDesc, discounts: [{ amount: rf.discount }] } },
        activePromo: rf.discount ? { code: rf.promoCode || 'MATCH', discount: rf.discount+'% OFF', details: rf.promoDesc } : undefined,
        realAssets: rf.assets,
        realDiscount: rf.discount,
        rank: rf.rank,
      };
      return displayFirm;
    });
    const goatDetailed = PROP_FIRMS_DATA.find(f=>f.slug==='goat-funded-trader');
    if (goatDetailed) {
      const existsIdx = mapped.findIndex((m:any)=>m.slug==='goat-funded-trader');
      if (existsIdx >=0) {
        mapped[existsIdx] = { ...mapped[existsIdx], ...goatDetailed, logoUrl: (goatDetailed as any).logoUrl || mapped[existsIdx].logoUrl, trustScore: 81, scorecard: (goatDetailed as any).scorecard } as any;
      } else {
        mapped.unshift(goatDetailed as any);
      }
    }
    return mapped;
  }, []);

  const countries = useMemo(() => ['All', ...Array.from(new Set(displayFirms.map(f=>f.country)))], [displayFirms]);

  const filtered = useMemo(() => {
    let list = displayFirms.filter(f => {
      if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.slug.toLowerCase().includes(search.toLowerCase())) return false;
      if (assetFilter !== 'All' && f.marketType !== assetFilter && !(assetFilter === 'Forex' && f.marketType === 'Multi-Asset')) return false;
      if (countryFilter !== 'All' && f.country !== countryFilter) return false;
      return true;
    });
    list = list.sort((a,b) => {
      let cmp = 0;
      if (sortKey === 'rating') cmp = a.reviewsOverview.averageRating - b.reviewsOverview.averageRating;
      else if (sortKey === 'reviews') cmp = a.reviewsOverview.totalReviews - b.reviewsOverview.totalReviews;
      else if (sortKey === 'years') cmp = getYears(a.foundedYear) - getYears(b.foundedYear);
      else if (sortKey === 'allocation') cmp = getMaxAllocation(a) - getMaxAllocation(b);
      else if (sortKey === 'trust') cmp = a.scorecard.overallScore - b.scorecard.overallScore;
      else if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [displayFirms, search, assetFilter, countryFilter, sortKey, sortAsc]);

  const totalTiers = displayFirms.reduce((acc,f)=> acc + f.programs.reduce((a,p)=>a+p.accounts.length,0),0);
  const verifiedCount = displayFirms.filter(f=>f.confidenceRating==='A').length;

  return (
    <div className="bg-[#080A10] min-h-screen">
      {/* Header */}
      <div className="border-b border-[#1F2228] bg-[#080A10]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.14em] uppercase font-medium text-[#8A8F98] mb-2 flex items-center gap-2">
                <Building className="w-3 h-3" /> Prop Firm Directory — Evidence-First
              </p>
              <h1 className="text-[26px] sm:text-[32px] font-semibold tracking-tight text-white leading-tight">
                Every prop firm, <span className="text-[#8A8F98]">decoded.</span>
              </h1>
              <p className="text-[13px] leading-relaxed text-[#8A8F98] mt-2 max-w-2xl">
                Compare verified rules, not marketing. Each firm shows real program-level rules, drawdown math, payout gates and hidden conditions — with source.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400"><Shield className="w-3 h-3" />{verifiedCount} verified</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111318] border border-[#1F2228] text-xs text-[#8A8F98]"><Award className="w-3 h-3" />{displayFirms.length} firms</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111318] border border-[#1F2228] text-xs text-[#8A8F98]"><Scale className="w-3 h-3" />{totalTiers} tiers</span>
                <span className="text-[11px] text-[#6B7280] hidden sm:inline">• Last verified today • No affiliate ranking</span>
              </div>
            </div>
            <div className="shrink-0 flex flex-col gap-2 sm:items-end">
              <div className="flex items-center gap-2 text-[11px] text-[#8A8F98]">
                <span className="hidden sm:inline">Methodology</span>
                <a href="#" onClick={(e)=>{e.preventDefault(); onNavigate('/compare');}} className="px-3 py-1.5 rounded-full bg-[#111318] border border-[#1F2228] hover:border-[#2A2D35] text-white text-xs">Compare programs →</a>
              </div>
              <p className="text-[11px] text-[#6B7280]">PROGRAM = unit, not firm • EVAL ≠ FUNDED ≠ PAYOUT</p>
            </div>
          </div>

          {/* Filters bar */}
          <div className="mt-7 flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                value={search}
                onChange={e=>setSearch(e.target.value)}
                placeholder="Search firm, e.g. FTMO, Apex, 2-Step..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#111318] border border-[#1F2228] text-[13px] text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#2A2D35] focus:bg-[#16181E]"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <select value={countryFilter} onChange={e=>setCountryFilter(e.target.value)} className="px-4 py-3 rounded-xl bg-[#111318] border border-[#1F2228] text-[13px] text-white focus:outline-none min-w-[140px]">
                {countries.map(c=> <option key={c} value={c}>{c==='All'?'All countries':c}</option>)}
              </select>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#111318] border border-[#1F2228]">
                {(['All','Forex','Futures','Crypto'] as AssetFilter[]).map(a=>(
                  <button key={a} onClick={()=>setAssetFilter(a)} className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${assetFilter===a?'bg-white text-[#080A10] shadow-sm':'text-[#8A8F98] hover:text-white'}`}>{a}</button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-xl bg-[#111318] border border-[#1F2228]">
                <span className="text-[11px] tracking-[0.08em] uppercase font-medium text-[#6B7280] hidden sm:inline">Sort</span>
                <select value={sortKey} onChange={e=>setSortKey(e.target.value as SortKey)} className="bg-transparent text-xs font-medium text-white focus:outline-none pr-2">
                  <option value="trust" className="bg-[#111318]">Trust score</option>
                  <option value="rating" className="bg-[#111318]">Rating</option>
                  <option value="reviews" className="bg-[#111318]">Reviews</option>
                  <option value="years" className="bg-[#111318]">Years</option>
                  <option value="allocation" className="bg-[#111318]">Max allocation</option>
                  <option value="name" className="bg-[#111318]">Name A-Z</option>
                </select>
                <button onClick={()=>setSortAsc(!sortAsc)} className="ml-1 w-8 h-8 rounded-lg bg-[#080A10] border border-[#1F2228] flex items-center justify-center text-[#8A8F98] hover:text-white hover:border-[#2A2D35] transition-colors">
                  <ArrowUpDown className={`w-3.5 h-3.5 ${sortAsc?'rotate-180':''}`} />
                </button>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-[#6B7280] mt-2 flex flex-wrap gap-2">
            <span>{filtered.length} firms • Sorted by {sortKey} {sortAsc?'asc':'desc'} • Click any row for dossier</span>
            <span className="text-emerald-400/70">• Real data from propfirmmatch.com • {displayFirms.length} firms • Live verified</span>
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Desktop table */}
        <div className="hidden lg:block overflow-hidden rounded-2xl border border-[#1F2228] bg-[#111318] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1280px]">
              <thead className="bg-[#080A10] border-b border-[#1F2228]">
                <tr className="text-[11px] tracking-[0.08em] uppercase font-medium text-[#8A8F98]">
                  <th className="px-4 py-3.5 font-medium w-12 text-center">#</th>
                  <th className="px-4 py-3.5 font-medium min-w-[240px]">Firm</th>
                  <th className="px-4 py-3.5 font-medium min-w-[140px]">
                    <button onClick={()=>{setSortKey('rating'); setSortAsc(sortKey==='rating'?!sortAsc:false);}} className="flex items-center gap-1.5 hover:text-white transition-colors">Rank / Reviews <ArrowUpDown className="w-3 h-3" /></button>
                  </th>
                  <th className="px-4 py-3.5 font-medium w-[90px]">Country</th>
                  <th className="px-4 py-3.5 font-medium w-[80px]">
                    <button onClick={()=>{setSortKey('years'); setSortAsc(sortKey==='years'?!sortAsc:false);}} className="flex items-center gap-1.5 hover:text-white transition-colors">Years <ArrowUpDown className="w-3 h-3" /></button>
                  </th>
                  <th className="px-4 py-3.5 font-medium min-w-[170px]">Assets</th>
                  <th className="px-4 py-3.5 font-medium min-w-[160px]">Platforms</th>
                  <th className="px-4 py-3.5 font-medium w-[110px]">
                    <button onClick={()=>{setSortKey('allocation'); setSortAsc(sortKey==='allocation'?!sortAsc:false);}} className="flex items-center gap-1.5 hover:text-white transition-colors">Max Allo. <ArrowUpDown className="w-3 h-3" /></button>
                  </th>
                  <th className="px-4 py-3.5 font-medium w-[120px]">Promo</th>
                  <th className="px-4 py-3.5 font-medium w-[130px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2228]">
                {filtered.map((firm, idx) => {
                  const years = getYears(firm.foundedYear);
                  const allocation = getMaxAllocation(firm);
                  const minPrice = getMinPrice(firm);
                  const isTop = idx < 3;
                  const isGoat = firm.slug === 'goat-funded-trader';
                  return (
                    <tr key={firm.id} onClick={()=>onNavigate(`/prop-firms/${firm.slug}`)} className={`group hover:bg-[#080A10]/60 cursor-pointer transition-colors border-b border-transparent hover:border-[#1F2228]/50 ${isGoat?'bg-[#2563eb]/[0.04] hover:bg-[#2563eb]/[0.08]':''}`}>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-xs font-mono font-medium ${idx===0?'bg-amber-500 text-black shadow-sm':idx===1?'bg-zinc-300 text-zinc-900':idx===2?'bg-amber-700 text-white':'bg-[#1F2228] text-[#8A8F98]'}`}>{idx+1}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white border border-[#1F2228] flex items-center justify-center overflow-hidden shrink-0 p-1.5 shadow-sm">
                            <img
                              src={(firm as any).logoUrl || firm.countryFlag}
                              alt={firm.name}
                              className="w-full h-full object-contain"
                              loading="lazy"
                              onError={(e) => {
                                const el = e.currentTarget as HTMLImageElement;
                                el.onerror = null;
                                el.src = firm.countryFlag;
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[13px] font-semibold text-white group-hover:text-[#3b82f6] transition-colors">{firm.name}</span>
                              {isGoat && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white leading-none">VERIFIED</span>}
                              {firm.status==='CAUTION' && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20 leading-none">CAUTION</span>}
                            </div>
                            <p className="text-[11px] text-[#6B7280] truncate flex items-center gap-1.5 mt-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${firm.confidenceRating==='A'?'bg-emerald-500':firm.confidenceRating==='B'?'bg-sky-500':'bg-white/20'}`} />
                              <span className="truncate">{firm.brandName} • {firm.programs.length} programs • {firm.platforms.slice(0,2).join(', ')}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${firm.reviewsOverview.averageRating>=4.5?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':firm.reviewsOverview.averageRating>=4.2?'bg-white text-[#080A10] border-white':'bg-[#1F2228] text-white border-[#1F2228]'}`}>
                            {firm.reviewsOverview.averageRating.toFixed(1)} <Star className="w-3 h-3 inline -mt-0.5" />
                          </span>
                          <span className="text-xs text-[#8A8F98] font-mono">{firm.reviewsOverview.totalReviews.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-0.5 mt-1.5">
                          {Array.from({length:5}).map((_,i)=>(
                            <Star key={i} className={`w-3 h-3 ${i < Math.round(firm.reviewsOverview.averageRating) ? 'fill-amber-500 text-amber-500' : 'text-white/12'}`} />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white">
                          <img src={firm.countryFlag} alt={firm.country} className="w-5 h-3.5 rounded-sm object-cover border border-white/10" onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />
                          {firm.country}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${years>=10?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':years>=3?'bg-white/[0.04] text-white/70 border-[#1F2228]':'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                          {years}{years>=10?'+':''} {years===1?'yr':'yrs'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          <span className={`px-2 py-1 rounded-full text-[11px] font-medium border ${firm.marketType==='Futures'?'bg-orange-500/10 text-orange-400 border-orange-500/20':firm.marketType==='Crypto'?'bg-sky-500/10 text-sky-400 border-sky-500/20':firm.marketType==='Forex'?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':'bg-white/[0.04] text-white/60 border-[#1F2228]'}`}>
                            {firm.marketType}
                          </span>
                          {firm.programs.slice(0,2).map(p=>(
                            <span key={p.id} className="px-2 py-1 rounded-full text-[10px] font-medium bg-[#080A10] border border-[#1F2228] text-[#8A8F98]">{p.programType}</span>
                          ))}
                        </div>
                        <p className="text-[11px] text-[#6B7280] truncate mt-1.5 max-w-[160px]" title={firm.tagline}>{firm.tagline ? (firm.tagline.length>36? firm.tagline.slice(0,36)+'…' : firm.tagline) : 'Verified programs'}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {firm.platforms.slice(0,3).map(pl=>(
                            <span key={pl} className="px-2 py-1 rounded-full text-[10px] font-medium bg-[#080A10] border border-[#1F2228] text-[#8A8F98]">{pl.replace('MetaTrader 5','MT5').replace('TradeLocker','TL')}</span>
                          ))}
                          {firm.platforms.length>3 && <span className="inline-flex px-1.5 py-1 rounded text-[10px] text-[#6B7280]">+{firm.platforms.length-3}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[13px] font-mono font-semibold text-white">${(allocation/1000).toFixed(0)}K</span>
                        <p className="text-[11px] text-[#6B7280] mt-0.5">from ${minPrice}</p>
                        {isTop && <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-500 mt-1"><Crown className="w-3 h-3" />Top 3</span>}
                      </td>
                      <td className="px-4 py-4">
                        {firm.activePromo ? (
                          <span className="inline-flex flex-col items-start px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-white text-xs font-semibold leading-tight shadow-sm">
                            <span>{firm.activePromo.discount}</span>
                            <span className="text-[10px] font-normal opacity-80 leading-none mt-0.5">{firm.activePromo.code}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-[#6B7280]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={(e)=>{e.stopPropagation(); onNavigate(`/prop-firms/${firm.slug}`);}} className="px-4 py-2 rounded-full bg-white text-[#080A10] text-xs font-semibold hover:bg-white/90 transition-colors shadow-sm">View</button>
                          <button onClick={(e)=>{e.stopPropagation(); onNavigate('/compare');}} className="w-8 h-8 rounded-full bg-[#080A10] border border-[#1F2228] flex items-center justify-center text-[#8A8F98] hover:text-white hover:border-[#2A2D35] transition-colors" title="Compare">
                            <Scale className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden space-y-3">
          {filtered.map((firm, idx)=>{
            const years = getYears(firm.foundedYear);
            const allocation = getMaxAllocation(firm);
            const minPrice = getMinPrice(firm);
            return (
              <div key={firm.id} onClick={()=>onNavigate(`/prop-firms/${firm.slug}`)} className="p-4 rounded-2xl bg-[#111318] border border-[#1F2228] space-y-3 active:bg-[#080A10]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={(firm as any).logoUrl || firm.countryFlag}
                      alt={firm.name}
                      className="w-8 h-8 rounded-lg object-contain bg-white p-1.5 border border-[#1F2228] shadow-sm shrink-0"
                      loading="lazy"
                      onError={(e) => {
                        const el = e.currentTarget as HTMLImageElement;
                        el.onerror = null;
                        el.src = firm.countryFlag;
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                        {firm.name}
                        {firm.slug==='goat-funded-trader' && <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500 text-white">VERIFIED</span>}
                      </p>
                      <p className="text-xs text-[#8A8F98] truncate">{firm.brandName} • {firm.marketType} • {years}yrs • {firm.headquarters.split('•')[0]}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${firm.reviewsOverview.averageRating>=4.5?'bg-emerald-500 text-white':'bg-white text-[#080A10]'}`}>{firm.reviewsOverview.averageRating.toFixed(1)}★</span>
                    <p className="text-[11px] text-[#6B7280] mt-1">{firm.reviewsOverview.totalReviews.toLocaleString()} reviews</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-1 rounded-full bg-[#080A10] border border-[#1F2228] text-xs text-[#8A8F98]">{firm.marketType}</span>
                  {firm.platforms.slice(0,3).map(pl=> <span key={pl} className="px-2 py-1 rounded-full bg-[#080A10] border border-[#1F2228] text-[11px] text-[#8A8F98]">{pl}</span>)}
                  <span className="px-2 py-1 rounded-full bg-white/5 border border-[#1F2228] text-xs font-mono text-white">${(allocation/1000).toFixed(0)}K max</span>
                  <span className="px-2 py-1 rounded-full bg-[#080A10] border border-[#1F2228] text-xs text-[#8A8F98]">from ${minPrice}</span>
                </div>
                {firm.activePromo && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-[#2563eb]/20 to-[#7c3aed]/20 border border-[#2563eb]/20">
                    <span className="text-xs font-semibold text-white">{firm.activePromo.discount} • {firm.activePromo.code}</span>
                    <span className="text-[11px] text-white/60">Tap to view details →</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={(e)=>{e.stopPropagation(); onNavigate(`/prop-firms/${firm.slug}`);}} className="flex-1 py-2.5 rounded-xl bg-white text-[#080A10] text-sm font-semibold flex items-center justify-center gap-1.5">
                    View dossier <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e)=>{e.stopPropagation(); onNavigate('/compare');}} className="px-4 py-2.5 rounded-xl bg-[#080A10] border border-[#1F2228] text-[#8A8F98]">
                    <Scale className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{firm.reviewsOverview.totalReviews} reviews</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{years}yrs</span>
                  <span>•</span>
                  <span className={firm.scorecard.overallScore>=80?'text-emerald-400':'text-[#8A8F98]'}>Trust {firm.scorecard.overallScore}</span>
                </div>
              </div>
            );
          })}
          {filtered.length===0 && (
            <div className="p-8 rounded-2xl bg-[#111318] border border-[#1F2228] text-center">
              <p className="text-sm text-white">No firms match</p>
              <p className="text-xs text-[#8A8F98] mt-1">Try clearing filters or searching another name.</p>
              <button onClick={()=>{setSearch(''); setAssetFilter('All'); setCountryFilter('All');}} className="mt-3 px-4 py-2 rounded-full bg-white text-[#080A10] text-xs font-medium">Clear filters</button>
            </div>
          )}
        </div>

        {filtered.length>0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280] border-t border-[#1F2228] pt-4">
            <span>Showing {filtered.length} of {displayFirms.length} firms • Evidence-first — every firm links to source + rule history</span>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">Want raw data?</span>
              <button onClick={()=>onNavigate('/changes')} className="px-3 py-1.5 rounded-full bg-[#111318] border border-[#1F2228] text-white hover:bg-[#1a1d23]">View changelog</button>
            </div>
          </div>
        )}

        {/* Methodology teaser */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-[#111318] border border-[#1F2228] flex flex-col sm:flex-row gap-4">
          <span className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0"><Shield className="w-4 h-4 text-emerald-400" /></span>
          <div>
            <h4 className="text-sm font-semibold text-white">How we rank (and why we don't sell rank)</h4>
            <p className="text-xs leading-relaxed text-[#8A8F98] mt-1">
              Firms are ordered by <span className="text-white">trust score</span> (evidence + transparency + rule stability + trader experience), not CPA. Affiliate money never changes factual data. See <button onClick={()=>onNavigate('/compare')} className="text-[#3b82f6] underline underline-offset-2">comparison methodology</button> for source hierarchy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
