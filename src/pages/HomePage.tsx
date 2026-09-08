import React, { useState, useEffect } from 'react';
import { PROP_FIRMS_DATA, RULE_GUIDES } from '../data/propFirmsData.ts';
import { getCanonicalStats } from '../core/canonical/store.ts';
import { SourceEvidence } from '../types/schema.ts';
import { PropFirmsTable } from '../components/directory/PropFirmsTable.tsx';
import { RiskSimulator } from '../components/simulator/RiskSimulator.tsx';
import { HeroIntelligenceCard } from '../components/hero/HeroIntelligenceCard.tsx';
import {
  Shield,
  ArrowRight,
  Scale,
  AlertTriangle,
  History,
  CheckCircle2,
  Layers,
  Building,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  TrendingDown,
  Layers2,
  Clock3,
  ShieldAlert,
  Activity,
  Boxes,
  Timer,
  Zap,
  Search,
  FileText,
  BookOpen,
  FileCheck,
  Banknote,
  GitMerge,
  Calculator,
  Lightbulb,
  Vote,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  onOpenSource: (evidence: SourceEvidence, ruleTitle: string) => void;
}

const getRiskLabel = (score: number): { label: string; dot: string } => {
  if (score >= 300) return { label: 'Critical', dot: 'bg-red-500' };
  if (score >= 200) return { label: 'High', dot: 'bg-orange-500' };
  if (score >= 140) return { label: 'Medium', dot: 'bg-amber-500' };
  return { label: 'Low', dot: 'bg-white/20' };
};

