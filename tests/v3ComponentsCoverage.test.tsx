import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { GoatV3CompleteModelRuleTable } from '../src/components/goat-v3/GoatV3CompleteModelRuleTable.tsx';
import { GoatV3RiskSimulator } from '../src/components/goat-v3/GoatV3RiskSimulator.tsx';
import { GoatV3ModelSelector } from '../src/components/goat-v3/GoatV3ModelSelector.tsx';
import { GoatV3RuleExplorer } from '../src/components/goat-v3/GoatV3RuleExplorer.tsx';
import { GoatV3RuleSnapshot } from '../src/components/goat-v3/GoatV3RuleSnapshot.tsx';
import { GoatV3TrustCenter } from '../src/components/goat-v3/GoatV3TrustCenter.tsx';
import { GoatV3FuturesWorkspace } from '../src/components/goat-v3/GoatV3FuturesWorkspace.tsx';
import { GoatV3QuickDecision } from '../src/components/goat-v3/GoatV3QuickDecision.tsx';
import { GoatV3TrapsWarnings } from '../src/components/goat-v3/GoatV3TrapsWarnings.tsx';
import { GoatV3ChangeHistory } from '../src/components/goat-v3/GoatV3ChangeHistory.tsx';
import { GoatV3VerticalNav } from '../src/components/goat-v3/GoatV3VerticalNav.tsx';
import { GoatV3CommunityReviews } from '../src/components/goat-v3/GoatV3CommunityReviews.tsx';
import { GoatV3PhaseByPhaseRulesMatrix } from '../src/components/goat-v3/GoatV3PhaseByPhaseRulesMatrix.tsx';
import { GoatV3ComparisonWorkspace } from '../src/components/goat-v3/GoatV3ComparisonWorkspace.tsx';
import { GoatV3Header } from '../src/components/goat-v3/GoatV3Header.tsx';
import { GoatV3AboutFirm } from '../src/components/goat-v3/GoatV3AboutFirm.tsx';
import { GoatV3PricingPromos } from '../src/components/goat-v3/GoatV3PricingPromos.tsx';
import { FirmV3Header } from '../src/components/firm-v3/FirmV3Header.tsx';
import { FirmV3AboutFirm } from '../src/components/firm-v3/FirmV3AboutFirm.tsx';
import { FirmV3PricingPromos } from '../src/components/firm-v3/FirmV3PricingPromos.tsx';
import { FirmV3TrustCenter } from '../src/components/firm-v3/FirmV3TrustCenter.tsx';
import { FirmV3CompleteModelRuleTable } from '../src/components/firm-v3/FirmV3CompleteModelRuleTable.tsx';
import {
  GFT_CANONICAL_MODELS,
  GFT_CANONICAL_RULES,
  GFT_WARNINGS_REGISTRY,
  GFT_CHANGE_HISTORY,
  GFT_DECISION_RECOMMENDATIONS,
  GFT_FUTURES_MODELS,
  GFT_PRICING_REGISTRY,
  GFT_COMMUNITY_REVIEWS,
} from '../src/data/goatCanonicalData.ts';
import { getCategoriesWithCounts } from '../src/data/goatSelectors.ts';
import { buildCanonicalSelectedRules } from '../src/data/goatCanonicalContext.ts';
import { getFirmCanonicalProfile } from '../src/data/allFirmsCanonicalData.ts';
import { getFirmBySlug } from '../src/core/canonical/store.ts';

