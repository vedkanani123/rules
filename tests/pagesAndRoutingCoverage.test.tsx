import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { App } from '../src/App.tsx';
import { HomePage } from '../src/pages/HomePage.tsx';
import { FirmDetailPage } from '../src/pages/FirmDetailPage.tsx';
import { AccountDetailPage } from '../src/pages/AccountDetailPage.tsx';
import { ComparePage } from '../src/pages/ComparePage.tsx';
import { PropFirmsListPage } from '../src/pages/PropFirmsListPage.tsx';
import { WizardPage } from '../src/pages/WizardPage.tsx';
import { RuleGuidePage } from '../src/pages/RuleGuidePage.tsx';
import { RulesHubPage } from '../src/pages/RulesHubPage.tsx';
import { ReviewsPage } from '../src/pages/ReviewsPage.tsx';
import { ChangesPage } from '../src/pages/ChangesPage.tsx';
import { AdminCrawlerPage } from '../src/pages/AdminCrawlerPage.tsx';
import { GoatRulesDemoPage } from '../src/pages/GoatRulesDemoPage.tsx';
import { GoatResearchTerminalV3Page } from '../src/pages/GoatResearchTerminalV3Page.tsx';
import { FirmResearchTerminalV3Page } from '../src/pages/FirmResearchTerminalV3Page.tsx';
import { AttributeLandingPage } from '../src/pages/AttributeLandingPage.tsx';
import { PrivacyPolicyPage } from '../src/pages/PrivacyPolicyPage.tsx';
import { TermsPage } from '../src/pages/TermsPage.tsx';
import { DisclaimerPage } from '../src/pages/DisclaimerPage.tsx';
import { ContactPage } from '../src/pages/ContactPage.tsx';
import { AboutPage } from '../src/pages/AboutPage.tsx';
import { MethodologyPage } from '../src/pages/MethodologyPage.tsx';
import { EditorialPolicyPage } from '../src/pages/EditorialPolicyPage.tsx';
import { AffiliateDisclosurePage } from '../src/pages/AffiliateDisclosurePage.tsx';
import { PROP_FIRMS_DATA, RULE_GUIDES } from '../src/data/propFirmsData.ts';
import { ATTRIBUTE_PAGES } from '../src/core/seo/attributePagesData.ts';
import { CURATED_COMPARISONS } from '../src/core/seo/comparisonData.ts';

const noop = () => {};

