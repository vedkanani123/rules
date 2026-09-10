import React, { useState } from 'react';
import { Mail, MessageSquare, Clock, MapPin, CheckCircle2, ArrowLeft, Send } from 'lucide-react';

interface ContactPageProps {
  onNavigate: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    firm: '',
    category: 'rule_correction',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Deterministic client feedback
    setSubmitted(true);
  };

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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-3">
          <MessageSquare className="w-3.5 h-3.5" /> Editorial & Trader Support
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Contact FundedTradingRules.com
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Report an undocumented rule change, submit dispute evidence, or inquire about research partnerships.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact Info Sidebar */}
        <div className="md:col-span-5 space-y-5">
          <div className="rounded-xl border border-white/[0.08] bg-slate-900/40 p-5 space-y-4">
            <h2 className="text-white font-semibold text-base">Direct Channels</h2>
            
            <div className="flex items-start gap-3 text-xs sm:text-sm">
              <Mail className="w-4 h-4 text-sky-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-slate-400 text-xs">General & Research Inquiries</p>
                <a href="mailto:support@fundedtradingrules.com" className="text-white hover:underline font-medium">
                  support@fundedtradingrules.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs sm:text-sm">
              <MessageSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-slate-400 text-xs">Rule Submissions & Evidence Desk</p>
                <a href="mailto:evidence@fundedtradingrules.com" className="text-white hover:underline font-medium">
                  evidence@fundedtradingrules.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs sm:text-sm">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-slate-400 text-xs">Operating Hours & SLA</p>
                <p className="text-slate-200">Mon – Fri: 08:00 – 18:00 UTC</p>
                <p className="text-slate-400 text-xs">Average response time: &lt; 24 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs sm:text-sm">
              <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-slate-400 text-xs">Publisher Details</p>
                <p className="text-slate-200">FundedTradingRules Independent Intelligence</p>
                <p className="text-slate-400 text-xs">Digital Publication • Worldwide Access</p>
              </div>
            </div>
          </div>

          {/* Evidence Policy */}
          <div className="rounded-xl border border-sky-500/20 bg-sky-950/10 p-5 space-y-2 text-xs leading-relaxed text-sky-200">
            <h3 className="font-semibold text-sky-300">Submitting Rule Changes?</h3>
            <p>
              Every rule update requires corroborating evidence (official FAQ URL, signed PDF term, or dated broker announcement). Submissions without verifiable source links will undergo crawler verification before publication.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7">
          <div className="rounded-xl border border-white/[0.08] bg-slate-900/40 p-6 sm:p-7">
            {submitted ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Message Received</h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
                  Thank you for contacting our research desk. Our audit team will review your inquiry within 24 business hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', firm: '', category: 'rule_correction', message: '' }); }}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-white font-semibold text-lg mb-2">Send an Inquiry</h2>
                
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Trader or Researcher Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-800/80 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-800/80 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Inquiry Type</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="rule_correction">Rule Update / Correction</option>
                      <option value="dispute_evidence">Submit Dispute Evidence</option>
                      <option value="firm_request">Request New Firm Dossier</option>
                      <option value="general">General Research Inquiries</option>
                      <option value="advertising">Compliance & Advertising</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Relevant Firm (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Goat Funded Trader, FTMO"
                      value={formData.firm}
                      onChange={(e) => setFormData({ ...formData, firm: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-800/80 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Message / Source Details</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide details, official rule quotation, or links..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-800/80 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sky-600/20"
                >
                  <Send className="w-3.5 h-3.5" /> Submit to Audit Desk
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
