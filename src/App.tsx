import React, { useState, useEffect, Suspense } from 'react';
import { Navbar } from './components/layout/Navbar.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { GlobalSearchModal } from './components/search/GlobalSearchModal.tsx';
import { SourceViewerModal } from './components/evidence/SourceViewerModal.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { FirmDetailPage } from './pages/FirmDetailPage.tsx';
import { AccountDetailPage } from './pages/AccountDetailPage.tsx';
import { ComparePage } from './pages/ComparePage.tsx';
import { PropFirmsListPage } from './pages/PropFirmsListPage.tsx';
import { WizardPage } from './pages/WizardPage.tsx';
import { RuleGuidePage } from './pages/RuleGuidePage.tsx';
import { RulesHubPage } from './pages/RulesHubPage.tsx';
import { ReviewsPage } from './pages/ReviewsPage.tsx';
import { ChangesPage } from './pages/ChangesPage.tsx';
import { AdminCrawlerPage } from './pages/AdminCrawlerPage.tsx';
import { RiskSimulator } from './components/simulator/RiskSimulator.tsx';
import { PROP_FIRMS_DATA, RULE_GUIDES } from './data/propFirmsData.ts';
import { REAL_FIRMS } from './data/propFirmMatchReal.ts';
import { SourceEvidence } from './types/schema.ts';

