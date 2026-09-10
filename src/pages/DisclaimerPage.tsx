import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, ArrowLeft, Mail } from 'lucide-react';

interface DisclaimerPageProps {
  onNavigate: (path: string) => void;
}

export const DisclaimerPage: React.FC<DisclaimerPageProps> = ({ onNavigate }) => {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-3">
          <AlertTriangle className="w-3.5 h-3.5" /> High Risk & Regulatory Disclosures
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Risk & Financial Services Disclaimer
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          CFTC Rule 4.41 Compliance • Proprietary Trading Evaluation Warning
        </p>
      </div>

      {/* Critical Highlight Alert */}
      <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-6 sm:p-7 space-y-3">
        <div className="flex items-center gap-2.5 text-rose-400 font-bold text-base sm:text-lg">
          <ShieldAlert className="w-6 h-6 flex-shrink-0" />
          <span>IMPORTANT RISK DISCLOSURE: TRADING CARRIES SUBSTANTIAL RISK</span>
        </div>
        <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed">
          Trading forex, futures, commodities, indices, and crypto contracts carries an extremely high level of risk and may not be suitable for all persons. High leverage can work against you as well as for you. Before deciding to trade or purchase a proprietary evaluation challenge, you must carefully evaluate your investment objectives, level of experience, and risk appetite. You could sustain a loss of some or all of your evaluation fees and initial capital. Never risk funds you cannot afford to lose.
        </p>
      </div>

      {/* CFTC Rule 4.41 */}
      <section className="space-y-3 rounded-xl border border-white/[0.08] bg-slate-900/40 p-6">
        <h2 className="text-white font-bold text-base sm:text-lg">
          CFTC RULE 4.41 — HYPOTHETICAL OR SIMULATED PERFORMANCE RESULTS
        </h2>
        <div className="text-xs sm:text-sm text-slate-300 space-y-2.5 leading-relaxed italic">
          <p>
            &quot;Hypothetical or simulated performance results have certain inherent limitations. Unlike an actual performance record, simulated results do not represent actual trading. Also, since the trades have not actually been executed, the results may have under- or over-compensated for the impact, if any, of certain market factors, such as lack of liquidity.&quot;
          </p>
          <p>
            &quot;Simulated trading programs in general are also subject to the fact that they are designed with the benefit of hindsight. No representation is being made that any account will or is likely to achieve profits or losses similar to those shown.&quot;
          </p>
        </div>
      </section>

      {/* Non-Brokerage & Non-Financial Advice */}
      <section className="space-y-4 rounded-xl border border-white/[0.08] bg-slate-900/40 p-6">
        <h2 className="text-white font-semibold text-lg">Platform Status & Non-Brokerage Declaration</h2>
        <div className="space-y-3 text-sm leading-relaxed">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p><strong className="text-white">Not a Financial Intermediary:</strong> FundedTradingRules.com is an independent publisher of proprietary trading firm terms, rule documentation, and dispute records. We do not provide brokerage services, investment advisory services, trade execution, or financial planning.</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p><strong className="text-white">Demo & Simulated Accounts:</strong> Most evaluation firms conduct challenges on simulated demo accounts with fictitious capital. Passing a demo challenge does not guarantee simulated live or real capital trading success.</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p><strong className="text-white">Verify With Official Sources:</strong> We inspect and audit terms on an ongoing basis. However, firms maintain discretionary rights to amend terms, margin rules, and payout policies. Always verify official contracts and FAQ documents prior to buying challenges.</p>
          </div>
        </div>
      </section>

      {/* FTC & Google Ads Affiliate Disclosure */}
      <section className="space-y-3 rounded-xl border border-white/[0.08] bg-slate-900/40 p-6">
        <h2 className="text-white font-semibold text-lg">Affiliate & Compensation Policy (FTC / Google Ads)</h2>
        <p className="text-sm leading-relaxed">
          FundedTradingRules.com operates on an evidence-first principle. We do not accept payment to hide rule violations, alter trailing drawdown calculations, or remove verified trader complaints. Some outbound links may contain referral parameters that help support the independent operation and continuous crawler infrastructure of this site at no extra cost to you. We strictly prohibit pay-to-play rankings.
        </p>
      </section>

      {/* Contact for Inquiries */}
      <section className="border-t border-white/[0.08] pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-white font-semibold text-base">Compliance Questions?</h2>
          <p className="text-xs text-slate-400 mt-1">Contact our regulatory and compliance desk.</p>
        </div>
        <a
          href="mailto:compliance@fundedtradingrules.com"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors border border-white/10"
        >
          <Mail className="w-4 h-4" /> compliance@fundedtradingrules.com
        </a>
      </section>
    </div>
  );
};
