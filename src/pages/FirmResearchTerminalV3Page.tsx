import React, { useState, useMemo, useEffect } from 'react';
import {
  GFTCategory,
  GFTModel,
  TradingPlatform,
  TradingStyle,
} from '../data/goatCanonicalData.ts';
import {
  getFirmCanonicalProfile,
  FirmCanonicalProfile,
} from '../data/allFirmsCanonicalData.ts';
import {
  getFirmCategoriesWithCounts,
  getFirmModelsByCategory,
  getFirmModelById,
  getFirmAllPricingForModel,
  getFirmWarningsForModel,
  getFirmReviewsForModel,
  getFirmChangeHistoryForModel,
} from '../data/allFirmsSelectors.ts';
import { getRulesForModel } from '../data/goatSelectors.ts';
import { buildCanonicalSelectedRules } from '../data/goatCanonicalContext.ts';
import { REAL_FIRMS } from '../data/propFirmMatchReal.ts';
import { PROP_FIRMS_DATA } from '../data/propFirmsData.ts';

// Cloned Header & About Firm with Company Parameterization
import { FirmV3Header } from '../components/firm-v3/FirmV3Header.tsx';
import { FirmV3AboutFirm } from '../components/firm-v3/FirmV3AboutFirm.tsx';

// Direct Reuse of Full-Power Goat Terminal Components
import { GoatV3ModelSelector } from '../components/goat-v3/GoatV3ModelSelector.tsx';
import { GoatV3QuickDecision } from '../components/goat-v3/GoatV3QuickDecision.tsx';
import { GoatV3RuleSnapshot } from '../components/goat-v3/GoatV3RuleSnapshot.tsx';
import { GoatV3ComparisonWorkspace } from '../components/goat-v3/GoatV3ComparisonWorkspace.tsx';
import { GoatV3RiskSimulator } from '../components/goat-v3/GoatV3RiskSimulator.tsx';
import { GoatV3RuleExplorer } from '../components/goat-v3/GoatV3RuleExplorer.tsx';
import { GoatV3PricingPromos } from '../components/goat-v3/GoatV3PricingPromos.tsx';
import { GoatV3TrustCenter } from '../components/goat-v3/GoatV3TrustCenter.tsx';
import { GoatV3TrapsWarnings } from '../components/goat-v3/GoatV3TrapsWarnings.tsx';
import { GoatV3FuturesWorkspace } from '../components/goat-v3/GoatV3FuturesWorkspace.tsx';
import { GoatV3CommunityReviews } from '../components/goat-v3/GoatV3CommunityReviews.tsx';
import { GoatV3ChangeHistory } from '../components/goat-v3/GoatV3ChangeHistory.tsx';
import { GoatV3CompleteModelRuleTable } from '../components/goat-v3/GoatV3CompleteModelRuleTable.tsx';
import { GoatV3VerticalNav } from '../components/goat-v3/GoatV3VerticalNav.tsx';
import { GoatV3PhaseByPhaseRulesMatrix } from '../components/goat-v3/GoatV3PhaseByPhaseRulesMatrix.tsx';

import {
  Search,
  Filter,
  X,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Check,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Scale,
} from 'lucide-react';

interface FirmResearchTerminalV3PageProps {
  slug: string;
  onNavigate: (path: string) => void;
  onOpenSource?: (evidence: any, ruleTitle: string) => void;
}

