import React from 'react';
import {
  GFTCategory,
  GFTModel,
  TradingPlatform,
  TradingStyle,
} from '../../data/goatCanonicalData.ts';
import { CategoryMeta } from '../../data/goatSelectors.ts';
import {
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  Layers,
  Scale,
  DollarSign,
  TrendingDown,
  Clock,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';

interface GoatV3ModelSelectorProps {
  categories: CategoryMeta[];
  selectedCategory: GFTCategory;
  onSelectCategory: (cat: GFTCategory) => void;
  modelsInCategory: GFTModel[];
  selectedModel: GFTModel;
  onSelectModel: (model: GFTModel) => void;
  selectedSize: number;
  onSelectSize: (size: number) => void;
  selectedStage: 'all' | 'evaluation' | 'funded';
  onSelectStage: (stage: 'all' | 'evaluation' | 'funded') => void;
  selectedPlatform: 'all' | TradingPlatform;
  onSelectPlatform: (platform: 'all' | TradingPlatform) => void;
  selectedVersion: 'current_2026' | 'pre_aug_2026';
  onSelectVersion: (version: 'current_2026' | 'pre_aug_2026') => void;
  selectedTradingStyle: TradingStyle;
  onSelectTradingStyle: (style: TradingStyle) => void;
  comparisonModelIds: string[];
  onToggleCompareModel: (modelId: string) => void;
  onOpenComparison: () => void;
}

export const GoatV3ModelSelector: React.FC<GoatV3ModelSelectorProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  modelsInCategory,
  selectedModel,
  onSelectModel,
  selectedSize,
  onSelectSize,
  selectedStage,
  onSelectStage,
  selectedPlatform,
  onSelectPlatform,
  selectedVersion,
  onSelectVersion,
  selectedTradingStyle,
  onSelectTradingStyle,
  comparisonModelIds,
  onToggleCompareModel,
  onOpenComparison,
}) => {
  const tradingStylesList: Array<{ id: TradingStyle; label: string }> = [
    { id: 'conservative', label: 'Conservative (High Cushion)' },
    { id: 'news_trader', label: 'News Trader' },
    { id: 'swing_trader', label: 'Swing Trader (Overnight)' },
    { id: 'scalper', label: 'Scalper (Intraday)' },
    { id: 'ea_trader', label: 'EA / Algo Trader' },
    { id: 'weekend_holder', label: 'Weekend Holder' },
    { id: 'copy_trader', label: 'Copy Trader' },
    { id: 'aggressive', label: 'Aggressive / High Speed' },
    { id: 'futures_trader', label: 'Futures Trader' },
  ];

  return (
    <section id="selector" className="space-y-6">
      {/* Category Tabs with Dynamic Registry Counts */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              Model Architecture & Selection Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Select an official category to inspect dynamically filtered models, exact rules, and live mathematical limits.
            </p>
          </div>

          {comparisonModelIds.length > 0 && (
            <button
              onClick={onOpenComparison}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              Compare ({comparisonModelIds.length}) Selected
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500/60 shadow-lg shadow-blue-500/10 text-white'
                    : 'bg-[#111318] hover:bg-[#16181E] border-[#1F2228] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold truncate">{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
                      isSelected
                        ? 'bg-blue-500/30 text-blue-200 border border-blue-400/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                    }`}
                  >
                    {cat.modelCount}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                  {cat.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Model Cards in Active Category */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Available Models in {categories.find((c) => c.id === selectedCategory)?.label}:</span>
          <span className="font-mono text-[11px]">Click card to inspect full rules & simulator</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {modelsInCategory.map((m) => {
            const isSelected = selectedModel.id === m.id;
            const isComparing = comparisonModelIds.includes(m.id);

            return (
              <div
                key={m.id}
                onClick={() => onSelectModel(m)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#131a2a] to-[#10141f] border-blue-500/70 shadow-lg shadow-blue-500/15'
                    : 'bg-[#111318] hover:bg-[#151820] border-[#1F2228] hover:border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white">{m.name}</h3>
                        {m.isArchived && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                            Legacy
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{m.tagline}</p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCompareModel(m.id);
                      }}
                      className={`p-1.5 rounded-lg border text-xs transition-colors ${
                        isComparing
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 border-slate-700'
                      }`}
                      title={isComparing ? 'Remove from compare' : 'Add to compare'}
                    >
                      <Scale className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Core Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-black/30 border border-white/[0.04] text-center my-3">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Target</div>
                      <div className="text-xs font-black text-emerald-400">
                        {m.targetsByStage.phase1 ? `${m.targetsByStage.phase1}%` : 'Instant'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Daily Loss</div>
                      <div className="text-xs font-black text-amber-400">
                        {m.dailyLossLimit.pct === 0 ? '0% (None)' : `${m.dailyLossLimit.pct}%`}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Max DD</div>
                      <div className="text-xs font-black text-rose-400">
                        {m.maxDrawdown.pct}% {m.maxDrawdown.type === 'static' ? 'Static' : 'Trailing'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Split: {m.profitSplit.basePct}%</span>
                  </div>
                  <div className="font-mono text-slate-400">
                    Cycle: {m.profitSplit.payoutCycleDays}d
                  </div>
                  {m.consistencyRule.active ? (
                    <span className="text-amber-400/90 font-medium">
                      {m.consistencyRule.maxSingleDayPct}% Cap
                    </span>
                  ) : (
                    <span className="text-emerald-400/90 font-medium">0% Consistency</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Context Filters Bar (Size, Stage, Platform, Version, Trading Style) */}
      <div className="p-4 rounded-2xl bg-[#111318] border border-[#1F2228] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider font-mono">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
            Active Account Context Filters
          </span>
          <span className="text-xs text-slate-400">
            Selected: <span className="text-blue-400 font-semibold">{selectedModel.name}</span> ·{' '}
            <span className="text-white font-mono font-bold">${selectedSize.toLocaleString()}</span>
          </span>
        </div>

        {/* Account Size Selector Chips */}
        <div className="space-y-1.5">
          <div className="text-xs text-slate-400">Account Size (Capital):</div>
          <div className="flex flex-wrap gap-2">
            {selectedModel.availableSizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  onClick={() => onSelectSize(size)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-400 shadow-sm shadow-blue-500/20'
                      : 'bg-[#16181E] hover:bg-slate-800 text-slate-300 border-[#1F2228]'
                  }`}
                >
                  ${size.toLocaleString()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stage, Platform, and Version Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/[0.04]">
          {/* Stage Filter */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Account Stage:</label>
            <select
              value={selectedStage}
              onChange={(e) => onSelectStage(e.target.value as any)}
              className="w-full bg-[#16181E] border border-[#1F2228] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Stages (Overview)</option>
              {selectedModel.isEvaluation && <option value="evaluation">Evaluation Stage</option>}
              <option value="funded">Funded / Master Stage</option>
            </select>
          </div>

          {/* Platform Filter */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Execution Platform:</label>
            <select
              value={selectedPlatform}
              onChange={(e) => onSelectPlatform(e.target.value as any)}
              className="w-full bg-[#16181E] border border-[#1F2228] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Supported Platforms</option>
              {selectedModel.supportedPlatforms.map((p) => (
                <option key={p} value={p}>
                  {p.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Purchase Version */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Purchase Date / Terms Version:</label>
            <select
              value={selectedVersion}
              onChange={(e) => onSelectVersion(e.target.value as any)}
              className="w-full bg-[#16181E] border border-[#1F2228] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="current_2026">Current Terms (Sept 2026 Active)</option>
              <option value="pre_aug_2026">Pre-August 2026 (Grandfathered 4% Daily)</option>
            </select>
          </div>
        </div>

        {/* Trading Style Profile Selector */}
        <div className="pt-2 border-t border-white/[0.04] space-y-1.5">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Trading Style Profile:</span>
            <span className="text-[11px] text-blue-400">Updates suitability & risk recommendations</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tradingStylesList.map((style) => {
              const isSelected = selectedTradingStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => onSelectTradingStyle(style.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border-slate-800'
                  }`}
                >
                  {style.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
