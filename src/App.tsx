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
import { GoatRulesDemoPage } from './pages/GoatRulesDemoPage.tsx';
import { GoatResearchTerminalV3Page } from './pages/GoatResearchTerminalV3Page.tsx';
import { FirmResearchTerminalV3Page } from './pages/FirmResearchTerminalV3Page.tsx';
import { RiskSimulator } from './components/simulator/RiskSimulator.tsx';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage.tsx';
import { TermsPage } from './pages/TermsPage.tsx';
import { DisclaimerPage } from './pages/DisclaimerPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { AttributeLandingPage } from './pages/AttributeLandingPage.tsx';
import { CookieConsent } from './components/layout/CookieConsent.tsx';
import { trackEvent } from './utils/analytics.ts';
import { PROP_FIRMS_DATA, RULE_GUIDES } from './data/propFirmsData.ts';
import { REAL_FIRMS } from './data/propFirmMatchReal.ts';
import { SourceEvidence } from './types/schema.ts';
import { getRouteSEOData as getRouteByPath } from './core/seo/routesRegistry.ts';
import { BASE_URL } from './core/seo/schemaGenerator.ts';

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
  const getPath = () => window.location.pathname + window.location.search + window.location.hash;
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

  // Route metadata synchronization
  useEffect(() => {
    const cleanPath = currentPath === '/' ? '/' : currentPath.split('?')[0].split('#')[0];
    const registeredRoute = getRouteByPath(cleanPath);

    let title = registeredRoute?.title;
    let desc = registeredRoute?.metaDescription;

    if (!title || !desc) {
      if (currentPath.startsWith('/prop-firms/')) {
        const slug = currentPath.split('/prop-firms/')[1]?.split('/')[0]?.split('?')[0];
        const firm = PROP_FIRMS_DATA.find((f) => f.slug === slug);
        if (firm) {
          title = `${firm.name} — Verified Rules, Hidden Traps & Dollar Math | FundedTradingRules.com`;
          desc = `Complete evidence dossier for ${firm.name}. Verified drawdown calculation, consistency limits, news trading rules, and trader dispute track record.`;
        } else {
          title = 'Prop Firm Dossier — Verified Intelligence | FundedTradingRules.com';
          desc = 'Browse proprietary trading firms with verified rules, drawdown models, profit targets, payout consistency rules, and official contract citations.';
        }
      } else if (currentPath.startsWith('/rules/')) {
        const slug = currentPath.replace('/rules/', '').split('/')[0]?.split('?')[0];
        const guide = RULE_GUIDES.find((g) => g.slug === slug);
        if (guide) {
          title = `${guide.name} — In-Depth Rule Guide & Traps | FundedTradingRules.com`;
          desc = guide.shortDefinition || `Comprehensive guide to ${guide.name} across proprietary trading firms. How it's calculated, violation triggers, and defense playbook.`;
        } else {
          title = 'Rule Intelligence Guides — Master Every Prop Firm Rule | FundedTradingRules.com';
          desc = 'Deep architectural guides to every prop firm rule: trailing vs balance drawdown, 2-minute news buffers, 80% margin limits, and IP clustering.';
        }
      } else {
        title = 'FundedTradingRules.com — Know the rules before you buy the challenge. | Evidence-First Prop Firm Intelligence';
        desc = 'Know the rules before you buy the challenge. Compare prop firms with verified official rules, plain-English explanations, real trader complaints, and account risk simulation.';
      }
    }

    // 1. Update Title
    document.title = title;

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', desc);

    // 3. Update Canonical Tag
    const canonicalUrl = `${BASE_URL}${cleanPath === '/' ? '' : cleanPath}`;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // 4. Update OpenGraph Tags
    const setMetaProp = (prop: string, val: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', prop);
        document.head.appendChild(el);
      }
      el.setAttribute('content', val);
    };

    const setMetaName = (name: string, val: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', val);
    };

    setMetaProp('og:title', title);
    setMetaProp('og:description', desc);
    setMetaProp('og:url', canonicalUrl);
    setMetaName('twitter:title', title);
    setMetaName('twitter:description', desc);

    // 5. Track Virtual Pageview for Google Ads & Analytics
    trackEvent('page_view', {
      page_title: title,
      page_location: canonicalUrl,
      page_path: currentPath,
    });
  }, [currentPath]);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(window.location.pathname || '/');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Scroll restoration: top on route change; anchor scroll when hash present
    requestAnimationFrame(() => {
      const hash = window.location.hash;
      if (hash) {
        const el = document.querySelector(hash);
        if (el) { el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); return; }
      }
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
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

    // 1.4 Attribute Landing Pages: /prop-firms/with-:attr (e.g. with-static-drawdown, with-no-consistency-rule)
    if (currentPath.startsWith('/prop-firms/with-')) {
      const attrSlug = currentPath.replace('/prop-firms/', '').split('/')[0].split('?')[0];
      return <AttributeLandingPage attributeSlug={attrSlug} onNavigate={navigate} />;
    }

    // 1.5 Prop Firms List Route: /prop-firms, /firms, /directory
    if (
      currentPath === '/prop-firms' ||
      currentPath === '/prop-firms/' ||
      currentPath === '/firms' ||
      currentPath === '/firms/' ||
      currentPath === '/directory'
    ) {
      return <PropFirmsListPage onNavigate={navigate} onOpenSource={handleOpenSource} />;
    }

    // 1.7 Third Demo Page (V3 Research Terminal): /demo-3, /demo3, /demo-v3, /v3, /research, /prop-firms/goat-funded-trader/demo-3
    if (
      currentPath === '/demo-3' ||
      currentPath === '/demo3' ||
      currentPath === '/demo-v3' ||
      currentPath === '/v3' ||
      currentPath === '/goat-research' ||
      currentPath === '/research' ||
      currentPath.startsWith('/prop-firms/goat-funded-trader/demo-3') ||
      currentPath.startsWith('/prop-firms/goat-funded-trader/v3')
    ) {
      return <GoatResearchTerminalV3Page onNavigate={navigate} onOpenSource={handleOpenSource} />;
    }

    // 1.8 Demo Visual Rules Route: /demo-rules or /prop-firms/goat-funded-trader/demo
    if (
      currentPath === '/demo-rules' ||
      currentPath === '/demo' ||
      currentPath === '/goat-rules-demo' ||
      currentPath.startsWith('/prop-firms/goat-funded-trader/demo')
    ) {
      return <GoatRulesDemoPage onNavigate={navigate} onOpenSource={handleOpenSource} />;
    }

    // 1.9 Classic / Original / Legacy Firm Detail Route (Preserved legacy page without editing): /prop-firms/:slug/classic, /original, /legacy, /v1
    if (
      currentPath.includes('/classic') ||
      currentPath.includes('/original') ||
      currentPath.includes('/legacy') ||
      currentPath.includes('/v1')
    ) {
      const rawSlug = currentPath.replace('/prop-firms/', '').replace('/firm/', '').split('/')[0];
      const targetFirm: any = (PROP_FIRMS_DATA.find((f) => f.slug === rawSlug) || PROP_FIRMS_DATA[0]) as any;
      return <FirmDetailPage firm={targetFirm} onNavigate={navigate} onOpenSource={handleOpenSource} />;
    }

    // 1.95 Main Goat Funded Trader Route -> Research Terminal v3 (The #1 comprehensive research station - UNTOUCHED)
    if (
      currentPath === '/prop-firms/goat-funded-trader' ||
      currentPath === '/prop-firms/goat-funded-trader/' ||
      currentPath === '/firm/goat-funded-trader'
    ) {
      return <GoatResearchTerminalV3Page onNavigate={navigate} onOpenSource={handleOpenSource} />;
    }

    // 2. Firm Detail Route: /prop-firms/:slug or /firm/:slug -> Universal Research Terminal v3 for all companies
    if (currentPath.startsWith('/prop-firms/') || currentPath.startsWith('/firm/')) {
      const rawSlug = currentPath.replace('/prop-firms/', '').replace('/firm/', '').split('/')[0];
      const slug = (rawSlug || '').split('?')[0].split('#')[0];
      return (
        <FirmResearchTerminalV3Page
          slug={slug}
          onNavigate={navigate}
          onOpenSource={handleOpenSource}
        />
      );
    }

    // 3. Compare Route (with support for dedicated pair URLs: /compare/:pair e.g. /compare/ftmo-vs-topstep)
    if (currentPath.startsWith('/compare')) {
      const pairSlug = currentPath.replace('/compare/', '').replace('/compare', '').split('/')[0].split('?')[0];
      return <ComparePage pairSlug={pairSlug || undefined} onNavigate={navigate} onOpenSource={handleOpenSource} />;
    }

    // 4. Wizard & Account Finder Route: /wizard, /finder, /find, /match
    if (
      currentPath === '/wizard' ||
      currentPath === '/wizard/' ||
      currentPath === '/finder' ||
      currentPath === '/finder/' ||
      currentPath === '/find' ||
      currentPath === '/match'
    ) {
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

    // 7. All Rules Hub: /rules, /knowledge
    if (
      currentPath === '/rules' ||
      currentPath === '/rules/' ||
      currentPath.startsWith('/rules?') ||
      currentPath === '/knowledge' ||
      currentPath === '/knowledge/' ||
      currentPath.startsWith('/knowledge?')
    ) {
      return <RulesHubPage onNavigate={navigate} />;
    }

    // 8. Reviews Route: /reviews
    if (
      currentPath === '/reviews' ||
      currentPath === '/reviews/' ||
      currentPath === '/disputes' ||
      currentPath === '/evidence'
    ) {
      return <ReviewsPage onNavigate={navigate} />;
    }

    // 9. Changelog Route: /changes, /changelog, /audit
    if (
      currentPath === '/changes' ||
      currentPath === '/changes/' ||
      currentPath === '/changelog' ||
      currentPath === '/changelog/' ||
      currentPath === '/audit'
    ) {
      return <ChangesPage onNavigate={navigate} />;
    }

    // 10. Admin & Crawler Dashboard: /admin or /crawler-admin
    if (currentPath.startsWith('/admin') || currentPath === '/crawler-admin') {
      return <AdminCrawlerPage />;
    }

    // 11. Legal & Regulatory Compliance Routes (Google Ads Mandate)
    if (currentPath === '/privacy' || currentPath === '/privacy/') {
      return <PrivacyPolicyPage onNavigate={navigate} />;
    }
    if (currentPath === '/terms' || currentPath === '/terms/') {
      return <TermsPage onNavigate={navigate} />;
    }
    if (currentPath === '/disclaimer' || currentPath === '/disclaimer/' || currentPath === '/risk') {
      return <DisclaimerPage onNavigate={navigate} />;
    }
    if (currentPath === '/contact' || currentPath === '/contact/' || currentPath === '/support') {
      return <ContactPage onNavigate={navigate} />;
    }

    // 12. Homepage
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
    <div className="min-h-[100dvh] bg-[#080A10] text-slate-100 flex flex-col overflow-x-clip">
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
      <main className="flex-1 pt-4 sm:pt-6 pb-safe w-full max-w-[100vw] overflow-x-clip">
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

      {/* Cookie Consent Banner (Google Consent Mode v2 ready) */}
      <CookieConsent onNavigate={navigate} />
    </div>
  );
};
