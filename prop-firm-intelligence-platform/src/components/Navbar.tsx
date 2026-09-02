import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Scale,
  Compass,
  SlidersHorizontal,
  MessageSquareWarning,
  History,
  Bot,
  Activity,
  AlertTriangle,
  TableProperties,
  LayoutGrid,
  ChevronDown,
  Building2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { ALL_PROP_FIRMS_DIRECTORY } from '../data/firms-data';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
  selectedFirmId?: string;
  onSelectFirm?: (firmId: string, initialTab?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  selectedFirmId = 'goat-funded-trader',
  onSelectFirm
}) => {
  const [tickerIndex, setTickerIndex] = useState(0);
  const [isFirmDropdownOpen, setIsFirmDropdownOpen] = useState(false);

  const tickerAlerts = [
    '🚨 GOAT Funded Trader: 80% Max Margin Usage Rule located in FAQ can trigger profit forfeiture on open positions',
    '⚠️ Payout trading days increased from 3 days to 4 days for funded accounts purchased on or after July 25, 2026',
    '⚡ Rule Qualification: CANADA50 promo 1st-payout fee refund vs standard 4th-payout terms discrepancy',
    '🛡️ Zero open positions and zero pending limit orders strictly required before submitting withdrawal request',
    '📊 Instant Model: 33% Consistency rule caps maximum profit permitted from a single trading day'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % tickerAlerts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [tickerAlerts.length]);

  const currentFirm = ALL_PROP_FIRMS_DIRECTORY.find(f => f.id === selectedFirmId) || ALL_PROP_FIRMS_DIRECTORY[0];

  const navItems = [
    { id: 'directory', label: 'All Prop Firms', icon: LayoutGrid, isDirectory: true, badge: `${ALL_PROP_FIRMS_DIRECTORY.length}` },
    { id: 'rules', label: 'Rules & Hidden Traps', icon: TableProperties, badge: '24+' },
    { id: 'firm', label: 'Firm Overview', icon: Activity },
    { id: 'compare', label: 'Compare Models', icon: Scale },
    { id: 'match', label: 'Strategy Matcher', icon: Compass },
    { id: 'conflicts', label: 'Hidden Traps & Conflicts', icon: AlertTriangle, badge: '7' },
    { id: 'simulator', label: 'Rule Simulator', icon: SlidersHorizontal },
    { id: 'reviews', label: 'Trader Reviews & Payouts', icon: MessageSquareWarning, badge: '1,120+' },
    { id: 'changes', label: 'Rule Changelog', icon: History },
    { id: 'crawler', label: 'Live Crawler Suite', icon: Bot }
  ];

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 text-zinc-100">
      {/* Alert Ticker Bar */}
      <div className="bg-gradient-to-r from-amber-950/70 via-zinc-900 to-rose-950/70 border-b border-amber-500/20 px-4 py-1.5 text-xs font-mono flex items-center justify-between text-amber-200/90">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-semibold uppercase tracking-wider text-amber-400 shrink-0">EVIDENCE RADAR:</span>
          <span className="truncate transition-all duration-500">{tickerAlerts[tickerIndex]}</span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-zinc-400 shrink-0 pl-4 border-l border-zinc-800">
          <span>Active Deep-Dive: <strong className="text-zinc-200">{currentFirm.name}</strong></span>
          <span className="text-emerald-400 flex items-center gap-1 font-semibold">● 100% Grounded</span>
        </div>
      </div>

      {/* Main Top Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div
            id="brand-logo"
            onClick={() => setActiveTab('directory')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="h-full w-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                  PROP FIRM INTELLIGENCE
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  EVIDENCE-FIRST
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Universal Prop Firm Rules • Hidden Traps • Risk Simulations
              </p>
            </div>
          </div>

          {/* Firm Selector Switcher & Search Bar */}
          <div className="flex items-center gap-3">
            {/* Quick Firm Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsFirmDropdownOpen(!isFirmDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-200 transition-all cursor-pointer shadow-sm"
              >
                <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                <span className="max-w-[130px] sm:max-w-none truncate">{currentFirm.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              </button>

              {isFirmDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-fadeIn"
                  onMouseLeave={() => setIsFirmDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-zinc-500 border-b border-zinc-800 flex items-center justify-between">
                    <span>Select Prop Firm</span>
                    <span>{ALL_PROP_FIRMS_DIRECTORY.length} Available</span>
                  </div>

                  <button
                    onClick={() => {
                      setIsFirmDropdownOpen(false);
                      setActiveTab('directory');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-indigo-300 hover:bg-indigo-950/40 transition-colors font-semibold"
                  >
                    <LayoutGrid className="h-4 w-4 text-indigo-400" />
                    <span>View All Prop Firms Directory</span>
                  </button>

                  <div className="border-t border-zinc-800 my-1" />

                  {ALL_PROP_FIRMS_DIRECTORY.map(f => (
                    <button
                      key={f.id}
                      onClick={() => {
                        setIsFirmDropdownOpen(false);
                        if (onSelectFirm) {
                          onSelectFirm(f.id, 'rules');
                        } else {
                          setActiveTab('rules');
                        }
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        f.id === selectedFirmId
                          ? 'bg-indigo-600/20 text-white font-bold border border-indigo-500/30'
                          : 'text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-[11px] font-bold text-indigo-400">{f.shortName}</span>
                        <span className="truncate">{f.name}</span>
                      </div>
                      {f.status === 'ACTIVE_VERIFIED' ? (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded shrink-0">
                          Active
                        </span>
                      ) : (
                        <span className="text-[9px] text-zinc-500 shrink-0">
                          Pipeline
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Global Search Button */}
            <button
              id="global-search-btn"
              onClick={onOpenSearch}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs transition-all shadow-inner group cursor-pointer"
            >
              <Search className="h-4 w-4 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>

        {/* Tab Items Menu */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-2 border-t border-zinc-850 text-xs font-medium">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? item.isDirectory
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                      : 'bg-indigo-600/25 text-indigo-200 border border-indigo-500/40 font-semibold shadow-sm'
                    : item.isDirectory
                      ? 'text-indigo-300 hover:text-white hover:bg-zinc-900 border border-indigo-500/20'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? (item.isDirectory ? 'text-white' : 'text-indigo-400') : 'text-zinc-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive
                        ? 'bg-indigo-500/40 text-white font-bold'
                        : 'bg-zinc-850 text-zinc-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
