import React, { useState, useEffect } from 'react';
import { Cookie, Shield, Check, X } from 'lucide-react';

interface CookieConsentProps {
  onNavigate: (path: string) => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ onNavigate }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: any = null;
    try {
      const consent = localStorage.getItem('pfr_cookie_consent');
      if (!consent) {
        // Show after a gentle 1.2s delay
        timer = setTimeout(() => setVisible(true), 1200);
      }
    } catch {
      // Storage blocked, ignore
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const updateGoogleConsent = (status: 'granted' | 'denied') => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        ad_storage: status,
        ad_user_data: status,
        ad_personalization: status,
        analytics_storage: status,
      });
    }
  };

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('pfr_cookie_consent', 'accepted');
    } catch {
      // ignore
    }
    updateGoogleConsent('granted');
    setVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem('pfr_cookie_consent', 'declined');
    } catch {
      // ignore
    }
    updateGoogleConsent('denied');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#0c101d] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/80 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex-shrink-0">
          <Cookie className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-white font-semibold">
            <span>Cookie & Privacy Consent</span>
            <Shield className="w-3 h-3 text-emerald-400" />
          </div>
          <p className="text-slate-300 leading-relaxed">
            We use cookies to audit prop firm traffic, optimize interactive calculators, and measure marketing performance. In accordance with Google Consent Mode v2 and GDPR/CCPA, you can choose your preference.
          </p>
          <div className="pt-1">
            <button
              onClick={() => onNavigate('/privacy')}
              className="text-sky-400 hover:underline text-[11px]"
            >
              Read our Privacy Policy
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.08]">
        <button
          onClick={handleAcceptAll}
          className="flex-1 py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <Check className="w-3.5 h-3.5" /> Accept All
        </button>
        <button
          onClick={handleDecline}
          className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-white/10"
        >
          <X className="w-3.5 h-3.5" /> Essential Only
        </button>
      </div>
    </aside>
  );
};
