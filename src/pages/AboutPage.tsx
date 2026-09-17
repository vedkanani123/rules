import React from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

interface AboutPageProps { onNavigate: (path: string) => void; }

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }]} />
      <div className="mt-6 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">About FundedTradingRules</h1>
          <p className="text-sm text-[#8A8F98] mt-2">Who we are and why this site exists</p>
        </div>
        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-[#C8CCD4] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white">Our Mission</h2>
            <p>FundedTradingRules.com exists to help traders understand the rules, restrictions, and conditions of proprietary trading firm evaluation programs before committing money. We document trading rules from official sources and present them in a structured, searchable format.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Who We Are</h2>
            <div className="rounded-xl border border-emerald-500/20 bg-[#111318] p-5 space-y-2">
              <p className="text-white text-sm"><strong>Publisher:</strong> FundedTradingRules Research Desk</p>
              <p className="text-[#8A8F98] text-sm"><strong>Platform Focus:</strong> Empirical Prop Trading Rules, Trailing Drawdown Verification & Fee Intelligence</p>
              <p className="text-[#8A8F98] text-sm"><strong>Evidence Desk Contact:</strong> <a href="mailto:support@fundedtradingrules.com" className="text-sky-400 hover:underline">support@fundedtradingrules.com</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">What We Do</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Document rules:</strong> We read official firm documentation, terms of service, and support articles to extract and present trading rules in a standardized format.</li>
              <li><strong>Compare firms:</strong> Our comparison tools help traders evaluate firms side-by-side based on their published rules and conditions.</li>
              <li><strong>Track changes:</strong> We monitor firms for rule changes and document them in our changelog.</li>
              <li><strong>Provide tools:</strong> Our risk simulator and drawdown calculator help traders understand rule mechanics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">What We Don't Do</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>We are <strong>not</strong> a financial advisor, broker, or trading firm.</li>
              <li>We do <strong>not</strong> provide trading signals, investment advice, or recommendations on whether to trade.</li>
              <li>We do <strong>not</strong> guarantee the accuracy of any information — rules change frequently, and traders should always verify directly with each firm.</li>
              <li>We <strong>cannot</strong> resolve disputes between traders and firms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">How We're Funded</h2>
            <p>This site may earn commissions through affiliate links to prop trading firms. These relationships do not influence our rule documentation or rankings. For full details, see our <a href="/affiliate-disclosure" className="text-blue-400 hover:text-blue-300">Affiliate Disclosure</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Accuracy & Limitations</h2>
            <p>While we strive to keep our information current, prop firm rules change frequently — sometimes without public announcement. All information on this site should be treated as a starting point for research, not as a definitive source. Always verify rules directly with each firm before purchasing a challenge or evaluation.</p>
            <p>If you find an error in our data, please <a href="/contact" className="text-blue-400 hover:text-blue-300">let us know</a> and we'll investigate and correct it.</p>
          </section>
        </div>
      </div>
    </div>
  );
};
