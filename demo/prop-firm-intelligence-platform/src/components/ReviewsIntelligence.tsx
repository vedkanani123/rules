import React, { useState } from 'react';
import {
  MessageSquareWarning,
  Star,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ThumbsUp,
  Filter,
  FileText,
  Clock,
  Zap,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { ReviewComplaint, ReviewTheme } from '../types';

interface ReviewsIntelligenceProps {
  reviews: ReviewComplaint[];
  themes: ReviewTheme[];
  onOpenSourceModal: (source: any) => void;
}

export const ReviewsIntelligence: React.FC<ReviewsIntelligenceProps> = ({
  reviews,
  themes,
  onOpenSourceModal
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRating, setSelectedRating] = useState<number>(0);

  const filteredReviews = reviews.filter(r => {
    if (selectedCategory !== 'ALL' && r.complaint_category !== selectedCategory) return false;
    if (selectedRating > 0 && r.rating !== selectedRating) return false;
    return true;
  });

  return (
    <div id="reviews-intelligence-container" className="space-y-6 animate-fadeIn">
      {/* Header & Score Metrics */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-925 to-zinc-950 border border-zinc-800 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <MessageSquareWarning className="h-6 w-6" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-100">
                Trader Intelligence & Payout Dispute Forensics
              </h1>
            </div>
            <p className="text-xs text-zinc-300 max-w-3xl leading-relaxed">
              Aggregated dispute data from Trustpilot, PropFirmMatch, and verified trader case submissions. We pair each trader claim with the official firm reply and an objective evidence-based technical assessment.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800 shrink-0">
            <div className="text-center pr-4 border-r border-zinc-800">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Trustpilot Score</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">4.3 ★</span>
              <span className="text-[10px] text-zinc-400 block font-mono">1,120+ reviews</span>
            </div>
            <div className="text-left text-xs space-y-1">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-zinc-300 font-mono">Rise Payout: <strong>4-12 Hours</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-zinc-300 font-mono">Crypto: <strong>24-48 Hours</strong></span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold block">● Verified Payouts Ongoing</span>
            </div>
          </div>
        </div>

        {/* Complaint Themes Distribution Bar */}
        <div className="pt-2 border-t border-zinc-800/80 space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
            Click Complaint Vector to Filter:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {themes.map((theme, i) => (
              <button
                key={i}
                onClick={() => setSelectedCategory(selectedCategory === theme.theme ? 'ALL' : theme.theme)}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                  selectedCategory === theme.theme
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-lg shadow-amber-500/10'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-750 hover:bg-zinc-900'
                }`}
              >
                <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                  <span className="font-bold truncate">{theme.theme.replace(/_/g, ' ')}</span>
                  <span className="font-extrabold text-zinc-200">{theme.percentage}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full"
                    style={{ width: `${theme.percentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1.5 truncate">{theme.summary}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-400" />
            <span className="font-mono text-zinc-400">Category:</span>
            <select
              aria-label="Filter reviews by category"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-zinc-950 border border-zinc-750 rounded-xl px-3 py-1.5 text-zinc-200 font-mono focus:border-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="COORDINATED_TRADING_ALLEGATION">Coordinated Trading Allegations</option>
              <option value="PAYOUT_DENIAL">Payout Denials</option>
              <option value="MARGIN_RULE_FORFEITURE">80% Margin Rule Forfeiture</option>
              <option value="PLATFORM_ISSUES">Platform / Slippage Issues</option>
              <option value="REFUND_DISPUTE">Refund Disputes</option>
              <option value="POSITIVE_EXPERIENCE">Positive Verified Payouts</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-zinc-400">Rating:</span>
            <select
              aria-label="Filter reviews by star rating"
              value={selectedRating}
              onChange={e => setSelectedRating(Number(e.target.value))}
              className="bg-zinc-950 border border-zinc-750 rounded-xl px-3 py-1.5 text-zinc-200 font-mono focus:border-indigo-500 focus:outline-none"
            >
              <option value={0}>All Ratings</option>
              <option value={5}>★ 5 Stars</option>
              <option value={4}>★ 4 Stars</option>
              <option value={3}>★ 3 Stars</option>
              <option value={2}>★ 2 Stars</option>
              <option value={1}>★ 1 Star</option>
            </select>
          </div>
        </div>

        <span className="text-zinc-400 font-mono text-xs">
          Showing <strong>{filteredReviews.length}</strong> Reports
        </span>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {filteredReviews.map(review => (
          <div
            key={review.id}
            className="p-6 sm:p-7 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 shadow-xl space-y-4 transition-all"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center text-amber-400">
                  {Array.from({ length: review.rating }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <h3 className="font-bold text-sm text-zinc-100">{review.title}</h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <span className="text-zinc-300 font-semibold">{review.author}</span>
                <span>•</span>
                <span>{review.date}</span>
                <span>•</span>
                <span className="text-cyan-400 font-semibold">{review.platform}</span>
              </div>
            </div>

            {/* Trader Complaint Text */}
            <div className="space-y-2">
              <p className="text-xs text-zinc-300 leading-relaxed italic border-l-2 border-zinc-700 pl-3">
                &ldquo;{review.complaint_text}&rdquo;
              </p>
            </div>

            {/* Official Firm Response */}
            {review.firm_response && (
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-semibold">
                  <Building2 className="h-4 w-4" />
                  <span>Official Response from Goat Funded Trader:</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
                  {review.firm_response}
                </p>
              </div>
            )}

            {/* Independent Objective Analysis */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/20 via-zinc-950 to-zinc-950 border border-indigo-500/20 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold">
                <ShieldCheck className="h-4 w-4" />
                <span>Independent Technical Assessment:</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {review.independent_analysis}
              </p>
            </div>

            {/* Footer */}
            <div className="pt-2 flex items-center justify-between text-xs text-zinc-400">
              <span className="font-mono text-[11px]">
                Theme: <strong className="text-amber-300">{review.complaint_category.replace(/_/g, ' ')}</strong>
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <ThumbsUp className="h-3.5 w-3.5 text-zinc-500" />
                  <span>{review.helpful_votes} helpful</span>
                </span>
                <button
                  onClick={() => onOpenSourceModal({
                    title: `Review: ${review.title}`,
                    url: 'https://www.trustpilot.com/review/goatfundedtrader.com',
                    source_quote: review.complaint_text,
                    type: 'TRADER_REPORT',
                    confidence: 'B'
                  })}
                  className="text-indigo-400 hover:underline flex items-center gap-1 font-mono text-[11px] cursor-pointer"
                >
                  <FileText className="h-3 w-3" />
                  <span>View Evidence</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