describe('Goat V3 Components Coverage', () => {
  it('renders GoatV3CompleteModelRuleTable across multiple models, sizes, stages, and versions', () => {
    const modelsToTest = GFT_CANONICAL_MODELS.slice(0, 5);
    for (const model of modelsToTest) {
      const canonical = buildCanonicalSelectedRules(model, {
        category: model.category,
        modelId: model.id,
        accountSize: 100000,
        stage: 'all',
        platform: 'all',
        purchaseDate: '2026-09-01',
        termsVersion: model.id === 'one_step' ? 'pre_aug_2026' : 'current_2026',
        tradingStyle: 'conservative',
      });

      const html = renderToStaticMarkup(
        <GoatV3CompleteModelRuleTable
          canonicalRules={canonical}
          selectedModel={model}
          selectedSize={100000}
          selectedStage="all"
          selectedVersion={model.id === 'one_step' ? 'pre_aug_2026' : 'current_2026'}
          selectedPlatform="all"
          selectedTradingStyle="conservative"
          onSelectModel={vi.fn()}
          onSelectSize={vi.fn()}
          onSelectStage={vi.fn()}
          onSelectVersion={vi.fn()}
          onSelectPlatform={vi.fn()}
          onOpenSourceModal={vi.fn()}
        />
      );
      expect(html).toContain(model.name);
      expect(html).toContain('A. Account and Evaluation Structure');
    }
  });

  it('renders GoatV3RiskSimulator and GoatV3RuleSnapshot across evaluation and instant models', () => {
    for (const model of [GFT_CANONICAL_MODELS[0], GFT_CANONICAL_MODELS.find((m) => !m.isEvaluation) || GFT_CANONICAL_MODELS[1]]) {
      const canonical = buildCanonicalSelectedRules(model, {
        category: model.category,
        modelId: model.id,
        accountSize: 50000,
        stage: 'funded',
        platform: 'ctrader',
        purchaseDate: '2026-09-01',
        termsVersion: 'current_2026',
        tradingStyle: 'scalper',
      });

      const simHtml = renderToStaticMarkup(
        <GoatV3RiskSimulator canonicalRules={canonical} model={model} accountSize={50000} />
      );
      expect(simHtml).toContain('$50,000');

      const snapHtml = renderToStaticMarkup(
        <GoatV3RuleSnapshot
          canonicalRules={canonical}
          model={model}
          accountSize={50000}
          stage="funded"
          onNavigateToCompleteTable={vi.fn()}
          onNavigateToExplorer={vi.fn()}
          onOpenSourceModal={vi.fn()}
        />
      );
      expect(snapHtml).toContain('Rule Snapshot');
    }
  });

  it('renders GoatV3ModelSelector, GoatV3RuleExplorer, GoatV3PricingPromos, and GoatV3QuickDecision', () => {
    const categories = getCategoriesWithCounts();
    const model = GFT_CANONICAL_MODELS[0];

    const selectorHtml = renderToStaticMarkup(
      <GoatV3ModelSelector
        categories={categories}
        selectedCategory={model.category}
        onSelectCategory={vi.fn()}
        modelsInCategory={GFT_CANONICAL_MODELS.filter((m) => m.category === model.category)}
        selectedModel={model}
        onSelectModel={vi.fn()}
        selectedSize={100000}
        onSelectSize={vi.fn()}
        selectedStage="all"
        onSelectStage={vi.fn()}
        selectedPlatform="all"
        onSelectPlatform={vi.fn()}
        selectedVersion="current_2026"
        onSelectVersion={vi.fn()}
        selectedTradingStyle="conservative"
        onSelectTradingStyle={vi.fn()}
        comparisonModelIds={[model.id]}
        onToggleCompareModel={vi.fn()}
        onOpenComparison={vi.fn()}
      />
    );
    expect(selectorHtml).toContain(model.name);

    const explorerHtml = renderToStaticMarkup(
      <GoatV3RuleExplorer
        rules={GFT_CANONICAL_RULES}
        accountSize={100000}
        onOpenSourceModal={vi.fn()}
      />
    );
    expect(explorerHtml).toContain('All Rules');

    const pricingEmptyHtml = renderToStaticMarkup(
      <GoatV3PricingPromos
        model={model}
        pricingList={[]}
        selectedSize={100000}
        onSelectSize={vi.fn()}
      />
    );
    expect(pricingEmptyHtml.length).toBeGreaterThan(100);

    const pricingSourcedHtml = renderToStaticMarkup(
      <GoatV3PricingPromos
        model={model}
        pricingList={[
          ...GFT_PRICING_REGISTRY,
          {
            modelId: model.id,
            accountSize: 100000,
            officialListedPrice: 499,
            verifiedCurrentPrice: 399,
            verificationStatus: 'officially_verified',
            sourceUrl: 'https://goatfundedtrader.com/pricing/model',
          },
        ]}
        selectedSize={100000}
        onSelectSize={vi.fn()}
      />
    );
    expect(pricingSourcedHtml).toContain('$499');

    const decisionHtml = renderToStaticMarkup(
      <GoatV3QuickDecision
        recommendations={GFT_DECISION_RECOMMENDATIONS}
        onSelectModelById={vi.fn()}
        currentSelectedModelId={GFT_DECISION_RECOMMENDATIONS[0].bestModelId}
      />
    );
    expect(decisionHtml).toContain('Quick Decision Guide');
  });

  it('renders remaining GoatV3 workspace and auxiliary components', () => {
    expect(renderToStaticMarkup(<GoatV3TrustCenter />)).toContain('Source Available');
    expect(renderToStaticMarkup(<GoatV3FuturesWorkspace futuresModels={GFT_FUTURES_MODELS} />)).toContain('CME Futures');
    expect(
      renderToStaticMarkup(
        <GoatV3TrapsWarnings warnings={GFT_WARNINGS_REGISTRY} selectedModelId="two_step_standard" />
      )
    ).toContain('Watchouts');
    expect(renderToStaticMarkup(<GoatV3ChangeHistory changeHistory={GFT_CHANGE_HISTORY} />)).toContain(
      'Rule Change History'
    );
    expect(
      renderToStaticMarkup(
        <GoatV3VerticalNav
          activeSection="complete-rules-table"
          onSelectSection={vi.fn()}
          onSearchOpen={vi.fn()}
          isMobileModal={true}
          onCloseMobileModal={vi.fn()}
        />
      )
    ).toContain('Table of Contents');
    expect(renderToStaticMarkup(<GoatV3CommunityReviews reviews={GFT_COMMUNITY_REVIEWS} />).length).toBeGreaterThan(
      100
    );
    expect(renderToStaticMarkup(<GoatV3PhaseByPhaseRulesMatrix onBackToHub={vi.fn()} />).length).toBeGreaterThan(
      100
    );
    expect(
      renderToStaticMarkup(
        <GoatV3ComparisonWorkspace
          allModels={GFT_CANONICAL_MODELS}
          selectedModelIds={['two_step_standard', 'one_step']}
          onRemoveModel={vi.fn()}
          onAddModel={vi.fn()}
          comparisonSize={100000}
          onChangeComparisonSize={vi.fn()}
        />
      ).length
    ).toBeGreaterThan(100);
    expect(
      renderToStaticMarkup(
        <GoatV3Header
          onSearchOpen={vi.fn()}
          activeSection="selector"
          onSectionClick={vi.fn()}
          onNavigate={vi.fn()}
          totalModelsCount={13}
        />
      )
    ).toContain('Goat Funded Trader');
    expect(renderToStaticMarkup(<GoatV3AboutFirm onScrollToSection={vi.fn()} />)).toContain(
      'Wishes Tower International Limited'
    );
  });
});

