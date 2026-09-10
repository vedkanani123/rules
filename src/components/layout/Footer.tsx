import React from 'react';
import { PROP_FIRMS_DATA } from '../../data/propFirmsData.ts';
import { Link } from '../common/Link.tsx';
import { ATTRIBUTE_PAGES } from '../../core/seo/attributePagesData.ts';
import { CURATED_COMPARISONS } from '../../core/seo/comparisonData.ts';

interface FooterProps {
  onNavigate?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const firms = PROP_FIRMS_DATA;

  return (
    <footer className="border-t border-[#1F2228] bg-[#080A10] mt-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Col 1: Brand & Purpose */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-white flex items-center justify-center">
                <div className="w-3 h-3 bg-[#080A10] rotate-45" />
              </div>
              <span className="text-sm font-semibold text-white">FundedTradingRules.com</span>
            </Link>
            <p className="text-xs leading-relaxed text-[#9CA3AF] mt-3 max-w-sm">
              Independent, evidence-backed intelligence for prop firm traders. Every rule verified with official citations and deterministic math.
            </p>
            <p className="text-[11px] leading-relaxed text-[#6B7280] mt-3 max-w-sm">
              <strong className="text-slate-400">Risk Disclosure:</strong> Proprietary trading evaluations involve simulated trading with substantial risk of loss. Past performance does not guarantee future results. Not financial advice.
            </p>
          </div>

          {/* Col 2: Top Evaluated Firms */}
          <div className="lg:col-span-2">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#9CA3AF] mb-3">Top Firms</p>
            <div className="space-y-1">
              {firms.slice(0, 7).map((f) => (
                <Link
                  key={f.id}
                  href={`/prop-firms/${f.slug}`}
                  className="block text-xs text-[#8A8F98] hover:text-white py-0.5 text-left transition-colors"
                >
                  {f.name}
                </Link>
              ))}
              <Link
                href="/prop-firms"
                className="block text-xs text-sky-400 hover:text-sky-300 pt-1 font-medium"
              >
                View all {firms.length}+ firms →
              </Link>
            </div>
          </div>

          {/* Col 3: Research Tools & Curated Rules */}
          <div className="lg:col-span-3">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#9CA3AF] mb-3">Curated Rule Hubs</p>
            <div className="space-y-1">
              {ATTRIBUTE_PAGES.slice(0, 6).map((attr) => (
                <Link
                  key={attr.slug}
                  href={`/prop-firms/${attr.slug}`}
                  className="block text-xs text-[#8A8F98] hover:text-white py-0.5 text-left transition-colors"
                >
                  {attr.h1.replace(' (2026)', '').replace(' Explained', '')}
                </Link>
              ))}
              <Link
                href="/rules"
                className="block text-xs text-sky-400 hover:text-sky-300 pt-1 font-medium"
              >
                Browse all 40+ rule guides →
              </Link>
            </div>
          </div>

          {/* Col 4: Trust & Legal Compliance */}
          <div className="lg:col-span-3">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#9CA3AF] mb-3">Intelligence & Legal</p>
            <div className="space-y-1">
              {[
                ['Firms Directory', '/prop-firms'],
                ['Compare Engine', '/compare'],
                ['Strategy Matcher Wizard', '/wizard'],
                ['Drawdown Risk Simulator', '/simulator'],
                ['Dispute Evidence Registry', '/reviews'],
                ['Live Rule Changes Audit', '/changes'],
                ['Privacy Policy (GDPR / CCPA)', '/privacy'],
                ['Terms of Service', '/terms'],
                ['Risk & CFTC Disclaimer', '/disclaimer'],
                ['Contact & Evidence Desk', '/contact'],
              ].map(([label, path]) => (
                <Link
                  key={label}
                  href={path}
                  className="block text-xs text-[#8A8F98] hover:text-white py-0.5 text-left transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Shortcuts Strip */}
        <div className="mt-8 pt-6 border-t border-[#1F2228] text-xs text-[#8A8F98]">
          <span className="font-semibold text-white/70 mr-2">Top Comparisons:</span>
          {CURATED_COMPARISONS.slice(0, 6).map((comp, idx) => (
            <React.Fragment key={comp.slug}>
              {idx > 0 && <span className="text-white/20 mx-1.5">•</span>}
              <Link href={`/compare/${comp.slug}`} className="hover:text-white transition-colors">
                {comp.firmAName} vs {comp.firmBName}
              </Link>
            </React.Fragment>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-[#1F2228] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#9CA3AF]">
          <span>© 2026 FundedTradingRules.com — Evidence-Backed Proprietary Trading Intelligence.</span>
          <div className="flex items-center gap-4 text-[11px] text-[#8A8F98]">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <span>•</span>
            <Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
