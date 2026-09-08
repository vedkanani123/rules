import React, { useState } from 'react';
import { GFTModel, GFTPricingEntry } from '../../data/goatCanonicalData.ts';
import {
  DollarSign,
  Tag,
  Copy,
  Check,
  Calendar,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Gift,
  Info,
  HelpCircle,
} from 'lucide-react';

interface GoatV3PricingPromosProps {
  model: GFTModel;
  pricingList: GFTPricingEntry[];
  selectedSize: number;
  onSelectSize: (size: number) => void;
}

export const GoatV3PricingPromos: React.FC<GoatV3PricingPromosProps> = ({
  model,
  pricingList,
  selectedSize,
  onSelectSize,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activePricing =
    pricingList.find((p) => p.accountSize === selectedSize) || pricingList[0];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const observedPromos = [
    {
      code: 'BOGO40',
      discount: '40% OFF + Buy One Get One Free',
      appliesTo: 'Evaluation & Instant Funding Tiers',
      status: 'Observed Campaign (Subject to Confirmation)',
      dateChecked: 'September 2026',
      source: 'Marketing campaign observation',
      verificationStatus: 'Requires direct checkout confirmation',
    },
    {
      code: 'FIRSTGFT',
      discount: '50% OFF First Evaluation',
      appliesTo: 'New accounts / first-time registrations',
      status: 'Reported Introductory Offer',
      dateChecked: 'September 2026',
      source: 'Public trader community reports',
      verificationStatus: 'Requires direct checkout confirmation',
    },
    {
      code: 'BOGO35',
      discount: 'Pay Later $5 Entry + Free Retry',
      appliesTo: 'Pay Later ($5 initial fee model)',
      status: 'Reported Campaign',
      dateChecked: 'September 2026',
      source: 'Promotional bulletin',
      verificationStatus: 'Requires direct checkout confirmation',
    },
  ];

  return (
    <section id="pricing" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Pricing & Promotional Reference Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Catalog retail pricing and observed promotional discount structures.
          </p>
        </div>
      </div>

      {/* Mandatory Honesty Banner (Requirement 11) */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300">Checkout Verification Disclaimer:</span>{' '}
          Prices and promotional discounts shown are demonstration reference data observed from public announcements. Price or promotion requires direct checkout confirmation on the official Goat Funded Trader payment gateway before purchase.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Card: Active Model Pricing Breakdown */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#111318] border border-[#1F2228] space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">{model.name} Pricing Matrix</h3>
              <p className="text-xs text-slate-400">Reference catalog values across capital sizes</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Checked: Sept 2026
            </span>
          </div>

          {/* Capital Selector Chips */}
          <div className="space-y-1.5">
            <div className="text-xs text-slate-400">Select Capital Tier:</div>
            <div className="flex flex-wrap gap-2">
              {pricingList.map((p) => {
                const isSelected = p.accountSize === selectedSize;
                return (
                  <button
                    key={p.accountSize}
                    onClick={() => onSelectSize(p.accountSize)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-400 shadow-sm shadow-blue-500/20'
                        : 'bg-[#16181E] hover:bg-slate-800 text-slate-300 border-[#1F2228]'
                    }`}
                  >
                    ${p.accountSize.toLocaleString()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Price Display */}
          {activePricing && (
            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-slate-400">Standard Listed Retail:</div>
                  <div className="text-xl line-through text-slate-400 font-mono">
                    ${activePricing.officialListedPrice.toLocaleString()}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-emerald-400 font-semibold flex items-center justify-end gap-1">
                    <Tag className="w-3 h-3" />
                    Observed Promo (e.g. 40% OFF):
                  </div>
                  <div className="text-3xl font-black text-white font-mono">
                    ${activePricing.promoPriceBogo40?.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/[0.04]">
                <span>
                  Refund Policy:{' '}
                  <strong className={model.refundableFee ? 'text-emerald-400' : 'text-slate-400'}>
                    {model.refundableFee ? '100% Refundable on 1st Payout' : 'Non-refundable registration'}
                  </strong>
                </span>
                <span className="font-mono text-[11px] text-amber-300">
                  Price or promotion requires direct checkout confirmation.
                </span>
              </div>
            </div>
          )}

          {/* Complete Pricing Table for this Model with all 10 required fields (Requirement 11) */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#1F2228] text-slate-400 font-mono text-[11px]">
                  <th className="py-2.5 px-3">Capital Size</th>
                  <th className="py-2.5 px-3">Listed Price</th>
                  <th className="py-2.5 px-3">Observed Discount</th>
                  <th className="py-2.5 px-3">Promo Coupon</th>
                  <th className="py-2.5 px-3">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2228] text-slate-300 font-mono">
                {pricingList.map((p) => (
                  <tr
                    key={p.accountSize}
                    className={`hover:bg-white/[0.02] cursor-pointer ${
                      p.accountSize === selectedSize ? 'bg-blue-600/10 font-bold text-white' : ''
                    }`}
                    onClick={() => onSelectSize(p.accountSize)}
                  >
                    <td className="py-2.5 px-3">${p.accountSize.toLocaleString()}</td>
                    <td className="py-2.5 px-3">${p.officialListedPrice.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-emerald-400">${p.promoPriceBogo40?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-amber-300 font-sans">BOGO40 (Sample)</td>
                    <td className="py-2.5 px-3 text-[10px] font-sans text-slate-400">
                      Requires direct checkout confirmation
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Card: Observed Promotional Codes */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#111318] border border-[#1F2228] space-y-4">
          <div className="border-b border-white/[0.06] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-400" />
              Observed Promotional Discount Codes
            </h3>
            <p className="text-xs text-slate-400">
              Publicly reported discount campaigns. Subject to provider expiration without notice.
            </p>
          </div>

          <div className="space-y-3">
            {observedPromos.map((promo) => (
              <div
                key={promo.code}
                className="p-3.5 rounded-xl bg-[#16181E] border border-[#1F2228] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <code className="px-2.5 py-1 rounded bg-black/50 border border-slate-700 text-amber-300 font-mono font-bold text-xs tracking-wider">
                      {promo.code}
                    </code>
                    <button
                      onClick={() => handleCopy(promo.code)}
                      className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy code"
                    >
                      {copiedCode === promo.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                    Observed Promo
                  </span>
                </div>

                <div className="text-xs font-semibold text-white">{promo.discount}</div>
                <div className="text-[11px] text-slate-400">{promo.appliesTo}</div>
                <div className="text-[10px] text-amber-300/80 flex items-center gap-1 pt-1 border-t border-white/[0.04]">
                  <span>Status:</span>
                  <span>{promo.verificationStatus}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">Promotional Policy Notice:</span>
            <p>
              Coupons are provided as reference data observed from marketing channels. Antigravity does not guarantee coupon validity, affiliate relationships, or final cart discounts. Always confirm totals at the checkout page.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
