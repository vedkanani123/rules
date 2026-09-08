import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FirmDirectory } from './components/FirmDirectory';
import { RulesTable } from './components/RulesTable';
import { FirmOverview } from './components/FirmOverview';
import { CompareAccounts } from './components/CompareAccounts';
import { StrategyMatcher } from './components/StrategyMatcher';
import { ConflictsAndEasyToMiss } from './components/ConflictsAndEasyToMiss';
import { LiveSimulator } from './components/LiveSimulator';
import { ReviewsIntelligence } from './components/ReviewsIntelligence';
import { RuleChangelog } from './components/RuleChangelog';
import { CrawlerAdminSuite } from './components/CrawlerAdminSuite';
import { SearchModal } from './components/SearchModal';
import { AccountDetailModal } from './components/AccountDetailModal';
import { SourceViewerModal } from './components/SourceViewerModal';
import { PropFirm, PropAccountModel, RuleEvidenceItem, RuleConflict, ReviewComplaint, ReviewTheme, RuleChangeHistory } from './types';
import { ALL_PROP_FIRMS_DIRECTORY } from './data/firms-data';
import {
  ShieldCheck,
  LayoutGrid,
  ChevronRight,
  Sparkles,
  Building2,
  TableProperties,
  Activity,
  Scale,
  Compass,
  AlertTriangle,
  SlidersHorizontal,
  MessageSquareWarning,
  History,
  Bot
} from 'lucide-react';

// Fallback seed data in case of direct SPA client-render
import { DataStore } from '../server/data/store';