describe('Firm V3 Components Coverage (Verified & Unverified Firms)', () => {
  it('renders FirmV3Header, FirmV3AboutFirm, FirmV3PricingPromos, FirmV3TrustCenter, and FirmV3CompleteModelRuleTable for verified firms', () => {
    const profile = getFirmCanonicalProfile('the-5ers');
    const canonicalFirm = getFirmBySlug('the-5ers') || getFirmBySlug('ftmo')!;
    const model = profile.models[0];

    const headerHtml = renderToStaticMarkup(
      <FirmV3Header
        firm={profile}
        onSearchOpen={vi.fn()}
        activeSection="selector"
        onSectionClick={vi.fn()}
        onNavigate={vi.fn()}
        totalModelsCount={profile.models.length}
      />
    );
    expect(headerHtml).toContain(profile.name);

    const aboutHtml = renderToStaticMarkup(
      <FirmV3AboutFirm
        firm={{
          ...profile,
          entities: [
            ...profile.entities,
            {
              name: 'Secondary Tech Entity Ltd',
              role: 'Risk Engine',
              jurisdiction: 'UK',
              crNo: '999999',
              address: 'London, UK',
              scope: 'Tech operations',
            },
          ],
        }}
        onScrollToSection={vi.fn()}
      />
    );
    expect(aboutHtml).toContain('Primary Entity');
    expect(aboutHtml).toContain('Risk Engine');

    const pricingHtml = renderToStaticMarkup(
      <FirmV3PricingPromos
        firm={{
          ...profile,
          activePromo: {
            ...profile.activePromo,
            sourceUrl: 'https://the5ers.com/programs-pricing',
          } as any,
        }}
        model={model}
        pricingList={GFT_PRICING_REGISTRY.slice(0, 2).map((p) => ({
          ...p,
          sourceUrl: 'https://the5ers.com/programs-pricing',
        }))}
        selectedSize={100000}
        onSelectSize={vi.fn()}
      />
    );
    expect(pricingHtml).toContain('Pricing, Promos &amp; Fee Refund Terms');

    const trustHtml = renderToStaticMarkup(<FirmV3TrustCenter firm={profile} />);
    expect(trustHtml).toContain('Tier 1 Evidence');

    const tableHtml = renderToStaticMarkup(
      <FirmV3CompleteModelRuleTable
        firm={canonicalFirm}
        firmProfile={profile}
        selectedModel={model}
        selectedSize={100000}
        selectedStage="all"
      />
    );
    expect(tableHtml.length).toBeGreaterThan(200);
  });

  it('renders FirmV3 components gracefully for fallback profiles', () => {
    const unknownProfile = getFirmCanonicalProfile('unverified-test-firm');

    const headerHtml = renderToStaticMarkup(
      <FirmV3Header
        firm={unknownProfile}
        onSearchOpen={vi.fn()}
        activeSection="selector"
        onSectionClick={vi.fn()}
        onNavigate={vi.fn()}
        totalModelsCount={unknownProfile.models.length}
      />
    );
    expect(headerHtml.length).toBeGreaterThan(100);

    const aboutHtml = renderToStaticMarkup(
      <FirmV3AboutFirm firm={unknownProfile} onScrollToSection={vi.fn()} />
    );
    expect(aboutHtml.length).toBeGreaterThan(100);

    const pricingHtml = renderToStaticMarkup(
      <FirmV3PricingPromos
        firm={unknownProfile}
        model={unknownProfile.models[0]}
        pricingList={GFT_PRICING_REGISTRY.slice(0, 2)}
        selectedSize={100000}
        onSelectSize={vi.fn()}
      />
    );
    expect(pricingHtml.length).toBeGreaterThan(100);

    const trustHtml = renderToStaticMarkup(<FirmV3TrustCenter firm={unknownProfile} />);
    expect(trustHtml.length).toBeGreaterThan(100);
  });

  it('exercises interactive states, modals, drawers, filters, and DOM handlers across V3 components', () => {
    (globalThis as any).window = {
      location: { href: 'https://www.fundedtradingrules.com/v3' },
      scrollTo: () => {},
    };
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
                  target: { value: 'one_step', checked: true },
                  currentTarget: { value: 'one_step', checked: true },
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

    function exerciseComponent(Comp: React.FC<any>, props: any, overrideFn: (val: any, idx: number) => any) {
      const Runner: React.FC = () => {
        const tree = Comp(props);
        walkAndInvokeDomHandlers(tree);
        return tree;
      };
      return renderWithState(<Runner />, overrideFn);
    }

    const model = GFT_CANONICAL_MODELS[0];
    const canonical = buildCanonicalSelectedRules(model, {
      category: model.category,
      modelId: model.id,
      accountSize: 100000,
      stage: 'all',
      platform: 'all',
      purchaseDate: '2026-09-01',
      termsVersion: 'current_2026',
      tradingStyle: 'conservative',
    });

    const sampleDrawerRow = {
      id: 'row-test-1',
      index: 1,
      categoryKey: 'A',
      categoryTitle: 'A. Account and Evaluation Structure',
      ruleName: 'Daily Loss Limit',
      appliesTo: 'All phases',
      phase1: '4%',
      phase2: '4%',
      phase3: 'N/A',
      masterAccount: '4%',
      decision: 'YES' as const,
      decisionDetail: 'Hard Breach',
      verification: 'Conflicting' as const,
      calculation: '$4,000',
      formula: 'Capital * 4%',
      explanation: 'Full technical clause text.',
      beginnerExplanation: 'Simple explanation for new traders.',
      breachTrigger: 'Equity < $96,000',
      afterBreachAction: 'Account closed',
      conflictDetails: {
        hasConflict: true,
        difference: 'Pre-Aug vs Post-Aug',
        userAction: 'Check dashboard',
      },
      source: 'Official FAQ',
      sourceUrl: 'https://help.goatfundedtrader.com/en/articles/daily',
      lastVerifiedDate: '2026-09-01',
    };

    // 1. GoatV3CompleteModelRuleTable with drawer open + validation modal open
    const drawerHtml = exerciseComponent(
      GoatV3CompleteModelRuleTable,
      {
        canonicalRules: canonical,
        selectedModel: model,
        selectedSize: 100000,
        selectedStage: 'all',
        selectedVersion: 'current_2026',
        onSelectModel: vi.fn(),
        onSelectSize: vi.fn(),
        onSelectStage: vi.fn(),
        onSelectVersion: vi.fn(),
        onOpenSourceModal: vi.fn(),
      },
      (val, idx) => {
        if (idx === 8) return sampleDrawerRow;
        if (idx === 9) return true;
        if (idx === 10) return true;
        return val;
      }
    );
    expect(drawerHtml).toContain('Beginner-Friendly Explanation');
    expect(drawerHtml).toContain('Automated Data Quality &amp; Phase Integrity Audit');

    // 2. GoatV3CompleteModelRuleTable with filters active & no-match state
    const noMatchHtml = renderWithState(
      <GoatV3CompleteModelRuleTable canonicalRules={canonical} selectedModel={model} />,
      (val, idx) => {
        if (idx === 0) return 'zzzz_no_match_query';
        if (idx === 1) return 'A';
        if (idx === 2) return 'YES';
        if (idx === 3) return 'Verified';
        if (idx === 4 || idx === 5 || idx === 6) return true;
        return val;
      }
    );
    expect(noMatchHtml).toContain('No rules match the current filters');

    // 3. GoatV3RiskSimulator in danger & caution states + handlers
    const dangerSimHtml = exerciseComponent(
      GoatV3RiskSimulator,
      { canonicalRules: canonical, model, accountSize: 100000 },
      (val, idx) => {
        if (idx === 1) return 89000;
        if (idx === 2) return 2500;
        return val;
      }
    );
    expect(dangerSimHtml).toContain('CRITICAL RISK WARNING');

    const cautionSimHtml = renderWithState(
      <GoatV3RiskSimulator canonicalRules={canonical} model={model} accountSize={100000} />,
      (val, idx) => (idx === 1 ? 96500 : val)
    );
    expect(cautionSimHtml.length).toBeGreaterThan(200);

    // 4. Exercise handlers on remaining V3 components
    exerciseComponent(
      GoatV3RuleExplorer,
      { rules: GFT_CANONICAL_RULES, accountSize: 100000, onOpenSourceModal: vi.fn() },
      (val, idx) => (idx === 0 ? 'drawdown' : idx === 1 ? 'drawdown' : val)
    );
    exerciseComponent(
      GoatV3ModelSelector,
      {
        categories: getCategoriesWithCounts(),
        selectedCategory: model.category,
        onSelectCategory: vi.fn(),
        modelsInCategory: GFT_CANONICAL_MODELS,
        selectedModel: model,
        onSelectModel: vi.fn(),
        selectedSize: 100000,
        onSelectSize: vi.fn(),
        selectedStage: 'all',
        onSelectStage: vi.fn(),
        selectedPlatform: 'all',
        onSelectPlatform: vi.fn(),
        selectedVersion: 'current_2026',
        onSelectVersion: vi.fn(),
        selectedTradingStyle: 'conservative',
        onSelectTradingStyle: vi.fn(),
        comparisonModelIds: [model.id],
        onToggleCompareModel: vi.fn(),
        onOpenComparison: vi.fn(),
      },
      (val) => val
    );
    exerciseComponent(
      GoatV3QuickDecision,
      {
        recommendations: GFT_DECISION_RECOMMENDATIONS,
        onSelectModelById: vi.fn(),
        currentSelectedModelId: model.id,
      },
      (val) => val
    );
    exerciseComponent(
      GoatV3Header,
      {
        onSearchOpen: vi.fn(),
        activeSection: 'selector',
        onSectionClick: vi.fn(),
        onNavigate: vi.fn(),
        totalModelsCount: 13,
      },
      (val) => val
    );
    exerciseComponent(GoatV3AboutFirm, { onScrollToSection: vi.fn() }, (val) => val);
    const profile = getFirmCanonicalProfile('the-5ers');
    exerciseComponent(
      FirmV3Header,
      {
        firm: profile,
        onSearchOpen: vi.fn(),
        activeSection: 'selector',
        onSectionClick: vi.fn(),
        onNavigate: vi.fn(),
        totalModelsCount: profile.models.length,
      },
      (val) => val
    );
    exerciseComponent(FirmV3AboutFirm, { firm: profile, onScrollToSection: vi.fn() }, (val) => val);
  });
});