export const FirmResearchTerminalV3Page: React.FC<FirmResearchTerminalV3PageProps> = ({
  slug,
  onNavigate,
  onOpenSource,
}) => {
  // ── 0. Resolve Firm Profile ──
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const firmProfile: FirmCanonicalProfile = useMemo(() => {
    const rf = (REAL_FIRMS as unknown as any[]).find((r) => norm(r.slug) === norm(slug));
    const pfd = PROP_FIRMS_DATA.find((p) => norm(p.slug) === norm(slug));
    const fallback = { ...rf, ...pfd };
    return getFirmCanonicalProfile(slug, fallback);
  }, [slug]);

  // ── 1. Core Selection State ──
  const categories = useMemo(
    () => getFirmCategoriesWithCounts(firmProfile.models),
    [firmProfile.models]
  );

  const [selectedCategory, setSelectedCategory] = useState<GFTCategory>(() => {
    return categories[0]?.id || 'two_step';
  });

  useEffect(() => {
    if (categories.length > 0 && !categories.some((c) => c.id === selectedCategory)) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  const modelsInCategory = useMemo(
    () => getFirmModelsByCategory(firmProfile.models, selectedCategory),
    [firmProfile.models, selectedCategory]
  );

  const [selectedModel, setSelectedModel] = useState<GFTModel>(() => {
    return modelsInCategory[0] || firmProfile.models[0];
  });

  useEffect(() => {
    if (modelsInCategory.length > 0 && !modelsInCategory.some((m) => m.id === selectedModel.id)) {
      setSelectedModel(modelsInCategory[0]);
    }
  }, [modelsInCategory, selectedModel]);

  const [selectedSize, setSelectedSize] = useState<number>(() => {
    return selectedModel?.defaultSize || 100000;
  });

  const [selectedStage, setSelectedStage] = useState<'all' | 'evaluation' | 'funded'>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | TradingPlatform>('all');
  const [selectedVersion, setSelectedVersion] = useState<'current_2026' | 'pre_aug_2026'>('current_2026');
  const [selectedTradingStyle, setSelectedTradingStyle] = useState<TradingStyle>('conservative');

  // Comparison Model IDs (up to 4)
  const [comparisonModelIds, setComparisonModelIds] = useState<string[]>(() => {
    return firmProfile.models.slice(0, 3).map((m) => m.id);
  });
  const [comparisonSize, setComparisonSize] = useState<number>(100000);

  // Active navigation section & view mode (hub vs matrix)
  const [activeSection, setActiveSection] = useState<string>('about-firm');
  const [viewMode, setViewMode] = useState<'hub' | 'matrix'>('hub');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Search & Global Filter State
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Evidence Modal State
  const [evidenceModalData, setEvidenceModalData] = useState<{
    evidence: string;
    title: string;
    sourceUrl?: string;
  } | null>(null);

  // Real-Time Scroll Spy
  useEffect(() => {
    const sectionIds = [
      'about-firm',
      'selector',
      'complete-rules-table',
      'decision',
      'snapshot',
      'comparison',
      'simulator',
      'explorer',
      'pricing',
      'futures',
      'traps',
      'trust',
      'reviews',
      'history',
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (scrollPosition >= top) {
            setActiveSection(sectionIds[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Synchronize size when model changes if size is not available
  useEffect(() => {
    if (!selectedModel?.availableSizes?.includes(selectedSize)) {
      setSelectedSize(selectedModel?.defaultSize || selectedModel?.availableSizes?.[0] || 100000);
    }
  }, [selectedModel, selectedSize]);

  // Handler for category switch
  const handleSelectCategory = (cat: GFTCategory) => {
    setSelectedCategory(cat);
    const modelsInNewCat = getFirmModelsByCategory(firmProfile.models, cat);
    if (modelsInNewCat.length > 0 && !modelsInNewCat.some((m) => m.id === selectedModel.id)) {
      setSelectedModel(modelsInNewCat[0]);
    }
  };

  // Handler for selecting model directly
  const handleSelectModel = (model: GFTModel) => {
    setSelectedModel(model);
    setSelectedCategory(model.category);
    if (!model.availableSizes?.includes(selectedSize)) {
      setSelectedSize(model.defaultSize || model.availableSizes[0] || 100000);
    }
  };

  // Handler for selection from recommendation or cards
  const handleSelectModelById = (modelId: string) => {
    const found = getFirmModelById(firmProfile.models, modelId);
    if (found) {
      handleSelectModel(found);
      scrollToSection('snapshot');
    }
  };

  // Comparison toggle
  const handleToggleCompare = (modelId: string) => {
    setComparisonModelIds((prev) => {
      if (prev.includes(modelId)) {
        return prev.filter((id) => id !== modelId);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), modelId];
      }
      return [...prev, modelId];
    });
  };

  const handleRemoveCompare = (modelId: string) => {
    setComparisonModelIds((prev) => prev.filter((id) => id !== modelId));
  };

  const handleAddCompare = (modelId: string) => {
    if (!comparisonModelIds.includes(modelId) && comparisonModelIds.length < 4) {
      setComparisonModelIds((prev) => [...prev, modelId]);
    }
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      const topOffset = 84;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Canonical Single Source of Truth Rule Object for the exact selected context
  const canonicalRules = useMemo(() => {
    return buildCanonicalSelectedRules(selectedModel, {
      category: selectedCategory,
      modelId: selectedModel.id,
      accountSize: selectedSize,
      stage: selectedStage,
      platform: selectedPlatform,
      purchaseDate: '2026-09-08',
      termsVersion: selectedVersion,
      tradingStyle: selectedTradingStyle,
    });
  }, [
    selectedCategory,
    selectedModel,
    selectedSize,
    selectedStage,
    selectedPlatform,
    selectedVersion,
    selectedTradingStyle,
  ]);

  // Derived datasets for active selection
  const pricingList = useMemo(
    () => getFirmAllPricingForModel(firmProfile.pricingRegistry, selectedModel.id),
    [firmProfile.pricingRegistry, selectedModel.id]
  );

  const rulesList: any[] = useMemo(() => {
    return getRulesForModel(selectedModel.id, selectedStage);
  }, [selectedModel.id, selectedStage]);

  const warningsList = useMemo(
    () => getFirmWarningsForModel(firmProfile.warnings, selectedModel.id),
    [firmProfile.warnings, selectedModel.id]
  );

  const changeHistoryList = useMemo(
    () => getFirmChangeHistoryForModel(firmProfile.changeHistory, selectedModel.id),
    [firmProfile.changeHistory, selectedModel.id]
  );

  const communityReviews = useMemo(
    () => getFirmReviewsForModel(firmProfile.reviews, selectedModel.id),
    [firmProfile.reviews, selectedModel.id]
  );

  const decisionRecommendations = useMemo(() => {
    if (firmProfile.recommendations && firmProfile.recommendations.length > 0) {
      return firmProfile.recommendations.map((rec: any, idx: number) => ({
        key: rec.key || `rec-${idx}`,
        title: rec.title || 'Recommended Model',
        bestModelId: rec.bestModelId || rec.recommendedModelId || firmProfile.models[0]?.id,
        bestModelName: rec.bestModelName || firmProfile.models.find((m) => m.id === (rec.bestModelId || rec.recommendedModelId))?.name || firmProfile.models[0]?.name,
        accountSizeRecommendation: typeof rec.accountSizeRecommendation === 'number' ? rec.accountSizeRecommendation : 100000,
        badge: rec.badge || 'Verified Choice',
        whyRecommended: rec.whyRecommended || rec.whyThisModel || 'Verified model parameters matched to strategy criteria.',
        assumptionsUsed: Array.isArray(rec.assumptionsUsed) ? rec.assumptionsUsed : ['Tested on standard market conditions', 'Static risk rules applied'],
        risksAndLimitations: Array.isArray(rec.risksAndLimitations) ? rec.risksAndLimitations : ['Subject to standard daily loss limits', 'Requires meeting target criteria'],
        suitabilityScore: typeof rec.suitabilityScore === 'number' ? rec.suitabilityScore : 95,
      }));
    }
    return [
      {
        key: 'standard',
        title: `${firmProfile.name} Primary Model`,
        bestModelId: firmProfile.models[0]?.id || 'default',
        bestModelName: firmProfile.models[0]?.name || 'Standard 2-Step',
        accountSizeRecommendation: 100000,
        badge: 'Recommended',
        whyRecommended: `Balanced evaluation structure with verified drawdown rules and high profit split.`,
        assumptionsUsed: ['Standard evaluation challenge', 'Discipline-based risk management'],
        risksAndLimitations: ['Daily loss limit enforced at rollover', 'Profit target required to progress'],
        suitabilityScore: 96,
      },
    ];
  }, [firmProfile.recommendations, firmProfile.models, firmProfile.name]);

  const futuresModels = useMemo(
    () => firmProfile.futuresModels || [],
    [firmProfile.futuresModels]
  );

  // Filtered models for global search
  const searchedModels = useMemo(() => {
    if (!globalSearchQuery.trim()) return [];
    const q = globalSearchQuery.toLowerCase();
    return firmProfile.models.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.tagline.toLowerCase().includes(q) ||
        m.categoryLabel.toLowerCase().includes(q)
    );
  }, [globalSearchQuery, firmProfile.models]);

  return (
    <div className="w-full min-h-screen bg-[#080A10] text-slate-100 selection:bg-blue-600 selection:text-white pb-24">
      {/* 1. Header with Firm Parameters */}
      <FirmV3Header
        firm={firmProfile}
        onSearchOpen={() => setIsSearchModalOpen(true)}
        activeSection={activeSection}
        onSectionClick={scrollToSection}
        onNavigate={onNavigate}
        totalModelsCount={firmProfile.models.length}
      />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">
          {/* Vertical Sticky Sidebar Navigation (Desktop) - Only active in Hub mode */}
          {viewMode === 'hub' && (
            <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-[76px] z-30 max-h-[calc(100vh-92px)] overflow-y-auto pr-1 scrollbar-thin">
              <GoatV3VerticalNav
                activeSection={activeSection}
                onSelectSection={scrollToSection}
                onSearchOpen={() => setIsSearchModalOpen(true)}
              />
            </aside>
          )}

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 space-y-10 sm:space-y-12 w-full">
            {/* Navigation Breadcrumb & Version Pill */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span
                  onClick={() => onNavigate('/prop-firms')}
                  className="hover:text-white cursor-pointer"
                >
                  Prop Firms
                </span>
                <span>/</span>
                <span
                  onClick={() => onNavigate(`/prop-firms/${firmProfile.slug}`)}
                  className="hover:text-white cursor-pointer text-slate-300 font-semibold"
                >
                  {firmProfile.name}
                </span>
                <span>/</span>
                <span className="text-blue-400 font-medium">
                  {viewMode === 'matrix' ? 'Phase-by-Phase Rules Matrix' : 'Official Rules & Intelligence Hub'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {firmProfile.models.length} Models Cataloged
                </span>
                <div className="flex items-center gap-1 bg-[#111318] p-1 rounded-xl border border-[#1F2228] text-[11px] font-mono">
                  <button
                    onClick={() => setViewMode('hub')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      viewMode === 'hub'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Rules Hub
                  </button>
                  <button
                    onClick={() => setViewMode('matrix')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      viewMode === 'matrix'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Open Phase-by-Phase Rules Matrix"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>All Rules Matrix</span>
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'matrix' ? (
              /* ══ MODE 2: PHASE-BY-PHASE RULES MATRIX ══ */
              <GoatV3PhaseByPhaseRulesMatrix onBackToHub={() => setViewMode('hub')} />
            ) : (
              /* ══ MODE 1: COMPLETE RULES HUB & DASHBOARD ══ */
              <>
                {/* 1.5 About Firm - Corporate Registry & Active Promos */}
                <FirmV3AboutFirm firm={firmProfile} onScrollToSection={scrollToSection} />

                {/* 2. Model Architecture & Selection Engine */}
                <GoatV3ModelSelector
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleSelectCategory}
                  modelsInCategory={modelsInCategory}
                  selectedModel={selectedModel}
                  onSelectModel={handleSelectModel}
                  selectedSize={selectedSize}
                  onSelectSize={setSelectedSize}
                  selectedStage={selectedStage}
                  onSelectStage={setSelectedStage}
                  selectedPlatform={selectedPlatform}
                  onSelectPlatform={setSelectedPlatform}
                  selectedVersion={selectedVersion}
                  onSelectVersion={setSelectedVersion}
                  selectedTradingStyle={selectedTradingStyle}
                  onSelectTradingStyle={setSelectedTradingStyle}
                  comparisonModelIds={comparisonModelIds}
                  onToggleCompareModel={handleToggleCompare}
                  onOpenComparison={() => scrollToSection('comparison')}
                />

                {/* 2.5 Complete Rules for Selected Model (Central Feature) */}
                <GoatV3CompleteModelRuleTable
                  canonicalRules={canonicalRules}
                  selectedModel={selectedModel}
                  selectedSize={selectedSize}
                  selectedStage={selectedStage}
                  selectedVersion={selectedVersion}
                  selectedPlatform={selectedPlatform}
                  selectedTradingStyle={selectedTradingStyle}
                  onSelectModel={handleSelectModel}
                  onSelectSize={setSelectedSize}
                  onSelectStage={setSelectedStage}
                  onSelectVersion={setSelectedVersion}
                  onSelectPlatform={setSelectedPlatform}
                  onOpenSourceModal={(evidence, title, sourceUrl) =>
                    setEvidenceModalData({ evidence, title, sourceUrl })
                  }
                />

                {/* 3. Quick Decision Guide & Suitability Matrix */}
                <GoatV3QuickDecision
                  recommendations={decisionRecommendations}
                  onSelectModelById={handleSelectModelById}
                  currentSelectedModelId={selectedModel.id}
                />

                {/* 4. Rule Snapshot */}
                <GoatV3RuleSnapshot
                  canonicalRules={canonicalRules}
                  onNavigateToCompleteTable={() => scrollToSection('complete-rules-table')}
                  onNavigateToExplorer={() => scrollToSection('explorer')}
                  onOpenSourceModal={(evidence, title) =>
                    setEvidenceModalData({ evidence, title, sourceUrl: selectedModel.sourceUrl })
                  }
                />

                {/* 5. Multi-Model Comparison Workspace */}
                <GoatV3ComparisonWorkspace
                  allModels={firmProfile.models}
                  selectedModelIds={comparisonModelIds}
                  onRemoveModel={handleRemoveCompare}
                  onAddModel={handleAddCompare}
                  comparisonSize={comparisonSize}
                  onChangeComparisonSize={setComparisonSize}
                />

                {/* 6. Model-Specific Risk Simulator (Phase 7-G) */}
                <GoatV3RiskSimulator
                  canonicalRules={canonicalRules}
                />

                {/* 7. Full Rule Explorer & Verification Audit (Phase 7-E) */}
                <GoatV3RuleExplorer
                  rules={rulesList}
                  accountSize={selectedSize}
                  onOpenSourceModal={(evidence, title, sourceUrl) =>
                    setEvidenceModalData({ evidence, title, sourceUrl })
                  }
                />

                {/* 8. Pricing & Promotion Verification Engine (Phase 7-H) */}
                <GoatV3PricingPromos
                  model={selectedModel}
                  pricingList={pricingList}
                  selectedSize={selectedSize}
                  onSelectSize={setSelectedSize}
                />

                {/* 9. Dedicated CME Futures Desk (Phase 8) */}
                {futuresModels.length > 0 && (
                  <GoatV3FuturesWorkspace futuresModels={futuresModels} />
                )}

                {/* 10. Watchouts, Restrictions & Rule Clarifications (Phase 7-K) */}
                <GoatV3TrapsWarnings
                  warnings={warningsList}
                  selectedModelId={selectedModel.id}
                />

                {/* 11. Trust & Verification Framework (Phase 7-I) */}
                <GoatV3TrustCenter />

                {/* 12. Community Reports & Trader Testimonials (Phase 7-J) */}
                <GoatV3CommunityReviews reviews={communityReviews} />

                {/* 13. Rule Change History & Verification Audit Trail (Phase 7-L) */}
                <GoatV3ChangeHistory changeHistory={changeHistoryList} />
              </>
            )}
          </main>
        </div>
      </div>

      {/* Global Source / Evidence Modal */}
      {evidenceModalData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setEvidenceModalData(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-[#0e111a] border border-[#222738] p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#222738] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Source Evidence: {evidenceModalData.title}</span>
              </div>
              <button
                onClick={() => setEvidenceModalData(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#080A10] border border-[#1b202c] text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
              {evidenceModalData.evidence}
            </div>

            {evidenceModalData.sourceUrl && (
              <div className="pt-2">
                <a
                  href={evidenceModalData.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 underline font-medium"
                >
                  Verify at Official Source Documentation <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
