import React, { useState, useMemo, useEffect } from 'react';
import {
  GFT_CANONICAL_MODELS,
  GFT_FUTURES_MODELS,
  GFTCategory,
  GFTModel,
  TradingPlatform,
  TradingStyle,
} from '../data/goatCanonicalData.ts';
import {
  getCategoriesWithCounts,
  getModelsByCategory,
  getModelById,
  getAllPricingForModel,
  getRulesForModel,
  getWarningsForModel,
  getReviewsForModel,
  getChangeHistoryForModel,
  getAllDecisionRecommendations,
  getAllFuturesModels,
} from '../data/goatSelectors.ts';
import { GoatV3Header } from '../components/goat-v3/GoatV3Header.tsx';
import { buildCanonicalSelectedRules } from '../data/goatCanonicalContext.ts';
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
import { GoatV3AboutFirm } from '../components/goat-v3/GoatV3AboutFirm.tsx';
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

interface GoatResearchTerminalV3PageProps {
  onNavigate: (path: string) => void;
  onOpenSource?: (evidence: any, ruleTitle: string) => void;
}

export const GoatResearchTerminalV3Page: React.FC<GoatResearchTerminalV3PageProps> = ({
  onNavigate,
  onOpenSource,
}) => {
  // ── 1. Core Selection State ──
  const categories = useMemo(() => getCategoriesWithCounts(), []);
  const [selectedCategory, setSelectedCategory] = useState<GFTCategory>('two_step');
  const modelsInCategory = useMemo(
    () => getModelsByCategory(selectedCategory),
    [selectedCategory]
  );

  const [selectedModel, setSelectedModel] = useState<GFTModel>(() => {
    return (
      GFT_CANONICAL_MODELS.find((m) => m.id === 'two_step_standard') ||
      GFT_CANONICAL_MODELS[0]
    );
  });

  const [selectedSize, setSelectedSize] = useState<number>(100000);
  const [selectedStage, setSelectedStage] = useState<'all' | 'evaluation' | 'funded'>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | TradingPlatform>('all');
  const [selectedVersion, setSelectedVersion] = useState<'current_2026' | 'pre_aug_2026'>('current_2026');
  const [selectedTradingStyle, setSelectedTradingStyle] = useState<TradingStyle>('conservative');

  // Comparison Model IDs (up to 4)
  const [comparisonModelIds, setComparisonModelIds] = useState<string[]>([
    'two_step_standard',
    'one_step',
    'pay_after_pass',
  ]);
  const [comparisonSize, setComparisonSize] = useState<number>(100000);

  // Active navigation section & view mode (hub vs matrix)
  const [activeSection, setActiveSection] = useState<string>('about-firm');
  const [viewMode, setViewMode] = useState<'hub' | 'matrix'>('hub');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Search & Global Filter State
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [filterShowConflicts, setFilterShowConflicts] = useState(false);
  const [filterShowHistorical, setFilterShowHistorical] = useState(false);

  // Evidence Modal State
  const [evidenceModalData, setEvidenceModalData] = useState<{
    evidence: string;
    title: string;
    sourceUrl?: string;
  } | null>(null);

  // Real-Time Scroll Spy to sync activeSection with viewport scroll
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
    if (!selectedModel.availableSizes.includes(selectedSize)) {
      setSelectedSize(selectedModel.defaultSize);
    }
  }, [selectedModel, selectedSize]);

  // Handler for category switch
  const handleSelectCategory = (cat: GFTCategory) => {
    setSelectedCategory(cat);
    const modelsInNewCat = getModelsByCategory(cat);
    if (modelsInNewCat.length > 0 && !modelsInNewCat.some((m) => m.id === selectedModel.id)) {
      setSelectedModel(modelsInNewCat[0]);
    }
  };

  // Handler for selecting model directly
  const handleSelectModel = (model: GFTModel) => {
    setSelectedModel(model);
    setSelectedCategory(model.category);
    if (!model.availableSizes.includes(selectedSize)) {
      setSelectedSize(model.defaultSize);
    }
  };

  // Handler for selection from recommendation or cards
  const handleSelectModelById = (modelId: string) => {
    const found = getModelById(modelId);
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
      purchaseDate: selectedVersion === 'pre_aug_2026' ? '2026-07-15' : '2026-09-01',
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
    () => getAllPricingForModel(selectedModel.id),
    [selectedModel.id]
  );
  const rulesList = useMemo(
    () => getRulesForModel(selectedModel.id, selectedStage),
    [selectedModel.id, selectedStage]
  );
  const warningsList = useMemo(
    () => getWarningsForModel(selectedModel.id),
    [selectedModel.id]
  );
  const changeHistoryList = useMemo(
    () => getChangeHistoryForModel(selectedModel.id),
    [selectedModel.id]
  );
  const communityReviews = useMemo(
    () => getReviewsForModel(selectedModel.id),
    [selectedModel.id]
  );
  const decisionRecommendations = useMemo(
    () => getAllDecisionRecommendations(),
    []
  );
  const futuresModels = useMemo(() => getAllFuturesModels(), []);

  // Filtered models for global search
  const searchedModels = useMemo(() => {
    if (!globalSearchQuery.trim()) return [];
    const q = globalSearchQuery.toLowerCase();
    return GFT_CANONICAL_MODELS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.tagline.toLowerCase().includes(q) ||
        m.categoryLabel.toLowerCase().includes(q)
    );
  }, [globalSearchQuery]);

  const searchedRules = useMemo(() => {
    if (!globalSearchQuery.trim()) return [];
    const q = globalSearchQuery.toLowerCase();
    return rulesList.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.exactClause.toLowerCase().includes(q)
    );
  }, [globalSearchQuery, rulesList]);

  return (
    <div className="w-full min-h-screen bg-[#080A10] text-slate-100 selection:bg-blue-600 selection:text-white pb-24">
      {/* 1. Header (Phase 7-A) */}
      <GoatV3Header
        onSearchOpen={() => setIsSearchModalOpen(true)}
        activeSection={activeSection}
        onSectionClick={scrollToSection}
        onNavigate={onNavigate}
        totalModelsCount={GFT_CANONICAL_MODELS.length}
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
                  onClick={() => onNavigate('/prop-firms/goat-funded-trader')}
                  className="hover:text-white cursor-pointer text-slate-300"
                >
                  Goat Funded Trader
                </span>
                <span>/</span>
                <span className="text-blue-400 font-medium">
                  {viewMode === 'matrix' ? 'Phase-by-Phase Rules Matrix' : 'Official Rules & Intelligence Hub'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  13 Models Cataloged
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
              /* ══ MODE 2: PHASE-BY-PHASE RULES MATRIX (EXACT IMAGE 1) ══ */
              <GoatV3PhaseByPhaseRulesMatrix onBackToHub={() => setViewMode('hub')} />
            ) : (
              /* ══ MODE 1: COMPLETE RULES HUB & DASHBOARD ══ */
              <>
                {/* 1.5 About Goat Funded Trader - Corporate Registry & Active Promos */}
                <GoatV3AboutFirm onScrollToSection={scrollToSection} />

                {/* 2. Model Architecture & Selection Engine (Phase 6 & 7-B) */}
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

                {/* 3. Quick Decision Guide & Suitability Matrix (Phase 7-C) */}
                <GoatV3QuickDecision
                  recommendations={decisionRecommendations}
                  onSelectModelById={handleSelectModelById}
                  currentSelectedModelId={selectedModel.id}
                />

                {/* 4. Rule Snapshot (Phase 7-D) */}
                <GoatV3RuleSnapshot
                  canonicalRules={canonicalRules}
                  onNavigateToCompleteTable={() => scrollToSection('complete-rules-table')}
                  onNavigateToExplorer={() => scrollToSection('explorer')}
                  onOpenSourceModal={(evidence, title) =>
                    setEvidenceModalData({ evidence, title, sourceUrl: selectedModel.sourceUrl })
                  }
                />

                {/* 5. Multi-Model Comparison Workspace (Phase 7-F) */}
                <GoatV3ComparisonWorkspace
                  allModels={GFT_CANONICAL_MODELS}
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
                <GoatV3FuturesWorkspace futuresModels={futuresModels} />

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

      {/* ── Mobile & Tablet Quick Jump Floating Trigger (Hub mode only) ── */}
      {viewMode === 'hub' && (
        <div className="lg:hidden fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-2xl shadow-blue-600/50 border border-blue-400/30 transition-transform active:scale-95 cursor-pointer backdrop-blur-md"
          >
            <BookOpen className="w-4 h-4 text-white" />
            <span>Sections Index</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      )}

      {/* ── Mobile Vertical Nav Slide-Up Modal ── */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full sm:max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-2xl bg-[#0b0e17] border border-[#1b202e] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-[#0e121d]">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Jump to Section (13)</span>
              </div>
              <button
                onClick={() => setIsMobileNavOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 overflow-y-auto flex-1">
              <GoatV3VerticalNav
                activeSection={activeSection}
                onSelectSection={scrollToSection}
                onSearchOpen={() => {
                  setIsMobileNavOpen(false);
                  setIsSearchModalOpen(true);
                }}
                isMobileModal={true}
                onCloseMobileModal={() => setIsMobileNavOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Global Search Modal ── */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl rounded-2xl bg-[#111318] border border-[#1F2228] p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Search className="w-4 h-4 text-blue-400" />
                Global Intelligence Search
              </div>
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Type model name, rule, drawdown type, or trap keyword..."
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                className="w-full bg-[#16181E] border border-[#1F2228] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {globalSearchQuery.trim() === '' ? (
                <div className="text-center py-8 text-xs text-slate-400 space-y-1">
                  <p>Search across all 13 Goat Funded Trader models and official legal rules.</p>
                  <p className="text-slate-400">Try searching: "Pay Later", "Floating loss", "VPS", "1-Step", "Consistency"</p>
                </div>
              ) : (
                <>
                  {/* Matching Models */}
                  {searchedModels.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                        Matching Models ({searchedModels.length})
                      </span>
                      <div className="space-y-1">
                        {searchedModels.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => {
                              handleSelectModel(m);
                              setIsSearchModalOpen(false);
                            }}
                            className="p-2.5 rounded-lg bg-[#16181E] hover:bg-slate-800 border border-[#1F2228] cursor-pointer flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-bold text-white">{m.name}</div>
                              <div className="text-[11px] text-slate-400">{m.tagline}</div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Rules */}
                  {searchedRules.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                        Matching Rules & Clauses ({searchedRules.length})
                      </span>
                      <div className="space-y-1">
                        {searchedRules.map((r) => (
                          <div
                            key={r.id}
                            onClick={() => {
                              setIsSearchModalOpen(false);
                              scrollToSection('explorer');
                            }}
                            className="p-2.5 rounded-lg bg-[#16181E] hover:bg-slate-800 border border-[#1F2228] cursor-pointer text-xs space-y-1"
                          >
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{r.title}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                                {r.categoryLabel}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{r.summary}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchedModels.length === 0 && searchedRules.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400">
                      No matching models or clauses found for "{globalSearchQuery}".
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Evidence Inspection Modal ── */}
      {evidenceModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-[#111318] border border-[#1F2228] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Source Evidence Verification
              </div>
              <button
                onClick={() => setEvidenceModalData(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-white">{evidenceModalData.title}</div>
              <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.06] text-slate-200 text-xs italic leading-relaxed">
                "{evidenceModalData.evidence}"
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.04] text-xs">
              <span className="text-slate-400 text-[11px]">
                Status: <strong className="text-emerald-400">Audit Grade A Verified</strong>
              </span>

              {evidenceModalData.sourceUrl && (
                <a
                  href={evidenceModalData.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium"
                >
                  <span>Open Official Help Article</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
