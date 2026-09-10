import React from 'react';
import { RULE_GUIDES } from '../data/propFirmsData.ts';
import { RuleGuideItem } from '../types/schema.ts';
import { Link } from '../components/common/Link.tsx';
import { Breadcrumbs } from '../components/common/Breadcrumbs.tsx';
import {
  BookOpen,
  Calculator,
  Building,
  ArrowLeft,
  ArrowRight,
  FileText,
  Shield,
  Clock,
  Eye,
  Flame,
} from 'lucide-react';

interface RuleGuidePageProps {
  guideSlug: string;
  onNavigate?: (path: string) => void;
}

const SPECIAL_RULE_GUIDES: Record<string, RuleGuideItem> = {
  '1-percent-floating-loss': {
    slug: '1-percent-floating-loss',
    name: '1% Floating Loss Rule & Micro-Loss Tripwires',
    category: 'Risk Management',
    shortDefinition: 'An instant breach triggered when any single open trade floats into a 1% unrealized loss relative to starting account balance.',
    detailedExplanation: 'The 1% floating loss rule is enforced on select instant-funding accounts and aggressive micro-evaluation tiers. Unlike normal daily loss limits that calculate net equity across all trades at day-close, this rule watches individual positions in real time. If a single trade pulls back beyond 1%, the account is immediately breached, regardless of overall daily profit.',
    formula: 'Single Position Loss Floor = Starting Nominal Capital * 1.00%',
    example: 'On a $10,000 account, if your open position hits -$100.01 floating loss, the rule is violated instantly even if you are +$500 in realized profit on the day.',
    howFirmsCalculate: [
      {
        title: 'Intraday Tick Monitoring',
        description: 'Automated bridge server monitoring registers any millisecond breach of the 1% threshold, triggering instant liquidation.',
      },
    ],
    commonMistakes: [
      'Assuming the 4% or 5% daily loss limit gives you room to hold a swing trade.',
      'Failing to set a hard stop-loss inside 0.8% to account for market slippage and spread widening.',
    ],
    firmsUsing: [
      { firmName: 'Goat Funded Trader', modelVariation: 'Instant 5k Micro-Loss threshold' },
    ],
  },
};

