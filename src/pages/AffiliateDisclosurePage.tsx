import React from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Breadcrumbs } from '../components/common/Breadcrumbs.tsx';

interface AffiliateDisclosurePageProps { onNavigate: (path: string) => void; }

export const AffiliateDisclosurePage: React.FC<AffiliateDisclosurePageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Affiliate Disclosure', url: '/affiliate-disclosure' }]} />
      <div className="mt-6 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Affiliate Disclosure</h1>
          <p className="text-sm text-[#8A8F98] mt-2">Last updated: September 2026</p>
        </div>
        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-[#C8CCD4] leading-relaxed">
          <h2>How This Site Is Funded</h2>
          <p>FundedTradingRules.com is an independently operated website that provides rule documentation and analysis for proprietary trading firms. Some of the links on this site are affiliate links, meaning we may earn a commission if you click through and make a purchase. This comes at no additional cost to you.</p>
          
          <h2>Our Commitment</h2>
          <p>Affiliate relationships do not influence our rule documentation, firm rankings, analysis, or editorial content. The rules, drawdown calculations, and trading conditions documented on this site are based on publicly available information from each firm's official sources.</p>
          
          <h2>Promo Codes</h2>
          <p>Promotional codes displayed on this site are observed from public marketing channels. We do not guarantee their validity, discount amounts, or availability. Always confirm pricing and discount terms directly on the firm's official checkout page before making any purchase.</p>
          
          <h2>Contact</h2>
          <p>If you have questions about our affiliate relationships or how this site is funded, please contact us at <a href="mailto:support@fundedtradingrules.com" className="text-blue-400 hover:text-blue-300">support@fundedtradingrules.com</a>.</p>
        </div>
      </div>
    </div>
  );
};
