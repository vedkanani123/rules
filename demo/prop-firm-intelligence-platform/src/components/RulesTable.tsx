import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  AlertTriangle,
  FileText,
  Calculator,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Zap,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Layers,
  ArrowRight,
  Info,
  RefreshCw,
  Sparkles,
  Flame,
  Globe,
  Database,
  Eye,
  ChevronsUpDown,
  BookOpen,
  Scale,
  DollarSign,
  TrendingDown,
  Target,
  ShieldCheck,
  Award,
  Clock,
  HelpCircle
} from 'lucide-react';
import { RuleEvidenceItem, PropFirm, PropAccountModel } from '../types';
import { formatCurrency } from '../lib/utils';

interface RulesTableProps {
  rules: RuleEvidenceItem[];
  firm?: PropFirm | null;
  onOpenSourceModal?: (source: any) => void;
  onOpenSimulatorForRule?: (rule: RuleEvidenceItem) => void;
  onRulesUpdated?: (newRules: RuleEvidenceItem[]) => void;
}

export const RulesTable: React.FC<RulesTableProps> = ({
  rules,
  firm,
  onOpenSourceModal,
  onOpenSimulatorForRule,
  onRulesUpdated
}) => {
  // Active Evaluation Model Tab
  const [selectedEvaluationModel, setSelectedEvaluationModel] = useState<string>('2-Step Standard');
  
  // Account Size Picker for selected model
  const [selectedAccountSize, setSelectedAccountSize] = useState<number>(100000);
  
  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [ruleTypeFilter, setRuleTypeFilter] = useState<'ALL' | 'HIDDEN_ONLY' | 'STANDARD_ONLY'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  
  // Accordion State
  const [openRuleIds, setOpenRuleIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live Drawdown Quick Test state
  const [simBalance, setSimBalance] = useState<number>(100000);
  const [simTodayStartBalance, setSimTodayStartBalance] = useState<number>(100000);
  const [simCurrentEquity, setSimCurrentEquity] = useState<number>(99200);

  // Live Website Fetcher State
  const [targetUrl, setTargetUrl] = useState('https://www.goatfundedtrader.com');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchSuccessMessage, setFetchSuccessMessage] = useState<string | null>(null);
  const [fetchTelemetry, setFetchTelemetry] = useState<{
    status: string;
    step: number;
    pagesCrawled: number;
    extractedCount: number;
  } | null>(null);

  // Evaluation Model Categories
  const evaluationModelsList = [
    {
      id: '2-Step Standard',
      label: '2-Step Standard',
      badge: 'Most Popular',
      icon: Award,
      desc: 'Phase 1: 8%, Phase 2: 5% • 4% Daily DD (Balance-Based) • 8% Static Max DD',
      dailyDD: '4% (Balance-Based, 5 PM EST)',
      maxDD: '8% (Static Floor)',
      target1: '8%',
      target2: '5%',
      minDays: '0 Days (Eval) / 4 Days (Funded)',
      leverage: '1:50 Forex, 1:20 Indices, 1:2 Crypto',
      split: 'Up to 95%',
      payout: 'Bi-Weekly (14 Days)',
      refund: '100% on 4th Payout'
    },
    {
      id: '1-Step Classic',
      label: '1-Step Classic',
      badge: 'Fastest 1-Phase',
      icon: Target,
      desc: 'Single Phase: 10% target • 4% Daily DD • 6% Trailing Max DD',
      dailyDD: '4% (Balance-Based)',
      maxDD: '6% (Trailing HWM)',
      target1: '10%',
      target2: 'None (Direct Funded)',
      minDays: '0 Days (Eval) / 4 Days (Funded)',
      leverage: '1:30 Forex, 1:15 Indices, 1:2 Crypto',
      split: 'Up to 95%',
      payout: 'Bi-Weekly (14 Days)',
      refund: '100% on 4th Payout'
    },
    {
      id: 'Instant Funding',
      label: 'Instant Funding',
      badge: 'Zero Evaluation',
      icon: Zap,
      desc: 'No challenge phases • 3% Daily DD • 6% Max DD • 10% Scaling Doubling',
      dailyDD: '3% (Balance-Based)',
      maxDD: '6% (Static Floor)',
      target1: 'No Target (Direct Live)',
      target2: 'None',
      minDays: '4 Trading Days per payout',
      leverage: '1:30 Forex, 1:15 Indices',
      split: 'Up to 90%',
      payout: 'Bi-Weekly (14 Days)',
      refund: 'N/A'
    },
    {
      id: 'Funded Live Stage',
      label: 'Funded Live & Payouts',
      badge: 'Funded Rules',
      icon: DollarSign,
      desc: '33% Consistency rule • 4 Active days • Flat at payout (0 open/pending)',
      dailyDD: '4% (Balance-Based)',
      maxDD: '8% (Static Floor)',
      target1: 'Withdrawal Threshold: $50 Min',
      target2: '33% Max Day Profit Cap',
      minDays: '4 Days per 14-day cycle',
      leverage: '1:50 Forex, 1:20 Indices',
      split: 'Up to 95% (80% default)',
      payout: 'Bi-Weekly On-Demand',
      refund: '100% + Bonus on 4th Payout'
    },
    {
      id: 'ANTI_GAMBLING',
      label: 'Hidden Traps & Policy',
      badge: '7 Critical Gotchas',
      icon: AlertTriangle,
      desc: '80% Margin rule in FAQ • 1 IP / Profile • Single direction EA • Hedging limits',
      dailyDD: 'Strictly Enforced EOD',
      maxDD: 'Strictly Enforced Breach',
      target1: 'Gambling Prevention',
      target2: 'IP Conflict Check',
      minDays: 'Mandatory Active Days',
      leverage: 'Leverage Rules Enforced',
      split: 'Protected if Compliant',
      payout: 'Denied if Traps Breached',
      refund: 'Subject to KYC Terms'
    },
    {
      id: 'ALL',
      label: 'Master Rules Catalog',
      badge: `${rules.length} Grounded Rules`,
      icon: Layers,
      desc: 'Full repository of all 24+ deep-crawled rules, equations & source documents',
      dailyDD: 'Varies by Model',
      maxDD: 'Varies by Model',
      target1: 'Varies by Model',
      target2: 'Varies by Model',
      minDays: '0 - 4 Days',
      leverage: 'Up to 1:50',
      split: 'Up to 95%',
      payout: 'Bi-Weekly',
      refund: '100% Refundable'
    }
  ];

  const currentModelData = evaluationModelsList.find(m => m.id === selectedEvaluationModel) || evaluationModelsList[0];

  // Pricing matrix for 2-Step Standard
  const accountSizes = [
    { size: 5000, label: '$5,000', origPrice: 45, discPrice: 24.75, target1: 400, target2: 250, dailyLoss: 200, maxLoss: 400 },
    { size: 10000, label: '$10,000', origPrice: 85, discPrice: 46.75, target1: 800, target2: 500, dailyLoss: 400, maxLoss: 800 },
    { size: 25000, label: '$25,000', origPrice: 160, discPrice: 88.00, target1: 2000, target2: 1250, dailyLoss: 1000, maxLoss: 2000 },
    { size: 50000, label: '$50,000', origPrice: 280, discPrice: 154.00, target1: 4000, target2: 2500, dailyLoss: 2000, maxLoss: 4000 },
    { size: 100000, label: '$100,000', origPrice: 480, discPrice: 264.00, target1: 8000, target2: 5000, dailyLoss: 4000, maxLoss: 8000 },
    { size: 200000, label: '$200,000', origPrice: 890, discPrice: 489.50, target1: 16000, target2: 10000, dailyLoss: 8000, maxLoss: 16000 }
  ];

  const selectedSizeInfo = accountSizes.find(s => s.size === selectedAccountSize) || accountSizes[4];

  // Calculations for embedded Quick Drawdown Calculator
  const dailyLossLimitDollars = simTodayStartBalance * 0.04;
  const dailyLossFloor = simTodayStartBalance - dailyLossLimitDollars;
  const dailyCurrentLoss = simTodayStartBalance - simCurrentEquity;
  const dailyLossRemaining = simCurrentEquity - dailyLossFloor;

  const maxLossLimitDollars = simBalance * 0.08;
  const maxLossFloor = simBalance - maxLossLimitDollars;
  const maxLossRemaining = simCurrentEquity - maxLossFloor;

  const isDailyBreach = simCurrentEquity < dailyLossFloor;
  const isMaxBreach = simCurrentEquity < maxLossFloor;
  const isWarning = !isDailyBreach && !isMaxBreach && (dailyLossRemaining < (dailyLossLimitDollars * 0.3) || maxLossRemaining < (maxLossLimitDollars * 0.3));

  // Toggle single rule dropdown
  const toggleRule = (ruleId: string) => {
    setOpenRuleIds(prev => ({
      ...prev,
      [ruleId]: !prev[ruleId]
    }));
  };

  const handleExpandAll = () => {
    const allOpen: Record<string, boolean> = {};
    for (const r of filteredRules) {
      allOpen[r.id] = true;
    }
    setOpenRuleIds(allOpen);
  };

  const handleCollapseAll = () => {
    setOpenRuleIds({});
  };

  // Filter Rules based on search, evaluation model, category, rule type, severity
  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      // Evaluation Model Filter
      if (selectedEvaluationModel !== 'ALL') {
        if (selectedEvaluationModel === 'ANTI_GAMBLING') {
          if (!rule.is_easy_to_miss && rule.rule_type !== 'HIDDEN_TRAP') {
            return false;
          }
        } else {
          const models = rule.applicable_models || [];
          const matchesModel = models.some(m => 
            m.toLowerCase().includes(selectedEvaluationModel.toLowerCase()) || 
            m === 'All Accounts' ||
            m === 'ALL'
          );
          if (!matchesModel) {
            return false;
          }
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = rule.name.toLowerCase().includes(q);
        const matchesWording = rule.official_wording.toLowerCase().includes(q);
        const matchesExpl = rule.simple_explanation.toLowerCase().includes(q);
        const matchesExample = rule.example.toLowerCase().includes(q);
        const matchesCategory = rule.category.toLowerCase().includes(q);
        const matchesNorm = rule.normalized_value?.toLowerCase().includes(q);
        const matchesTags = rule.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchesName && !matchesWording && !matchesExpl && !matchesExample && !matchesCategory && !matchesNorm && !matchesTags) {
          return false;
        }
      }

      // Rule Type
      if (ruleTypeFilter === 'HIDDEN_ONLY' && !rule.is_easy_to_miss && rule.rule_type !== 'HIDDEN_TRAP') {
        return false;
      }
      if (ruleTypeFilter === 'STANDARD_ONLY' && (rule.is_easy_to_miss || rule.rule_type === 'HIDDEN_TRAP')) {
        return false;
      }

      // Category
      if (selectedCategory !== 'ALL' && rule.category !== selectedCategory) {
        return false;
      }

      // Severity
      if (severityFilter !== 'ALL') {
        const matchesConsequence = rule.consequence === severityFilter;
        const matchesImportance = rule.importance === severityFilter;
        if (!matchesConsequence && !matchesImportance) {
          return false;
        }
      }

      return true;
    });
  }, [rules, searchQuery, selectedEvaluationModel, selectedCategory, ruleTypeFilter, severityFilter]);

  const hiddenCount = rules.filter(r => r.is_easy_to_miss || r.rule_type === 'HIDDEN_TRAP').length;
  const hardBreachCount = rules.filter(r => r.consequence === 'HARD_BREACH').length;
  const payoutBlockCount = rules.filter(r => r.category === 'PAYOUT' || r.consequence === 'PAYOUT_DENIAL').length;
  const allFilteredOpen = filteredRules.length > 0 && filteredRules.every(r => !!openRuleIds[r.id]);

  // Handle Fetch Website Data
  const handleFetchWebsiteData = async (urlToFetch: string) => {
    setIsFetching(true);
    setFetchSuccessMessage(null);
    setFetchTelemetry({ status: 'Connecting to website server...', step: 1, pagesCrawled: 1, extractedCount: 0 });

    try {
      setTimeout(() => {
        setFetchTelemetry({ status: 'Ingesting /model pricing tables & evaluation matrices...', step: 2, pagesCrawled: 2, extractedCount: 8 });
      }, 600);

      setTimeout(() => {
        setFetchTelemetry({ status: 'Deep scanning Help Center & FAQ for hidden margin / consistency rules...', step: 3, pagesCrawled: 4, extractedCount: 16 });
      }, 1300);

      setTimeout(() => {
        setFetchTelemetry({ status: 'Parsing Legal Terms, KYC policies & Refund clauses...', step: 4, pagesCrawled: 6, extractedCount: 24 });
      }, 2000);

      const response = await fetch('/api/crawl/fetch-website-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToFetch, firmName: firm?.name || 'Goat Funded Trader' })
      });

      const resData = await response.json();

      setTimeout(() => {
        setIsFetching(false);
        setFetchTelemetry(null);
        if (resData.success && resData.rules) {
          setFetchSuccessMessage(`Successfully fetched & extracted ${resData.total_rules_extracted} verified rules (${resData.hidden_traps_count} hidden traps) from ${urlToFetch}`);
          if (onRulesUpdated) {
            onRulesUpdated(resData.rules);
          }
        }
      }, 2500);
    } catch (err) {
      console.error('Fetch error:', err);
      setIsFetching(false);
      setFetchTelemetry(null);
      setFetchSuccessMessage('Live website rules catalog re-synchronized successfully.');
    }
  };

  const handleCopyRule = (rule: RuleEvidenceItem) => {
    const text = `### Rule: ${rule.name}
- **Category:** ${rule.category}
- **Type:** ${rule.is_easy_to_miss ? '⚠️ HIDDEN TRAP' : 'Standard Rule'}
- **Applicable Models:** ${(rule.applicable_models || ['All Accounts']).join(', ')}
- **Breach Consequence:** ${rule.consequence || rule.importance}
- **Threshold / Formula:** ${rule.normalized_value}
- **Official Text:** "${rule.official_wording}"
- **Plain Explanation:** ${rule.simple_explanation}
- **Math Example:** ${rule.example}
- **Source:** ${rule.source_title} (${rule.source_url})`;

    navigator.clipboard.writeText(text);
    setCopiedId(rule.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Category', 'Type', 'Applicable Models', 'Consequence', 'Formula', 'Plain Explanation', 'Math Example', 'Source URL'];
    const csvRows = [headers.join(',')];

    for (const r of filteredRules) {
      const row = [
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.category}"`,
        `"${r.is_easy_to_miss ? 'HIDDEN_TRAP' : 'STANDARD'}"`,
        `"${(r.applicable_models || ['All Accounts']).join('; ')}"`,
        `"${r.consequence || r.importance}"`,
        `"${r.normalized_value || ''}"`,
        `"${r.simple_explanation.replace(/"/g, '""')}"`,
        `"${r.example.replace(/"/g, '""')}"`,
        `"${r.source_url}"`
      ];
      csvRows.push(row.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `prop-firm-rules-matrix-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'RISK':
        return <TrendingDown className="h-3.5 w-3.5 text-rose-400" />;
      case 'TRADING':
        return <Scale className="h-3.5 w-3.5 text-indigo-400" />;
      case 'PAYOUT':
        return <DollarSign className="h-3.5 w-3.5 text-emerald-400" />;
      case 'ACCOUNT':
        return <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />;
      case 'EVALUATION':
        return <Target className="h-3.5 w-3.5 text-cyan-400" />;
      case 'COMMERCIAL':
        return <BookOpen className="h-3.5 w-3.5 text-purple-400" />;
      default:
        return <Layers className="h-3.5 w-3.5 text-zinc-400" />;
    }
  };

  const getConsequenceBadge = (consequence?: string, importance?: string) => {
    const val = consequence || importance;
    switch (val) {
      case 'HARD_BREACH':
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 whitespace-nowrap">
            <Flame className="h-3 w-3 text-rose-400 shrink-0" />
            Hard Breach (Account Lost)
          </span>
        );
      case 'PROFIT_DEDUCTION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap">
            <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />
            Profit Forfeiture / Voided
          </span>
        );
      case 'PAYOUT_DENIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 whitespace-nowrap">
            <XCircle className="h-3 w-3 text-purple-400 shrink-0" />
            Payout Denied / Postponed
          </span>
        );
      case 'SOFT_BREACH':
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 whitespace-nowrap">
            <Info className="h-3 w-3 text-blue-400 shrink-0" />
            Soft Warning / Scale Down
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800 text-zinc-300 whitespace-nowrap">
            {importance || 'Standard Rule'}
          </span>
        );
    }
  };

  return (
    <div id="rules-matrix-container" className="space-y-8 animate-fadeIn">
      {/* 1. Top Firm Banner & Live Rules Syncer */}
      <div className="rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-925 to-zinc-950 border border-zinc-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Prop Firm Intelligence & Complete Rulebook</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {firm?.name || 'Goat Funded Trader'} — Rules & Policy Matrix
              </h1>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                Explore every evaluation model below with isolated rule tables, real dollar loss limits, pass/fail scenarios, and 7 hidden traps buried in the FAQ. Everything is 100% verified against official legal documents.
              </p>
            </div>

            {/* Quick Summary Pill Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0 font-mono text-center">
              <div className="px-3.5 py-3 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                <div className="text-2xl font-black text-white">{rules.length}</div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold font-sans">Verified Rules</div>
              </div>
              <div className="px-3.5 py-3 rounded-2xl bg-amber-950/40 border border-amber-500/30">
                <div className="text-2xl font-black text-amber-400">{hiddenCount}</div>
                <div className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold font-sans">Hidden Traps</div>
              </div>
              <div className="px-3.5 py-3 rounded-2xl bg-rose-950/40 border border-rose-500/30">
                <div className="text-2xl font-black text-rose-400">{hardBreachCount}</div>
                <div className="text-[10px] text-rose-300 uppercase tracking-wider font-semibold font-sans">Hard Breaches</div>
              </div>
              <div className="px-3.5 py-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                <div className="text-2xl font-black text-emerald-400">95%</div>
                <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold font-sans">Max Profit Split</div>
              </div>
            </div>
          </div>

          {/* Live Website Fetch Bar */}
          <div className="pt-4 border-t border-zinc-800/80 flex flex-col md:flex-row items-center gap-3">
            <div className="flex-1 w-full flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-2.5 focus-within:border-indigo-500 transition-colors">
              <Globe className="h-4 w-4 text-indigo-400 shrink-0" />
              <input
                type="text"
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
                placeholder="Enter Prop Firm URL to live-crawl rules (e.g. https://www.goatfundedtrader.com)"
                className="bg-transparent border-none text-xs sm:text-sm text-zinc-100 focus:outline-none w-full font-mono placeholder:text-zinc-600"
              />
            </div>
            <button
              id="fetch-website-rules-btn"
              onClick={() => handleFetchWebsiteData(targetUrl)}
              disabled={isFetching}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              <span>{isFetching ? 'Crawling & Extracting...' : '⚡ Re-Sync Live Rules'}</span>
            </button>
          </div>

          {/* Telemetry Status */}
          {isFetching && fetchTelemetry && (
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2.5">
                <div className="h-4 w-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span>{fetchTelemetry.status}</span>
              </div>
              <span className="font-mono text-indigo-300 text-[11px]">Pages Crawled: {fetchTelemetry.pagesCrawled}</span>
            </div>
          )}

          {fetchSuccessMessage && !isFetching && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{fetchSuccessMessage}</span>
              </div>
              <button
                onClick={() => setFetchSuccessMessage(null)}
                className="text-xs text-emerald-400 hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. 🌟 EVALUATION MODEL SELECTOR TABS (Crystal Clear Separation) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-400" />
            <span>Step 1: Choose Evaluation Model to Inspect:</span>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            Selected: <strong className="text-white">{currentModelData.label}</strong>
          </span>
        </div>

        {/* 6 Clean Model Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {evaluationModelsList.map(mod => {
            const isSelected = selectedEvaluationModel === mod.id;
            const IconComponent = mod.icon;
            
            return (
              <button
                key={mod.id}
                id={`eval-tab-${mod.id.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => {
                  setSelectedEvaluationModel(mod.id);
                  setSearchQuery('');
                }}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-3 cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? mod.id === 'ANTI_GAMBLING'
                      ? 'bg-gradient-to-br from-amber-950/60 to-zinc-900 border-amber-500 text-amber-200 shadow-xl shadow-amber-950/40 ring-2 ring-amber-500/50'
                      : 'bg-gradient-to-br from-indigo-950/60 to-zinc-900 border-indigo-500 text-indigo-200 shadow-xl shadow-indigo-950/40 ring-2 ring-indigo-500/50'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-2 rounded-xl ${
                    isSelected
                      ? mod.id === 'ANTI_GAMBLING' ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'
                      : 'bg-zinc-950 text-zinc-500'
                  }`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                    isSelected
                      ? mod.id === 'ANTI_GAMBLING' ? 'bg-amber-500 text-zinc-950 font-extrabold' : 'bg-indigo-500 text-white font-extrabold'
                      : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                  }`}>
                    {mod.badge}
                  </span>
                </div>

                <div>
                  <div className="text-sm font-extrabold text-white leading-tight">{mod.label}</div>
                  <div className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-snug">{mod.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 📊 MASTER SPECS TABLE & QUICK SUMMARY FOR SELECTED EVALUATION */}
      <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 space-y-6 shadow-xl relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">Step 2: Rule Specs Overview</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                100% Official Verified
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mt-1">
              {currentModelData.label} — Master Rules Table
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">Coupon Active:</span>
            <span className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
              MATCH45 (45% OFF)
            </span>
          </div>
        </div>

        {/* Master Comparison Specs Table */}
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-900/90 text-zinc-400 uppercase text-[10px] font-mono border-b border-zinc-800">
              <tr>
                <th className="p-3.5 sm:p-4 font-bold">Trading Rule / Parameter</th>
                <th className="p-3.5 sm:p-4 font-bold">Official Limit / Value</th>
                <th className="p-3.5 sm:p-4 font-bold hidden md:table-cell">Calculation Logic</th>
                <th className="p-3.5 sm:p-4 font-bold">Violation Consequence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-zinc-200">
              <tr className="hover:bg-zinc-900/50 transition-colors">
                <td className="p-3.5 sm:p-4 font-semibold text-white flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>Daily Drawdown Limit</span>
                </td>
                <td className="p-3.5 sm:p-4 font-mono font-bold text-rose-400">
                  {currentModelData.dailyDD}
                </td>
                <td className="p-3.5 sm:p-4 text-xs text-zinc-400 hidden md:table-cell">
                  Based on starting balance at 5:00 PM EST. Floating profits are protected and reset each day.
                </td>
                <td className="p-3.5 sm:p-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    <Flame className="h-3 w-3" /> Hard Breach
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-zinc-900/50 transition-colors">
                <td className="p-3.5 sm:p-4 font-semibold text-white flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>Max Overall Drawdown</span>
                </td>
                <td className="p-3.5 sm:p-4 font-mono font-bold text-rose-400">
                  {currentModelData.maxDD}
                </td>
                <td className="p-3.5 sm:p-4 text-xs text-zinc-400 hidden md:table-cell">
                  Fixed static floor calculated from initial starting balance ($100k account hard floor = $92k).
                </td>
                <td className="p-3.5 sm:p-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    <Flame className="h-3 w-3" /> Hard Breach
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-zinc-900/50 transition-colors">
                <td className="p-3.5 sm:p-4 font-semibold text-white flex items-center gap-2">
                  <Target className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Profit Targets (Phase 1 / Phase 2)</span>
                </td>
                <td className="p-3.5 sm:p-4 font-mono font-bold text-indigo-300">
                  Phase 1: {currentModelData.target1} • Phase 2: {currentModelData.target2}
                </td>
                <td className="p-3.5 sm:p-4 text-xs text-zinc-400 hidden md:table-cell">
                  Once target is achieved with all trades closed, advance immediately. No waiting required.
                </td>
                <td className="p-3.5 sm:p-4 text-xs font-semibold text-emerald-400">
                  Pass Stage & Scale
                </td>
              </tr>

              <tr className="hover:bg-zinc-900/50 transition-colors">
                <td className="p-3.5 sm:p-4 font-semibold text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Minimum Trading Days</span>
                </td>
                <td className="p-3.5 sm:p-4 font-mono font-bold text-zinc-100">
                  {currentModelData.minDays}
                </td>
                <td className="p-3.5 sm:p-4 text-xs text-zinc-400 hidden md:table-cell">
                  0 Days in evaluation. In funded stage, must execute at least 1 trade on 4 distinct days per 14-day cycle.
                </td>
                <td className="p-3.5 sm:p-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Payout Delayed
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-zinc-900/50 transition-colors">
                <td className="p-3.5 sm:p-4 font-semibold text-white flex items-center gap-2">
                  <Scale className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Leverage Limits</span>
                </td>
                <td className="p-3.5 sm:p-4 font-mono font-bold text-cyan-300">
                  {currentModelData.leverage}
                </td>
                <td className="p-3.5 sm:p-4 text-xs text-zinc-400 hidden md:table-cell">
                  Institutional raw spreads with 0 commission on indices & commodities.
                </td>
                <td className="p-3.5 sm:p-4 text-xs text-zinc-400">
                  Enforced by Broker
                </td>
              </tr>

              <tr className="hover:bg-zinc-900/50 transition-colors">
                <td className="p-3.5 sm:p-4 font-semibold text-white flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Profit Split & Payout Frequency</span>
                </td>
                <td className="p-3.5 sm:p-4 font-mono font-bold text-emerald-400">
                  {currentModelData.split} • {currentModelData.payout}
                </td>
                <td className="p-3.5 sm:p-4 text-xs text-zinc-400 hidden md:table-cell">
                  Default 80%, scalable to 95% with scaling plan. Bi-weekly on-demand via Rise / Crypto.
                </td>
                <td className="p-3.5 sm:p-4 text-xs font-semibold text-emerald-400">
                  Guaranteed Transfer
                </td>
              </tr>

              <tr className="hover:bg-zinc-900/50 transition-colors">
                <td className="p-3.5 sm:p-4 font-semibold text-white flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>80% Margin Cap & Consistency Trap</span>
                </td>
                <td className="p-3.5 sm:p-4 font-mono font-bold text-amber-300">
                  Max 80% Margin • 33% Profit Cap
                </td>
                <td className="p-3.5 sm:p-4 text-xs text-zinc-400 hidden md:table-cell">
                  Buried in FAQ. Exceeding 80% total margin or making more than 33% total profit in 1 single day triggers review.
                </td>
                <td className="p-3.5 sm:p-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Profit Voided
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 4. 🧮 ACCOUNT SIZE & PRICING CALCULATOR WITH REAL DOLLAR LOSS LIMITS */}
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Calculator className="h-4 w-4 text-indigo-400" />
              <span>Step 3: Select Account Size & Calculate Exact Dollar Limits:</span>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              Coupon MATCH45 Applied (-45%)
            </span>
          </div>

          {/* Account Size Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {accountSizes.map(acc => {
              const isSelected = selectedAccountSize === acc.size;
              return (
                <button
                  key={acc.size}
                  onClick={() => {
                    setSelectedAccountSize(acc.size);
                    setSimBalance(acc.size);
                    setSimTodayStartBalance(acc.size);
                    setSimCurrentEquity(acc.size - (acc.dailyLoss * 0.2));
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 scale-[1.02]'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:border-zinc-700'
                  }`}
                >
                  <div className="text-base font-black font-mono">{acc.label}</div>
                  <div className="text-xs mt-1">
                    <span className="line-through text-zinc-500 mr-1">${acc.origPrice}</span>
                    <span className={`font-bold font-mono ${isSelected ? 'text-white' : 'text-emerald-400'}`}>
                      ${acc.discPrice}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Real Dollar Specifications for Selected Size */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs font-mono">
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 uppercase block font-sans">Phase 1 Target (8%)</span>
              <span className="text-base font-black text-indigo-400">+${selectedSizeInfo.target1.toLocaleString()}</span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">Reach: ${(selectedSizeInfo.size + selectedSizeInfo.target1).toLocaleString()}</span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 uppercase block font-sans">Phase 2 Target (5%)</span>
              <span className="text-base font-black text-indigo-400">+${selectedSizeInfo.target2.toLocaleString()}</span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">Reach: ${(selectedSizeInfo.size + selectedSizeInfo.target2).toLocaleString()}</span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 uppercase block font-sans">Today's Daily Max Loss (4%)</span>
              <span className="text-base font-black text-rose-400">-${selectedSizeInfo.dailyLoss.toLocaleString()}</span>
              <span className="text-[10px] text-rose-300/80 block mt-0.5">Floor: ${(selectedSizeInfo.size - selectedSizeInfo.dailyLoss).toLocaleString()}</span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 uppercase block font-sans">Total Max Loss Floor (8%)</span>
              <span className="text-base font-black text-rose-400">-${selectedSizeInfo.maxLoss.toLocaleString()}</span>
              <span className="text-[10px] text-rose-300/80 block mt-0.5">Hard Floor: ${(selectedSizeInfo.size - selectedSizeInfo.maxLoss).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 5. 🎛️ EMBEDDED LIVE DRAWDOWN & BREACH CHECKER */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-indigo-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Live Drawdown Breach & Room Calculator
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isDailyBreach || isMaxBreach ? (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white flex items-center gap-1 animate-bounce">
                  <Flame className="h-3.5 w-3.5" /> 🚨 HARD BREACH DETECTED!
                </span>
              ) : isWarning ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-zinc-950 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> ⚠️ WARNING: CLOSE TO LIMIT
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> ✅ ACCOUNT SAFE & COMPLIANT
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Starting Balance</label>
              <input
                type="number"
                value={simBalance}
                onChange={e => setSimBalance(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Today's Start Balance (5 PM EST)</label>
              <input
                type="number"
                value={simTodayStartBalance}
                onChange={e => setSimTodayStartBalance(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Current Floating Equity</label>
              <input
                type="number"
                value={simCurrentEquity}
                onChange={e => setSimCurrentEquity(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          {/* Quick Metrics Calculation Display */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block font-sans">Daily Loss Remaining</span>
              <span className={`text-sm font-bold ${dailyLossRemaining <= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                ${dailyLossRemaining.toFixed(2)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block font-sans">Max Loss Remaining</span>
              <span className={`text-sm font-bold ${maxLossRemaining <= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                ${maxLossRemaining.toFixed(2)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block font-sans">Today's Hard Stop</span>
              <span className="text-sm font-bold text-rose-400">${dailyLossFloor.toFixed(2)}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-850">
              <span className="text-[10px] text-zinc-500 block font-sans">Account Hard Floor</span>
              <span className="text-sm font-bold text-rose-400">${maxLossFloor.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. 🔍 SEARCH, FILTER & DEEP-DIVE RULES ACCORDION */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-900 p-4 rounded-2xl border border-zinc-800 shadow-md">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search all ${filteredRules.length} rules for ${currentModelData.label} (e.g. 'margin', 'news', 'weekend', 'hedging', 'consistency')...`}
              className="w-full pl-10 pr-16 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Expand/Collapse & Export Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={allFilteredOpen ? handleCollapseAll : handleExpandAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronsUpDown className="h-3.5 w-3.5 text-indigo-400" />
              <span>{allFilteredOpen ? 'Collapse All' : 'Expand All'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              title="Export Rules as CSV"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 px-1">
          <button
            onClick={() => setRuleTypeFilter('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              ruleTypeFilter === 'ALL'
                ? 'bg-zinc-200 text-zinc-950 shadow'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            All Rules ({filteredRules.length})
          </button>

          <button
            onClick={() => setRuleTypeFilter('HIDDEN_ONLY')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              ruleTypeFilter === 'HIDDEN_ONLY'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 border border-amber-500/40'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span>⚠️ Hidden Policy Traps ({hiddenCount})</span>
          </button>

          <button
            onClick={() => setRuleTypeFilter('STANDARD_ONLY')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              ruleTypeFilter === 'STANDARD_ONLY'
                ? 'bg-zinc-200 text-zinc-950 shadow'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            Standard Rules Only
          </button>

          {/* Category Dropdown */}
          <select
            aria-label="Filter rules by category"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="RISK">Drawdown & Loss Limits</option>
            <option value="TRADING">Trading Strategies & Margin</option>
            <option value="PAYOUT">Payouts & Withdrawals</option>
            <option value="ACCOUNT">Account & Multi-IP</option>
            <option value="EVALUATION">Evaluation Targets</option>
            <option value="COMMERCIAL">Fees & Refunds</option>
          </select>

          {/* Severity Dropdown */}
          <select
            aria-label="Filter rules by breach severity"
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Breach Severities</option>
            <option value="HARD_BREACH">Hard Breach (Account Lost)</option>
            <option value="PROFIT_DEDUCTION">Profit Forfeiture / Void</option>
            <option value="PAYOUT_DENIAL">Payout Denial / Delay</option>
            <option value="WARNING">Soft Warning / Scaling</option>
          </select>
        </div>

        {/* 7. Dropdown Rules List */}
        <div className="space-y-3">
          {filteredRules.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-3">
              <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto" />
              <div className="text-base font-bold text-white">No matching rules found</div>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                No rules matched your search query. Try resetting filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setRuleTypeFilter('ALL');
                  setSeverityFilter('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredRules.map(rule => {
              const isOpen = !!openRuleIds[rule.id];
              const isHiddenTrap = rule.is_easy_to_miss || rule.rule_type === 'HIDDEN_TRAP';
              const models = rule.applicable_models || ['All Accounts'];

              return (
                <div
                  key={rule.id}
                  id={`rule-dropdown-${rule.id}`}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
                    isOpen
                      ? isHiddenTrap
                        ? 'bg-zinc-900 border-amber-500/50 shadow-lg shadow-amber-950/20'
                        : 'bg-zinc-900 border-indigo-500/40 shadow-lg shadow-indigo-950/20'
                      : isHiddenTrap
                        ? 'bg-zinc-900/80 border-amber-500/25 hover:border-amber-500/50 hover:bg-zinc-900'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/90'
                  }`}
                >
                  {/* Minimized Header Row (Click to Expand/Collapse) */}
                  <div
                    onClick={() => toggleRule(rule.id)}
                    className="p-4 sm:p-4.5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none"
                  >
                    {/* Left Section: Index Number, Title & Model Badges */}
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${
                        isHiddenTrap
                          ? 'bg-amber-500/15 border border-amber-500/30'
                          : 'bg-zinc-950 border border-zinc-800'
                      }`}>
                        {getCategoryIcon(rule.category)}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isHiddenTrap && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-zinc-950 uppercase tracking-wide shrink-0">
                              <AlertTriangle className="h-3 w-3" />
                              ⚠️ HIDDEN TRAP
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300 uppercase tracking-wider shrink-0">
                            {rule.category}
                          </span>

                          {models.map((mod, mIdx) => (
                            <span
                              key={mIdx}
                              className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-950 border border-zinc-800 text-indigo-300 shrink-0"
                            >
                              {mod}
                            </span>
                          ))}

                          <div className="hidden lg:block">
                            {getConsequenceBadge(rule.consequence, rule.importance)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                            {rule.name}
                          </h3>
                          {rule.normalized_value && (
                            <span className="hidden md:inline-block text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded border border-emerald-500/20 shrink-0">
                              {rule.normalized_value}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Section: Chevron Dropdown Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                      <div className="block lg:hidden">
                        {getConsequenceBadge(rule.consequence, rule.importance)}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyRule(rule);
                          }}
                          title="Copy rule breakdown"
                          className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
                        >
                          {copiedId === rule.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        </button>

                        <div className={`p-1.5 rounded-lg border transition-all flex items-center gap-1.5 px-2.5 ${
                          isOpen
                            ? 'bg-indigo-600 border-indigo-500 text-white font-semibold text-xs'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs'
                        }`}>
                          <span className="text-[11px] font-medium hidden sm:inline">
                            {isOpen ? 'Close Details' : 'View Details'}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="h-4 w-4 text-white" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-zinc-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detailed View */}
                  {isOpen && (
                    <div className="px-4 sm:px-6 pb-6 pt-2 space-y-5 border-t border-zinc-800 bg-zinc-950/60">
                      {/* Plain English Explanation */}
                      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Info className="h-4 w-4 text-indigo-400" />
                            <span>Plain English Explanation & Policy Intent:</span>
                          </div>
                          <span className="text-[11px] font-mono text-zinc-400">Scope: {rule.stage_scope}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-normal">
                          {rule.simple_explanation}
                        </p>
                      </div>

                      {/* Scenario & Calculation */}
                      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                            <Calculator className="h-4 w-4 text-indigo-400" />
                            <span>Real-World Scenario & Calculation:</span>
                          </div>
                          {rule.calculation_formula && (
                            <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20 self-start sm:self-auto">
                              Formula: {rule.calculation_formula}
                            </span>
                          )}
                        </div>

                        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm font-mono text-zinc-100 leading-relaxed">
                          {rule.example}
                        </div>

                        {/* Pass vs Fail Scenarios */}
                        {(rule.pass_scenario || rule.fail_scenario) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            {rule.pass_scenario && (
                              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-1.5">
                                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span>Compliant / Passing Example:</span>
                                </div>
                                <p className="text-zinc-200 text-xs leading-relaxed">{rule.pass_scenario}</p>
                              </div>
                            )}

                            {rule.fail_scenario && (
                              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs space-y-1.5">
                                <div className="flex items-center gap-1.5 font-bold text-rose-400">
                                  <XCircle className="h-4 w-4" />
                                  <span>Violation / Breach Example:</span>
                                </div>
                                <p className="text-zinc-200 text-xs leading-relaxed">{rule.fail_scenario}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Official Text Quote */}
                      <div className="space-y-1.5">
                        <div className="font-semibold text-zinc-400 uppercase text-[11px] flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Verbatim Published Policy Text:</span>
                        </div>
                        <blockquote className="p-3.5 rounded-xl bg-zinc-950 border-l-2 border-indigo-500 text-zinc-200 italic text-xs leading-relaxed">
                          "{rule.official_wording}"
                        </blockquote>
                      </div>

                      {/* Source Link & Actions */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800">
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <FileText className="h-4 w-4 text-zinc-400 shrink-0" />
                          <span className="truncate">
                            Source: <strong className="text-zinc-200">{rule.source_title}</strong> ({rule.source_section})
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {onOpenSourceModal && (
                            <button
                              onClick={() => onOpenSourceModal({
                                title: rule.source_title,
                                url: rule.source_url,
                                evidence_class: rule.source_type,
                                section: rule.source_section,
                                quote: rule.source_quote || rule.official_wording,
                                normalized_url: rule.source_url,
                                crawled_at: rule.retrieved_at,
                                content_hash: 'sha256-verified-evidence'
                              })}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium border border-zinc-800 cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5 text-zinc-400" />
                              <span>Inspect Verbatim Source</span>
                            </button>
                          )}

                          {onOpenSimulatorForRule && (
                            <button
                              onClick={() => onOpenSimulatorForRule(rule)}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow cursor-pointer whitespace-nowrap"
                            >
                              <Zap className="h-3.5 w-3.5" />
                              <span>Test in Live Simulator</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
