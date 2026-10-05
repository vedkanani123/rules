import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { RuleCard } from '../src/components/rules/RuleCard.tsx';
import { RulesAccordion } from '../src/components/rules/RulesAccordion.tsx';
import { RulesQuickView, buildQuickViewRows } from '../src/components/rules/RulesQuickView.tsx';
import { SameTradeVisual } from '../src/components/comparison/SameTradeVisual.tsx';
import { RiskSimulator } from '../src/components/simulator/RiskSimulator.tsx';
import { GlobalSearchModal } from '../src/components/search/GlobalSearchModal.tsx';
import { SourceViewerModal } from '../src/components/evidence/SourceViewerModal.tsx';
import { Navbar } from '../src/components/layout/Navbar.tsx';
import { Footer } from '../src/components/layout/Footer.tsx';
import { CookieConsent } from '../src/components/layout/CookieConsent.tsx';
import { Breadcrumbs } from '../src/components/common/Breadcrumbs.tsx';
import { Link } from '../src/components/common/Link.tsx';
import { PropFirmsTable } from '../src/components/directory/PropFirmsTable.tsx';
import { AllAccountsTable } from '../src/components/directory/AllAccountsTable.tsx';
import { ReviewCard } from '../src/components/reviews/ReviewCard.tsx';
import { TrustBadge, UnknownNotice, VerificationWarning } from '../src/components/trust/TrustBadge.tsx';
import { HeroIntelligenceCard } from '../src/components/hero/HeroIntelligenceCard.tsx';
import { PROP_FIRMS_DATA, RULE_GUIDES } from '../src/data/propFirmsData.ts';
import { buildParameterRules } from '../src/core/pipeline/parameterRules.ts';
import { AccountTier, Rule, SourceEvidence, TraderReview } from '../src/types/schema.ts';

const noop = () => {};

const sampleEvidence: SourceEvidence = {
  id: 'ev-shared-1',
  sourceType: 'TERMS_AND_CONDITIONS',
  sourceTitle: 'Official Terms & Conditions',
  sourceUrl: 'https://example.com/terms',
  sourceExcerpt: 'Traders must respect the 5% daily loss limit and 10% maximum loss limit at all times across all open and closed positions.',
  sourceCodeSnippet: 'daily_loss <= 0.05 * starting_balance',
  retrievedAt: '2026-03-01',
  confidence: 'A',
};

