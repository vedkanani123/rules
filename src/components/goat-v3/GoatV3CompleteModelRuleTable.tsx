import React, { useState, useMemo } from 'react';
import {
  GFTModel,
  GFT_CANONICAL_MODELS,
  TradingPlatform,
  TradingStyle,
} from '../../data/goatCanonicalData.ts';
import { CanonicalSelectedModelRules } from '../../data/goatCanonicalContext.ts';
import {
  PhaseAwareRuleRow,
  RuleCategoryGroup,
  RuleDecisionValue,
  RuleStatusValue,
  buildPhaseAwareRuleTable,
  calculatePercentageAmount,
  formatCurrency,
  RULE_CATEGORIES,
} from '../../data/goatPhaseAwareRules.ts';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Calculator,
  ExternalLink,
  Layers,
  Target,
  TrendingDown,
  DollarSign,
  Clock,
  Zap,
  Info,
  Sliders,
  AlertCircle,
  X,
  FileText,
  RotateCcw,
  Sparkles,
  BookOpen,
  ArrowRight,
  Shield,
  Activity,
} from 'lucide-react';

interface GoatV3CompleteModelRuleTableProps {
  canonicalRules: CanonicalSelectedModelRules;
  selectedModel?: GFTModel;
  selectedSize?: number;
  selectedStage?: 'all' | 'evaluation' | 'funded';
  selectedVersion?: 'current_2026' | 'pre_aug_2026';
  selectedPlatform?: 'all' | TradingPlatform;
  selectedTradingStyle?: TradingStyle;
  onSelectModel?: (model: GFTModel) => void;
  onSelectSize?: (size: number) => void;
  onSelectStage?: (stage: 'all' | 'evaluation' | 'funded') => void;
  onSelectVersion?: (version: 'current_2026' | 'pre_aug_2026') => void;
  onSelectPlatform?: (platform: 'all' | TradingPlatform) => void;
  onOpenSourceModal?: (evidence: string, title: string, sourceUrl?: string) => void;
}

