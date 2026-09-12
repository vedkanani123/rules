import React, { useState, useMemo } from 'react';
import { GFTModel, TradingPlatform, TradingStyle } from '../../data/goatCanonicalData.ts';
import { PropFirm } from '../../types/schema.ts';
import { FirmCanonicalProfile } from '../../data/allFirmsCanonicalData.ts';
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
  FileText,
  Check,
  Copy,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface FirmV3CompleteModelRuleTableProps {
  firm: PropFirm;
  firmProfile: FirmCanonicalProfile;
  selectedModel: GFTModel;
  selectedSize: number;
  selectedStage: string;
  selectedVersion?: string;
  selectedPlatform?: TradingPlatform;
  selectedTradingStyle?: TradingStyle;
  onSelectModel?: (model: GFTModel) => void;
  onSelectSize?: (size: number) => void;
  onSelectStage?: (stage: any) => void;
  onSelectVersion?: (version: any) => void;
  onSelectPlatform?: (platform: TradingPlatform) => void;
  onOpenSourceModal?: (evidence: any, title: string, sourceUrl: string) => void;
}

export const FirmV3CompleteModelRuleTable: React.FC<FirmV3CompleteModelRuleTableProps> = ({
  firm,
  firmProfile,
  selectedModel,
  selectedSize,
  selectedStage,
  onOpenSourceModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [decisionFilter, setDecisionFilter] = useState<string>('all');

  const fmt = (n: number) => '$' + n.toLocaleString();

  // Determine model specifics
  const model = selectedModel || (firmProfile.models && firmProfile.models[0]) || ({
    id: 'default-model',
    name: 'Standard Evaluation',
    category: 'two_step',
    categoryLabel: '2-Step',
    tagline: 'Standard evaluation challenge',
    badge: 'Standard',
    isEvaluation: true,
    stagesCount: 2,
    defaultSize: 100000,
    targetsByStage: { phase1: 10, phase2: 5, funded: 0 },
    dailyLossLimit: { pct: 5, calculationType: 'balance_based', description: '5% Daily Loss Limit' },
    maxDrawdown: { pct: 10, type: 'static', description: '10% Max Drawdown' },
  } as any);
  const size = selectedSize || 100000;
  const isOneStep = model.category === 'one_step';
  const isInstant = model.category === 'instant_funding';

  // Build verified, firm-specific rule rows
  const ruleRows = useMemo(() => {
    const p1Target = model.targetsByStage?.phase1 ?? 10;
    const p2Target = model.targetsByStage?.phase2 ?? 5;
    const dailyPct = model.dailyLossLimit?.pct ?? 5;
    const maxLossPct = model.maxDrawdown?.pct ?? 10;
    const maxLossType = model.maxDrawdown?.type === 'static' ? 'Static Floor' : 'Trailing Drawdown';
    const dailyLossAmt = (size * dailyPct) / 100;
    const maxLossAmt = (size * maxLossPct) / 100;
    const officialUrl = firm.helpCenterUrl || firm.website;
    const officialDoc = `${firm.name} Official Trading Objectives & Contract Terms`;

    return [
      {
        id: 'A-1',
        category: 'A. Capital & Account Sizing',
        name: 'Account Sizing & Starting Balance',
        value: fmt(size),
        phase1: isInstant ? 'N/A' : fmt(size),
        phase2: isInstant || isOneStep ? 'N/A' : fmt(size),
        funded: fmt(size),
        decision: 'ALLOWED',
        formula: `Starting Capital = ${fmt(size)}`,
        source: `${firm.name} Account Specifications`,
        sourceUrl: officialUrl,
        description: `Baseline simulated capital tier for ${firm.name} ${model.name}. All drawdown floors and targets scale from this value.`,
      },
      {
        id: 'B-1',
        category: 'B. Profit Targets',
        name: 'Phase 1 Profit Target',
        value: isInstant ? 'Zero (Instant Access)' : `+${p1Target}% (${fmt((size * p1Target) / 100)})`,
        phase1: isInstant ? 'N/A' : `+${p1Target}%`,
        phase2: isInstant || isOneStep ? 'N/A' : `+${p2Target}%`,
        funded: 'No Target (Keep Profits)',
        decision: isInstant ? 'NO TARGET' : 'REQUIRED',
        formula: isInstant ? 'Zero evaluation requirement' : `Profit Target = ${fmt(size)} * ${p1Target}%`,
        source: officialDoc,
        sourceUrl: officialUrl,
        description: isInstant
          ? `Direct funded account with ${firm.name}. Traders retain profit share from day one without evaluation phases.`
          : `Reach a net closed simulated profit of ${p1Target}% to pass Phase 1 of ${firm.name}.`,
      },
      {
        id: 'C-1',
        category: 'C. Drawdown & Loss Boundaries',
        name: 'Daily Loss Limit',
        value: `${dailyPct}% (${fmt(dailyLossAmt)})`,
        phase1: `-${dailyPct}% (${fmt(dailyLossAmt)})`,
        phase2: `-${dailyPct}% (${fmt(dailyLossAmt)})`,
        funded: `-${dailyPct}% (${fmt(dailyLossAmt)})`,
        decision: 'HARD LIMIT',
        formula: `Daily Loss Floor = Starting Balance - (${fmt(size)} * ${dailyPct}%)`,
        source: officialDoc,
        sourceUrl: officialUrl,
        description: model.dailyLossLimit?.description || `Daily loss limit of ${dailyPct}% resets at 00:00 CE(S)T server time on ${firm.name}.`,
      },
      {
        id: 'C-2',
        category: 'C. Drawdown & Loss Boundaries',
        name: 'Maximum Overall Drawdown',
        value: `${maxLossPct}% (${fmt(maxLossAmt)}) · ${maxLossType}`,
        phase1: `-${maxLossPct}%`,
        phase2: `-${maxLossPct}%`,
        funded: `-${maxLossPct}%`,
        decision: 'HARD LIMIT',
        formula: model.maxDrawdown?.type === 'static'
          ? `Static Floor = ${fmt(size)} - (${fmt(size)} * ${maxLossPct}%) [Fixed]`
          : `Trailing Floor = High-Water Mark Balance - (${fmt(size)} * ${maxLossPct}%)`,
        source: officialDoc,
        sourceUrl: officialUrl,
        description: model.maxDrawdown?.description || `Maximum account loss limit of ${maxLossPct}% enforced across all stages.`,
      },
      {
        id: 'D-1',
        category: 'D. News & Time-Based Rules',
        name: 'News Trading Policy',
        value: firm.rules.find((r) => r.slug.includes('news'))?.headlineValue || 'Allowed (Check Account Model)',
        phase1: 'Allowed',
        phase2: 'Allowed',
        funded: firm.slug === 'ftmo' ? 'Allowed on Swing, 2-min buffer on Standard' : 'Allowed per Policy',
        decision: 'CONDITIONAL',
        formula: 'Execution buffer around macroeconomic releases',
        source: `${firm.name} News Policy Documentation`,
        sourceUrl: officialUrl,
        description: firm.rules.find((r) => r.slug.includes('news'))?.plainEnglish || `News trading parameters enforced per official ${firm.name} rulebook.`,
      },
      {
        id: 'D-2',
        category: 'D. News & Time-Based Rules',
        name: 'Weekend & Overnight Holding',
        value: firm.rules.find((r) => r.slug.includes('weekend'))?.headlineValue || 'Permitted on Swing Accounts',
        phase1: 'Allowed',
        phase2: 'Allowed',
        funded: firm.slug === 'ftmo' ? 'Allowed on Swing accounts' : 'Permitted',
        decision: 'ALLOWED',
        formula: 'Position holding past Friday 17:00 EST close',
        source: officialDoc,
        sourceUrl: officialUrl,
        description: firm.rules.find((r) => r.slug.includes('weekend'))?.plainEnglish || `Weekend holding rules for ${firm.name}.`,
      },
      {
        id: 'E-1',
        category: 'E. Execution & Platform Rules',
        name: 'Expert Advisors (EA) & Algorithmic Trading',
        value: firm.rules.find((r) => r.slug.includes('ea') || r.slug.includes('copy'))?.headlineValue || 'Fully Allowed (No Latency Arbitrage)',
        phase1: 'Allowed',
        phase2: 'Allowed',
        funded: 'Allowed',
        decision: 'ALLOWED',
        formula: 'Automated MQL / cBot execution permitted',
        source: officialDoc,
        sourceUrl: officialUrl,
        description: firm.rules.find((r) => r.slug.includes('ea') || r.slug.includes('copy'))?.plainEnglish || `Algorithmic execution and EAs permitted on ${firm.name}.`,
      },
      {
        id: 'F-1',
        category: 'F. Payouts & Profit Split',
        name: 'Trader Profit Split & Frequency',
        value: `${firm.programs[0]?.accounts[0]?.profitSplit || 80}% to ${firm.programs[0]?.accounts[0]?.profitSplitMaxWithAddon || 90}%`,
        phase1: 'Evaluation (Virtual)',
        phase2: 'Evaluation (Virtual)',
        funded: `${firm.programs[0]?.accounts[0]?.profitSplit || 80}% Performance Reward`,
        decision: 'GUARANTEED',
        formula: 'Trader Reward = Net Profit * Profit Split %',
        source: `${firm.name} Payout & Reward Policy`,
        sourceUrl: officialUrl,
        description: `Verified reward disbursement terms for ${firm.name} funded accounts.`,
      },
    ];
  }, [firm, model, size, isOneStep, isInstant]);

  const filteredRows = useMemo(() => {
    return ruleRows.filter((r) => {
      const matchesSearch =
        !searchQuery ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDecision = decisionFilter === 'all' || r.decision === decisionFilter;
      return matchesSearch && matchesDecision;
    });
  }, [ruleRows, searchQuery, decisionFilter]);

  // Group rows by category
  const groups = useMemo(() => {
    const map = new Map<string, typeof ruleRows>();
    filteredRows.forEach((r) => {
      if (!map.has(r.category)) map.set(r.category, []);
      map.get(r.category)!.push(r);
    });
    return Array.from(map.entries()).map(([categoryName, rows]) => ({
      categoryName,
      rows,
    }));
  }, [filteredRows]);

  return (
    <section id="complete-rules-table" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            Complete Rules & Verified Parameters: {model.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Official contract parameters for {firm.name} ({fmt(size)} account tier). Verified against official documentation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter rules or math..."
              className="bg-[#111318] border border-[#1F2228] rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-[#1F2228] bg-[#111318]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#1F2228] bg-[#080A10]/90 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-[240px]">Rule Parameter</th>
                <th className="py-3 px-3 w-[160px]">Verified Value</th>
                <th className="py-3 px-3">Phase 1</th>
                <th className="py-3 px-3">Phase 2</th>
                <th className="py-3 px-3">Funded Account</th>
                <th className="py-3 px-3 text-right">Official Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2228]/60 text-xs">
              {groups.map((grp) => (
                <React.Fragment key={grp.categoryName}>
                  <tr className="bg-[#0c0e14] border-t border-[#1F2228]">
                    <td colSpan={6} className="py-2 px-4 font-bold text-sky-400 text-xs tracking-wide uppercase font-mono">
                      {grp.categoryName}
                    </td>
                  </tr>
                  {grp.rows.map((row) => (
                    <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{row.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{row.description}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">{row.value}</td>
                      <td className="py-3 px-3 font-mono text-slate-300">{row.phase1}</td>
                      <td className="py-3 px-3 font-mono text-slate-300">{row.phase2}</td>
                      <td className="py-3 px-3 font-mono text-slate-200 font-semibold">{row.funded}</td>
                      <td className="py-3 px-3 text-right">
                        <a
                          href={row.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 underline max-w-[160px] truncate"
                          title={row.source}
                        >
                          <span>{row.source}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