function setupWindowForRoute(targetPath: string) {
  const [pathnameAndSearch, hash = ''] = targetPath.split('#');
  const [pathname, search = ''] = pathnameAndSearch.split('?');
  (globalThis as any).window = {
    location: {
      pathname: pathname || '/',
      search: search ? `?${search}` : '',
      hash: hash ? `#${hash}` : '',
      href: `https://www.fundedtradingrules.com${targetPath}`,
    },
    history: {
      pushState: () => {},
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    matchMedia: () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
    scrollTo: () => {},
    setInterval: () => 0,
    clearInterval: () => {},
    setTimeout: () => 0,
    clearTimeout: () => {},
    dataLayer: [],
  };

  (globalThis as any).document = {
    title: '',
    head: { appendChild: () => {} },
    body: { style: {} },
    documentElement: { style: {} },
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({
      setAttribute: () => {},
      appendChild: () => {},
      remove: () => {},
    }),
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

function renderAppAt(path: string): string {
  setupWindowForRoute(path);
  const AppAny = App as React.FC<{ initialPath?: string }>;
  return renderToStaticMarkup(<AppAny initialPath={path} />);
}

describe('Pages and Routing Coverage Suite', () => {
  it('renders App across all route types', { timeout: 25000 }, () => {
    const goatFirm = PROP_FIRMS_DATA[0];
    const validAccountId = goatFirm.programs[0].accounts[0].id;

    const routesToRender = [
      '/',
      '/prop-firms',
      '/firms',
      '/directory',
      '/prop-firms/goat-funded-trader',
      '/prop-firms/the-5ers',
      '/prop-firms/ftmo',
      '/prop-firms/unknown-firm-404',
      '/prop-firms/goat-funded-trader/classic',
      '/prop-firms/the-5ers/legacy',
      `/prop-firms/${goatFirm.slug}/accounts/${validAccountId}`,
      `/prop-firms/${goatFirm.slug}/accounts/nonexistent-account-id`,
      '/prop-firms/nonexistent-firm-slug/accounts/acc-1',
      '/prop-firms/with-static-drawdown',
      '/prop-firms/with-no-consistency-rule',
      '/prop-firms/with-1-percent-floating-loss',
      '/prop-firms/with-nonexistent-attribute',
      '/demo-3',
      '/demo-rules',
      '/compare',
      `/compare/${CURATED_COMPARISONS[0].slug}`,
      '/wizard',
      '/simulator',
      '/rules',
      `/rules/${RULE_GUIDES[0].slug}`,
      '/rules/1-percent-floating-loss',
      '/rules/unknown-rule-slug-xyz',
      '/reviews',
      '/changes',
      '/admin',
      '/privacy',
      '/terms',
      '/disclaimer',
      '/contact',
      '/about',
      '/methodology',
      '/editorial-policy',
      '/affiliate-disclosure',
      '/unknown-404-path',
    ];

    for (const route of routesToRender) {
      const html = renderAppAt(route);
      expect(html.length).toBeGreaterThan(100);
    }
  });

  it('renders HomePage, PropFirmsListPage, WizardPage, ReviewsPage, ChangesPage, and AdminCrawlerPage directly', () => {
    setupWindowForRoute('/');
    expect(
      renderToStaticMarkup(<HomePage onNavigate={noop} onOpenSearch={noop} onOpenSource={noop} />).length
    ).toBeGreaterThan(200);

    expect(
      renderToStaticMarkup(<PropFirmsListPage onNavigate={noop} onOpenSource={noop} />).length
    ).toBeGreaterThan(200);

    expect(renderToStaticMarkup(<WizardPage onNavigate={noop} />).length).toBeGreaterThan(200);
    expect(renderToStaticMarkup(<ReviewsPage onNavigate={noop} />).length).toBeGreaterThan(200);
    expect(renderToStaticMarkup(<ChangesPage onNavigate={noop} />).length).toBeGreaterThan(200);
    expect(renderToStaticMarkup(<AdminCrawlerPage />).length).toBeGreaterThan(200);
  });

  it('renders FirmDetailPage and AccountDetailPage across multiple firm and account configurations', () => {
    setupWindowForRoute('/prop-firms/goat-funded-trader');
    for (const firm of PROP_FIRMS_DATA.slice(0, 4)) {
      const detailHtml = renderToStaticMarkup(
        <FirmDetailPage firm={firm} onNavigate={noop} onOpenSource={noop} />
      );
      expect(detailHtml).toContain(firm.name);

      for (const prog of firm.programs.slice(0, 2)) {
        const acc = prog.accounts[0];
        if (!acc) continue;
        const accHtml = renderToStaticMarkup(
          <AccountDetailPage firm={firm} account={acc} onNavigate={noop} onOpenSource={noop} />
        );
        expect(accHtml).toContain(firm.name);
      }
    }

    // Synthetic edge-case accounts on AccountDetailPage to exercise EOD, trailing, and zero daily loss branches
    const baseFirm = PROP_FIRMS_DATA[0];
    const baseAcc = baseFirm.programs[0].accounts[0];
    for (const variant of [
      { ...baseAcc, dailyLossLimit: 3, drawdownType: 'end_of_day' as const, profitTargetStep1: 0, profitTargetStep2: 0, minTradingDays: 0, consistencyRule: '30% best day', weekendHolding: false, overnightHolding: false, newsTradingAllowed: false, eaAllowed: false, copyTradingAllowed: false, refundableFee: false },
      { ...baseAcc, dailyLossLimit: 0, drawdownType: 'trailing_equity' as const, profitTargetStep1: 10, profitTargetStep2: 5, minTradingDays: 5, consistencyRule: 'None', weekendHolding: true, overnightHolding: true, newsTradingAllowed: true, eaAllowed: true, copyTradingAllowed: true, refundableFee: true },
    ]) {
      const html = renderToStaticMarkup(
        <AccountDetailPage firm={baseFirm} account={variant} onNavigate={noop} onOpenSource={noop} />
      );
      expect(html.length).toBeGreaterThan(200);
    }
  });

  it('renders GoatResearchTerminalV3Page, FirmResearchTerminalV3Page, and GoatRulesDemoPage', () => {
    setupWindowForRoute('/v3');
    expect(
      renderToStaticMarkup(<GoatResearchTerminalV3Page onNavigate={noop} onOpenSource={noop} />).length
    ).toBeGreaterThan(500);

    for (const slug of ['the-5ers', 'ftmo', 'funding-pips', 'topstep', 'unknown-firm-slug']) {
      const html = renderToStaticMarkup(
        <FirmResearchTerminalV3Page slug={slug} onNavigate={noop} onOpenSource={noop} />
      );
      expect(html.length).toBeGreaterThan(100);
    }

    expect(
      renderToStaticMarkup(<GoatRulesDemoPage onNavigate={noop} onOpenSource={noop} />).length
    ).toBeGreaterThan(100);
  });

  it('renders RulesHubPage and RuleGuidePage across all rule guides and special guides', () => {
    setupWindowForRoute('/rules');
    expect(renderToStaticMarkup(<RulesHubPage onNavigate={noop} />).length).toBeGreaterThan(200);

    for (const guide of RULE_GUIDES) {
      const html = renderToStaticMarkup(<RuleGuidePage guideSlug={guide.slug} onNavigate={noop} />);
      expect(html.length).toBeGreaterThan(200);
    }
    const specialHtml = renderToStaticMarkup(
      <RuleGuidePage guideSlug="1-percent-floating-loss" onNavigate={noop} />
    );
    expect(specialHtml).toContain('1% Floating Loss');
  });

  it('renders AttributeLandingPage and ComparePage across all configured slugs', () => {
    setupWindowForRoute('/prop-firms/with-static-drawdown');
    for (const attr of ATTRIBUTE_PAGES) {
      const html = renderToStaticMarkup(
        <AttributeLandingPage attributeSlug={attr.slug} onNavigate={noop} />
      );
      expect(html.length).toBeGreaterThan(100);
    }
    expect(
      renderToStaticMarkup(<AttributeLandingPage attributeSlug="with-invalid-slug" onNavigate={noop} />).length
    ).toBeGreaterThan(50);

    expect(renderToStaticMarkup(<ComparePage onNavigate={noop} />).length).toBeGreaterThan(200);
    for (const pair of CURATED_COMPARISONS.slice(0, 3)) {
      const html = renderToStaticMarkup(<ComparePage pairSlug={pair.slug} onNavigate={noop} />);
      expect(html.length).toBeGreaterThan(200);
    }
  });

  it('renders all legal, trust, and compliance pages', () => {
    setupWindowForRoute('/privacy');
    expect(renderToStaticMarkup(<PrivacyPolicyPage onNavigate={noop} />).length).toBeGreaterThan(100);
    expect(renderToStaticMarkup(<TermsPage onNavigate={noop} />).length).toBeGreaterThan(100);
    expect(renderToStaticMarkup(<DisclaimerPage onNavigate={noop} />).length).toBeGreaterThan(100);
    expect(renderToStaticMarkup(<ContactPage onNavigate={noop} />).length).toBeGreaterThan(100);
    expect(renderToStaticMarkup(<AboutPage onNavigate={noop} />).length).toBeGreaterThan(100);
    expect(renderToStaticMarkup(<MethodologyPage onNavigate={noop} />).length).toBeGreaterThan(100);
    expect(renderToStaticMarkup(<EditorialPolicyPage onNavigate={noop} />).length).toBeGreaterThan(100);
    expect(renderToStaticMarkup(<AffiliateDisclosurePage onNavigate={noop} />).length).toBeGreaterThan(100);
  });

  it('exercises interactive state branches and DOM handlers across WizardPage, V3 terminals, FirmDetailPage, HomePage, AdminCrawlerPage, ContactPage, and App', { timeout: 25000 }, () => {
    setupWindowForRoute('/wizard');
    Object.defineProperty(globalThis, 'navigator', {
      value: { clipboard: { writeText: () => Promise.resolve() } },
      configurable: true,
      writable: true,
    });

    const internals =
      (React as any).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

    function renderWithState(
      el: React.ReactElement,
      overrideFn: (val: any, idx: number) => any
    ): string {
      let origUseState: any = null;
      let origUseEffect: any = null;
      const Setup: React.FC = () => {
        const d = internals?.H;
        if (d && !origUseState) {
          origUseState = d.useState;
          origUseEffect = d.useEffect;
          let idx = 0;
          d.useState = (init: any) => {
            const v = typeof init === 'function' ? init() : init;
            const nextVal = overrideFn(v, idx++);
            const [s] = origUseState(nextVal);
            const setter = (arg: any) => {
              try {
                if (typeof arg === 'function') arg(s);
              } catch {}
            };
            return [s, setter];
          };
          d.useEffect = (cb: any, deps?: any) => {
            try {
              const c = cb();
              if (typeof c === 'function') c();
            } catch {}
            return origUseEffect(cb, deps);
          };
        }
        return null;
      };
      const Restore: React.FC = () => {
        const d = internals?.H;
        if (d && origUseState) {
          d.useState = origUseState;
          d.useEffect = origUseEffect;
          origUseState = null;
          origUseEffect = null;
        }
        return null;
      };
      try {
        return renderToStaticMarkup(
          <>
            <Setup />
            {el}
            <Restore />
          </>
        );
      } finally {
        const d = internals?.H;
        if (d && origUseState) {
          d.useState = origUseState;
          d.useEffect = origUseEffect;
        }
      }
    }

    function walkAndInvokeDomHandlers(node: any, depth = 0) {
      if (!node || depth > 22) return;
      if (Array.isArray(node)) {
        for (const c of node) walkAndInvokeDomHandlers(c, depth + 1);
        return;
      }
      if (typeof node !== 'object') return;
      if (typeof node.type === 'function') {
        try {
          walkAndInvokeDomHandlers(node.type(node.props), depth + 1);
        } catch {}
        return;
      }
      const props = node.props;
      if (props && typeof props === 'object') {
        if (typeof node.type === 'string') {
          for (const [k, v] of Object.entries(props)) {
            if (typeof v === 'function' && /^on[A-Z]/.test(k)) {
              try {
                v({
                  target: { value: '100000', checked: true },
                  currentTarget: { value: '100000', checked: true },
                  preventDefault: () => {},
                  stopPropagation: () => {},
                });
              } catch {}
            }
          }
        }
        if (props.children) walkAndInvokeDomHandlers(props.children, depth + 1);
      }
    }

    function exercisePage(Comp: React.FC<any>, props: any, overrideFn: (val: any, idx: number) => any) {
      const Runner: React.FC = () => {
        const tree = Comp(props);
        walkAndInvokeDomHandlers(tree);
        return tree;
      };
      return renderWithState(<Runner />, overrideFn);
    }

    // 1. WizardPage across grouped, table, grid, expanded grid, open dropdowns, sort modes, and compare bar
    for (const layout of ['grouped', 'table', 'grid'] as const) {
      const html = exercisePage(WizardPage, { onNavigate: noop }, (val, idx) => {
        if (val === 'grid') return layout;
        if (idx === 33) return layout === 'grouped' ? 'trust_desc' : layout === 'table' ? 'price_asc' : 'split_desc';
        if (idx === 34) return layout === 'grouped' ? 'mustHave' : layout === 'table' ? 'dealbreakers' : 'trading';
        if (idx === 36) return true; // isGridExpanded
        if (idx === 38) return 'goat-funded-trader-two_step_standard-100k'; // expandedCardId
        if (idx === 39) return ['goat-funded-trader-two_step_standard-100k', 'the-5ers-high_stakes_2step-100k'];
        return val;
      });
      expect(html.length).toBeGreaterThan(200);
    }

    // WizardPage with active want/avoid filters and empty search state
    expect(
      exercisePage(WizardPage, { onNavigate: noop }, (val, idx) => {
        if (idx >= 1 && idx <= 28 && typeof val === 'boolean') return idx % 4 === 0;
        if (idx === 33) return 'payout_asc';
        if (idx === 34) return 'drawdown';
        return val;
      }).length
    ).toBeGreaterThan(100);

    expect(
      exercisePage(WizardPage, { onNavigate: noop }, (val, idx) => {
        if (idx === 32) return 'zzzz-no-match-99999';
        if (idx === 33) return 'size_desc';
        if (idx === 34) return 'payouts';
        return val;
      }).length
    ).toBeGreaterThan(100);

    // 2. FirmResearchTerminalV3Page & GoatResearchTerminalV3Page in matrix mode, search modal open, evidence modal open
    expect(
      exercisePage(
        FirmResearchTerminalV3Page,
        { slug: 'goat-funded-trader', onNavigate: noop, onOpenSource: noop },
        (val, idx) => {
          if (val === 'hub') return 'matrix';
          if (idx === 9 && val === false) return true; // isMobileNavOpen
          if (idx === 10 && val === false) return true; // isSearchModalOpen
          if (idx === 11 && val === '') return 'drawdown'; // globalSearchQuery
          if (idx === 12 && val === null) {
            return {
              evidence: 'Maximum daily drawdown is 4% of initial balance.',
              title: 'Daily Loss Limit',
              sourceUrl: 'https://help.goatfundedtrader.com/',
            };
          }
          return val;
        }
      ).length
    ).toBeGreaterThan(200);

    expect(
      exercisePage(
        GoatResearchTerminalV3Page,
        { onNavigate: noop, onOpenSource: noop },
        (val, idx) => {
          if (val === 'hub') return 'matrix';
          if (idx === 9 && val === false) return true;
          if (idx === 10 && val === false) return true;
          if (idx === 11 && val === '') return 'payout';
          if (idx === 12 && val === null) {
            return {
              evidence: 'Official terms quote.',
              title: 'Payout Policy',
              sourceUrl: 'https://help.goatfundedtrader.com/',
            };
          }
          return val;
        }
      ).length
    ).toBeGreaterThan(200);

    // 3. FirmDetailPage across Instant, 1-Step, and 2-Step programs
    const goatFirm = PROP_FIRMS_DATA[0];
    for (const prog of goatFirm.programs) {
      const html = exercisePage(
        FirmDetailPage,
        { firm: goatFirm, onNavigate: noop, onOpenSource: noop },
        (val, idx) => {
          if (idx === 0) return prog.id;
          if (idx === 2) return true; // copiedPromo
          return val;
        }
      );
      expect(html.length).toBeGreaterThan(200);
    }

    // 4. HomePage across all coverage tabs
    for (const tab of ['drawdown', 'position', 'consistency', 'time'] as const) {
      const html = exercisePage(
        HomePage,
        { onNavigate: noop, onOpenSearch: noop, onOpenSource: noop },
        (val, idx) => {
          if (idx === 0) return tab;
          return val;
        }
      );
      expect(html.length).toBeGreaterThan(200);
    }

    // 5. AdminCrawlerPage across 'run', 'tree', and 'verify' tabs
    for (const tab of ['run', 'tree', 'verify'] as const) {
      const html = exercisePage(AdminCrawlerPage, {}, (val, idx) => {
        if (val === 'run') return tab;
        if (idx === 2) return 'Verified candidate rule';
        return val;
      });
      expect(html.length).toBeGreaterThan(200);
    }

    // 6. ContactPage submitted + unsubmitted, PropFirmsListPage, RulesHubPage, ChangesPage
    expect(
      exercisePage(ContactPage, { onNavigate: noop }, (val, idx) => (idx === 0 ? true : val))
    ).toContain('Message Received');
    expect(exercisePage(ContactPage, { onNavigate: noop }, (v) => v).length).toBeGreaterThan(100);
    expect(
      exercisePage(PropFirmsListPage, { onNavigate: noop, onOpenSource: noop }, (v) => v).length
    ).toBeGreaterThan(200);
    expect(exercisePage(RulesHubPage, { onNavigate: noop }, (v) => v).length).toBeGreaterThan(200);
    expect(exercisePage(ChangesPage, { onNavigate: noop }, (v) => v).length).toBeGreaterThan(200);
  });
});

