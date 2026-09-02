import React from 'react';
import { PROP_FIRMS_DATA } from '../../data/propFirmsData.ts';
interface FooterProps { onNavigate: (path: string) => void; }
export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const firms = PROP_FIRMS_DATA;
  return (
    <footer className="border-t border-[#1F2228] bg-[#080A10] mt-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-white flex items-center justify-center"><div className="w-3 h-3 bg-[#080A10] rotate-45" /></div>
              <span className="text-sm font-semibold text-white">PropFirmRules</span>
            </div>
            <p className="text-xs leading-relaxed text-[#9CA3AF] mt-3 max-w-md">Independent, evidence-backed intelligence for prop firm traders. Every rule verified with source.</p>
            <p className="text-xs text-[#9CA3AF] mt-3">Not financial advice. Proprietary trading evaluations involve risk of loss. Verify all rules on official provider websites before purchasing.</p>
          </div>
          <div className="lg:col-span-2">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#9CA3AF] mb-3">Firms</p>
            {firms.slice(0,6).map(f=> <button key={f.id} onClick={() => onNavigate(`/prop-firms/${f.slug}`)} className="block text-xs text-[#8A8F98] hover:text-white py-1 text-left transition-colors">{f.name}</button>)}
          </div>
          <div className="lg:col-span-2">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#9CA3AF] mb-3">Intelligence</p>
            {[
              ['Firms Directory', '/prop-firms'],
              ['Strategy Matcher', '/wizard'],
              ['Compare Matrix', '/compare'],
              ['Account Simulator', '/simulator'],
              ['Rules Knowledge Hub', '/rules'],
              ['Evidence Registry', '/reviews'],
              ['Audit Changelog', '/changes'],
            ].map(([l,p])=> <button key={l} onClick={() => onNavigate(p)} className="block text-xs text-[#8A8F98] hover:text-white py-1 text-left transition-colors">{l}</button>)}
          </div>
          <div className="lg:col-span-3">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#9CA3AF] mb-3">Why Trust Us</p>
            <p className="text-xs leading-relaxed text-[#9CA3AF]">Every rule has a direct source excerpt + URL. Trader dispute claims remain strictly separated from official binding legal terms. Zero affiliate payola.</p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-[#1F2228] flex flex-col sm:flex-row justify-between gap-2 text-xs text-[#9CA3AF]">
          <span>© {new Date().getFullYear()} PropFirmRules — Independent Prop Trading Intelligence.</span>
          <span className="text-[#8A8F98]">Deterministic calculations • Verifiable citations</span>
        </div>
      </div>
    </footer>
  );
};