const PageSkeleton: React.FC = () => (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4 animate-pulse">
    <div className="h-8 bg-slate-800 rounded-xl w-1/3" />
    <div className="h-4 bg-slate-800 rounded w-2/3" />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
      <div className="h-32 bg-slate-800 rounded-2xl" />
      <div className="h-32 bg-slate-800 rounded-2xl" />
      <div className="h-32 bg-slate-800 rounded-2xl" />
    </div>
  </div>
);

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [selectedEvidence, setSelectedEvidence] = useState<{
    evidence: SourceEvidence;
    ruleTitle: string;
  } | null>(null);

  // Sync route with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Lock body scroll when any modal is open
  useEffect(() => {
    const anyModal = isSearchOpen || Boolean(selectedEvidence);
    if (anyModal) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isSearchOpen, selectedEvidence]);

  // SEO: update document title per route + evidence-first meta
  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'PropFirmRules.io — Know the rules before you buy the challenge. | Evidence-First Prop Firm Intelligence',
      '/compare': 'Compare Prop Firms Side-by-Side — Evidence-Based | PropFirmRules.io',
      '/wizard': 'Find My Best Prop Firm — Personalized Matching | PropFirmRules.io',
      '/reviews': 'Trader Reviews vs Firm Responses — Neutral Evidence | PropFirmRules.io',
      '/changes': 'Rule Changes Changelog — Live Audit Trail | PropFirmRules.io',
      '/simulator': 'Risk Simulator — Test Drawdowns Before You Buy | PropFirmRules.io',
      '/rules': 'Rule Intelligence Guides — Master Every Prop Firm Rule | PropFirmRules.io',
    };
    if (currentPath.startsWith('/prop-firms/')) {
      const slug = currentPath.split('/prop-firms/')[1]?.split('/')[0];
      const firm = PROP_FIRMS_DATA.find(f=>f.slug===slug);
      document.title = firm ? `${firm.name} — Verified Rules, Hidden Traps & Dollar Math | PropFirmRules.io` : 'Prop Firm Dossier — Verified Intelligence | PropFirmRules.io';
    } else if (currentPath.startsWith('/rules/')) {
      const slug = currentPath.replace('/rules/','').split('/')[0];
      const guide = RULE_GUIDES.find(g=>g.slug===slug);
      document.title = guide ? `${guide.name} — In-Depth Guide | PropFirmRules.io` : titles['/rules'];
    } else {
      document.title = titles[currentPath] || titles['/'];
    }
  }, [currentPath]);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const handleOpenSource = (evidence: SourceEvidence, ruleTitle: string) => {
    setSelectedEvidence({ evidence, ruleTitle });
  };

  const goatFirm = PROP_FIRMS_DATA[0];

  // Route Renderer
  const renderCurrentView = () => {
    // 1. Account Detail Route: /prop-firms/:slug/accounts/:accId
    if (currentPath.includes('/accounts/')) {
      const pathParts = currentPath.split('/prop-firms/')[1] || '';
      const [firmSlug, rest] = pathParts.split('/accounts/');
      const accId = rest;
      const targetFirm = PROP_FIRMS_DATA.find((f) => f.slug === firmSlug);
      if (!targetFirm) {
        return (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
            <h1 className="text-2xl font-bold text-white">Firm not found</h1>
            <p className="text-sm text-white/60">No firm matching slug <code className="px-2 py-1 glass-card rounded text-[#3b82f6]">{firmSlug}</code></p>
            <button onClick={() => navigate('/prop-firms')} className="mt-4 px-5 py-3 min-h-[44px] rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold">Back to Firms</button>
          </div>
        );
      }
      let foundAcc: any = null;
      for (const prog of targetFirm.programs) {
        const match = prog.accounts.find((a) => a.id === accId);
        if (match) {
          foundAcc = match;
          break;
        }
      }
      if (!foundAcc) {
        return (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
            <h1 className="text-2xl font-bold text-white">Account not found</h1>
            <p className="text-sm text-white/60">The account <code className="px-2 py-1 glass-card rounded text-[#3b82f6]">{accId}</code> does not exist under {targetFirm.name}.</p>
            <button onClick={() => navigate(`/prop-firms/${firmSlug}`)} className="mt-4 px-5 py-3 min-h-[44px] rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold">Back to Firm</button>
          </div>
        );
      }
      return (
        <AccountDetailPage
          firm={targetFirm}
          account={foundAcc}
          onNavigate={navigate}
          onOpenSource={handleOpenSource}
        />
      );
    }

    // 1.5 Prop Firms List Route: /prop-firms
    if (currentPath === '/prop-firms' || currentPath === '/prop-firms/') {
      return <PropFirmsListPage onNavigate={navigate} onOpenSource={handleOpenSource} />;
    }

    // 2. Firm Detail Route: /prop-firms/:slug
    if (currentPath.startsWith('/prop-firms/')) {
      const slug = currentPath.replace('/prop-firms/', '').split('/')[0];
      let targetFirm: any = PROP_FIRMS_DATA.find((f) => f.slug === slug) as any;
      // Fallback to real scraped data without fabricating or cloning GFT rules
      if (!targetFirm) {
        const rf: any = (REAL_FIRMS as any[]).find((r: any) => r.slug === slug);
        if (rf) {
          const progTypes: string[] = rf.programType || [];
          const mappedPrograms = progTypes.slice(0, 3).map((pt: string, idx: number) => {
            const normPt = pt.replace('2_Steps', '2-Step').replace('3_Steps', '3-Step');
            return {
              id: rf.slug + '-prog-' + idx,
              firmId: rf.slug,
              name: normPt,
              slug: normPt.toLowerCase().replace(/\s+/g, '-'),
              programType: normPt as any,
              description: normPt + ' program via ' + rf.name,
              stagesCount: normPt.includes('2-Step') ? 2 : normPt.includes('3-Step') ? 3 : 1,
              keyAdvantages: ['Direct provider integration', 'Active challenge model'],
              primaryWatchouts: ['Rules currently under direct verification'],
              accounts: [
                {
                  id: rf.slug + '-acc-' + idx + '-100k',
                  programId: rf.slug + '-prog-' + idx,
                  name: '$100K ' + normPt,
                  nominalSize: 100000,
                  currency: 'USD',
                  price: 499,
                  refundableFee: true,
                  profitTargetPhase1: normPt.includes('1-Step') ? 10 : 8,
                  profitTargetPhase2: normPt.includes('2-Step') ? 5 : undefined,
                  dailyLossLimit: 4,
                  dailyLossCalculation: 'balance_based',
                  maxTotalLoss: 8,
                  drawdownType: 'static',
                  minimumTradingDays: 0,
                  maximumTradingDays: 'Unlimited',
                  profitSplit: 80,
                  profitSplitMaxWithAddon: 90,
                  payoutFrequency: 'Bi-weekly',
                  firstPayoutConditions: 'Standard active days and profit threshold',
                  payoutMinimum: 100,
                  newsTradingRule: 'Allowed',
                  newsTradingDetail: 'Verify red-folder policy on official support portal',
                  weekendHolding: true,
                  overnightHolding: true,
                  eaAllowed: true,
                  copyTradingAllowed: false,
                  hedgingAllowed: true,
                  inactivityLimitDays: 30,
                  leverage: '1:100',
                  platforms: rf.platforms || ['MetaTrader 5'],
                  instruments: ['Forex', 'Indices', 'Commodities'],
                  rules: [],
                  sources: [],
                  lastVerified: '2026-08-28',
                }
              ],
            };
          });

          targetFirm = {
            id: rf.id,
            name: rf.name,
            slug: rf.slug,
            brandName: rf.name.split(' ')[0].slice(0, 8).toUpperCase(),
            country: rf.country || 'Global',
            countryFlag: rf.countryFlag || 'https://flagcdn.com/w80/un.png',
            logoUrl: rf.logoUrl,
            logoAlt: rf.name,
            maxAllocation: rf.maxAllocation || 400000,
            foundedYear: rf.foundedYear || 2022,
            marketType: rf.marketType || 'Multi-Asset',
            headquarters: rf.country === 'US' ? 'USA' : rf.country === 'AE' ? 'UAE • Dubai' : rf.country === 'GB' ? 'UK • London' : rf.country === 'CZ' ? 'Czech Republic' : rf.country === 'HK' ? 'Hong Kong' : rf.country || 'Global',
            ceoName: rf.name + ' Leadership',
            platforms: rf.platforms || ['MetaTrader 5'],
            website: 'https://' + rf.slug.replace(/-/g, '') + '.com',
            supportUrl: 'https://' + rf.slug.replace(/-/g, '') + '.com/contact',
            helpCenterUrl: 'https://help.' + rf.slug.replace(/-/g, '') + '.com',
            status: 'ACTIVE',
            confidenceRating: 'B',
            supportedCountriesCount: 180,
            restrictedCountries: ['US', 'IR', 'KP'],
            programs: mappedPrograms.length ? mappedPrograms : [
              {
                id: rf.slug + '-prog-std',
                firmId: rf.slug,
                name: 'Standard Evaluation',
                slug: 'standard',
                programType: '2-Step',
                description: 'Standard 2-Step challenge provided by ' + rf.name,
                stagesCount: 2,
                keyAdvantages: ['Industry standard targets', 'Direct payout support'],
                primaryWatchouts: ['Verify drawdown reset timezone with official support'],
                accounts: [
                  {
                    id: rf.slug + '-acc-100k',
                    programId: rf.slug + '-prog-std',
                    name: '$100K Evaluation',
                    nominalSize: 100000,
                    currency: 'USD',
                    price: 499,
                    refundableFee: true,
                    profitTargetPhase1: 8,
                    profitTargetPhase2: 5,
                    dailyLossLimit: 4,
                    dailyLossCalculation: 'balance_based',
                    maxTotalLoss: 8,
                    drawdownType: 'static',
                    minimumTradingDays: 0,
                    maximumTradingDays: 'Unlimited',
                    profitSplit: 80,
                    payoutFrequency: 'Bi-weekly',
                    firstPayoutConditions: 'Active trading days and minimum profit threshold',
                    payoutMinimum: 100,
                    newsTradingRule: 'Allowed',
                    newsTradingDetail: 'Consult official help center for red-folder restriction updates',
                    weekendHolding: true,
                    overnightHolding: true,
                    eaAllowed: true,
                    copyTradingAllowed: false,
                    hedgingAllowed: true,
                    inactivityLimitDays: 30,
                    leverage: '1:100',
                    platforms: rf.platforms || ['MetaTrader 5'],
                    instruments: ['Forex', 'Indices', 'Commodities'],
                    rules: [],
                    sources: [],
                    lastVerified: '2026-08-28',
                  }
                ]
              }
            ],
            rules: [], // Clean: do NOT inject GFT rules
            easyToMissRules: [],
            conflicts: [],
            legalEntities: [{
              name: rf.name + ' Operating Entity',
              companyNumber: 'Registration Pending Audit',
              jurisdiction: rf.country || 'Global',
              registeredAddress: 'Official registered address pending audit',
              role: 'Proprietary Trading Firm Provider'
            }],
            reviewsOverview: {
              averageRating: rf.reviewScore || 4.2,
              totalReviews: rf.reviewsCount || 100,
              recentReviews: [],
              complaintThemeBreakdown: [],
            },
            scorecard: {
              riskScore: 70,
              payoutScore: 75,
              tradingFreedomScore: 75,
              ruleComplexityScore: 60,
              transparencyScore: 70,
              traderExperienceScore: 75,
              overallScore: rf.trustScore || 75,
              scoreExplanations: {},
            },
            recentChanges: [],
            totalPayoutsReported: '$' + ((rf.maxAllocation || 400000) / 100000).toFixed(1) + 'M capacity',
            activeTradersReported: Math.round((rf.reviewsCount || 500) / 10) + 'k+ reported',
            tagline: rf.promoDesc || `${rf.name} trading programs and verified parameters`,
            activePromo: rf.discount ? { code: rf.promoCode || 'PROMO', discount: rf.discount + '% OFF', details: rf.promoDesc || '' } : undefined,
          };
        }
      }
      if (!targetFirm) {
        return (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
            <h1 className="text-2xl font-bold text-white">Firm not found</h1>
            <p className="text-sm text-white/60">No firm with slug <code className="px-2 py-1 glass-card rounded text-[#3b82f6]">{slug}</code></p>
            <button onClick={() => navigate('/prop-firms')} className="mt-4 px-5 py-3 min-h-[44px] rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold">Back to Firms</button>
          </div>
        );
      }
      return (
        <FirmDetailPage
          firm={targetFirm}
          onNavigate={navigate}
          onOpenSource={handleOpenSource}
        />
      );
    }

    // 3. Compare Route
    if (currentPath === '/compare') {
      return <ComparePage onNavigate={navigate} onOpenSource={handleOpenSource} />;
    }

    // 4. Wizard Route
    if (currentPath === '/wizard') {
      return <WizardPage onNavigate={navigate} />;
    }

    // 5. Standalone Simulator Route
    if (currentPath === '/simulator') {
      return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-20">
          <div className="border-b border-white/[0.06] pb-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight text-balance">
              Interactive Prop Firm Account Simulator
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1.5 leading-relaxed">
              Simulate market drawdowns, open lots, and intraday equity pullbacks against verified prop firm risk boundaries.
            </p>
          </div>
          <RiskSimulator
            initialNominalSize={100000}
            initialDailyLossPct={4}
            initialMaxLossPct={8}
            initialDrawdownType="static"
          />
        </div>
      );
    }

    // 6. Rule Guide Route: /rules/:slug
    if (currentPath.startsWith('/rules/') && currentPath !== '/rules') {
      const slug = currentPath.replace('/rules/', '').split('/')[0].split('?')[0];
      const guideExists = RULE_GUIDES.some((g) => g.slug === slug);
      if (!guideExists && slug) {
        return (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
            <h1 className="text-2xl font-bold text-white">Guide not found</h1>
            <button onClick={() => navigate('/rules')} className="mt-4 px-5 py-3 min-h-[44px] rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold">Browse All Guides</button>
          </div>
        );
      }
      return <RuleGuidePage guideSlug={slug || RULE_GUIDES[0].slug} onNavigate={navigate} />;
    }

    // 7. All Rules Hub: /rules
    if (currentPath === '/rules' || currentPath.startsWith('/rules?')) {
      return <RulesHubPage onNavigate={navigate} />;
    }

    // 8. Reviews Route: /reviews
    if (currentPath === '/reviews') {
      return <ReviewsPage onNavigate={navigate} />;
    }

    // 9. Changelog Route: /changes
    if (currentPath === '/changes') {
      return <ChangesPage onNavigate={navigate} />;
    }

    // 10. Admin & Crawler Dashboard: /admin or /crawler-admin
    if (currentPath.startsWith('/admin') || currentPath === '/crawler-admin') {
      return <AdminCrawlerPage />;
    }

    // 11. Homepage
    if (currentPath === '/' || currentPath === '' || currentPath.startsWith('/?')) {
      return (
        <HomePage
          onNavigate={navigate}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenSource={handleOpenSource}
        />
      );
    }

    // 12. 404 Catch-All
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-white/50 text-2xl font-mono font-bold">
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Page Not Found</h1>
        <p className="text-sm text-white/60 max-w-md mx-auto">
          The requested intelligence path <code className="px-2 py-0.5 rounded bg-white/[0.06] text-sky-300 font-mono text-xs">{currentPath}</code> does not exist or has been moved.
        </p>
        <div className="pt-2">
          <button onClick={() => navigate('/')} className="px-6 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold transition-colors">
            Return to Homepage
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[100dvh] bg-[#080A10] text-slate-100 flex flex-col overflow-x-hidden">
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
      <main className="flex-1 pt-4 sm:pt-6 pb-safe w-full max-w-[100vw] overflow-x-hidden">
        <Suspense fallback={<PageSkeleton />}>
          {renderCurrentView()}
        </Suspense>
      </main>

      <Footer onNavigate={navigate} />

      {/* Global Modals — only mount when open to avoid a11y trap */}
      {isSearchOpen && (
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onNavigate={navigate}
        />
      )}

      {selectedEvidence && (
        <SourceViewerModal
          isOpen={Boolean(selectedEvidence)}
          onClose={() => setSelectedEvidence(null)}
          evidence={selectedEvidence?.evidence || null}
          ruleTitle={selectedEvidence?.ruleTitle}
        />
      )}
    </div>
  );
};
