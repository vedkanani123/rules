import React from 'react';
import { Scale, FileText, AlertCircle, ArrowLeft, Mail } from 'lucide-react';

interface TermsPageProps {
  onNavigate: (path: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
          <Scale className="w-3.5 h-3.5" /> User Agreement & Legal Terms
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Effective Date: {lastUpdated} • Please read carefully before using FundedTradingRules.com
        </p>
      </div>

      {/* Intro */}
      <section className="space-y-4 text-sm leading-relaxed">
        <p>
          Welcome to <strong className="text-white">FundedTradingRules.com</strong>. These Terms of Service (&quot;Terms&quot;) govern your access to and use of the FundedTradingRules.com website, tools, rule comparison tables, risk simulators, and dispute archives.
        </p>
        <p>
          By accessing or using any portion of our platform, you acknowledge that you have read, understood, and agree to be legally bound by these Terms and our Privacy Policy. If you do not agree, do not access or use the platform.
        </p>
      </section>

      {/* 1. Purpose of the Platform */}
      <section className="space-y-3 rounded-xl border border-white/[0.08] bg-slate-900/40 p-6">
        <div className="flex items-center gap-2.5 text-white font-semibold text-lg">
          <FileText className="w-5 h-5 text-sky-400" />
          <h2>1. Independent Information & Research Purpose</h2>
        </div>
        <p className="text-sm leading-relaxed">
          FundedTradingRules.com is an independent intelligence and research platform designed to provide structured rule analysis, drawdown mechanics, and dispute records regarding proprietary trading firms. We are NOT a proprietary trading firm, broker-dealer, introducing broker, or commodity trading advisor. We do not provide trading accounts, execute financial transactions, or handle customer deposits.
        </p>
      </section>

      {/* 2. No Financial Advice & Simulated Nature */}
      <section className="space-y-3 rounded-xl border border-amber-500/20 bg-amber-950/10 p-6 text-amber-200">
        <div className="flex items-center gap-2.5 font-semibold text-lg text-amber-300">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <h2>2. No Financial or Investment Advice</h2>
        </div>
        <p className="text-sm leading-relaxed text-amber-100/90">
          All materials, calculators, formulas, ratings, and comparisons published on FundedTradingRules.com are for educational, informational, and research purposes only. Nothing on this website constitutes financial, investment, legal, or tax advice. Prop trading evaluations involve substantial financial risk. Before purchasing any evaluation challenge, verify current binding terms on the respective provider&apos;s official website.
        </p>
      </section>

      {/* 3. Intellectual Property */}
      <section className="space-y-3 rounded-xl border border-white/[0.08] bg-slate-900/40 p-6">
        <h2 className="text-white font-semibold text-lg">3. Intellectual Property Rights</h2>
        <p className="text-sm leading-relaxed">
          All original content, visual design, custom calculations, algorithms, UI components, and software code on FundedTradingRules.com are the intellectual property of FundedTradingRules.com and are protected by international copyright, trademark, and unfair competition laws. Third-party trademarks, logos, and firm names belong to their respective owners and are referenced solely for descriptive and comparative identification under fair use.
        </p>
      </section>

      {/* 4. Acceptable Use */}
      <section className="space-y-3 rounded-xl border border-white/[0.08] bg-slate-900/40 p-6">
        <h2 className="text-white font-semibold text-lg">4. Permitted and Prohibited Conduct</h2>
        <p className="text-sm leading-relaxed">
          You agree to use FundedTradingRules.com solely for lawful personal or non-commercial research purposes. You shall not:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-sm">
          <li>Deploy automated scrapers, bots, or data extraction scripts that impose unreasonable load on our infrastructure.</li>
          <li>Frame or mirror any part of the site without explicit written authorization.</li>
          <li>Submit falsified, malicious, or uncorroborated dispute evidence against any firm.</li>
          <li>Interfere with or bypass website security controls or rate limiters.</li>
        </ul>
      </section>

      {/* 5. Limitation of Liability */}
      <section className="space-y-3 rounded-xl border border-white/[0.08] bg-slate-900/40 p-6">
        <h2 className="text-white font-semibold text-lg">5. Limitation of Liability & Warranty Disclaimer</h2>
        <p className="text-sm leading-relaxed">
          The service is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranty of any kind, express or implied. While we strive to maintain complete and current rule accuracy, prop firm terms change frequently without notice. FundedTradingRules.com shall not be liable for any trading losses, failed challenges, denied payouts, account breaches, or indirect damages resulting from your use of or reliance upon our information.
        </p>
      </section>

      {/* 6. Contact */}
      <section className="border-t border-white/[0.08] pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-white font-semibold text-base">Questions Regarding These Terms?</h2>
          <p className="text-xs text-slate-400 mt-1">Contact our legal compliance team for official clarifications.</p>
        </div>
        <a
          href="mailto:legal@fundedtradingrules.com"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
        >
          <Mail className="w-4 h-4" /> legal@fundedtradingrules.com
        </a>
      </section>
    </div>
  );
};
