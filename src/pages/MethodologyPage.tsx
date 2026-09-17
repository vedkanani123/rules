import React from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

interface MethodologyPageProps { onNavigate: (path: string) => void; }

export const MethodologyPage: React.FC<MethodologyPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Methodology', url: '/methodology' }]} />
      <div className="mt-6 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Our Methodology</h1>
          <p className="text-sm text-[#8A8F98] mt-2">How we verify and document prop trading firm rules</p>
        </div>
        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-[#C8CCD4] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white">1. How Rules Are Documented</h2>
            <p>Our research desk rigorously verifies and documents prop trading firm rules by reviewing official legal documentation, terms of service agreements, FAQ pages, customer support documentation, and checkout contracts. We extract the core rules to provide standardized, deterministic, and easily comparable data across different firms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">2. Verified vs. Unverified Information</h2>
            <p><strong>Verified:</strong> Rules that have been confirmed directly against the firm's official current documentation. We maintain links or references to the source of verification where possible.</p>
            <p><strong>Unverified:</strong> In cases where firm documentation is ambiguous, contradictory, or absent, we mark the specific data point as unverified. We err on the side of caution and may hide unverified information rather than presenting potentially inaccurate data.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">3. How Data is Updated</h2>
            <p>Our database relies on manual verification. Each firm profile includes a <code>checked_at</code> date indicating the last time our team verified the data against the firm's official site. We periodically review major firms to ensure information remains up-to-date.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">4. Limitations of the Verification Process</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Proprietary trading firms frequently update their rules, often without public announcements or change logs.</li>
              <li>There may be a delay between a firm changing a rule and our platform updating to reflect that change.</li>
              <li>Terms of Service and legal agreements always override marketing materials or simplified rule summaries provided by the firm or our site.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">5. How to Report Errors</h2>
            <p>Community feedback is essential to maintaining accuracy. If you notice a discrepancy, an outdated rule, or have proof of a recent change, please <a href="/contact" className="text-blue-400 hover:text-blue-300">contact us</a>. Provide a link to the official firm documentation, and we will review and correct our database as soon as possible.</p>
          </section>
        </div>
      </div>
    </div>
  );
};