type CoverageTabId = 'drawdown' | 'position' | 'consistency' | 'time';

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenSearch,
  onOpenSource,
}) => {
  const goatFirm = PROP_FIRMS_DATA[0];
  const canonical = getCanonicalStats();
  const hiddenRules = goatFirm.rules.filter(
    (r) =>
      r.isEasyToMiss &&
      r.sources.some(
        (s) =>
          (s.sourceType === 'OFFICIAL' ||
            s.sourceType === 'OFFICIAL_SUPPORT' ||
            s.sourceType === 'OFFICIAL_TERMS' ||
            s.sourceType === 'FIRM_RESPONSE') &&
          (s.confidence === 'A' || s.confidence === 'B')
      )
  );
  const totalFirms = PROP_FIRMS_DATA.length;
  const totalTiers = PROP_FIRMS_DATA.reduce(
    (acc, f) => acc + f.programs.reduce((a, p) => a + p.accounts.length, 0),
    0
  );
  const allRulesCount = PROP_FIRMS_DATA.reduce((acc, f) => acc + f.rules.length, 0);

  // Coverage tabs (kept for completeness below engine — not in engine itself)
  const [activeTab, setActiveTab] = useState<CoverageTabId>('drawdown');

  const goatAccount = goatFirm.programs.find(p => p.slug === '2-step-standard')?.accounts.find(a=> a.nominalSize===100000) || goatFirm.programs[0]?.accounts[0];
  const dailyLimit = goatAccount?.dailyLossLimit ?? 4;
  const maxLoss = goatAccount?.maxTotalLoss ?? 8;

  const tabs: { id: CoverageTabId; label: string; count: string; sub: string }[] = [
    { id: 'drawdown', label: 'Drawdown & Loss', count: '04 rules', sub: '04 rules' },
    { id: 'position', label: 'Position & Size', count: '02 rules', sub: '02 rules' },
    { id: 'consistency', label: 'Consistency & Behavior', count: '02 rules', sub: '02 rules' },
    { id: 'time', label: 'Time-Based', count: '06 rules', sub: '06 rules' },
  ];

  const drawdownCards = [
    { title: '80% Margin Cap', desc: 'Total margin across all open positions must stay below 80% — enforced only at payout review, never on pricing page.', icon: TrendingDown },
    { title: 'IP / Device Cluster Ban', desc: 'Coordinated address or device patterns flagged as a single cluster — payout review risk.', icon: ShieldAlert },
    { title: 'News 2-Min Buffer', desc: 'No new trade or close within 2 minutes of red-folder events on funded accounts.', icon: Activity },
    { title: 'Instant $50 Trap ($5K)', desc: 'Instant $5K account has hidden $50 max daily — 1% not 4%, buried in FAQ.', icon: Timer },
  ];
  const positionCards = [
    { title: 'Max Lot Cap', desc: 'Caps the largest lot you can open. Blocks trades that would exceed your prop firm’s lot limit.', icon: Boxes },
    { title: 'Max Positions Open', desc: 'Limits concurrent open trades. Prevents over-exposure across correlated pairs.', icon: Layers2 },
    { title: 'Max Lot Aggregate', desc: 'Monitors total lots across all open positions — not just per-trade size.', icon: SlidersHorizontal },
    { title: 'Margin Utilization Guard', desc: 'Warns when margin usage crosses 80% — the hidden gambling-style breach.', icon: AlertTriangle },
  ];
  const consistencyCards = [
    { title: 'Consistency Rule Monitor', desc: 'No single day or trade can dominate your target. Tracks 15% consistency in real time.', icon: Scale },
    { title: 'Gambling Behavior Shield', desc: 'Flags martingale, all-in sizing, and revenge-trading patterns before payout review.', icon: Zap },
    { title: 'Copy Trade Cluster Guard', desc: 'Detects synchronized signal copying flagged as coordinated trading.', icon: Eye },
    { title: 'Strategy Drift Alert', desc: 'Notifies when lot size or frequency deviates dangerously from your plan.', icon: History },
  ];
  const timeCards = [
    { title: 'Daily Cut-Off Guard', desc: 'Enforces server-day reset at 00:00 CE(S)T — no timezone confusion.', icon: Clock3 },
    { title: 'News Buffer (2-Min Rule)', desc: 'Blocks entries/exits 2 min before & after red-folder news on funded accounts.', icon: AlertTriangle },
    { title: 'Weekend Hold Guard', desc: 'Prevents forbidden weekend holding where it triggers breach.', icon: History },
    { title: 'Inactivity Lockout Watch', desc: 'Counts 30-day inactivity window — pings you before your account is auto-disabled.', icon: Eye },
  ];
  const extraTimeCards = [
    { title: 'Trading Hours Fence', desc: 'Restricts trading to allowed session windows per firm policy.', icon: Timer },
    { title: 'Payout Day Counter', desc: 'Tracks 4 active trading days required before funded withdrawals unlock.', icon: CheckCircle2 },
  ];
  const getCardsForTab = () => {
    if (activeTab === 'drawdown') return drawdownCards;
    if (activeTab === 'position') return positionCards;
    if (activeTab === 'consistency') return consistencyCards;
    if (activeTab === 'time') return [...timeCards, ...extraTimeCards].slice(0, 4);
    return drawdownCards;
  };

  const scrollToEngine = () => {
    document.getElementById('intelligence-engine')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#080A10] pb-16 overflow-x-hidden">
      {/* ================= HERO — PREMIUM FIRST VIEWPORT (75-90% fitted) ================= */}
      <section className="relative flex items-center overflow-hidden min-h-[78vh] lg:min-h-[82vh] max-h-[860px] py-6 sm:py-7 lg:py-6 xl:py-7">
        {/* depth layers */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-20 w-[560px] h-[460px] rounded-full bg-white/[0.025] blur-3xl" />
          <div className="absolute top-0 right-0 w-[720px] h-[520px] rounded-full bg-[#2563eb]/[0.065] blur-3xl" />
          <div className="absolute top-[58%] left-1/2 -translate-x-1/2 w-[1100px] h-[1px] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
          <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />
        </div>

        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-12 items-center">
            {/* Left — editorial column */}
            <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center lg:pr-4 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-[#111318] border border-[#1F2228]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                  <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-white/70">Independent</span>
                </span>
                <span className="inline-flex items-center h-7 px-2.5 rounded-full bg-[#111318] border border-[#1F2228] text-[10px] font-medium tracking-[0.08em] uppercase text-white/70">
                  Evidence-backed
                </span>
                <span className="inline-flex items-center h-7 px-2.5 rounded-full bg-[#111318] border border-[#1F2228] text-[10px] font-medium tracking-[0.08em] uppercase text-white/70">
                  No affiliate bias
                </span>
              </div>

              <h1 className="mt-5 text-[30px] sm:text-[38px] lg:text-[42px] xl:text-[46px] font-bold tracking-[-0.032em] leading-[1.05] text-white">
                Know the rules
                <span className="block text-[#3b82f6]">before you pay</span>
                for the challenge.
              </h1>

              <p className="mt-4 text-[14px] sm:text-[15px] leading-relaxed text-white/60 max-w-[500px]">
                Every FAQ, term sheet and payout policy — read and cited. No affiliate hype. Know the traps before you buy the challenge.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onNavigate('/wizard')}
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[14px] font-semibold shadow-[0_8px_24px_rgba(37,99,235,0.28)] transition-colors"
                >
                  Find My Best Match
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/prop-firms')}
                  className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-xl bg-transparent hover:bg-white/[0.04] border border-white/12 text-white/80 hover:text-white text-[14px] font-medium transition-colors"
                >
                  Explore All {PROP_FIRMS_DATA.length} Firms
                </button>
                <button
                  type="button"
                  onClick={onOpenSearch}
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-xl bg-[#111318] hover:bg-[#16181E] border border-[#1F2228] text-white/60 hover:text-white text-[13px] font-mono transition-colors"
                  aria-label="Quick search modal"
                >
                  <Search className="w-4 h-4 text-white/40" />
                  <span>Search rules or firms...</span>
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] text-white/40 border border-white/10">⌘K</kbd>
                </button>
              </div>

              <div className="mt-6 max-w-[460px]">
                <div className="grid grid-cols-3 gap-px rounded-xl overflow-hidden bg-[#1F2228] border border-[#1F2228]">
                  <div className="bg-[#111318] px-3 py-3">
                    <p className="text-[17px] font-semibold tabular-nums tracking-tight text-white leading-none">{canonical.rules}</p>
                    <p className="mt-1.5 text-[10px] leading-snug text-white/40">rules verified</p>
                  </div>
                  <div className="bg-[#111318] px-3 py-3">
                    <p className="text-[17px] font-semibold tabular-nums tracking-tight text-white leading-none">{canonical.firms}</p>
                    <p className="mt-1.5 text-[10px] leading-snug text-white/40">firms indexed</p>
                  </div>
                  <div className="bg-[#111318] px-3 py-3">
                    <p className="text-[17px] font-semibold tracking-tight text-white leading-none truncate">{canonical.lastVerified !== 'Unknown' ? canonical.lastVerified : 'Pending'}</p>
                    <p className="mt-1.5 text-[10px] leading-snug text-white/40">last verified</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  {(goatAccount?.platforms ?? goatFirm.platforms.slice(0, 3)).map((platform) => (
                    <span
                      key={platform}
                      className="inline-flex items-center h-6 px-2 rounded-md bg-white/[0.04] border border-white/[0.07] text-[11px] text-white/55"
                    >
                      {platform}
                    </span>
                  ))}
                  <span className="inline-flex items-center h-6 px-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-300/90">
                    {goatFirm.rules.length} rules enforced
                  </span>
                </div>
              </div>
            </div>

            {/* Right — live instrument */}
            <div className="lg:col-span-7 xl:col-span-7 lg:pl-2 min-w-0">
              <div className="relative">
                <div className="pointer-events-none absolute -inset-6 rounded-[28px] bg-[#2563eb]/[0.06] blur-3xl" />
                <div className="relative">
                  <HeroIntelligenceCard onOpenFirm={(slug) => onNavigate(`/prop-firms/${slug}`)} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* bottom hint — ensures next section peeks */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-white/[0.03]" />
      </section>

      {/* ================= INTELLIGENCE ENGINE — replaces protection-engine ================= */}
      <section id="intelligence-engine" className="relative py-10 sm:py-14 border-y border-[#1F2228]/60 bg-[#080A10] overflow-hidden">
        {/* subtle grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111318] border border-[#1F2228] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono tracking-[0.14em] uppercase text-white/55">Source → Rule → Risk → Decision</span>
            </div>
            <h2 className="text-[26px] sm:text-[36px] font-bold tracking-tight leading-tight text-white">
              Every rule they make you find. <span className="bg-gradient-to-r from-emerald-400 to-[#2563eb] bg-clip-text text-transparent">We bring it together.</span>
            </h2>
            <p className="mt-3 text-[13.5px] leading-relaxed text-white/45 max-w-[640px] mx-auto">
              We read public firm pages, connect the evidence, uncover easy-to-miss conditions, explain the rules in plain English, and show exactly how they affect your account.
            </p>
          </div>

          <div className="mt-8">
            <IntelligenceEngineAnimation dailyLimit={dailyLimit} maxLoss={maxLoss} />
          </div>
        </div>
      </section>

      {/* Coverage explorer (kept, but moved below engine) */}
      <section id="coverage-section" className="py-9 sm:py-12 bg-[#080A10]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#111318] border border-[#1F2228] mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-400/80">Explore by category</span>
            </div>
            <h3 className="text-[20px] sm:text-[26px] font-bold tracking-tight text-white leading-tight">
              Every hidden rule that affects payouts. <span className="text-white/40">Browse by risk.</span>
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/40">
              Pick a category. See what we flag. Rules you set sober, enforced the moment they’re breached.
            </p>
          </div>

          <div className="mt-5 rounded-xl overflow-hidden bg-[#111318] border border-[#1F2228] grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-12">
              <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[#1F2228]">
                {tabs.map((t) => {
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`relative text-left px-3 sm:px-4 py-4 flex flex-col gap-1 border-r last:border-r-0 border-[#1F2228] transition-colors ${isActive ? 'bg-white/[0.04]' : 'bg-transparent hover:bg-white/[0.02]'}`}
                    >
                      {isActive && <div className="absolute inset-x-0 bottom-0 h-px bg-emerald-500/60" />}
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded flex items-center justify-center ${isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.04] text-white/30'}`}>
                          {t.id === 'drawdown' && <TrendingDown className="w-3.5 h-3.5" />}
                          {t.id === 'position' && <Boxes className="w-3.5 h-3.5" />}
                          {t.id === 'consistency' && <Clock3 className="w-3.5 h-3.5" />}
                          {t.id === 'time' && <Timer className="w-3.5 h-3.5" />}
                        </span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                      </div>
                      <span className={`text-xs font-semibold leading-tight ${isActive ? 'text-white' : 'text-white/60'}`}>{t.label}</span>
                      <span className="text-[10px] font-mono tracking-widest uppercase text-white/25">{t.sub}</span>
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {getCardsForTab().map((card, idx) => (
                  <button
                    key={card.title}
                    type="button"
                    onClick={() => onNavigate('/rules')}
                    className={`text-left p-5 flex flex-col gap-3 border-[#1F2228] transition-colors hover:bg-white/[0.02] cursor-pointer group ${idx % 4 !== 3 ? 'lg:border-r' : ''} ${idx < 2 ? 'border-b lg:border-b-0' : idx < getCardsForTab().length - 2 ? 'border-b' : ''} sm:border-b-0 border-b last:border-b-0`}
                  >
                    <span className="w-7 h-7 rounded bg-[#1a1c22] group-hover:bg-[#2563eb]/15 border border-[#1F2228] group-hover:border-[#2563eb]/30 flex items-center justify-center transition-colors">
                      <card.icon className="w-3.5 h-3.5 text-white/40 group-hover:text-[#3b82f6]" />
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-white group-hover:text-[#60a5fa] leading-tight transition-colors">{card.title}</h4>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-white/35">{card.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hidden Rules + Stats + Directory + Guides + Simulator + Trust */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {hiddenRules.length > 0 && (
          <section>
            <div className="rounded-xl overflow-hidden bg-[#111318] border border-amber-500/15">
              <div className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/10 bg-amber-500/[0.04]">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-white leading-tight">Hidden conditions detected — read before you buy</h2>
                    <p className="text-[13px] leading-relaxed text-white/40 mt-1 max-w-2xl">These are enforceable rules found outside pricing pages — buried in FAQs or terms. Traders only discover them at payout review.</p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('/rules')}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white text-[#080A10] text-sm font-medium hover:bg-white/90 shrink-0 min-h-[44px]"
                >
                  Browse All Hidden Rules <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 sm:p-4 bg-[#080A10]/40">
                {hiddenRules.slice(0, 3).map((rule) => {
                  const risk = getRiskLabel(rule.easyToMissRisk);
                  return (
                    <div key={rule.id} className="p-4 rounded-xl bg-[#080A10] border border-[#1F2228] space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${risk.dot} shrink-0`} />
                        <span className="text-[11px] font-mono font-semibold tracking-wide uppercase text-white/40">{risk.label} risk</span>
                        <span className="ml-auto text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#111318] border border-[#1F2228] text-white/30">{rule.category}</span>
                      </div>
                      <h3 className="text-[13px] font-medium text-white leading-snug line-clamp-2">{rule.name}</h3>
                      <p className="text-xs leading-relaxed text-white/40 line-clamp-2">{rule.plainEnglish}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { value: `${totalFirms}`, label: 'Firms indexed', sub: 'Evidence verified', icon: Building },
            { value: `${totalTiers}`, label: 'Account tiers', sub: '$5K — $200K', icon: Layers },
            { value: `${allRulesCount}`, label: 'Rules verified', sub: 'With source + proof', icon: Shield },
            { value: `${hiddenRules.length}`, label: 'Hidden conditions', sub: 'Flagged with source', icon: Eye },
          ].map((stat, i) => (
            <div key={i} className="p-4 sm:p-5 rounded-xl bg-[#111318] border border-[#1F2228] flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1a1d23] border border-[#1F2228] flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-white/40" />
              </div>
              <div>
                <div className="text-[22px] font-semibold text-white tracking-tight leading-none font-mono">{stat.value}</div>
                <div className="text-[13px] font-medium text-white mt-1 leading-none">{stat.label}</div>
                <div className="text-xs font-mono text-white/30 mt-1 leading-none">{stat.sub}</div>
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight">Firm directory</h2>
              <p className="text-sm text-white/40 mt-1">Compare verified rules, not marketing. Every claim has a source.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs font-mono text-white/30">{totalFirms} firms · {totalTiers} tiers · updated weekly</span>
              <button
                onClick={() => onNavigate('/prop-firms')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-[#080A10] text-xs font-semibold hover:bg-white/90 min-h-[44px]"
              >
                View all firms <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('/compare')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#111318] border border-[#1F2228] hover:bg-[#1a1d23] text-xs font-medium text-white/70 hover:text-white min-h-[44px]"
              >
                <Scale className="w-3.5 h-3.5" /> Compare
              </button>
            </div>
          </div>
          <div className="rounded-xl bg-[#111318] border border-[#1F2228] p-3 sm:p-4">
            <PropFirmsTable firms={PROP_FIRMS_DATA} onNavigate={onNavigate} onOpenSource={onOpenSource} />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-xl bg-[#111318] border border-[#1F2228] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#1a1d23] border border-[#1F2228] flex items-center justify-center">
                <History className="w-3.5 h-3.5 text-white/40" />
              </span>
              <h3 className="text-sm font-semibold text-white">Rule guides — plain English</h3>
            </div>
            <p className="text-sm leading-relaxed text-white/40">Master the math behind drawdowns, consistency rules, news buffers and inactivity limits — with formulas and real dollar examples.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {RULE_GUIDES.slice(0, 4).map((g) => (
                <button
                  key={g.slug}
                  onClick={() => onNavigate(`/rules/${g.slug}`)}
                  className="text-left p-4 rounded-xl bg-[#080A10] border border-[#1F2228] hover:border-[#2563eb]/30 hover:bg-[#0e1016] transition-colors group"
                >
                  <span className="text-[11px] font-mono font-semibold tracking-wide uppercase text-white/30">{g.category}</span>
                  <span className="block text-sm font-medium text-white mt-1 leading-tight group-hover:text-white">{g.name}</span>
                  <span className="block text-xs text-white/40 mt-1.5 line-clamp-2 leading-relaxed">{g.shortDefinition}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-white/30 mt-3 group-hover:text-white">Read guide <ChevronRight className="w-3 h-3" /></span>
                </button>
              ))}
            </div>
            <button onClick={() => onNavigate('/rules')} className="text-sm font-medium text-white/40 hover:text-white inline-flex items-center gap-1">
              All guides <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="lg:col-span-5 rounded-xl bg-[#111318] border border-[#1F2228] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#1a1d23] border border-[#1F2228] flex items-center justify-center">
                <SlidersHorizontal className="w-3.5 h-3.5 text-white/40" />
              </span>
              <h3 className="text-sm font-semibold text-white">Try the risk simulator</h3>
            </div>
            <p className="text-sm leading-relaxed text-white/40">Test a $100k account against real drawdown floors — see exactly when daily or max loss would trigger.</p>
            <div className="rounded-xl overflow-hidden border border-[#1F2228] bg-[#080A10]">
              <RiskSimulator
                initialNominalSize={100000}
                initialDailyLossPct={4}
                initialMaxLossPct={8}
                initialDrawdownType="static"
              />
            </div>
          </div>
        </section>

        <section>
          <div className="relative rounded-xl overflow-hidden border border-[#1F2228] bg-[#111318] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none" />
            <div className="relative max-w-xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#080A10] border border-[#1F2228] text-[11px] font-mono tracking-wide uppercase text-white/30 mb-3">
                Why traders trust us
              </div>
              <h3 className="text-[16px] sm:text-[18px] font-semibold tracking-tight text-white">Built for clarity, not hype.</h3>
              <p className="text-sm leading-relaxed text-white/40 mt-2">No affiliate rankings. No paid placements. Every rule shows its source, every drawdown shows its math, every trader claim stays separate from official terms.</p>
            </div>
            <div className="relative flex flex-wrap gap-2 lg:justify-end">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-[#080A10] border border-[#1F2228] text-xs font-mono text-white/60 min-h-[44px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Evidence-first
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-[#080A10] border border-[#1F2228] text-xs font-mono text-white/60 min-h-[44px]">
                <Shield className="w-3.5 h-3.5 text-white/40" /> Deterministic math
              </span>
              <button
                onClick={() => onNavigate('/prop-firms')}
                className="px-5 py-2.5 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold shadow-lg shadow-[#2563eb]/20 transition-colors"
              >
                Explore Verified Prop Firms <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

/* ================= INTELLIGENCE ENGINE ANIMATED VISUAL ================= */
const IntelligenceEngineAnimation: React.FC<{ dailyLimit: number; maxLoss: number }> = ({ dailyLimit, maxLoss }) => {
  const [activeSource, setActiveSource] = useState(0);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setInterval(() => setActiveSource((s) => (s + 1) % 4), 1400);
    const t2 = setInterval(() => setPhase((p) => (p + 1) % 6), 1800);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const sources = [
    { id: 'pricing', label: 'Official Website', sub: 'Pricing Page', icon: FileText, detail: 'Model · Prices · Promo', accent: 'emerald' },
    { id: 'faq', label: 'FAQ / Help Center', sub: 'support.goat...', icon: BookOpen, detail: 'Daily loss · FAQ', accent: 'sky' },
    { id: 'terms', label: 'Terms & Conditions', sub: 'Legal · 12 sections', icon: FileCheck, detail: 'Inactivity · Copy', accent: 'amber' },
    { id: 'payout', label: 'Payout Rules', sub: 'Rewards · Payout', icon: Banknote, detail: 'On-demand · 4 days', accent: 'emerald' },
  ] as const;

  const classifications = ['VERIFIED', 'CONDITIONAL', 'EASY-TO-MISS', 'CONFLICTING'] as const;
  const activeClass = classifications[phase % 4];
  const activeDecision = ['SAFE', 'WATCH', 'HIGH IMPACT'][phase % 3] as string;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#0E0F14] border border-[#1E232B] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      {/* grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent" />

      {/* Desktop layout */}
      <div className="relative hidden lg:grid grid-cols-12 gap-0 min-h-[420px]">
        {/* Left: sources  */}
        <div className="col-span-4 p-5 border-r border-white/[0.06] bg-white/[0.01] space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-[0.16em] uppercase text-white/30">Official sources</span>
            <span className="ml-auto text-[10px] font-mono text-emerald-400">35 pages · 4 origins</span>
          </div>
          {sources.map((s, idx) => {
            const isActive = activeSource === idx;
            return (
              <div
                key={s.id}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-500 ${isActive ? 'bg-white/[0.06] border-emerald-500/25 shadow-[0_0_20px_rgba(16,185,129,0.08)] translate-x-1' : 'bg-[#0a0c10] border-white/[0.05] opacity-70'}`}
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${isActive ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-300' : 'bg-[#111318] border-white/[0.06] text-white/30'}`}>
                  <s.icon className="w-4 h-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-medium leading-none ${isActive ? 'text-white' : 'text-white/70'}`}>{s.label}</div>
                  <div className="text-[11px] font-mono text-white/30 truncate">{s.sub} · {s.detail}</div>
                </div>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'bg-white/15'}`} />
                {/* thin line to center */}
                <div className={`hidden lg:block absolute top-1/2 -right-5 w-5 h-px transition-colors duration-500 ${isActive ? 'bg-emerald-500/40' : 'bg-white/[0.06]'}`} />
              </div>
            );
          })}
          <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-white/25">
            <span className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" /> Reading sources · independent
          </div>
        </div>

        {/* Center: RULE FOUND node */}
        <div className="col-span-4 p-5 flex flex-col items-center justify-center relative border-r border-white/[0.06]">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.04] via-transparent to-sky-500/[0.03] pointer-events-none" />
          {/* vertical connector stub */}
          <div className="relative flex flex-col items-center gap-3 w-full max-w-[280px]">
            {/* central node */}
            <div className="relative">
              <div className="absolute -inset-3 rounded-full bg-emerald-500/10 blur-xl animate-pulse" />
              <div className="relative w-[148px] h-[148px] rounded-full bg-[#0a0c10] border border-emerald-500/25 shadow-[0_0_30px_rgba(16,185,129,0.15),inset_0_1px_0_rgba(255,255,255,0.06)] flex flex-col items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mb-2">
                  <GitMerge className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-[11px] font-mono tracking-[0.18em] uppercase text-emerald-300 font-semibold">Rule Found</div>
                <div className="text-[10px] font-mono text-white/35 mt-1">Cross-checked</div>
                <div className="mt-2 w-6 h-px bg-emerald-500/30" />
                <div className="mt-2 text-[10px] font-mono text-white/20">Evidence cluster</div>
              </div>
              {/* orbiting dots */}
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)] animate-ping" style={{ animationDuration: '2.2s' }} />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sky-400/70" />
            </div>

            {/* classification */}
            <div className="mt-2 w-full">
              <div className="text-[10px] font-mono tracking-[0.16em] uppercase text-white/25 text-center mb-2">Classification</div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {classifications.map((c) => {
                  const isOn = c === activeClass;
                  return (
                    <span
                      key={c}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold tracking-widest uppercase border transition-all duration-500 ${isOn ? (c === 'VERIFIED' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25 shadow-sm' : c === 'CONDITIONAL' ? 'bg-sky-500/15 text-sky-300 border-sky-500/25' : c === 'EASY-TO-MISS' ? 'bg-amber-500/15 text-amber-300 border-amber-500/25' : 'bg-red-500/15 text-red-300 border-red-500/25') : 'bg-[#111318] text-white/25 border-white/[0.06]'}`}
                    >
                      {c}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* evidence lines */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mt-1" />
          </div>
        </div>

        {/* Right: calculation → decision */}
        <div className="col-span-4 p-5 flex flex-col gap-3 bg-[#0a0c10]/50">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-[0.16em] uppercase text-white/25">Arithmetic & meaning</span>
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="rounded-xl bg-[#111318] border border-white/[0.06] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono tracking-wide uppercase text-white/35 inline-flex items-center gap-1.5"><Calculator className="w-3 h-3" /> $100K Account Example</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">2-Step Standard</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-[#080A10] border border-white/[0.06] p-3">
                <div className="text-[10px] font-mono tracking-widest uppercase text-white/30">Daily</div>
                <div className="text-sm font-mono font-semibold text-white mt-1">{dailyLimit}% = ${(100000 * dailyLimit / 100).toLocaleString()}</div>
                <div className="text-[11px] font-mono text-white/30">floor ${(100000 - 100000 * dailyLimit / 100).toLocaleString()}</div>
              </div>
              <div className="rounded-lg bg-[#080A10] border border-white/[0.06] p-3">
                <div className="text-[10px] font-mono tracking-widest uppercase text-white/30">Max</div>
                <div className="text-sm font-mono font-semibold text-white mt-1">{maxLoss}% = ${(100000 * maxLoss / 100).toLocaleString()}</div>
                <div className="text-[11px] font-mono text-white/30">floor ${(100000 - 100000 * maxLoss / 100).toLocaleString()}</div>
              </div>
            </div>
            <div className="rounded-lg bg-emerald-500/[0.06] border border-emerald-500/15 p-3 flex gap-2">
              <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-mono tracking-wide uppercase text-emerald-300/80">What this means</div>
                <div className="text-xs leading-relaxed text-white/65 mt-1">You can lose ${ (100000 * dailyLimit / 100).toLocaleString()} in one day before instant breach — even if max loss is larger. News buffer and inactivity sit outside this math.</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border p-3 flex items-center justify-between transition-colors duration-500"
            style={{ background: activeDecision === 'SAFE' ? 'rgba(16,185,129,0.08)' : activeDecision === 'WATCH' ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)', borderColor: activeDecision === 'SAFE' ? 'rgba(16,185,129,0.25)' : activeDecision === 'WATCH' ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)' }}>
            <div className="flex items-center gap-2.5">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center border ${activeDecision === 'SAFE' ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-300' : activeDecision === 'WATCH' ? 'bg-amber-500/15 border-amber-500/20 text-amber-300' : 'bg-red-500/15 border-red-500/20 text-red-300'}`}>
                <Vote className="w-4 h-4" />
              </span>
              <div>
                <div className="text-[11px] font-mono tracking-[0.16em] uppercase text-white/40">Trader Decision</div>
                <div className={`text-xs font-mono font-bold tracking-widest ${activeDecision === 'SAFE' ? 'text-emerald-300' : activeDecision === 'WATCH' ? 'text-amber-300' : 'text-red-300'}`}>{activeDecision}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest border ${activeDecision === 'SAFE' ? 'bg-emerald-500 text-white border-emerald-600' : activeDecision === 'WATCH' ? 'bg-amber-500 text-white border-amber-600' : 'bg-red-500 text-white border-red-600'}`}>
                {activeDecision === 'SAFE' ? 'PROCEED' : activeDecision === 'WATCH' ? 'CAUTION' : 'AVOID'}
              </div>
              <div className="text-[10px] font-mono text-white/30 mt-1">Risk-adjusted</div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-white/25 leading-relaxed">
            That’s the intelligence layer — between scattered pages and your decision.
          </div>
        </div>
      </div>

      {/* Mobile: vertical sequence */}
      <div className="lg:hidden p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {sources.map((s, idx) => {
            const isActive = activeSource === idx;
            return (
              <div key={s.id} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${isActive ? 'bg-white/[0.06] border-emerald-500/20' : 'bg-[#0a0c10] border-white/[0.06] opacity-70'}`}>
                <s.icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-white/30'}`} />
                <span className="text-[11px] font-mono text-white/70 leading-none">{s.label}</span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center py-2">
          <div className="w-px h-6 bg-gradient-to-b from-white/[0.08] to-emerald-500/30" />
          <div className="w-28 h-28 rounded-full bg-[#0a0c10] border border-emerald-500/25 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.12)]">
            <GitMerge className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-[10px] font-mono tracking-[0.16em] uppercase text-emerald-300 font-semibold">Rule Found</span>
          </div>
          <div className="w-px h-6 bg-gradient-to-b from-emerald-500/30 to-white/[0.08]" />
          <div className="flex gap-1.5 flex-wrap justify-center">
            {classifications.map(c => (
              <span key={c} className={`px-2 py-1 rounded-full text-[10px] font-mono font-semibold tracking-widest uppercase border ${c === activeClass ? (c === 'VERIFIED' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' : c === 'CONDITIONAL' ? 'bg-sky-500/15 text-sky-300 border-sky-500/25' : c === 'EASY-TO-MISS' ? 'bg-amber-500/15 text-amber-300 border-amber-500/25' : 'bg-red-500/15 text-red-300 border-red-500/25') : 'bg-[#111318] text-white/25 border-white/[0.06]'}`}>{c}</span>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-[#111318] border border-white/[0.06] p-4 space-y-3">
          <div className="text-[11px] font-mono tracking-wide uppercase text-white/35 inline-flex items-center gap-1.5"><Calculator className="w-3 h-3" /> $100K Account Example</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-[#080A10] border border-white/[0.06] p-3">
              <div className="text-[10px] font-mono tracking-widest uppercase text-white/30">Daily</div>
              <div className="text-sm font-mono font-semibold text-white mt-1">{dailyLimit}% = ${(100000 * dailyLimit / 100).toLocaleString()}</div>
            </div>
            <div className="rounded-lg bg-[#080A10] border border-white/[0.06] p-3">
              <div className="text-[10px] font-mono tracking-widest uppercase text-white/30">Max</div>
              <div className="text-sm font-mono font-semibold text-white mt-1">{maxLoss}% = ${(100000 * maxLoss / 100).toLocaleString()}</div>
            </div>
          </div>
          <div className="rounded-lg bg-emerald-500/[0.06] border border-emerald-500/15 p-3">
            <div className="text-[11px] font-mono tracking-wide uppercase text-emerald-300/80">What this means</div>
            <div className="text-xs leading-relaxed text-white/60 mt-1">You can lose ${ (100000 * dailyLimit / 100).toLocaleString()} in one day before breach. Conditions like news buffer sit outside this math.</div>
          </div>
          <div className={`rounded-xl border p-3 flex items-center justify-between ${activeDecision === 'SAFE' ? 'bg-emerald-500/10 border-emerald-500/20' : activeDecision === 'WATCH' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <span className="text-[11px] font-mono tracking-[0.16em] uppercase text-white/40">Trader Decision</span>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest ${activeDecision === 'SAFE' ? 'bg-emerald-500 text-white' : activeDecision === 'WATCH' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'}`}>{activeDecision}</span>
          </div>
        </div>
      </div>

      {/* footer tiny */}
      <div className="relative flex items-center justify-between px-4 py-3 border-t border-white/[0.06] bg-white/[0.02]">
        <span className="text-[11px] font-mono text-white/30">We do the research for you.</span>
        <span className="text-[11px] font-mono text-white/25 inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Independent intelligence layer</span>
      </div>
    </div>
  );
};
