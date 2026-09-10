import React from 'react';
import { ATTRIBUTE_PAGES, AttributePageConfig } from '../core/seo/attributePagesData.ts';
import { PROP_FIRMS_DATA } from '../data/propFirmsData.ts';
import { Breadcrumbs } from '../components/common/Breadcrumbs.tsx';
import { Link } from '../components/common/Link.tsx';
import {
  ShieldCheck,
  AlertTriangle,
  Calculator,
  Building2,
  ArrowRight,
  CheckCircle2,
  Filter,
  Scale,
  ExternalLink,
} from 'lucide-react';

interface AttributeLandingPageProps {
  attributeSlug: string;
  onNavigate?: (path: string) => void;
}

export const AttributeLandingPage: React.FC<AttributeLandingPageProps> = ({ attributeSlug }) => {
  const config = ATTRIBUTE_PAGES.find(a => a.slug === attributeSlug) || ATTRIBUTE_PAGES[0];
  const matchingFirms = PROP_FIRMS_DATA.filter(config.matcher);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Prop Firms', url: '/prop-firms' },
    { name: config.badge, url: `/prop-firms/${config.slug}` },
  ];

  return (
    <div className="bg-[#080A10] min-h-screen text-slate-100">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Breadcrumbs items={breadcrumbs} className="pt-4" />

        {/* Hero Section */}
        <div className="pt-6 pb-8 border-b border-[#1F2228]">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111318] border border-[#1F2228] text-xs font-semibold tracking-wide uppercase text-sky-400 mb-4">
            <Filter className="w-3.5 h-3.5" /> {config.badge} Directory
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {config.h1}
          </h1>
          <p className="text-base sm:text-lg text-white/70 mt-3 max-w-3xl leading-relaxed">
            {config.summary}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5 text-xs text-[#8A8F98]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111318] border border-[#1F2228]">
              <Building2 className="w-3.5 h-3.5 text-sky-400" /> {matchingFirms.length} Verified Firms Matching
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111318] border border-[#1F2228]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Backed by Official Terms Citations
            </span>
          </div>
        </div>

        {/* Educational Breakdown & Trap Warning */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-8">
          <div className="lg:col-span-7 rounded-2xl bg-[#111318] border border-[#1F2228] p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Calculator className="w-4 h-4 text-sky-400" />
              <span>Mathematical Definition & Calculation</span>
            </div>
            <p className="text-xs sm:text-sm text-[#8A8F98] leading-relaxed">
              {config.whyItMatters}
            </p>
            <div className="p-4 rounded-xl bg-[#080A10] border border-[#1F2228] font-mono text-xs text-sky-300">
              {config.mathematicalDefinition}
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl bg-amber-500/[0.04] border border-amber-500/20 p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Hidden Trap / What to Watch For</span>
            </div>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              {config.trapWarning}
            </p>
            <div className="pt-2">
              <Link
                href="/simulator"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300"
              >
                Test this scenario in the Risk Simulator <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Directory Table of Matching Firms */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Verified Prop Firms ({matchingFirms.length})
            </h2>
            <span className="text-xs text-[#8A8F98]">Sorted by Trust Score & Evidence</span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#1F2228] bg-[#111318]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1F2228] bg-[#080A10] text-[#8A8F98] uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4 font-semibold">Firm Name</th>
                    <th className="py-3 px-4 font-semibold">HQ / Trust</th>
                    <th className="py-3 px-4 font-semibold">Drawdown Model</th>
                    <th className="py-3 px-4 font-semibold">Daily Loss</th>
                    <th className="py-3 px-4 font-semibold">Profit Split</th>
                    <th className="py-3 px-4 font-semibold">Platforms</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2228]/60">
                  {matchingFirms.map((firm) => {
                    const firstAcc = firm.programs[0]?.accounts[0];
                    return (
                      <tr key={firm.id} className="hover:bg-[#080A10]/50 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-white">
                          <Link
                            href={`/prop-firms/${firm.slug}`}
                            className="flex items-center gap-2 hover:text-sky-400 transition-colors"
                          >
                            <span className="font-semibold">{firm.name}</span>
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-[#8A8F98]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs">{firm.countryFlag ? <img src={firm.countryFlag} alt={`${firm.country} flag`} className="w-3.5 h-2.5 inline-block mr-1" /> : null}</span>
                            <span>{firm.country}</span>
                            <span className="text-emerald-400 font-mono font-bold ml-1">{firm.scorecard.overallScore}/100</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          <span className="px-2 py-0.5 rounded bg-[#080A10] border border-[#1F2228] font-mono text-[11px]">
                            {firstAcc?.drawdownType?.replace(/_/g, ' ') || 'Static'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {firstAcc?.dailyLossLimit ? `${firstAcc.dailyLossLimit}% (${firstAcc.dailyLossCalculation.replace(/_/g, ' ')})` : 'None / 0%'}
                        </td>
                        <td className="py-3.5 px-4 text-emerald-400 font-semibold font-mono">
                          {firstAcc?.profitSplit ? `${firstAcc.profitSplit}%` : '80%'}
                        </td>
                        <td className="py-3.5 px-4 text-[#8A8F98] max-w-[160px] truncate">
                          {firm.platforms.slice(0, 3).join(', ')}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/prop-firms/${firm.slug}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-[#080A10] font-semibold text-[11px] hover:bg-white/90 transition-colors"
                          >
                            View Rules <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Jumps to Other Filter Hubs */}
        <div className="mt-14 pt-8 border-t border-[#1F2228] space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8A8F98]">
            Explore Other Verified Rule Filters
          </h3>
          <div className="flex flex-wrap gap-2">
            {ATTRIBUTE_PAGES.filter(a => a.slug !== config.slug).map((other) => (
              <Link
                key={other.slug}
                href={`/prop-firms/${other.slug}`}
                className="px-3.5 py-2 rounded-xl bg-[#111318] border border-[#1F2228] hover:border-sky-500/40 text-xs text-[#8A8F98] hover:text-white transition-all flex items-center gap-1.5"
              >
                <span>{other.badge}</span>
                <span className="text-white/40">•</span>
                <span className="text-white font-medium">{other.h1.replace('Prop Firms ', '')}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
