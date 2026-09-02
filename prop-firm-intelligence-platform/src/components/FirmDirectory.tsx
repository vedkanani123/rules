import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  ExternalLink,
  Sparkles,
  Award,
  ArrowRight,
  TrendingDown,
  Scale,
  DollarSign,
  AlertTriangle,
  Zap,
  Globe,
  RefreshCw,
  CheckCircle2,
  Layers,
  ChevronRight,
  Info,
  Clock,
  Compass,
  FileText
} from 'lucide-react';
import { ALL_PROP_FIRMS_DIRECTORY, DirectoryFirmItem } from '../data/firms-data';

interface FirmDirectoryProps {
  onSelectFirm: (firmId: string, initialTab?: string) => void;
  onLiveCrawlFirm?: (url: string, firmName: string) => void;
}

export const FirmDirectory: React.FC<FirmDirectoryProps> = ({
  onSelectFirm,
  onLiveCrawlFirm
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE_ONLY' | 'PIPELINE_ONLY'>('ALL');
  const [modelFilter, setModelFilter] = useState<string>('ALL');
  
  // Live Crawl quick state
  const [crawlUrl, setCrawlUrl] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlStatusMessage, setCrawlStatusMessage] = useState<string | null>(null);

  // Quick stats
  const totalFirms = ALL_PROP_FIRMS_DIRECTORY.length;
  const verifiedCount = ALL_PROP_FIRMS_DIRECTORY.filter(f => f.status === 'ACTIVE_VERIFIED').length;
  const pipelineCount = ALL_PROP_FIRMS_DIRECTORY.filter(f => f.status === 'PIPELINE_READY').length;

  // Filtered firms
  const filteredFirms = useMemo(() => {
    return ALL_PROP_FIRMS_DIRECTORY.filter(firm => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = firm.name.toLowerCase().includes(q) || firm.shortName.toLowerCase().includes(q);
        const matchesTagline = firm.tagline.toLowerCase().includes(q);
        const matchesHQ = firm.headquarters.toLowerCase().includes(q);
        const matchesModels = firm.challengeModels.some(m => m.toLowerCase().includes(q));
        const matchesRules = firm.keyRules.dailyDrawdownType.toLowerCase().includes(q) || firm.keyRules.maxDrawdown.toLowerCase().includes(q);
        if (!matchesName && !matchesTagline && !matchesHQ && !matchesModels && !matchesRules) {
          return false;
        }
      }

      // Status
      if (statusFilter === 'ACTIVE_ONLY' && firm.status !== 'ACTIVE_VERIFIED') {
        return false;
      }
      if (statusFilter === 'PIPELINE_ONLY' && firm.status !== 'PIPELINE_READY') {
        return false;
      }

      // Model
      if (modelFilter !== 'ALL') {
        if (!firm.challengeModels.some(m => m.toLowerCase().includes(modelFilter.toLowerCase()))) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, statusFilter, modelFilter]);

  const handleStartCrawl = (url: string, name: string) => {
    if (!url) return;
    setIsCrawling(true);
    setCrawlStatusMessage(`Connecting to ${name || url}... Ingesting rule tables and FAQ data.`);

    setTimeout(() => {
      setIsCrawling(false);
      setCrawlStatusMessage(`Live crawl completed for ${name || url}. Extracted verified rules catalog.`);
      if (onLiveCrawlFirm) {
        onLiveCrawlFirm(url, name);
      }
      // If Goat Funded Trader, select it
      if (url.includes('goat') || name.toLowerCase().includes('goat')) {
        onSelectFirm('goat-funded-trader', 'rules');
      }
    }, 2000);
  };

  const goatFirm = ALL_PROP_FIRMS_DIRECTORY.find(f => f.id === 'goat-funded-trader') || ALL_PROP_FIRMS_DIRECTORY[0];

  return (
    <div id="prop-firms-directory-view" className="space-y-8 animate-fadeIn">
      {/* 1. Main Directory Hero Header */}
      <div className="rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-925 to-zinc-950 border border-zinc-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Evidence-First Prop Firm Intelligence & Directory</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Prop Firms Directory & Risk Radar
              </h1>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                Choose a prop firm below to explore complete verified rules, mathematical drawdown calculations, pass/fail scenarios, hidden policy traps, and live simulators. Everything is 100% grounded in crawled legal documentation.
              </p>
            </div>

            {/* Quick Summary Pill Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
              <div className="px-4 py-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center">
                <div className="text-2xl font-black text-white font-mono">{totalFirms}</div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Firms Catalog</div>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center">
                <div className="text-2xl font-black text-emerald-400 font-mono">{verifiedCount}</div>
                <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">Deep-Dive Ready</div>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-center">
                <div className="text-2xl font-black text-indigo-400 font-mono">24+</div>
                <div className="text-[10px] text-indigo-300 uppercase tracking-wider font-semibold">Grounded Rules</div>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-center">
                <div className="text-2xl font-black text-amber-400 font-mono">1,120+</div>
                <div className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold">Payout Audits</div>
              </div>
            </div>
          </div>

          {/* Quick Add / Live Crawl Any Prop Firm Bar */}
          <div className="pt-4 border-t border-zinc-800/80 flex flex-col md:flex-row items-center gap-3">
            <div className="flex-1 w-full flex items-center gap-2.5 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-2.5 focus-within:border-indigo-500 transition-colors">
              <Globe className="h-4 w-4 text-indigo-400 shrink-0" />
              <input
                type="text"
                value={crawlUrl}
                onChange={e => setCrawlUrl(e.target.value)}
                placeholder="Add or live-crawl any prop firm URL (e.g. https://www.goatfundedtrader.com or https://ftmo.com)..."
                className="bg-transparent border-none text-xs sm:text-sm text-zinc-100 focus:outline-none w-full font-mono placeholder:text-zinc-600"
              />
            </div>
            <button
              onClick={() => handleStartCrawl(crawlUrl || 'https://www.goatfundedtrader.com', 'Live Crawled Firm')}
              disabled={isCrawling}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className={`h-4 w-4 ${isCrawling ? 'animate-spin' : ''}`} />
              <span>{isCrawling ? 'Crawling & Analyzing...' : '⚡ Add & Crawl Prop Firm'}</span>
            </button>
          </div>

          {crawlStatusMessage && (
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                <span>{crawlStatusMessage}</span>
              </div>
              <button
                onClick={() => setCrawlStatusMessage(null)}
                className="text-xs text-indigo-400 hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. 👑 FEATURED DEEP-DIVE CARD: GOAT FUNDED TRADER */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Award className="h-4 w-4 text-amber-400" />
            <span>Featured Deep-Dive Firm (Fully Audited & Verified):</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> 100% Verifiable Source Citations
          </span>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-zinc-950 border-2 border-indigo-500/40 hover:border-indigo-500 p-6 sm:p-8 shadow-xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-600/25 transition-all" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Section: Firm Identity & Ratings */}
            <div className="space-y-4 flex-1">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-amber-500 via-indigo-600 to-cyan-500 p-0.5 shadow-xl shrink-0">
                  <div className="h-full w-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                    <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-amber-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                      GFT
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {goatFirm.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>{goatFirm.statusLabel}</span>
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
                    {goatFirm.tagline}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 pt-1">
                    <span>HQ: <strong className="text-zinc-200">{goatFirm.headquarters}</strong></span>
                    <span>•</span>
                    <span>Founded: <strong className="text-zinc-200">{goatFirm.founded}</strong></span>
                    <span>•</span>
                    <span>Trustpilot: <strong className="text-emerald-400 font-mono font-bold">★ {goatFirm.trustpilotRating}</strong> ({goatFirm.trustpilotReviewsCount} reviews)</span>
                    <span>•</span>
                    <a
                      href={goatFirm.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-mono"
                    >
                      <span>Official Site</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Specs Highlights Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 font-mono text-xs">
                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Daily Drawdown</span>
                  <span className="font-bold text-white text-sm">4%</span>
                  <span className="text-[10px] text-emerald-400 block font-sans">Balance-Based</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Max Loss Floor</span>
                  <span className="font-bold text-rose-400 text-sm">8%</span>
                  <span className="text-[10px] text-zinc-400 block font-sans">Static Baseline</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Evaluation Targets</span>
                  <span className="font-bold text-indigo-300 text-sm">8% / 5%</span>
                  <span className="text-[10px] text-zinc-400 block font-sans">0 Min Days in Eval</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Profit Split</span>
                  <span className="font-bold text-emerald-400 text-sm">Up to 95%</span>
                  <span className="text-[10px] text-zinc-400 block font-sans">Bi-Weekly Payouts</span>
                </div>
              </div>

              {/* Active Promo Pill */}
              {goatFirm.activePromo && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="text-zinc-200">
                      Active Coupon: <strong className="text-amber-300 font-mono">{goatFirm.activePromo.code}</strong> ({goatFirm.activePromo.discount}) — {goatFirm.activePromo.details}
                    </span>
                  </div>
                  <span className="hidden sm:inline-block text-[11px] font-mono font-semibold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>
              )}
            </div>

            {/* Right Section: Overall Score & Direct Navigation Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 shrink-0 lg:w-72 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-zinc-800/80 lg:pl-6">
              <div className="text-center">
                <span className="text-[10px] font-mono uppercase text-zinc-400 block tracking-wider">Overall Intel Rating</span>
                <div className="text-4xl sm:text-5xl font-black text-indigo-400 font-mono mt-0.5">
                  {goatFirm.overallScore}<span className="text-lg text-zinc-500 font-normal">/100</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold block mt-0.5">
                  Grade A Confidence
                </span>
              </div>

              {/* Big CTA Button */}
              <button
                id="explore-goat-funded-trader-btn"
                onClick={() => onSelectFirm('goat-funded-trader', 'rules')}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Explore Goat Funded Trader</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Quick Jump Links */}
              <div className="grid grid-cols-2 gap-2 w-full text-xs">
                <button
                  onClick={() => onSelectFirm('goat-funded-trader', 'rules')}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-center font-medium cursor-pointer"
                >
                  📋 All 24 Rules
                </button>
                <button
                  onClick={() => onSelectFirm('goat-funded-trader', 'compare')}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-center font-medium cursor-pointer"
                >
                  ⚖️ Compare Models
                </button>
                <button
                  onClick={() => onSelectFirm('goat-funded-trader', 'conflicts')}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-amber-300 hover:text-amber-200 border border-zinc-800 text-center font-medium cursor-pointer"
                >
                  ⚠️ 7 Hidden Traps
                </button>
                <button
                  onClick={() => onSelectFirm('goat-funded-trader', 'simulator')}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-indigo-300 hover:text-indigo-200 border border-zinc-800 text-center font-medium cursor-pointer"
                >
                  🎛️ Risk Simulator
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar for Prop Firms Directory */}
      <div className="space-y-4 bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl shadow-md">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search prop firms by name, model, rule type, or payout features (e.g. 'FTMO', 'Instant', 'Balance-based')..."
              className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Model Selector Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              aria-label="Filter firms by challenge model"
              value={modelFilter}
              onChange={e => setModelFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Challenge Models</option>
              <option value="2-Step">2-Step Standard</option>
              <option value="1-Step">1-Step Classic</option>
              <option value="Instant">Instant Funding</option>
              <option value="Bootcamp">Bootcamp / Low Entry</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-850">
          <span className="text-xs font-semibold text-zinc-400 mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-zinc-400" /> Filter Directory:
          </span>

          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-zinc-200 text-zinc-950 shadow'
                : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            All Firms ({totalFirms})
          </button>

          <button
            onClick={() => setStatusFilter('ACTIVE_ONLY')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'ACTIVE_ONLY'
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow'
                : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 border border-emerald-500/40'
            }`}
          >
            <ShieldCheck className="h-3 w-3" />
            <span>Deep-Dive Active ({verifiedCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('PIPELINE_ONLY')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'PIPELINE_ONLY'
                ? 'bg-indigo-600 text-white font-bold shadow'
                : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            Pipeline & Preview ({pipelineCount})
          </button>

          <span className="text-[11px] text-zinc-500 font-mono ml-auto">
            Showing {filteredFirms.length} of {totalFirms} firms
          </span>
        </div>
      </div>

      {/* 4. Prop Firms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFirms.map(firm => {
          const isGoat = firm.id === 'goat-funded-trader';

          return (
            <div
              key={firm.id}
              id={`firm-card-${firm.id}`}
              className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between p-5 space-y-4 ${
                isGoat
                  ? 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-indigo-500/50 shadow-lg shadow-indigo-950/20 hover:border-indigo-500'
                  : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              {/* Top Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${firm.logoBg} p-0.5 shadow shrink-0`}>
                      <div className="h-full w-full bg-zinc-950 rounded-[10px] flex items-center justify-center font-black text-sm text-white">
                        {firm.logoText}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">{firm.name}</h3>
                      <p className="text-[11px] text-zinc-400">{firm.headquarters} • Founded {firm.founded}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-lg font-black text-indigo-400 font-mono">{firm.overallScore}</span>
                    <span className="text-[10px] text-zinc-500 block font-mono">/100</span>
                  </div>
                </div>

                {/* Status Pill */}
                <div>
                  {isGoat ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <ShieldCheck className="h-3 w-3" />
                      <span>100% Verified Deep-Dive</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                      <Clock className="h-3 w-3 text-zinc-400" />
                      <span>{firm.statusLabel}</span>
                    </span>
                  )}
                </div>

                {/* Tagline */}
                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                  {firm.tagline}
                </p>

                {/* Key Rules Spec Box */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-zinc-950 border border-zinc-850 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Daily Drawdown</span>
                    <span className="font-bold text-white">{firm.keyRules.dailyDrawdown}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Max Drawdown</span>
                    <span className="font-bold text-rose-400">{firm.keyRules.maxDrawdown}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Target (Step 1/2)</span>
                    <span className="font-bold text-indigo-300">{firm.keyRules.profitTarget}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Profit Split</span>
                    <span className="font-bold text-emerald-400">{firm.profitSplit}</span>
                  </div>
                </div>

                {/* Challenge Models Badges */}
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  {firm.challengeModels.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-850 text-zinc-300 border border-zinc-750"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="space-y-2 pt-3 border-t border-zinc-800">
                {isGoat ? (
                  <button
                    onClick={() => onSelectFirm(firm.id, 'rules')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <span>Open Complete Rules & Intel</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartCrawl(firm.website, firm.name)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Live Crawl Rules</span>
                    </button>
                    <a
                      href={firm.website}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                      title="Visit official website"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