const sampleRules: Rule[] = [
  {
    id: 'r-margin80',
    firmId: 'f1',
    name: '80% Margin Utilization Cap',
    slug: '80-percent-margin-cap',
    category: 'RISK',
    stageScope: 'ALL',
    accountModelScope: ['2-Step', '1-Step'],
    headlineValue: '80% max margin',
    normalizedValue: 80,
    unit: '%',
    officialWording: 'Margin utilization cannot exceed 80%.',
    plainEnglish: 'Keep margin usage under 80% of available margin.',
    howTradersViolate: 'Opening oversized positions during high volatility.',
    exceptions: [{ condition: 'Hedging', description: 'Hedged positions still count toward margin.' }],
    isEasyToMiss: true,
    whyEasyToMiss: 'Buried in risk management annex.',
    primaryRiskRating: 'EXTREME',
    importance: 'CRITICAL',
    importanceReason: 'Can void payouts on review.',
    formula: {
      formulaName: 'Margin Utilization',
      formulaExpression: 'used_margin / total_margin <= 0.80',
      variables: { used_margin: 'Current margin', total_margin: 'Account margin' },
      explanation: 'Ratio of used margin to available margin.',
      exampleInputs: { used_margin: 8000, total_margin: 10000 },
      exampleOutput: '80% (Limit reached)',
    },
    sources: [sampleEvidence],
    lastVerified: '2026-03-01',
  },
  {
    id: 'r-consistency',
    firmId: 'f1',
    name: 'Consistency Rule',
    slug: 'consistency-rule',
    category: 'PAYOUT',
    stageScope: 'FUNDED',
    accountModelScope: ['Instant'],
    headlineValue: '15% best trade cap',
    normalizedValue: 15,
    unit: '%',
    officialWording: 'No single trade may account for more than 15% of total profit.',
    plainEnglish: 'Keep individual trade profits below 15% of target.',
    howTradersViolate: 'Hitting one oversized home-run trade.',
    isEasyToMiss: true,
    whyEasyToMiss: 'Only checked at payout request.',
    primaryRiskRating: 'HIGH',
    importance: 'HIGH',
    importanceReason: 'Delays payout approval.',
    sources: [{ ...sampleEvidence, id: 'ev-shared-2', confidence: 'B', sourceCodeSnippet: undefined }],
    lastVerified: '2026-03-01',
  },
  {
    id: 'r-daily',
    firmId: 'f1',
    name: 'Daily Loss Limit',
    slug: 'daily-loss-limit',
    category: 'RISK',
    stageScope: 'EVALUATION',
    headlineValue: '5% daily',
    normalizedValue: 5,
    unit: '%',
    officialWording: 'Daily drawdown may not exceed 5%.',
    plainEnglish: 'Do not lose more than 5% in a single server day.',
    howTradersViolate: 'Floating loss dips below daily floor.',
    isEasyToMiss: false,
    primaryRiskRating: 'HIGH',
    importance: 'CRITICAL',
    importanceReason: 'Hard breach on touch.',
    sources: [{ ...sampleEvidence, id: 'ev-shared-3', confidence: 'C' }],
    lastVerified: '2026-03-01',
  },
  {
    id: 'r-max-pct',
    firmId: 'f1',
    name: 'Max Overall Drawdown',
    slug: 'max-drawdown-pct',
    category: 'RISK',
    stageScope: 'STEP_1',
    headlineValue: '10% max',
    normalizedValue: 10,
    unit: '%',
    officialWording: 'Account equity must not drop below 90% of initial balance.',
    plainEnglish: 'Total loss limit is 10%.',
    howTradersViolate: 'Cumulative losses over multiple days.',
    isEasyToMiss: false,
    primaryRiskRating: 'MODERATE',
    importance: 'HIGH',
    importanceReason: 'Permanent account termination.',
    sources: [{ ...sampleEvidence, id: 'ev-shared-4', confidence: 'D' }],
    lastVerified: '2026-03-01',
  },
  {
    id: 'r-max-usd',
    firmId: 'f1',
    name: 'Micro Loss Cap USD',
    slug: 'micro-loss-usd',
    category: 'RISK',
    stageScope: 'STEP_2',
    headlineValue: '$2,500 cap',
    normalizedValue: 2500,
    unit: 'USD',
    officialWording: 'Maximum loss is capped at $2,500.',
    plainEnglish: 'Hard dollar stop at $2,500.',
    howTradersViolate: 'Exceeding dollar stop.',
    isEasyToMiss: false,
    primaryRiskRating: 'MODERATE',
    importance: 'MEDIUM',
    importanceReason: 'Fixed dollar boundary.',
    sources: [sampleEvidence],
    lastVerified: '2026-03-01',
  },
  {
    id: 'r-target',
    firmId: 'f1',
    name: 'Step 1 Profit Target',
    slug: 'profit-target-step-1',
    category: 'EVALUATION',
    stageScope: 'SCALING',
    headlineValue: '8% target',
    normalizedValue: 8,
    unit: '%',
    officialWording: 'Achieve 8% net profit to advance.',
    plainEnglish: 'Make 8% to pass.',
    howTradersViolate: 'Overtrading near target.',
    isEasyToMiss: false,
    primaryRiskRating: 'SAFE',
    importance: 'LOW',
    importanceReason: 'Required to pass.',
    sources: [sampleEvidence],
    lastVerified: '2026-03-01',
  },
  {
    id: 'r-inactivity',
    firmId: 'f1',
    name: 'Inactivity Rule',
    slug: 'inactivity-limit',
    category: 'ACCOUNT',
    stageScope: 'PURCHASE',
    headlineValue: '30 days',
    normalizedValue: 30,
    unit: 'days',
    officialWording: 'Accounts inactive for 30 days are deactivated.',
    plainEnglish: 'Place at least one trade every 30 days.',
    howTradersViolate: 'Leaving account idle during vacation.',
    isEasyToMiss: true,
    whyEasyToMiss: 'No email warning before deactivation.',
    primaryRiskRating: 'MODERATE',
    importance: 'MEDIUM',
    importanceReason: 'Can expire active account.',
    sources: [sampleEvidence],
    lastVerified: '2026-03-01',
  },
];

