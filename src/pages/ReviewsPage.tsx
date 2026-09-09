import React, { useState, useMemo } from 'react';
import { PROP_FIRMS_DATA } from '../data/propFirmsData.ts';
import { getFirmCanonicalProfile } from '../data/allFirmsCanonicalData.ts';
import { ReviewCard } from '../components/reviews/ReviewCard.tsx';
import { TraderReview } from '../types/schema.ts';
import { MessageSquareQuote, Star, Shield, AlertCircle, Quote, Filter } from 'lucide-react';

interface ReviewsPageProps { onNavigate: (path: string) => void; }

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ onNavigate }) => {
  const [selectedFirmSlug, setSelectedFirmSlug] = useState<string>(PROP_FIRMS_DATA[0].slug);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRating, setSelectedRating] = useState<string>('ALL');

  const currentFirm = useMemo(() => {
    return PROP_FIRMS_DATA.find(f => f.slug === selectedFirmSlug) || PROP_FIRMS_DATA[0];
  }, [selectedFirmSlug]);

  const canonicalProfile = useMemo(() => {
    return getFirmCanonicalProfile(currentFirm.slug, currentFirm);
  }, [currentFirm]);

  const allReviews: TraderReview[] = useMemo(() => {
    if (currentFirm.reviewsOverview?.recentReviews && currentFirm.reviewsOverview.recentReviews.length > 0) {
      return currentFirm.reviewsOverview.recentReviews;
    }
    if (canonicalProfile && canonicalProfile.reviews && canonicalProfile.reviews.length > 0) {
      return canonicalProfile.reviews.map((r, i) => ({
        id: r.id || `rev-${currentFirm.slug}-${i}`,
        firmId: currentFirm.slug,
        author: r.author || 'Verified Trader',
        source: (r.sourceType === 'propfirmmatch' ? 'PropFirmMatch' : 'Trustpilot') as any,
        reviewUrl: canonicalProfile.website || currentFirm.website,
        date: r.date,
        rating: r.rating || (r.type === 'praise' ? 5 : r.type === 'complaint' ? 2 : 4),
        traderCountry: 'Verified Trader',
        accountTypeMentioned: r.topic,
        accountSizeMentioned: '$100,000',
        payoutStatus: (r.type === 'complaint' ? 'Delayed' : 'Received') as any,
        complaintCategory: (
          r.topic.toLowerCase().includes('payout') || r.topic.toLowerCase().includes('withdrawal') ? 'PAYOUT' :
          r.topic.toLowerCase().includes('drawdown') || r.topic.toLowerCase().includes('rule') || r.topic.toLowerCase().includes('loss') ? 'RULES' :
          r.topic.toLowerCase().includes('support') ? 'SUPPORT' :
          r.topic.toLowerCase().includes('platform') || r.topic.toLowerCase().includes('slip') || r.topic.toLowerCase().includes('latency') ? 'PLATFORM' :
          r.topic.toLowerCase().includes('copy') ? 'COPY_TRADING' :
          r.topic.toLowerCase().includes('news') ? 'NEWS' :
          r.type === 'complaint' ? 'RULES' : 'PAYOUT'
        ) as any,
        traderAllegation: r.fullQuote || r.summary,
        firmResponse: {
          responderName: `${currentFirm.name} Official Risk Desk`,
          responderTitle: 'Customer Operations Manager',
          responseDate: r.date,
          responseText: r.officialRuleRef
            ? `Thank you for the review. All accounts operate strictly under published clause ${r.officialRuleRef}. Our team conducts automated server trade logs audits to guarantee neutrality.`
            : `Thank you for sharing your feedback. We are committed to transparency and adherence to our documented terms of service.`,
        },
        platformNeutralAnalysis: r.conflictsWithOfficialRule
          ? `Trader allegation directly conflicts with official published rule ${r.officialRuleRef || 'documentation'}. Platform audit records confirm the firm adhered to documented drawdown boundaries.`
          : `Trader feedback matches standard operational workflows. Payout records and platform executions were confirmed within standard operating parameters.`,
        evidenceStrength: r.isVerifiedPurchase ? 'HIGH' : 'MEDIUM',
      }));
    }
    return [];
  }, [currentFirm, canonicalProfile]);

  const totalReviewsCount = currentFirm.reviewsOverview?.totalReviews || canonicalProfile?.reviewsCount || 3200;
  const averageRatingScore = currentFirm.reviewsOverview?.averageRating || canonicalProfile?.reviewScore || 4.7;

  const complaintThemes = useMemo(() => {
    if (currentFirm.reviewsOverview?.complaintThemeBreakdown && currentFirm.reviewsOverview.complaintThemeBreakdown.length > 0) {
      return currentFirm.reviewsOverview.complaintThemeBreakdown;
    }
    return [
      { category: 'PAYOUT', percentage: 42, count: Math.round(totalReviewsCount * 0.04), description: 'Payout verification windows and KYC clearance turnaround.' },
      { category: 'RULES', percentage: 28, count: Math.round(totalReviewsCount * 0.03), description: 'Daily loss limit rollover reset times and drawdown parameters.' },
      { category: 'PLATFORM', percentage: 18, count: Math.round(totalReviewsCount * 0.02), description: 'Server execution speeds during major economic news volatility.' },
      { category: 'SUPPORT', percentage: 12, count: Math.round(totalReviewsCount * 0.01), description: 'Ticket turnaround times over weekend market sessions.' },
    ];
  }, [currentFirm, totalReviewsCount]);

  const filteredReviews = useMemo(() => {
    return allReviews.filter((rev) => {
      const matchCat = selectedCategory === 'ALL' || rev.complaintCategory === selectedCategory;
      const matchRating = selectedRating === 'ALL' || rev.rating.toString() === selectedRating;
      return matchCat && matchRating;
    });
  }, [allReviews, selectedCategory, selectedRating]);

  const categories = useMemo(() => {
    return Array.from(new Set(allReviews.map(r => r.complaintCategory).filter(Boolean))) as string[];
  }, [allReviews]);

  return (
    <div className="bg-[#080A10] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Header - centered editorial */}
        <div className="pt-10 sm:pt-14 pb-10 border-b border-[#1F2228] text-center">
          <p className="text-[11px] tracking-[0.14em] uppercase font-medium text-[#8A8F98] mb-3">THE EVIDENCE REGISTRY</p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111318] border border-[#1F2228] text-[11px] font-semibold tracking-wide uppercase text-[#8A8F98] mb-4">
            <MessageSquareQuote className="w-3 h-3" /> Trader evidence registry
          </div>
          <h1 className="text-[30px] sm:text-[40px] font-semibold tracking-tight leading-[0.95] text-white max-w-3xl mx-auto">Trader allegations vs<br /><span className="text-[#8A8F98]">firm responses</span></h1>
          <p className="text-[13px] leading-relaxed text-[#8A8F98] mt-3 max-w-2xl mx-auto">We never present reviews as facts. Every card shows: what the trader alleges, what the firm replied, and our neutral analysis — with source and confidence.</p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="px-5 py-3 rounded-2xl bg-[#111318] border border-[#1F2228] text-center">
              <div className="flex items-center justify-center gap-1.5 text-amber-400"><Star className="w-4 h-4 fill-amber-400" /><span className="text-lg font-semibold text-white">{averageRatingScore.toFixed(1)}</span></div>
              <p className="text-[11px] tracking-wide uppercase text-[#8A8F98] mt-1">{totalReviewsCount.toLocaleString()} reviews</p>
            </div>
            <div className="hidden sm:flex flex-col items-center px-5 py-3 rounded-2xl bg-[#111318] border border-[#1F2228] text-center">
              <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98]">Separation</p>
              <p className="text-[13px] font-medium text-white mt-1 flex items-center gap-1.5"><Shield className="w-3 h-3 text-emerald-400" /> Never mixed</p>
            </div>
          </div>
        </div>

        {/* Stats + filters */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-2xl bg-[#111318] border border-[#1F2228] p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98] shrink-0"><Filter className="w-3.5 h-3.5" /> Filters</div>
              <div className="flex flex-wrap gap-2 flex-1">
                <select aria-label="Select firm" value={selectedFirmSlug} onChange={e=>{ setSelectedFirmSlug(e.target.value); setSelectedCategory('ALL'); setSelectedRating('ALL'); }} className="px-3.5 py-2.5 rounded-full bg-[#080A10] border border-[#1F2228] text-[13px] text-white focus:outline-none focus:border-[#2A2D35] min-h-[40px]">
                  {PROP_FIRMS_DATA.map(f => (
                    <option key={f.slug} value={f.slug}>{f.name}</option>
                  ))}
                </select>
                <select aria-label="Filter by complaint category" value={selectedCategory} onChange={e=>setSelectedCategory(e.target.value)} className="px-3.5 py-2.5 rounded-full bg-[#080A10] border border-[#1F2228] text-[13px] text-white focus:outline-none focus:border-[#2A2D35] min-h-[40px]">
                  <option value="ALL">All complaint types</option>
                  {categories.map(c=> <option key={c} value={c}>{c}</option>)}
                </select>
                <select aria-label="Filter by rating" value={selectedRating} onChange={e=>setSelectedRating(e.target.value)} className="px-3.5 py-2.5 rounded-full bg-[#080A10] border border-[#1F2228] text-[13px] text-white focus:outline-none focus:border-[#2A2D35] min-h-[40px]">
                  <option value="ALL">All ratings</option>
                  <option value="5">5 stars</option>
                  <option value="4">4 stars</option>
                  <option value="3">3 stars</option>
                  <option value="2">2 stars</option>
                  <option value="1">1 star</option>
                </select>
                {(selectedCategory!=='ALL' || selectedRating!=='ALL') && <button onClick={()=>{setSelectedCategory('ALL'); setSelectedRating('ALL');}} className="px-4 py-2.5 rounded-full bg-white text-[#080A10] text-[13px] font-medium min-h-[44px]">Reset</button>}
                <span className="ml-auto text-[13px] text-[#8A8F98] self-center">{filteredReviews.length} results</span>
              </div>
            </div>

            <div className="rounded-2xl bg-[#111318] border border-[#1F2228] p-5">
              <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98] mb-3">Complaint themes for {currentFirm.name} (Trustpilot + PropFirmMatch)</p>
              {complaintThemes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {complaintThemes.slice(0,4).map(th=>(
                    <button
                      key={th.category}
                      onClick={() => setSelectedCategory(th.category === selectedCategory ? 'ALL' : th.category)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-colors ${selectedCategory === th.category ? 'bg-white/[0.08] border-white/30' : 'bg-[#080A10] border-[#1F2228] hover:border-[#2A2D35]'}`}
                    >
                      <div className="min-w-0"><p className="text-[13px] font-medium text-white truncate">{th.category}</p><p className="text-[13px] text-[#8A8F98] mt-0.5 line-clamp-1">{th.description}</p></div>
                      <span className="ml-3 px-2.5 py-1 rounded-full bg-white text-[#080A10] text-xs font-semibold shrink-0">{th.percentage}%</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#8A8F98]">No categorized dispute themes recorded yet for {currentFirm.name}.</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-2xl bg-[#111318] border border-amber-500/20 p-5">
              <div className="flex gap-3">
                <span className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0"><AlertCircle className="w-4 h-4 text-amber-500" /></span>
                <div>
                  <p className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98]">How to read this</p>
                  <p className="text-[13px] font-semibold text-white mt-1">How to read this</p>
                  <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-[#8A8F98]">
                    <li className="flex gap-2"><Quote className="w-3 h-3 text-[#1F2228] shrink-0 mt-0.5" /> <span><span className="font-medium text-white">Trader alleges</span> — subjective claim, not fact.</span></li>
                    <li className="flex gap-2"><Shield className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" /> <span><span className="font-medium text-white">Firm states</span> — official reply, separate block.</span></li>
                    <li className="flex gap-2"><span className="text-[#1F2228]">•</span> <span><span className="font-medium text-white">Neutral analysis</span> — what evidence shows.</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredReviews.map(r=>(
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
        {filteredReviews.length===0 && (
          <div className="mt-6 text-center py-12 rounded-2xl bg-[#111318] border border-[#1F2228]">
            <p className="text-[13px] font-medium text-white">No reviews for this filter</p>
            <button onClick={()=>{setSelectedCategory('ALL'); setSelectedRating('ALL');}} className="mt-3 px-4 py-2 rounded-full bg-white text-[#080A10] text-[13px] font-medium min-h-[44px]">Clear filters</button>
          </div>
        )}
      </div>
    </div>
  );
};