export const GoatV3CompleteModelRuleTable: React.FC<GoatV3CompleteModelRuleTableProps> = ({
  canonicalRules,
  selectedModel,
  selectedSize,
  selectedStage,
  selectedVersion,
  onSelectModel,
  onSelectSize,
  onSelectStage,
  onSelectVersion,
  onOpenSourceModal,
}) => {
  const activeModel = selectedModel || canonicalRules.model;
  const currentAccountSize = selectedSize || canonicalRules.core.nominalCapital;
  const currentTermsVersion = selectedVersion || canonicalRules.context.termsVersion;
  const currentStage = selectedStage || canonicalRules.context.stage;

  // Local Table Controls & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('all');
  const [decisionFilter, setDecisionFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [filterCalculationsOnly, setFilterCalculationsOnly] = useState(false);
  const [filterConflictsOnly, setFilterConflictsOnly] = useState(false);
  const [filterConfirmationOnly, setFilterConfirmationOnly] = useState(false);

  // Category Collapsing State: All 28 categories expanded by default for full transparency
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(RULE_CATEGORIES.map((c) => c.id))
  );

  // Drawer & Modal State
  const [activeDrawerRow, setActiveDrawerRow] = useState<PhaseAwareRuleRow | null>(null);
  const [showValidationReportModal, setShowValidationReportModal] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Build the complete 28-category Phase-Aware Table Data strictly from single source
  const { groups, allRows, validationReport } = useMemo(() => {
    return buildPhaseAwareRuleTable(activeModel, {
      accountSize: currentAccountSize,
      stage: currentStage,
      platform: canonicalRules.context.platform,
      termsVersion: currentTermsVersion,
      tradingStyle: canonicalRules.context.tradingStyle,
    });
  }, [activeModel, currentAccountSize, currentStage, currentTermsVersion, canonicalRules]);

  // Expand / Collapse Category Handlers
  const toggleCategory = (key: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedCategories(new Set(RULE_CATEGORIES.map((c) => c.id)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategoryKey('all');
    setDecisionFilter('all');
    setVerificationFilter('all');
    setFilterCalculationsOnly(false);
    setFilterConflictsOnly(false);
    setFilterConfirmationOnly(false);
  };

  // Filtered Rows Computation
  const filteredRows = useMemo(() => {
    return allRows.filter((row) => {
      // Category filter
      if (selectedCategoryKey !== 'all' && row.categoryKey !== selectedCategoryKey) {
        return false;
      }

      // Decision filter
      if (decisionFilter !== 'all') {
        const d = row.decision.toUpperCase();
        if (d !== decisionFilter.toUpperCase()) return false;
      }

      // Verification status filter
      if (verificationFilter !== 'all') {
        if (row.verification !== verificationFilter) return false;
      }

      // Calculations only filter
      if (filterCalculationsOnly && (!row.formula || row.formula === 'N/A')) {
        return false;
      }

      // Conflicts only filter
      if (filterConflictsOnly && row.verification !== 'Conflicting' && !row.conflictDetails?.hasConflict) {
        return false;
      }

      // Requires confirmation only filter
      if (filterConfirmationOnly && row.verification !== 'Requires Confirmation') {
        return false;
      }

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = row.ruleName.toLowerCase().includes(q);
        const matchesCategory = row.categoryTitle.toLowerCase().includes(q);
        const matchesPhase1 = row.phase1.toLowerCase().includes(q);
        const matchesPhase2 = row.phase2.toLowerCase().includes(q);
        const matchesPhase3 = row.phase3.toLowerCase().includes(q);
        const matchesMaster = row.masterAccount.toLowerCase().includes(q);
        const matchesCalculation = row.calculation.toLowerCase().includes(q);
        const matchesFormula = row.formula?.toLowerCase().includes(q) ?? false;
        const matchesSource = row.source.toLowerCase().includes(q);
        const matchesExplanation = row.explanation.toLowerCase().includes(q);
        const matchesBeginner = row.beginnerExplanation?.toLowerCase().includes(q) ?? false;

        if (
          !matchesName &&
          !matchesCategory &&
          !matchesPhase1 &&
          !matchesPhase2 &&
          !matchesPhase3 &&
          !matchesMaster &&
          !matchesCalculation &&
          !matchesFormula &&
          !matchesSource &&
          !matchesExplanation &&
          !matchesBeginner
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    allRows,
    selectedCategoryKey,
    decisionFilter,
    verificationFilter,
    filterCalculationsOnly,
    filterConflictsOnly,
    filterConfirmationOnly,
    searchQuery,
  ]);

  // Group filtered rows back into their category groupings
  const filteredGroups = useMemo(() => {
    return groups
      .map((g) => ({
        ...g,
        rules: filteredRows.filter((r) => r.categoryKey === g.key),
      }))
      .filter((g) => g.rules.length > 0);
  }, [groups, filteredRows]);

  // Helper for Decision Pill Styling
  const renderDecisionBadge = (decision: RuleDecisionValue, detail?: string) => {
    const d = decision.toUpperCase();
    let bg = 'bg-slate-800 text-slate-300 border-slate-700';
    if (d === 'YES') bg = 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30';
    else if (d === 'NO') bg = 'bg-rose-950/40 text-rose-300 border-rose-500/30';
    else if (d === 'LIMITED') bg = 'bg-amber-950/40 text-amber-300 border-amber-500/30';
    else if (d === 'CONDITIONAL') bg = 'bg-blue-950/40 text-blue-300 border-blue-500/30';
    else if (d === 'CONFLICTING') bg = 'bg-orange-950/40 text-orange-300 border-orange-500/30';
    else if (d === 'N/A') bg = 'bg-zinc-900 text-zinc-500 border-zinc-800';

    return (
      <div className="flex flex-col items-center">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${bg}`}>
          {d}
        </span>
        {detail && detail !== d && (
          <span className="text-[10px] text-slate-400 mt-0.5 text-center leading-tight max-w-[120px] truncate" title={detail}>
            {detail}
          </span>
        )}
      </div>
    );
  };

  // Helper for Verification Status Badge Styling
  const renderVerificationBadge = (status: RuleStatusValue) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Verified
          </span>
        );
      case 'Conflicting':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <AlertTriangle className="w-3 h-3 text-orange-400" />
            Conflicting
          </span>
        );
      case 'Official but Ambiguous':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/30">
            <HelpCircle className="w-3 h-3 text-blue-400" />
            Official / Ambiguous
          </span>
        );
      case 'Requires Confirmation':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            Requires Confirmation
          </span>
        );
      case 'Historical':
      case 'Grandfathered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/30">
            <Clock className="w-3 h-3 text-purple-400" />
            {status}
          </span>
        );
      case 'Third-Party Report':
      case 'Community Reported':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            <Layers className="w-3 h-3 text-cyan-400" />
            {status}
          </span>
        );
      case 'Not Applicable':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] text-zinc-500 bg-zinc-900 border border-zinc-800">
            N/A
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] text-rose-400 bg-rose-950/20 border border-rose-500/20">
            Unverified
          </span>
        );
    }
  };

  // Helper for Phase Cells
  const renderPhaseCell = (value: string, isMaster: boolean = false) => {
    const isNA = value.startsWith('N/A');
    if (isNA) {
      return (
        <span className="text-[11px] text-zinc-500 italic font-mono bg-white/[0.02] px-2 py-1 rounded border border-white/[0.03]">
          {value}
        </span>
      );
    }
    return (
      <span className={`text-[12px] font-medium ${isMaster ? 'text-emerald-300 font-semibold' : 'text-slate-200'}`}>
        {value}
      </span>
    );
  };

  // Copy shareable rule link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  return (
    <section id="complete-rules-table" className="space-y-4">
      {/* ── Section Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono font-bold uppercase tracking-wider">
              Canonical Source of Truth
            </span>
            <span className="text-xs text-slate-400">Independent Research Terminal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-blue-400" />
            Complete Rules Table — {activeModel.name}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict phase breakdown across Phase 1, Phase 2, Phase 3, and Master Account with live dollar calculations derived from {formatCurrency(currentAccountSize)}.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowValidationReportModal(true)}
            className="px-3 py-1.5 rounded-lg bg-[#16181F] hover:bg-[#1E222D] border border-white/[0.08] text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Data Quality Report</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-lg bg-[#16181F] hover:bg-[#1E222D] border border-white/[0.08] text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSuccess ? 'Link Copied' : 'Share View'}</span>
          </button>
        </div>
      </div>

      {/* ── Dynamic Epistemic Audit Summary Bar (Requirement 13) ── */}
      <div className="p-3.5 rounded-xl bg-[#0D0F14] border border-white/[0.08] space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span>Audit Summary:</span>
            <span className="font-mono text-white bg-white/[0.06] px-2 py-0.5 rounded">
              {filteredRows.length === validationReport.totalRulesCount
                ? `${validationReport.totalRulesCount} Rules Total`
                : `${filteredRows.length} Visible / ${validationReport.totalRulesCount} Model Rules`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {validationReport.verifiedCount} Verified
            </span>
            {validationReport.ambiguousCount > 0 && (
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                {validationReport.ambiguousCount} Ambiguous
              </span>
            )}
            {validationReport.conflictingCount > 0 && (
              <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30">
                {validationReport.conflictingCount} Conflicting
              </span>
            )}
            {validationReport.requiresConfirmationCount > 0 && (
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {validationReport.requiresConfirmationCount} Requires Confirmation
              </span>
            )}
            {validationReport.historicalCount > 0 && (
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                {validationReport.historicalCount} Historical
              </span>
            )}
            {validationReport.unverifiedCount > 0 && (
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {validationReport.unverifiedCount} Unverified
              </span>
            )}
            {validationReport.notApplicableCount > 0 && (
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                {validationReport.notApplicableCount} N/A
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Interactive Table Controls & Filter Toolbar (Requirement 14) ── */}
      <div className="p-4 rounded-xl bg-[#111318] border border-white/[0.08] space-y-3">
        {/* Row 1: Model, Size, Terms Version, Stage Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Model Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Model</label>
            <select
              value={activeModel.id}
              onChange={(e) => {
                const found = GFT_CANONICAL_MODELS.find((m) => m.id === e.target.value);
                if (found && onSelectModel) onSelectModel(found);
              }}
              className="w-full bg-[#16181E] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
            >
              {GFT_CANONICAL_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.categoryLabel})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Account Size Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Account Size</label>
            <select
              value={currentAccountSize}
              onChange={(e) => {
                const size = Number(e.target.value);
                if (onSelectSize) onSelectSize(size);
              }}
              className="w-full bg-[#16181E] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
            >
              {activeModel.availableSizes.map((size) => (
                <option key={size} value={size}>
                  {formatCurrency(size)} Baseline
                </option>
              ))}
            </select>
          </div>

          {/* 3. Terms Version Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Terms Version</label>
            <select
              value={currentTermsVersion}
              onChange={(e) => {
                const v = e.target.value as 'current_2026' | 'pre_aug_2026';
                if (onSelectVersion) onSelectVersion(v);
              }}
              className="w-full bg-[#16181E] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
            >
              <option value="current_2026">Current September 2026 Terms</option>
              <option value="pre_aug_2026">Pre-August 2026 Terms (Grandfathered)</option>
            </select>
          </div>

          {/* 4. Stage Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Account Stage</label>
            <select
              value={currentStage}
              onChange={(e) => {
                const s = e.target.value as 'all' | 'evaluation' | 'funded';
                if (onSelectStage) onSelectStage(s);
              }}
              className="w-full bg-[#16181E] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
            >
              <option value="all">All Stages (Eval & Funded)</option>
              <option value="evaluation">Evaluation Challenges Only</option>
              <option value="funded">Funded Master Account Only</option>
            </select>
          </div>
        </div>

        {/* Row 2: Search, Category Filter, Decision Filter, Verification Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search parameter, formula, source..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#16181E] border border-white/[0.1] rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategoryKey}
              onChange={(e) => setSelectedCategoryKey(e.target.value)}
              className="w-full bg-[#16181E] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All 28 Categories (A – AB)</option>
              {RULE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id}. {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Decision Filter */}
          <div>
            <select
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
              className="w-full bg-[#16181E] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Decisions (Yes / No / Limited / etc.)</option>
              <option value="YES">YES — Permitted / Required</option>
              <option value="LIMITED">LIMITED — Allowed with Restrictions</option>
              <option value="CONDITIONAL">CONDITIONAL — Context Dependent</option>
              <option value="NO">NO — Strictly Prohibited / None</option>
              <option value="CONFLICTING">CONFLICTING — Disputed Policy</option>
              <option value="N/A">N/A — Not Applicable</option>
            </select>
          </div>

          {/* Verification Filter */}
          <div>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-full bg-[#16181E] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Verification Statuses</option>
              <option value="Verified">Verified Only</option>
              <option value="Conflicting">Conflicting Rules</option>
              <option value="Requires Confirmation">Requires Confirmation</option>
              <option value="Official but Ambiguous">Official but Ambiguous</option>
              <option value="Historical">Historical / Grandfathered</option>
            </select>
          </div>
        </div>

        {/* Row 3: Quick Filter Chips & Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.05]">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterCalculationsOnly(!filterCalculationsOnly)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer flex items-center gap-1 ${
                filterCalculationsOnly
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold'
                  : 'bg-white/[0.03] text-slate-400 border-white/[0.08] hover:text-white'
              }`}
            >
              <Calculator className="w-3 h-3" />
              Calculations Only
            </button>

            <button
              onClick={() => setFilterConflictsOnly(!filterConflictsOnly)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer flex items-center gap-1 ${
                filterConflictsOnly
                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 font-bold'
                  : 'bg-white/[0.03] text-slate-400 border-white/[0.08] hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-orange-400" />
              Conflicts Only
            </button>

            <button
              onClick={() => setFilterConfirmationOnly(!filterConfirmationOnly)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer flex items-center gap-1 ${
                filterConfirmationOnly
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                  : 'bg-white/[0.03] text-slate-400 border-white/[0.08] hover:text-white'
              }`}
            >
              <AlertCircle className="w-3 h-3 text-amber-400" />
              Requires Confirmation
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={expandAll}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer text-[11px]"
            >
              Expand All
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={collapseAll}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer text-[11px]"
            >
              Collapse All
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={resetFilters}
              className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* ── Desktop & Tablet 10-Column Semantic Table (Requirement 2 & 5) ── */}
      <div className="hidden md:block rounded-xl border border-white/[0.08] overflow-hidden bg-[#0A0C10] shadow-xl">
        <div className="overflow-x-auto max-h-[750px] relative">
          <table className="w-full border-collapse text-left">
            {/* Table Header: Exact 10 Logical Columns */}
            <thead className="bg-[#12141A] text-slate-300 text-[11px] uppercase tracking-wider font-semibold border-b border-white/[0.08] sticky top-0 z-20 shadow-md">
              <tr>
                <th scope="col" className="py-3 px-3 w-12 text-center sticky left-0 z-30 bg-[#12141A] border-r border-white/[0.06]">
                  #
                </th>
                <th scope="col" className="py-3 px-4 min-w-[220px] text-left sticky left-12 z-30 bg-[#12141A] border-r border-white/[0.06]">
                  Rule / Parameter
                </th>
                <th scope="col" className="py-3 px-3 min-w-[130px] text-left border-r border-white/[0.06]">
                  Phase 1
                </th>
                <th scope="col" className="py-3 px-3 min-w-[130px] text-left border-r border-white/[0.06]">
                  Phase 2
                </th>
                <th scope="col" className="py-3 px-3 min-w-[130px] text-left border-r border-white/[0.06]">
                  Phase 3
                </th>
                <th scope="col" className="py-3 px-4 min-w-[140px] text-left border-r border-white/[0.06] text-emerald-400 bg-emerald-950/10">
                  Master Account
                </th>
                <th scope="col" className="py-3 px-3 min-w-[120px] text-center border-r border-white/[0.06]">
                  Decision
                </th>
                <th scope="col" className="py-3 px-3 min-w-[140px] text-center border-r border-white/[0.06]">
                  Verification
                </th>
                <th scope="col" className="py-3 px-4 min-w-[180px] text-left border-r border-white/[0.06]">
                  Data / Calculation
                </th>
                <th scope="col" className="py-3 px-3 min-w-[130px] text-center">
                  Evidence
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.04]">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-sm text-slate-400 space-y-2">
                    <AlertCircle className="w-6 h-6 mx-auto text-slate-500" />
                    <p className="font-medium text-white">No rules match the current filters.</p>
                    <p className="text-xs">Try clearing the search query or switching category filter.</p>
                    <button
                      onClick={resetFilters}
                      className="mt-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                    >
                      Reset All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => {
                  const isExpanded = expandedCategories.has(group.key);

                  return (
                    <React.Fragment key={group.key}>
                      {/* Category Header Row (Spanning all 10 columns) */}
                      <tr className="bg-[#141822] border-y border-white/[0.08] select-none">
                        <td colSpan={10} className="py-2.5 px-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <button
                                onClick={() => toggleCategory(group.key)}
                                aria-expanded={isExpanded}
                                className="p-1 rounded hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                              <span className="text-xs font-bold text-white tracking-wide">{group.title}</span>
                              <span className="text-[11px] text-slate-400 hidden lg:inline">— {group.description}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-400">
                                {group.rules.length} {group.rules.length === 1 ? 'rule' : 'rules'}
                              </span>
                              {group.hasConflict && (
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Conflict
                                </span>
                              )}
                              {(group.requiresConfirmationCount ?? 0) > 0 && (
                                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                  {group.requiresConfirmationCount} Requires Confirmation
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Category Rules Rows */}
                      {isExpanded &&
                        group.rules.map((row) => {
                          const isConflicting = row.verification === 'Conflicting' || row.conflictDetails?.hasConflict;

                          return (
                            <tr
                              key={row.id}
                              onClick={() => setActiveDrawerRow(row)}
                              className={`group hover:bg-white/[0.02] transition-colors cursor-pointer ${
                                isConflicting ? 'bg-orange-950/[0.07]' : ''
                              }`}
                            >
                              {/* 1. Index (Sticky Col 1) */}
                              <td className="py-3 px-3 text-center text-[11px] font-mono text-slate-400 sticky left-0 z-10 bg-[#0A0C10] group-hover:bg-[#12141C] border-r border-white/[0.06]">
                                {row.index}
                              </td>

                              {/* 2. Rule / Parameter (Sticky Col 2) */}
                              <td className="py-3 px-4 text-xs font-semibold text-white sticky left-12 z-10 bg-[#0A0C10] group-hover:bg-[#12141C] border-r border-white/[0.06]">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span>{row.ruleName}</span>
                                    {row.beginnerExplanation && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveDrawerRow(row);
                                        }}
                                        className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5 cursor-pointer font-normal opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="View plain-English beginner explanation"
                                      >
                                        <BookOpen className="w-3 h-3" />
                                        <span>Explain</span>
                                      </button>
                                    )}
                                  </div>
                                  <div className="text-[10px] font-mono text-slate-400 font-normal">
                                    {row.appliesTo}
                                  </div>
                                </div>
                              </td>

                              {/* 3. Phase 1 */}
                              <td className="py-3 px-3 border-r border-white/[0.06]">
                                {renderPhaseCell(row.phase1)}
                              </td>

                              {/* 4. Phase 2 */}
                              <td className="py-3 px-3 border-r border-white/[0.06]">
                                {renderPhaseCell(row.phase2)}
                              </td>

                              {/* 5. Phase 3 */}
                              <td className="py-3 px-3 border-r border-white/[0.06]">
                                {renderPhaseCell(row.phase3)}
                              </td>

                              {/* 6. Master Account (Funded) */}
                              <td className="py-3 px-4 border-r border-white/[0.06] bg-emerald-950/[0.04]">
                                {renderPhaseCell(row.masterAccount, true)}
                              </td>

                              {/* 7. Decision (YES / NO / LIMITED / CONDITIONAL / etc.) */}
                              <td className="py-3 px-3 text-center border-r border-white/[0.06]">
                                {renderDecisionBadge(row.decision, row.decisionDetail)}
                              </td>

                              {/* 8. Verification (Verified / Conflicting / Ambiguous / etc.) */}
                              <td className="py-3 px-3 text-center border-r border-white/[0.06]">
                                {renderVerificationBadge(row.verification)}
                              </td>

                              {/* 9. Data / Calculation */}
                              <td className="py-3 px-4 border-r border-white/[0.06]">
                                <div className="text-[11px] font-mono text-slate-300">
                                  {row.calculation}
                                </div>
                              </td>

                              {/* 10. Evidence */}
                              <td className="py-3 px-3 text-center">
                                <div className="inline-flex items-center gap-1">
                                  <span
                                    className="text-[10px] font-mono text-slate-400 hover:text-white underline cursor-pointer truncate max-w-[100px]"
                                    title={row.source}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onOpenSourceModal) {
                                        onOpenSourceModal(row.explanation, row.ruleName, row.sourceUrl);
                                      } else {
                                        setActiveDrawerRow(row);
                                      }
                                    }}
                                  >
                                    {row.source}
                                  </span>
                                  {row.sourceUrl && (
                                    <a
                                      href={row.sourceUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-slate-400 hover:text-blue-400 p-0.5"
                                      title="Open official source link"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile Stacked Card View (< 768px) (Requirement 16) ── */}
      <div className="md:hidden space-y-3">
        {filteredGroups.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400 bg-[#111318] rounded-xl border border-white/[0.08]">
            No rules match current filters.
          </div>
        ) : (
          filteredGroups.map((group) => {
            const isExpanded = expandedCategories.has(group.key);

            return (
              <div key={group.key} className="rounded-xl border border-white/[0.08] overflow-hidden bg-[#0D0F14]">
                {/* Mobile Category Banner */}
                <button
                  onClick={() => toggleCategory(group.key)}
                  className="w-full p-3 bg-[#141822] flex items-center justify-between text-left cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{group.title}</div>
                    <div className="text-[10px] text-slate-400">{group.rules.length} rules</div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {isExpanded && (
                  <div className="p-2 space-y-2 divide-y divide-white/[0.04]">
                    {group.rules.map((row) => (
                      <div
                        key={row.id}
                        onClick={() => setActiveDrawerRow(row)}
                        className="pt-2 first:pt-0 space-y-2 cursor-pointer hover:bg-white/[0.02] p-2 rounded-lg"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono text-slate-400">#{row.index}</span>
                            <h4 className="text-xs font-bold text-white">{row.ruleName}</h4>
                          </div>
                          {renderDecisionBadge(row.decision, row.decisionDetail)}
                        </div>

                        {/* Phase Grid */}
                        <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono bg-black/20 p-2 rounded-lg border border-white/[0.04]">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Phase 1:</span>
                            <span className="text-slate-200">{row.phase1}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Phase 2:</span>
                            <span className="text-slate-200">{row.phase2}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Phase 3:</span>
                            <span className="text-slate-200">{row.phase3}</span>
                          </div>
                          <div>
                            <span className="text-emerald-400 block text-[10px]">Master:</span>
                            <span className="text-emerald-300 font-semibold">{row.masterAccount}</span>
                          </div>
                        </div>

                        {/* Calculation & Status Footer */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="text-[10px] text-slate-300 font-mono truncate max-w-[180px]">
                            {row.calculation}
                          </div>
                          <div>{renderVerificationBadge(row.verification)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Slide-Out Row Details Drawer (Requirement 15 & 18) ── */}
      {activeDrawerRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-[#111318] border border-white/[0.1] shadow-2xl flex flex-col overflow-hidden">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-start justify-between gap-4 bg-[#141822]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold">
                    #{activeDrawerRow.index} · Category {activeDrawerRow.categoryKey}
                  </span>
                  {renderVerificationBadge(activeDrawerRow.verification)}
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {activeDrawerRow.ruleName}
                </h3>
                <p className="text-xs text-slate-400">{activeDrawerRow.categoryTitle}</p>
              </div>

              <button
                onClick={() => setActiveDrawerRow(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {/* Beginner Guide Callout Box (Requirement 18) */}
              {activeDrawerRow.beginnerExplanation && (
                <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                    <BookOpen className="w-4 h-4" />
                    <span>Beginner-Friendly Explanation</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {activeDrawerRow.beginnerExplanation}
                  </p>
                </div>
              )}

              {/* Technical Explanation */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Full Technical Rule Clause
                </label>
                <div className="p-3 rounded-xl bg-[#16181E] border border-white/[0.06] text-slate-200 leading-relaxed font-mono text-[11px]">
                  {activeDrawerRow.explanation}
                </div>
              </div>

              {/* Phase-by-Phase Comparison Matrix */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Phase-by-Phase Breakdown
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-lg bg-[#16181E] border border-white/[0.06] space-y-1">
                    <div className="text-[10px] text-slate-400">Phase 1</div>
                    <div className="font-mono text-xs font-semibold text-white">{activeDrawerRow.phase1}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#16181E] border border-white/[0.06] space-y-1">
                    <div className="text-[10px] text-slate-400">Phase 2</div>
                    <div className="font-mono text-xs font-semibold text-white">{activeDrawerRow.phase2}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#16181E] border border-white/[0.06] space-y-1">
                    <div className="text-[10px] text-slate-400">Phase 3</div>
                    <div className="font-mono text-xs font-semibold text-white">{activeDrawerRow.phase3}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                    <div className="text-[10px] text-emerald-400 font-bold">Master Account</div>
                    <div className="font-mono text-xs font-bold text-emerald-300">{activeDrawerRow.masterAccount}</div>
                  </div>
                </div>
              </div>

              {/* Mathematical Calculation Box */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Mathematical Calculation Engine
                </label>
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Nominal Account Capital:</span>
                    <span className="font-mono font-bold text-white">{formatCurrency(currentAccountSize)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Calculated Dollar Value:</span>
                    <span className="font-mono font-bold text-blue-400">{activeDrawerRow.calculation}</span>
                  </div>
                  {activeDrawerRow.formula && (
                    <div className="pt-2 border-t border-white/[0.06] text-[11px] font-mono text-slate-400">
                      <span className="text-slate-400 block text-[10px] uppercase">Formula / Logic:</span>
                      <span className="text-emerald-300">{activeDrawerRow.formula}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Breach Trigger & After Breach Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-rose-950/10 border border-rose-500/20 space-y-1">
                  <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Breach Trigger</div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{activeDrawerRow.breachTrigger}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-950/10 border border-amber-500/20 space-y-1">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Consequence / After Breach</div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{activeDrawerRow.afterBreachAction}</p>
                </div>
              </div>

              {/* Conflict / Historical Explanation (if present) */}
              {activeDrawerRow.conflictDetails?.hasConflict && (
                <div className="p-3.5 rounded-xl bg-orange-950/20 border border-orange-500/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-orange-400 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Disputed / Conflicting Terms Alert</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {activeDrawerRow.conflictDetails.difference}
                  </p>
                  <div className="text-[10px] font-mono text-slate-400 bg-black/30 p-2 rounded border border-white/[0.05]">
                    Recommended Action: {activeDrawerRow.conflictDetails.userAction}
                  </div>
                </div>
              )}

              {/* Source Evidence & Citation */}
              <div className="p-3 rounded-xl bg-[#16181E] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Official Evidence Source:</span>
                  <span className="font-mono text-white font-semibold">{activeDrawerRow.source}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Last Verified:</span>
                  <span className="font-mono text-slate-300">{activeDrawerRow.lastVerifiedDate}</span>
                </div>
                {activeDrawerRow.sourceUrl && (
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Direct Documentation Link:</span>
                    <a
                      href={activeDrawerRow.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[11px] font-bold"
                    >
                      <span>Open Source Document</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-white/[0.08] bg-[#141822] flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                Model: {activeModel.name} · {formatCurrency(currentAccountSize)}
              </span>
              <button
                onClick={() => setActiveDrawerRow(null)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Data Quality Validation Report Modal (Requirement 26) ── */}
      {showValidationReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl rounded-2xl bg-[#111318] border border-white/[0.1] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Automated Data Quality & Phase Integrity Audit</span>
              </div>
              <button
                onClick={() => setShowValidationReportModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/[0.06]">
                <span className="text-slate-300">Phase Integrity Check:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {validationReport.isValid ? 'PASSED (0 Phase Leakage)' : 'FAILED'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2.5 rounded bg-black/20 border border-white/[0.05]">
                  <span className="text-slate-400 block">Total Rules Audited:</span>
                  <span className="text-white font-bold">{validationReport.totalRulesCount}</span>
                </div>
                <div className="p-2.5 rounded bg-black/20 border border-white/[0.05]">
                  <span className="text-slate-400 block">Verified with Evidence:</span>
                  <span className="text-emerald-400 font-bold">{validationReport.verifiedCount}</span>
                </div>
                <div className="p-2.5 rounded bg-black/20 border border-white/[0.05]">
                  <span className="text-slate-400 block">Conflicting Terms:</span>
                  <span className="text-orange-400 font-bold">{validationReport.conflictingCount}</span>
                </div>
                <div className="p-2.5 rounded bg-black/20 border border-white/[0.05]">
                  <span className="text-slate-400 block">Requires Confirmation:</span>
                  <span className="text-amber-300 font-bold">{validationReport.requiresConfirmationCount}</span>
                </div>
              </div>

              {validationReport.errors.length > 0 && (
                <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-300 space-y-1">
                  <div className="font-bold">Errors Detected:</div>
                  {validationReport.errors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}

              <div className="text-slate-400 text-[11px] leading-relaxed">
                <p>• Zero synthetic values: Phase 2/3 cells in 1-phase or 2-phase models explicitly use N/A cells with contextual tooltips.</p>
                <p>• Dollar conversions derived strictly via calculatePercentageAmount() from the canonical {formatCurrency(currentAccountSize)} baseline.</p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={() => setShowValidationReportModal(false)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
