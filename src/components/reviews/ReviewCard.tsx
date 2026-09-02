import React from 'react';
import { TraderReview } from '../../types/schema.ts';
import { Star, ShieldAlert, CornerDownRight, Scale } from 'lucide-react';

interface ReviewCardProps {
  review: TraderReview;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'PAYOUT': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'COPY_TRADING':
      case 'RULES': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'INACTIVITY': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-[#080A10] text-[#8A8F98] border-[#1F2228]';
    }
  };

  return (
    <div className="bg-[#111318] border border-[#1F2228] rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F2228] pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-[#080A10] border border-[#1F2228] flex items-center justify-center font-mono font-bold text-white text-xs shrink-0">
            {review.author.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-white text-sm">{review.author}</span>
              {review.traderCountry && <span className="text-xs font-mono text-[#6B7280] hidden sm:inline">({review.traderCountry})</span>}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-[#6B7280] mt-0.5">
              <span className="text-xs">{review.source}</span>
              <span className="hidden xs:inline">•</span>
              <span>{review.date}</span>
              {review.accountSizeMentioned && (
                <>
                  <span className="hidden xs:inline">•</span>
                  <span className="text-[#3b82f6] font-mono text-xs truncate">{review.accountSizeMentioned} {review.accountTypeMentioned}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {review.complaintCategory && (
            <span className={`px-2.5 py-1 text-[10px] font-mono font-bold tracking-widest uppercase rounded-full border whitespace-nowrap ${getCategoryBadge(review.complaintCategory)}`}>
              {review.complaintCategory.replace(/_/g, ' ')}
            </span>
          )}
          <span className="flex items-center gap-1 text-amber-400 text-xs font-mono font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 whitespace-nowrap">
            <Star className="w-3 h-3 fill-amber-400 shrink-0" />
            {review.rating}/5
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[#6B7280] font-mono font-bold tracking-widest uppercase text-[10px]">
          <ShieldAlert className="w-3.5 h-3.5 text-[#8A8F98] shrink-0" />
          <span>Trader Statement / Allegation</span>
        </div>
        <p className="text-xs sm:text-sm text-[#E5E7EB] leading-relaxed bg-[#080A10] p-3 sm:p-3.5 rounded-xl border border-[#1F2228] break-words">
          "{review.traderAllegation}"
        </p>
      </div>

      {review.firmResponse && (
        <div className="space-y-2 pl-3 sm:pl-4 border-l-2 border-[#2563eb]/40 ml-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[#6B7280] font-mono font-bold text-[10px] tracking-widest uppercase">
            <CornerDownRight className="w-3.5 h-3.5 text-[#3b82f6] shrink-0" />
            <span className="break-words">Official Firm Response</span>
            <span className="text-[#3A3E47] font-mono font-normal normal-case hidden sm:inline">— {review.firmResponse.responderName} • {review.firmResponse.responseDate}</span>
          </div>
          <p className="sm:hidden text-xs font-mono text-[#6B7280]">{review.firmResponse.responderName} • {review.firmResponse.responseDate}</p>
          <p className="text-xs sm:text-sm text-[#8A8F98] leading-relaxed bg-[#080A10] p-3 sm:p-3.5 rounded-xl border border-[#1F2228] italic break-words">
            "{review.firmResponse.responseText}"
          </p>
        </div>
      )}

      <div className="pt-3 border-t border-[#1F2228] flex items-start gap-2.5 text-xs sm:text-sm text-[#8A8F98]">
        <Scale className="w-4 h-4 text-[#3b82f6] shrink-0 mt-0.5" />
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-white text-[11px] font-mono tracking-widest uppercase">Platform Assessment</span>
            <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20">
              Evidence: {review.evidenceStrength}
            </span>
          </div>
          <p className="leading-relaxed break-words text-xs text-[#8A8F98]">
            {review.platformNeutralAnalysis}
          </p>
        </div>
      </div>
    </div>
  );
};