export const RuleGuidePage: React.FC<RuleGuidePageProps> = ({ guideSlug }) => {
  const allGuides = [...RULE_GUIDES, ...Object.values(SPECIAL_RULE_GUIDES)];
  const guide: RuleGuideItem =
    allGuides.find((g) => g.slug === guideSlug) ||
    SPECIAL_RULE_GUIDES[guideSlug] ||
    RULE_GUIDES[0];

  const idx = allGuides.findIndex((g) => g.slug === guide.slug);
  const prev = idx > 0 ? allGuides[idx - 1] : null;
  const next = idx < allGuides.length - 1 ? allGuides[idx + 1] : null;

  const FIRM_SLUG_MAP: Record<string, string> = {
    'goat funded trader': 'goat-funded-trader',
    ftmo: 'ftmo',
    'funding pips': 'funding-pips',
    fundednext: 'funded-next',
    'funded next': 'funded-next',
    the5ers: 'the-5ers',
    'the 5ers': 'the-5ers',
    topstep: 'topstep',
    'apex trader funding': 'apex-trader-funding',
    apex: 'apex-trader-funding',
    'take profit trader': 'take-profit-trader',
    'alpha capital': 'alpha-capital',
  };
  const primaryFirmName = guide.firmsUsing?.[0]?.firmName ?? '';
  const primaryFirmSlug = FIRM_SLUG_MAP[primaryFirmName.trim().toLowerCase()] ?? '';
  const primaryFirmHref = primaryFirmSlug ? `/prop-firms/${primaryFirmSlug}` : '/prop-firms';

  const isNewsGuide =
    guide.slug === 'news-trading-restrictions' ||
    guide.slug === 'weekend-overnight' ||
    guide.slug === 'trading-hours-rollover' ||
    guide.slug === 'instruments-hours-trading';
  const isPayoutGuide =
    guide.category === 'Payout Rules' ||
    guide.slug.includes('payout') ||
    guide.slug === 'profit-split-progression' ||
    guide.slug === 'refund-chargeback';
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
    .map((s) => allGuides.find((g) => g.slug === s))
    .filter((g): g is RuleGuideItem => Boolean(g));

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Rules', url: '/rules' },
    { name: guide.name, url: `/rules/${guide.slug}` },
  ];

  return (
    <div className="bg-[#080A10] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Breadcrumbs items={breadcrumbs} className="pt-4" />

        {/* Hero */}
        <div className="pt-4 sm:pt-6 pb-8 border-b border-[#1F2228]">
          <Link
            href="/rules"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#8A8F98] hover:text-white transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Learning Hub
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111318] border border-[#1F2228] text-[11px] font-semibold tracking-wide uppercase text-[#8A8F98] mb-4">
                <BookOpen className="w-3 h-3" /> {guide.category} • Visual Master Guide
              </div>
              <h1 className="text-[28px] sm:text-[40px] lg:text-[48px] font-bold tracking-tight leading-[1.05] text-white max-w-3xl">
                {guide.name}
              </h1>
              <p className="text-[15px] leading-relaxed text-white/50 mt-4 max-w-2xl">
                {guide.shortDefinition}
              </p>
              <p className="text-[13px] leading-relaxed text-[#8A8F98] mt-3 max-w-2xl">
                {guide.detailedExplanation}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111318] border border-[#1F2228] text-xs font-medium text-[#8A8F98]">
                  <Clock className="w-3.5 h-3.5" /> 5 min • Interactive
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
                  <Eye className="w-3.5 h-3.5" /> Live visual
                </span>
                <Link
                  href="/simulator"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111318] border border-[#1F2228] text-xs font-medium text-[#8A8F98] hover:text-white"
                >
                  <Calculator className="w-3.5 h-3.5" /> Test in Simulator
                </Link>
              </div>
            </div>
            <div className="shrink-0 flex flex-col gap-2 lg:text-right">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111318] border border-[#1F2228] text-xs text-[#8A8F98]">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Verified vs official FAQ & Terms
              </div>
              <p className="text-[11px] text-white/30">
                Applies to {(guide.firmsUsing || []).length} firms • {guide.category}
                {guide.stageScope ? ` • ${guide.stageScope}` : ''}
              </p>
              {prev && (
                <Link
                  href={`/rules/${prev.slug}`}
                  className="text-xs text-white/40 hover:text-white flex items-center gap-1 lg:justify-end"
                >
                  <ArrowLeft className="w-3 h-3" /> Prev: {prev.name.slice(0, 20)}
                </Link>
              )}
              {next && (
                <Link
                  href={`/rules/${next.slug}`}
                  className="text-xs text-white/40 hover:text-white flex items-center gap-1 lg:justify-end"
                >
                  Next: {next.name.slice(0, 20)} <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          <div className="lg:col-span-8 space-y-6">
            <section className="rounded-2xl bg-[#111318] border border-[#1F2228] p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-9 h-9 rounded-xl bg-[#080A10] border border-[#1F2228] flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[#8A8F98]" />
                </span>
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
                  <p className="text-xs font-semibold text-amber-400 mb-1">How traders get caught</p>
                  <p className="text-[12px] leading-relaxed text-white/60">{caughtText}</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15">
                  <p className="text-xs font-semibold text-emerald-400 mb-1">How to stay safe</p>
                  <p className="text-[12px] leading-relaxed text-white/60">{safeText}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-[#111318] border border-[#1F2228] p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-9 h-9 rounded-xl bg-[#080A10] border border-[#1F2228] flex items-center justify-center">
                  <Calculator className="w-4 h-4 text-[#8A8F98]" />
                </span>
                <div>
                  <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98]">The Formula</p>
                  <h2 className="text-[15px] font-semibold text-white">How it is calculated</h2>
                </div>
              </div>
              <div className="rounded-xl bg-[#080A10] border border-[#1F2228] p-4 font-mono text-xs text-sky-300">
                {guide.formula}
              </div>
              {guide.example && (
                <div className="mt-4 p-4 rounded-xl bg-[#080A10] border border-[#1F2228] space-y-1">
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">Real Dollar Example</p>
                  <p className="text-xs text-white/60 leading-relaxed">{guide.example}</p>
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-[#111318] border border-[#1F2228] p-6 sm:p-8 space-y-4">
              <h2 className="text-[15px] font-semibold text-white">Common Traps & Mistakes</h2>
              <div className="space-y-3">
                {guide.commonMistakes.map((m, i) => (
                  <div key={i} className="flex gap-3 p-4 rounded-xl bg-[#080A10] border border-[#1F2228]">
                    <span className="w-7 h-7 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 text-xs font-bold text-red-400">
                      {i + 1}
                    </span>
                    <p className="text-[13px] leading-relaxed text-white/60">{m}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={primaryFirmHref}
                  className="px-4 py-2.5 rounded-full bg-white text-[#080A10] text-xs font-semibold hover:bg-white/90 transition-colors"
                >
                  See live rule with source →
                </Link>
                <Link
                  href="/simulator"
                  className="px-4 py-2.5 rounded-full bg-[#080A10] border border-[#1F2228] text-xs font-medium text-white hover:border-white/40 transition-colors"
                >
                  Test in simulator
                </Link>
              </div>
            </section>

            <section className="rounded-2xl bg-gradient-to-br from-[#111318] to-[#0f1a2e] border border-[#1F2228] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Firms using this rule</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {guide.firmsUsing.map((f) => (
                    <span
                      key={f.firmName}
                      className="px-3 py-1.5 rounded-full bg-[#080A10] border border-[#1F2228] text-xs text-white/60"
                    >
                      <Building className="w-3 h-3 inline mr-1" />
                      {f.firmName} <span className="text-white/30">•</span> {f.modelVariation.slice(0, 32)}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href="/prop-firms"
                className="shrink-0 px-4 py-2 rounded-full bg-white text-[#080A10] text-xs font-semibold hover:bg-white/90 transition-colors"
              >
                Compare firms →
              </Link>
            </section>

            {relatedGuides.length > 0 && (
              <section className="rounded-2xl bg-[#111318] border border-[#1F2228] p-6">
                <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98] mb-1">
                  Related guides
                </p>
                <h2 className="text-[15px] font-semibold text-white mb-4">Keep learning this cluster</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {relatedGuides.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/rules/${r.slug}`}
                      className="text-left p-3 rounded-xl bg-[#080A10] border border-[#1F2228] hover:border-sky-500/30 transition-colors"
                    >
                      <p className="text-[13px] font-medium text-white">{r.name}</p>
                      <p className="text-[11px] text-white/40 mt-0.5 line-clamp-1">{r.shortDefinition}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl bg-[#111318] border border-[#1F2228] p-4">
              <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98] mb-3">
                All {allGuides.length} guides
              </p>
              <div className="space-y-1 max-h-[420px] overflow-auto pr-1">
                {allGuides.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/rules/${g.slug}`}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] transition-colors flex items-center gap-2 ${
                      g.slug === guide.slug
                        ? 'bg-white text-[#080A10] font-medium shadow-sm'
                        : 'text-[#8A8F98] hover:text-white hover:bg-[#080A10]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        g.slug === guide.slug ? 'bg-[#080A10]' : 'bg-[#1F2228]'
                      }`}
                    />
                    <span className="truncate">{g.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#111318] border border-emerald-500/15 p-5">
              <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-emerald-400 mb-3 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" /> Try it live
              </p>
              <p className="text-[13px] leading-relaxed text-white/50">
                Simulate this rule interactively with your starting capital and drawdown constraints using our real
                mathematical risk engine.
              </p>
              <Link
                href="/simulator"
                className="mt-4 w-full py-3 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Calculator className="w-4 h-4" /> Open Interactive Simulator
              </Link>
              <p className="text-[11px] text-white/20 text-center mt-2">Deterministic — exact firm formulas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