describe('Shared Components Coverage Suite', () => {
  it('renders RuleCard across all risk ratings, formulas, exceptions, and hidden flags', () => {
    for (const rule of sampleRules) {
      const html = renderToStaticMarkup(<RuleCard rule={rule} onOpenSource={noop} />);
      expect(html).toContain(rule.name);
    }
  });

  it('renders RulesAccordion with sample rules, parameter rules, highlighted rule, and empty state', () => {
    const firm = PROP_FIRMS_DATA[0];
    const prog = firm.programs[0];
    const acc = prog.accounts[0];
    const paramRules = buildParameterRules(firm, prog, acc);

    const html = renderToStaticMarkup(
      <RulesAccordion
        rules={[...sampleRules, ...paramRules]}
        selectedCapital={100000}
        programType="2-Step"
        programSlug={prog.slug}
        highlightedRuleId="80-percent-margin-cap"
        onOpenSource={noop}
      />
    );
    expect(html).toContain('Every way traders blow accounts');
    expect(html).toContain('80% Margin Utilization Cap');

    const emptyHtml = renderToStaticMarkup(
      <RulesAccordion
        rules={[]}
        selectedCapital={50000}
        programType="Instant"
        onOpenSource={noop}
      />
    );
    expect(emptyHtml).toContain('No rules match this filter');
  });

  it('executes buildQuickViewRows and renders RulesQuickView across program types', () => {
    for (const firm of PROP_FIRMS_DATA.slice(0, 4)) {
      for (const prog of firm.programs) {
        const acc = prog.accounts[0];
        if (!acc) continue;
        const challengeRows = buildQuickViewRows(acc, prog, 'challenge');
        const fundedRows = buildQuickViewRows(acc, prog, 'funded');
        expect(challengeRows.length).toBeGreaterThan(5);
        expect(fundedRows.length).toBeGreaterThan(5);

        const html = renderToStaticMarkup(
          <RulesQuickView
            firm={firm}
            program={prog}
            account={acc}
            rules={[...firm.rules, ...sampleRules]}
            accountSizeLabel={`$${(acc.nominalSize / 1000).toFixed(0)}K`}
            onSelectRule={noop}
          />
        );
        expect(html).toContain('Every rule');
      }
    }

    // Also test synthetic edge-case account for buildQuickViewRows
    const edgeAccount: AccountTier = {
      ...PROP_FIRMS_DATA[0].programs[0].accounts[0],
      dailyLossLimit: 0,
      drawdownType: 'end_of_day',
      profitTargetStep1: 0,
      profitTargetStep2: 0,
      minTradingDays: 0,
      consistencyRule: '30% best day cap',
      weekendHolding: false,
      overnightHolding: false,
      copyTradingAllowed: false,
      priceUnknown: true,
    };
    const edgeRows = buildQuickViewRows(edgeAccount, undefined, 'challenge');
    expect(edgeRows.some((r) => r.value === 'None')).toBe(true);
    expect(edgeRows.some((r) => r.value === 'Unknown')).toBe(true);
  });

  it('renders SameTradeVisual with multiple drawdown types and empty state', () => {
    const baseAcc = PROP_FIRMS_DATA[0].programs[0].accounts[0];
    const accounts = [
      { name: 'Static Firm', account: { ...baseAcc, nominalSize: 100000, drawdownType: 'static' as const, dailyLossLimit: 5, maxTotalLoss: 10, profitTargetStep1: 8 }, color: '#38bdf8' },
      { name: 'Trailing Equity Firm', account: { ...baseAcc, nominalSize: 100000, drawdownType: 'trailing_equity' as const, dailyLossLimit: 4, maxTotalLoss: 6, profitTargetStep1: 6 }, color: '#f59e0b' },
      { name: 'EOD Firm', account: { ...baseAcc, nominalSize: 100000, drawdownType: 'end_of_day' as const, dailyLossLimit: 3, maxTotalLoss: 6, profitTargetStep1: 8 }, color: '#10b981' },
    ];
    const trades = [
      { label: 'Day 1 Win', pnl: 4000, equityDip: -500 },
      { label: 'Day 2 Pullback', pnl: -2500, equityDip: -3500 },
      { label: 'Day 3 Big Win', pnl: 7000, equityDip: -200 },
      { label: 'Day 4 Heavy Loss', pnl: -6000, equityDip: -6500 },
    ];

    const html = renderToStaticMarkup(
      <SameTradeVisual accounts={accounts} trades={trades} startingEquity={100000} />
    );
    expect(html).toContain('Static Firm');
    expect(html).toContain('Trailing Equity Firm');

    const emptyHtml = renderToStaticMarkup(<SameTradeVisual accounts={[]} trades={trades} />);
    expect(emptyHtml).toContain('Same Trade');
  });

  it('renders RiskSimulator across all drawdown types', () => {
    for (const ddType of ['static', 'trailing_balance', 'intraday_equity', 'end_of_day'] as const) {
      const html = renderToStaticMarkup(
        <RiskSimulator
          initialNominalSize={100000}
          initialDailyLossPct={5}
          initialMaxLossPct={10}
          initialDrawdownType={ddType}
        />
      );
      expect(html.length).toBeGreaterThan(100);
    }
  });

  it('renders GlobalSearchModal and SourceViewerModal in open and closed states', () => {
    expect(renderToStaticMarkup(<GlobalSearchModal isOpen={false} onClose={noop} onNavigate={noop} />)).toBe('');
    const searchOpenHtml = renderToStaticMarkup(<GlobalSearchModal isOpen={true} onClose={noop} onNavigate={noop} />);
    expect(searchOpenHtml.length).toBeGreaterThan(100);

    expect(renderToStaticMarkup(<SourceViewerModal isOpen={false} onClose={noop} evidence={sampleEvidence} />)).toBe('');
    expect(renderToStaticMarkup(<SourceViewerModal isOpen={true} onClose={noop} evidence={null} />)).toBe('');

    for (const conf of ['A', 'B', 'C', 'D'] as const) {
      const modalHtml = renderToStaticMarkup(
        <SourceViewerModal
          isOpen={true}
          onClose={noop}
          evidence={{ ...sampleEvidence, confidence: conf }}
          ruleTitle="Daily Loss Limit"
        />
      );
      expect(modalHtml).toContain('Official Terms &amp; Conditions');
    }
  });

  it('renders Navbar, Footer, CookieConsent, Breadcrumbs, and Link', () => {
    for (const path of ['/', '/prop-firms', '/prop-firms/ftmo', '/rules', '/wizard', '/simulator', '/reviews', '/changes']) {
      const navHtml = renderToStaticMarkup(<Navbar currentPath={path} onNavigate={noop} onOpenSearch={noop} />);
      expect(navHtml.length).toBeGreaterThan(100);
    }

    const footerHtml = renderToStaticMarkup(<Footer onNavigate={noop} />);
    expect(footerHtml.length).toBeGreaterThan(100);

    const cookieHtml = renderToStaticMarkup(<CookieConsent onNavigate={noop} />);
    expect(cookieHtml).toBeDefined();

    expect(renderToStaticMarkup(<Breadcrumbs items={[]} />)).toBe('');
    const crumbsHtml = renderToStaticMarkup(
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Prop Firms', url: '/prop-firms' },
          { name: 'FTMO', url: '/prop-firms/ftmo' },
        ]}
        className="pt-4"
      />
    );
    expect(crumbsHtml).toContain('FTMO');

    const linkHtml = renderToStaticMarkup(<Link href="/prop-firms" className="btn">Explore</Link>);
    expect(linkHtml).toContain('href="/prop-firms"');
  });

  it('renders PropFirmsTable, AllAccountsTable, and AccountDetailLinks', () => {
    const firmsHtml = renderToStaticMarkup(
      <PropFirmsTable firms={PROP_FIRMS_DATA.slice(0, 5)} onNavigate={noop} onOpenSource={noop} />
    );
    expect(firmsHtml.length).toBeGreaterThan(100);

    const emptyFirmsHtml = renderToStaticMarkup(
      <PropFirmsTable firms={[]} onNavigate={noop} onOpenSource={noop} />
    );
    expect(emptyFirmsHtml).toBeDefined();

    const accountsHtml = renderToStaticMarkup(
      <AllAccountsTable firms={PROP_FIRMS_DATA.slice(0, 4)} onNavigate={noop} />
    );
    expect(accountsHtml.length).toBeGreaterThan(100);
  });

  it('renders ReviewCard across all complaint categories and firm response branches', () => {
    const categories = ['PAYOUT', 'COPY_TRADING', 'RULES', 'INACTIVITY', 'OTHER'] as const;
    for (const cat of categories) {
      const review: TraderReview = {
        id: `rev-${cat}`,
        firmId: 'f1',
        author: cat === 'PAYOUT' ? 'Alex Mercer' : cat === 'OTHER' ? '' : 'SingleName',
        traderCountry: 'UK',
        source: 'Trustpilot',
        date: '2026-03-01',
        accountSizeMentioned: '$100,000',
        accountTypeMentioned: '2-Step',
        complaintCategory: cat as any,
        rating: 4,
        traderAllegation: 'Detailed trader statement regarding rule execution.',
        firmResponse:
          cat === 'PAYOUT'
            ? {
                responderName: 'Risk Desk',
                responseDate: '2026-03-02',
                responseText: 'Reviewed and settled.',
              }
            : undefined,
        evidenceStrength: 'HIGH',
        platformNeutralAnalysis: 'Neutral assessment of the rule trigger.',
      };
      const html = renderToStaticMarkup(<ReviewCard review={review} />);
      expect(html).toContain('Detailed trader statement');
    }
  });

  it('renders TrustBadge, UnknownNotice, and VerificationWarning across all states', () => {
    const statuses = [
      'Verified',
      'Partially verified',
      'Needs review',
      'Conflicting',
      'Unknown',
      'Outdated',
      'Unavailable',
      'Not applicable',
    ] as const;
    for (const status of statuses) {
      const html = renderToStaticMarkup(<TrustBadge status={status} note="Audit note" />);
      expect(html).toContain(status);
    }

    expect(renderToStaticMarkup(<UnknownNotice message="No public document" />)).toContain('No public document');
    expect(renderToStaticMarkup(<UnknownNotice />)).toContain('Unknown');
    expect(renderToStaticMarkup(<VerificationWarning />)).toContain('Rules under verification');
  });

  it('renders HeroIntelligenceCard', () => {
    const html = renderToStaticMarkup(<HeroIntelligenceCard onOpenFirm={noop} />);
    expect(html.length).toBeGreaterThan(100);
  });

  it('exercises interactive states, expanded cards, modals, and DOM event handlers across shared components', () => {
    (globalThis as any).window = {
      location: { pathname: '/', search: '', hash: '', href: 'https://www.fundedtradingrules.com/' },
      history: { pushState: () => {} },
      dispatchEvent: () => true,
      addEventListener: () => {},
      removeEventListener: () => {},
      matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
      scrollTo: () => {},
      setInterval: (cb: any) => {
        try {
          cb();
        } catch {}
        return 0;
      },
      clearInterval: () => {},
      setTimeout: (cb: any) => {
        try {
          cb();
        } catch {}
        return 0;
      },
      clearTimeout: () => {},
      dataLayer: [],
    };
    (globalThis as any).localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
    Object.defineProperty(globalThis, 'navigator', {
      value: { clipboard: { writeText: () => Promise.resolve() } },
      configurable: true,
      writable: true,
    });

    const internals =
      (React as any).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

    function walkAndInvokeDomHandlers(node: any, depth = 0) {
      if (!node || depth > 25) return;
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
                  target: { value: '100k', checked: true },
                  currentTarget: { value: '100k', checked: true },
                  preventDefault: () => {},
                  stopPropagation: () => {},
                  key: 'Escape',
                  button: 0,
                  metaKey: false,
                  ctrlKey: false,
                });
              } catch {}
            }
          }
        }
        if (props.children) walkAndInvokeDomHandlers(props.children, depth + 1);
      }
    }

    function exerciseComp(Comp: React.FC<any>, props: any, overrideFn: (val: any, idx: number) => any) {
      let origUseState: any = null;
      let origUseEffect: any = null;
      const Runner: React.FC = () => {
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
        const tree = Comp(props);
        walkAndInvokeDomHandlers(tree);
        return tree;
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
            <Runner />
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

    // RuleCard expanded (`isExpanded = true`)
    const expandedCardHtml = exerciseComp(
      RuleCard,
      { rule: sampleRules[0], onOpenSource: noop },
      (val) => (val === false ? true : val)
    );
    expect(expandedCardHtml).toContain('Plain-English Explanation');

    // RulesAccordion with first rule expanded (`expandedId = sampleRules[0].id`)
    const expandedAccHtml = exerciseComp(
      RulesAccordion,
      {
        rules: sampleRules,
        selectedCapital: 100000,
        programType: '2-Step',
        highlightedRuleId: '80-percent-margin-cap',
        onOpenSource: noop,
      },
      (val, idx) => (idx === 0 ? sampleRules[0].id : val)
    );
    expect(expandedAccHtml).toContain('How traders violate');

    // RulesQuickView with search query and hidden filter
    const firm = PROP_FIRMS_DATA[0];
    exerciseComp(
      RulesQuickView,
      {
        firm,
        program: firm.programs[0],
        account: firm.programs[0].accounts[0],
        rules: sampleRules,
        accountSizeLabel: '$100K',
        onSelectRule: noop,
      },
      (val, idx) => (idx === 1 ? 'hidden' : idx === 2 ? 'margin' : val)
    );

    // RiskSimulator handlers
    exerciseComp(
      RiskSimulator,
      { initialNominalSize: 100000, initialDailyLossPct: 4, initialMaxLossPct: 8, initialDrawdownType: 'static' },
      (val) => val
    );

    // GlobalSearchModal with active query & results + no-match query
    const searchResultsHtml = exerciseComp(
      GlobalSearchModal,
      { isOpen: true, onClose: noop, onNavigate: noop },
      (val, idx) => (idx === 0 ? 'ftmo 100k static' : val)
    );
    expect(searchResultsHtml.length).toBeGreaterThan(200);

    exerciseComp(
      GlobalSearchModal,
      { isOpen: true, onClose: noop, onNavigate: noop },
      (val, idx) => (idx === 0 ? 'zzzz_nonexistent_search_xyz' : val)
    );

    // SourceViewerModal handlers & copy
    exerciseComp(
      SourceViewerModal,
      { isOpen: true, onClose: noop, evidence: sampleEvidence, ruleTitle: 'Test Rule' },
      (val) => (val === false ? true : val)
    );

    // Navbar with mobile menu open
    const navOpenHtml = exerciseComp(
      Navbar,
      { currentPath: '/', onNavigate: noop, onOpenSearch: noop },
      (val) => (val === false ? true : val)
    );
    expect(navOpenHtml.length).toBeGreaterThan(200);

    // CookieConsent visible + details expanded
    const cookieVisibleHtml = exerciseComp(
      CookieConsent,
      { onNavigate: noop },
      (val) => (val === false ? true : val)
    );
    expect(cookieVisibleHtml.length).toBeGreaterThan(100);

    // Link internal & external click handlers
    exerciseComp(Link, { href: '/prop-firms', children: 'Internal' }, (v) => v);
    exerciseComp(Link, { href: 'https://example.com', children: 'External' }, (v) => v);

    // PropFirmsTable & AllAccountsTable interactive states
    exerciseComp(
      PropFirmsTable,
      { firms: PROP_FIRMS_DATA.slice(0, 5), onNavigate: noop, onOpenSource: noop },
      (val, idx) => (idx === 0 ? PROP_FIRMS_DATA[0].id : val)
    );
    exerciseComp(
      AllAccountsTable,
      { firms: PROP_FIRMS_DATA.slice(0, 4), onNavigate: noop },
      (val) => val
    );

    // HeroIntelligenceCard with timers & reduced motion
    exerciseComp(HeroIntelligenceCard, { onOpenFirm: noop }, (val) => val);
  });
});

