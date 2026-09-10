import React from 'react';
import { ShieldCheck, Lock, Eye, Bell, ArrowLeft, Mail } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onNavigate: (path: string) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate }) => {
  const lastUpdated = 'September 10, 2026';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-300">
      {/* Back button */}
      <button
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>

      {/* Header */}
      <div className="border-b border-white/[0.08] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> GDPR & CCPA Compliant
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Effective Date: {lastUpdated} • Transparency-first data management
        </p>
      </div>

      {/* Intro */}
      <section className="space-y-4 text-sm leading-relaxed">
        <p>
          At <strong className="text-white">FundedTradingRules.com</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), we are committed to protecting your privacy and treating your data with strict integrity. This Privacy Policy outlines how we collect, use, disclose, and safeguard your personal information when you visit our website, utilize our interactive comparison engines, risk simulators, or review directory.
        </p>
        <p>
          By using FundedTradingRules.com, you consent to the data practices described in this policy. If you disagree with any terms, please discontinue using our service.
        </p>
      </section>

      {/* 1. Information We Collect */}
      <section className="space-y-4 rounded-xl border border-white/[0.08] bg-slate-900/40 p-6">
        <div className="flex items-center gap-2.5 text-white font-semibold text-lg">
          <Eye className="w-5 h-5 text-sky-400" />
          <h2>1. Information We Collect</h2>
        </div>
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            <strong className="text-white">A. Log and Analytics Data:</strong> When you access our platform, our servers and analytics partners (such as Google Analytics 4) may automatically log standard technical data transmitted by your browser, including your IP address, browser type, operating system, referring URLs, device characteristics, pages viewed, time spent on pages, and search terms entered.
          </p>
          <p>
            <strong className="text-white">B. Simulator and Tool Inputs:</strong> Calculations performed in our Risk Simulator or Rule Matcher are computed client-side in your local browser session. We do not store, harvest, or monetize individual trade lot sizes or balance inputs.
          </p>
          <p>
            <strong className="text-white">C. Direct Communications:</strong> When you contact us via email, submit rule disputes, or file evidence reports, we collect your name, email address, and any corroborating documents provided.
          </p>
        </div>
      </section>

      {/* 2. How We Use Information */}
      <section className="space-y-4 rounded-xl border border-white/[0.08] bg-slate-900/40 p-6">
        <div className="flex items-center gap-2.5 text-white font-semibold text-lg">
          <Lock className="w-5 h-5 text-emerald-400" />
          <h2>2. How We Use Your Information</h2>
        </div>
        <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
          <li>To maintain, optimize, and enhance website performance, speed, and mobile responsiveness.</li>
          <li>To audit and verify the accuracy of prop firm rules, terms, and dispute documentation.</li>
          <li>To monitor and mitigate abusive behavior, automated web scrapers, and bot fraud.</li>
          <li>To evaluate website traffic patterns and advertising campaign performance through Google Ads and Google Tag Manager.</li>
          <li>To comply with regulatory mandates, fraud prevention standards, and legal inquiries.</li>
        </ul>
      </section>

      {/* 3. Cookies and Tracking Technologies */}
      <section className="space-y-4 rounded-xl border border-white/[0.08] bg-slate-900/40 p-6">
        <div className="flex items-center gap-2.5 text-white font-semibold text-lg">
          <Bell className="w-5 h-5 text-amber-400" />
          <h2>3. Cookies and Google Ads / Consent Mode v2</h2>
        </div>
        <p className="text-sm leading-relaxed">
          We use functional cookies and performance tracking pixels. In compliance with the European Economic Area (EEA) and UK privacy directives, we implement <strong className="text-white">Google Consent Mode v2</strong>. Tracking cookies for personalized advertising (<code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-sky-300">ad_storage</code>, <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-sky-300">ad_user_data</code>, <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-sky-300">ad_personalization</code>) are only set in accordance with your preferences chosen via our Cookie Consent banner.
        </p>
        <p className="text-sm leading-relaxed">
          You can modify or revoke cookie preferences at any time through your browser settings or by clearing your site data.
        </p>
      </section>

      {/* 4. Third-Party Sharing & Affiliate Disclosure */}
      <section className="space-y-4 rounded-xl border border-white/[0.08] bg-slate-900/40 p-6">
        <h2 className="text-white font-semibold text-lg">4. Third-Party Disclosure & Affiliate Neutrality</h2>
        <p className="text-sm leading-relaxed">
          FundedTradingRules.com does not sell, rent, or lease your personal information to third parties or proprietary trading firms. We maintain editorial independence: ranking scores and rule classifications are deterministic and derived from public legal documentation. When outbound links to firm websites are clicked, those third-party sites operate under their respective privacy policies.
        </p>
      </section>

      {/* 5. Your Legal Rights (GDPR & CCPA) */}
      <section className="space-y-4 rounded-xl border border-white/[0.08] bg-slate-900/40 p-6">
        <h2 className="text-white font-semibold text-lg">5. Your Legal Rights (GDPR & CCPA)</h2>
        <p className="text-sm leading-relaxed">
          Depending on your jurisdiction (such as the EEA, UK, or State of California), you may hold statutory rights including:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-sm">
          <li>The right to request access to the personal data we hold about you.</li>
          <li>The right to request rectification of inaccurate or incomplete records.</li>
          <li>The right to erasure (&quot;right to be forgotten&quot;).</li>
          <li>The right to restrict or object to the processing of your data.</li>
          <li>The right to opt-out of non-essential analytics and targeted advertising cookies.</li>
        </ul>
      </section>

      {/* 6. Contact Us */}
      <section className="border-t border-white/[0.08] pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-white font-semibold text-base">Questions or Privacy Requests?</h2>
          <p className="text-xs text-slate-400 mt-1">Our Data Privacy Officer responds to all inquiries within 48 business hours.</p>
        </div>
        <a
          href="mailto:privacy@fundedtradingrules.com"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
        >
          <Mail className="w-4 h-4" /> privacy@fundedtradingrules.com
        </a>
      </section>
    </div>
  );
};