export function App() {
  // Navigation & Selected Firm State
  const [activeTab, setActiveTab] = useState<string>('directory');
  const [selectedFirmId, setSelectedFirmId] = useState<string>('goat-funded-trader');

  // Firm Intelligence Data
  const [firm, setFirm] = useState<PropFirm | null>(null);
  const [rules, setRules] = useState<RuleEvidenceItem[]>([]);
  const [conflicts, setConflicts] = useState<RuleConflict[]>([]);
  const [reviews, setReviews] = useState<ReviewComplaint[]>([]);
  const [themes, setThemes] = useState<ReviewTheme[]>([]);
  const [changes, setChanges] = useState<RuleChangeHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal States
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<PropAccountModel | null>(null);
  const [selectedSource, setSelectedSource] = useState<any | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [firmRes, rulesRes, conflictsRes, reviewsRes, changesRes] = await Promise.allSettled([
          fetch(`/api/firms/${selectedFirmId}`).then(r => r.json()),
          fetch(`/api/rules?firmId=${selectedFirmId}`).then(r => r.json()),
          fetch(`/api/conflicts?firmId=${selectedFirmId}`).then(r => r.json()),
          fetch(`/api/reviews?firmId=${selectedFirmId}`).then(r => r.json()),
          fetch(`/api/changes?firmId=${selectedFirmId}`).then(r => r.json())
        ]);

        if (firmRes.status === 'fulfilled' && firmRes.value.success) {
          setFirm(firmRes.value.data);
        } else {
          // Fallback to local singleton store
          const store = DataStore.getInstance();
          setFirm(store.getFirm(selectedFirmId) || store.getFirm('goat-funded-trader') || null);
        }

        if (rulesRes.status === 'fulfilled' && rulesRes.value.success) {
          setRules(rulesRes.value.data);
        } else {
          const store = DataStore.getInstance();
          setRules(store.getAllRules(selectedFirmId));
        }

        if (conflictsRes.status === 'fulfilled' && conflictsRes.value.success) {
          setConflicts(conflictsRes.value.data);
        } else {
          const store = DataStore.getInstance();
          setConflicts(store.getAllConflicts(selectedFirmId));
        }

        if (reviewsRes.status === 'fulfilled' && reviewsRes.value.success) {
          setReviews(reviewsRes.value.data);
          setThemes(reviewsRes.value.themes || []);
        } else {
          const store = DataStore.getInstance();
          setReviews(store.getAllReviews(selectedFirmId));
          setThemes(store.getReviewThemes(selectedFirmId));
        }

        if (changesRes.status === 'fulfilled' && changesRes.value.success) {
          setChanges(changesRes.value.data);
        } else {
          const store = DataStore.getInstance();
          setChanges(store.getAllChanges(selectedFirmId));
        }
      } catch (err) {
        console.error('Error fetching data from API:', err);
        const store = DataStore.getInstance();
        setFirm(store.getFirm(selectedFirmId) || store.getFirm('goat-funded-trader') || null);
        setRules(store.getAllRules(selectedFirmId));
        setConflicts(store.getAllConflicts(selectedFirmId));
        setReviews(store.getAllReviews(selectedFirmId));
        setThemes(store.getReviewThemes(selectedFirmId));
        setChanges(store.getAllChanges(selectedFirmId));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedFirmId]);

  const handleSelectFirm = (firmId: string, initialTab: string = 'rules') => {
    setSelectedFirmId(firmId);
    setActiveTab(initialTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSimulatorForAccount = (acc: PropAccountModel) => {
    setSelectedAccount(acc);
    setActiveTab('simulator');
  };

  const handleOpenSimulatorForRule = (rule: RuleEvidenceItem) => {
    if (firm?.programs && firm.programs.length > 0 && firm.programs[0].accounts.length > 0) {
      setSelectedAccount(firm.programs[0].accounts[0]);
    }
    setActiveTab('simulator');
  };

  const currentFirmMetadata = ALL_PROP_FIRMS_DIRECTORY.find(f => f.id === selectedFirmId) || ALL_PROP_FIRMS_DIRECTORY[0];

  if (loading || !firm) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-mono text-xs text-zinc-400">Loading verified prop firm intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        selectedFirmId={selectedFirmId}
        onSelectFirm={handleSelectFirm}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Breadcrumb & Quick Firm Context Bar (when viewing a specific firm tab) */}
        {activeTab !== 'directory' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <button
                onClick={() => setActiveTab('directory')}
                className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer shrink-0"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>All Prop Firms</span>
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
              <div className="flex items-center gap-2 truncate">
                <span className="font-bold text-white truncate">{currentFirmMetadata.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                  {currentFirmMetadata.status === 'ACTIVE_VERIFIED' ? '100% Verified Deep-Dive' : 'Preview'}
                </span>
              </div>
            </div>

            {/* Quick Switch Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <button
                onClick={() => setActiveTab('rules')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                  activeTab === 'rules' ? 'bg-indigo-600 text-white font-bold' : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Rules & Traps
              </button>
              <button
                onClick={() => setActiveTab('firm')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                  activeTab === 'firm' ? 'bg-indigo-600 text-white font-bold' : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('compare')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                  activeTab === 'compare' ? 'bg-indigo-600 text-white font-bold' : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Compare
              </button>
              <button
                onClick={() => setActiveTab('conflicts')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                  activeTab === 'conflicts' ? 'bg-amber-500 text-zinc-950 font-bold' : 'bg-zinc-950 text-amber-300 hover:text-amber-200'
                }`}
              >
                Hidden Traps
              </button>
              <button
                onClick={() => setActiveTab('simulator')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                  activeTab === 'simulator' ? 'bg-indigo-600 text-white font-bold' : 'bg-zinc-950 text-indigo-300 hover:text-indigo-200'
                }`}
              >
                Simulator
              </button>
            </div>
          </div>
        )}

        {/* 1. Prop Firms Directory (First Page Hub) */}
        {activeTab === 'directory' && (
          <FirmDirectory
            onSelectFirm={handleSelectFirm}
            onLiveCrawlFirm={(url, name) => {
              // Trigger crawl and select
              handleSelectFirm('goat-funded-trader', 'rules');
            }}
          />
        )}

        {/* 2. Rules Table & Hidden Traps */}
        {activeTab === 'rules' && (
          <RulesTable
            rules={rules}
            firm={firm}
            onOpenSourceModal={src => setSelectedSource(src)}
            onOpenSimulatorForRule={handleOpenSimulatorForRule}
            onRulesUpdated={newRules => setRules(newRules)}
          />
        )}

        {/* 3. Firm Overview & Programs */}
        {activeTab === 'firm' && (
          <FirmOverview
            firm={firm}
            onSelectAccount={acc => setSelectedAccount(acc)}
            onOpenSourceModal={src => setSelectedSource(src)}
            onOpenSimulatorForAccount={handleOpenSimulatorForAccount}
          />
        )}

        {/* 4. Compare Accounts */}
        {activeTab === 'compare' && (
          <CompareAccounts
            firm={firm}
            onSelectAccount={acc => setSelectedAccount(acc)}
            onOpenSimulatorForAccount={handleOpenSimulatorForAccount}
          />
        )}

        {/* 5. Strategy Matcher */}
        {activeTab === 'match' && (
          <StrategyMatcher
            firm={firm}
            onSelectAccount={acc => setSelectedAccount(acc)}
            onOpenSimulatorForAccount={handleOpenSimulatorForAccount}
          />
        )}

        {/* 6. Conflicts and Easy to Miss Rules */}
        {activeTab === 'conflicts' && (
          <ConflictsAndEasyToMiss
            conflicts={conflicts}
            rules={rules}
            onOpenSourceModal={src => setSelectedSource(src)}
          />
        )}

        {/* 7. Live Risk & Drawdown Simulator */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <LiveSimulator preloadedAccount={selectedAccount || undefined} />
          </div>
        )}

        {/* 8. Reviews Intelligence & Payout Audits */}
        {activeTab === 'reviews' && (
          <ReviewsIntelligence
            reviews={reviews}
            themes={themes}
            onOpenSourceModal={src => setSelectedSource(src)}
          />
        )}

        {/* 9. Rule Changelog */}
        {activeTab === 'changes' && (
          <RuleChangelog
            changes={changes}
            onOpenSourceModal={src => setSelectedSource(src)}
          />
        )}

        {/* 10. Crawler & Admin Suite */}
        {activeTab === 'crawler' && (
          <CrawlerAdminSuite
            onOpenSourceModal={src => setSelectedSource(src)}
            rules={rules}
          />
        )}
      </main>

      {/* Global Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        rules={rules}
        conflicts={conflicts}
        onSelectSource={src => setSelectedSource(src)}
      />

      <AccountDetailModal
        account={selectedAccount}
        firm={firm}
        onClose={() => setSelectedAccount(null)}
        onOpenSourceModal={src => setSelectedSource(src)}
      />

      <SourceViewerModal
        sourceItem={selectedSource}
        onClose={() => setSelectedSource(null)}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-850 bg-zinc-950 py-8 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 font-bold text-zinc-200">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Evidence-First Universal Prop Firm Intelligence Platform</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Every rule, calculation, and conflict backed by verbatim crawled source documents and cryptographic SHA-256 signatures.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-500">
            <span>Viewing: {currentFirmMetadata.name}</span>
            <span>•</span>
            <span>Version 2.5.0</span>
            <span>•</span>
            <span className="text-emerald-400">● 100% Grounded</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
