import React, { useState } from 'react';
import { GFTCommunityItem } from '../../data/goatCanonicalData.ts';
import {
  MessageSquareQuote,
  Star,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Filter,
  Info,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface GoatV3CommunityReviewsProps {
  reviews: GFTCommunityItem[];
}

export const GoatV3CommunityReviews: React.FC<GoatV3CommunityReviewsProps> = ({
  reviews,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredReviews = reviews.filter((r) => {
    if (filterType === 'all') return true;
    return r.type === filterType;
  });

  const getClassificationBadge = (type: string) => {
    switch (type) {
      case 'payout_proof':
      case 'customer_experience':
        return {
          label: 'Customer Experience',
          bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
        };
      case 'rule_dispute':
      case 'individual_complaint':
        return {
          label: 'Individual Complaint',
          bg: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
        };
      case 'slippage_complaint':
      case 'community_allegation':
        return {
          label: 'Community Allegation',
          bg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
        };
      case 'third_party_review':
      default:
        return {
          label: 'Third-Party Review',
          bg: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
        };
    }
  };

  return (
    <section id="reviews" className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-indigo-400" />
            Community Reports & Trader Feedback
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Strictly segregated from official firm rules. Illustrative community feedback categorized by topic.
          </p>
        </div>

        {/* Classification Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#111318] border border-[#1F2228] rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Feedback Types ({reviews.length})</option>
            <option value="payout_proof">Customer Experience (Payouts)</option>
            <option value="rule_dispute">Individual Complaints (Rule Disputes)</option>
            <option value="slippage_complaint">Community Allegations (Spreads/Slippage)</option>
          </select>
        </div>
      </div>

      {/* Mandatory Demonstration Disclaimer Notice (Requirement 10) */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1.5 shadow-lg">
        <div className="flex items-center gap-2 font-bold text-amber-300">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Demonstration sample — not real customer evidence.</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-slate-300">Epistemic Segregation Notice:</strong> Trader reviews and online forum posts reflect subjective individual claims and do not constitute official firm terms, contract rules, or legal guarantees. Reviews must NEVER be used as proof of an official rule. For authoritative conditions, refer exclusively to the Complete Rule Table.
        </p>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredReviews.map((rev) => {
          const badge = getClassificationBadge(rev.type);

          return (
            <div
              key={rev.id}
              className="p-4 rounded-xl bg-[#111318] border border-[#1F2228] flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">Sample Trader {rev.author.replace(/[^0-9]/g, '') || '#1'}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {rev.sourceType}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{rev.topic}</div>
                  </div>

                  <div className="text-right">
                    {rev.rating && (
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    )}
                    <span className="text-[10px] text-slate-500 font-mono">Illustrative Date</span>
                  </div>
                </div>

                <blockquote className="text-xs text-slate-300 italic bg-black/30 p-3 rounded-lg border border-white/[0.04] leading-relaxed">
                  "{rev.fullQuote}"
                </blockquote>
              </div>

              {/* Classification Footer */}
              <div className="flex flex-wrap items-center justify-between text-[11px] pt-2 border-t border-white/[0.04]">
                <span className="text-slate-400">
                  Category:{' '}
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${badge.bg}`}>
                    {badge.label}
                  </span>
                </span>

                <span className="text-slate-500 font-mono text-[10px]">
                  Demonstration Example
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
