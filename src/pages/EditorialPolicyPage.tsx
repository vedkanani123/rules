import React from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

interface EditorialPolicyPageProps { onNavigate: (path: string) => void; }

export const EditorialPolicyPage: React.FC<EditorialPolicyPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Editorial Policy', url: '/editorial-policy' }]} />
      <div className="mt-6 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Editorial Policy</h1>
          <p className="text-sm text-[#8A8F98] mt-2">Our commitment to independent, accurate, and objective information</p>
        </div>
        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-[#C8CCD4] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white">1. Content Independence Statement</h2>
            <p>Our primary duty is to our users. FundedTradingRules.com maintains strict editorial independence. The presentation, ranking, and description of prop trading firms and their rules are determined solely by our editorial team's objective analysis of their terms, conditions, and offerings. We do not allow firms to pay for favorable ratings or to alter our presentation of their actual rules.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">2. How Affiliate Relationships Work</h2>
            <p>To keep this site free, we partner with some of the prop trading firms listed on our site through affiliate programs. When you click a link and purchase an evaluation, we may earn a commission. However, these relationships <strong>never</strong> dictate our editorial content, rule verification process, or our firm comparisons. We list firms based on user interest and market relevance, regardless of whether we have an affiliate agreement with them.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">3. Error Correction Process</h2>
            <p>We take accuracy seriously. Given the dynamic nature of prop firm rules, errors or outdated information may occasionally appear. Once an error is identified—either internally or via community reports—we verify the correct information against official firm documentation. Corrections are implemented promptly across the site.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">4. Review and Complaint Handling</h2>
            <p>We review the terms and conditions of prop trading firms to extract objective rules. We do not act as an arbitrator for individual user complaints or disputes with firms. If multiple verified sources or a significant volume of credible complaints indicate a firm is acting in bad faith or violating their stated terms, we reserve the right to add a warning to their profile or remove them from our platform entirely.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">5. Contact for Editorial Concerns</h2>
            <p>If you have questions about our editorial process, believe our content lacks objectivity, or need to escalate a concern about a firm's representation, please <a href="/contact" className="text-blue-400 hover:text-blue-300">contact us</a>. We aim to address editorial concerns within 48-72 business hours.</p>
          </section>
        </div>
      </div>
    </div>
  );
};
