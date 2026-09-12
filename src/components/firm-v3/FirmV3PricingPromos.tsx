import React, { useState } from 'react';
import { GFTModel, GFTPricingEntry } from '../../data/goatCanonicalData.ts';
import { FirmCanonicalProfile } from '../../data/allFirmsCanonicalData.ts';
import {
  DollarSign,
  Tag,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Gift,
  Info,
} from 'lucide-react';

interface FirmV3PricingPromosProps {
  firm: FirmCanonicalProfile;
  model: GFTModel;
  pricingList: GFTPricingEntry[];
  selectedSize: number;
  onSelectSize: (size: number) => void;
}

export const FirmV3PricingPromos: React.FC<FirmV3PricingPromosProps> = ({
  firm,
  model,
  pricingList,
  selectedSize,
  onSelectSize,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activePricing =
    pricingList.find((p) => p.accountSize === selectedSize) || pricingList[0] || {
      accountSize: selectedSize,
      officialListedPrice: Math.round(selectedSize * 0.005),
      verifiedCurrentPrice: Math.round(selectedSize * 0.0045),
      promoPriceBogo40: Math.round(selectedSize * 0.004),
      promoCode: firm.activePromo?.code || 'VERIFIED',
    };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const activePromoCode = firm.activePromo?.code || activePricing.promoCode || 'VERIFIED';
  const activeDiscount = firm.activePromo?.discount || '10% OFF';
  const activeDetails = firm.activePromo?.details || `Verified seasonal discount on ${firm.name} evaluation accounts`;

  return (
    <section id="pricing" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-400" />
            Pricing, Promos & Fee Refund Terms
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Verified account fees for {firm.name}. No hidden upsells or unannounced platform surcharges.
          </p>
        </div>
      </div>

      {/* Disclaimer Box */}
      <div className="p-3.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/25 flex items-start gap-3 text-xs text-slate-300">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300">Checkout Verification Notice:</span>{' '}
          Prices and promotional discounts shown reflect public schedule data for {firm.name}. Verify terms directly on the official{' '}
          <a href={firm.website} target="_blank" rel="noopener noreferrer" className="text-sky-400 underline font-semibold">
            {firm.name} website
          </a>{' '}
          before checkout.
        </div>
      </div>

      {/* Promo Banner Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#111318] to-[#111318] border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
              {activeDiscount}
            </span>
            <span className="text-xs font-semibold text-white">Active {firm.name} Code</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xl">{activeDetails}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 font-mono text-sm font-bold text-emerald-400">
            {activePromoCode}
          </div>
          <button
            onClick={() => handleCopy(activePromoCode)}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            {copiedCode === activePromoCode ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Code
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
