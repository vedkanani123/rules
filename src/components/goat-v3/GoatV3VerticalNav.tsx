import React, { useEffect, useState } from 'react';
import {
  Layers,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Scale,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  AlertTriangle,
  Flame,
  ExternalLink,
  Calendar,
  Building,
  ArrowUp,
  Search,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

export interface NavSectionItem {
  id: string;
  label: string;
  shortLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  group: 'Core & Models' | 'Analysis & Simulator' | 'Safeguards & Audit';
  badge?: string;
}

export const NAV_SECTIONS: NavSectionItem[] = [
  {
    id: 'about-firm',
    label: 'About & Corporate Legal',
    shortLabel: 'About GFT',
    icon: Building,
    group: 'Core & Models',
  },
  {
    id: 'selector',
    label: 'Model Architecture',
    shortLabel: '13 Models',
    icon: Layers,
    group: 'Core & Models',
    badge: '13',
  },
  {
    id: 'complete-rules-table',
    label: 'Complete Rules Table',
    shortLabel: 'Rules Table',
    icon: BookOpen,
    group: 'Core & Models',
    badge: 'Core',
  },
  {
    id: 'decision',
    label: 'Quick Decision Guide',
    shortLabel: 'Decision Guide',
    icon: Sparkles,
    group: 'Core & Models',
  },
  {
    id: 'snapshot',
    label: 'Rule Snapshot & Terms',
    shortLabel: 'Snapshot',
    icon: ShieldCheck,
    group: 'Core & Models',
  },
  {
    id: 'comparison',
    label: 'Multi-Model Compare',
    shortLabel: 'Compare 4x',
    icon: Scale,
    group: 'Analysis & Simulator',
    badge: 'Matrix',
  },
  {
    id: 'simulator',
    label: 'Model Risk Simulator',
    shortLabel: 'Risk Simulator',
    icon: TrendingUp,
    group: 'Analysis & Simulator',
    badge: 'Live',
  },
  {
    id: 'explorer',
    label: 'Clause Rule Explorer',
    shortLabel: 'Rule Explorer',
    icon: Scale,
    group: 'Analysis & Simulator',
  },
  {
    id: 'pricing',
    label: 'Pricing & Promos',
    shortLabel: 'Pricing',
    icon: DollarSign,
    group: 'Analysis & Simulator',
    badge: '40% OFF',
  },
  {
    id: 'futures',
    label: 'CME Futures Desk',
    shortLabel: 'Futures Desk',
    icon: Flame,
    group: 'Analysis & Simulator',
  },
  {
    id: 'traps',
    label: 'Watchouts & Traps',
    shortLabel: 'Traps & Rules',
    icon: AlertTriangle,
    group: 'Safeguards & Audit',
    badge: 'Alert',
  },
  {
    id: 'trust',
    label: 'Trust & Verification',
    shortLabel: 'Trust Center',
    icon: ShieldAlert,
    group: 'Safeguards & Audit',
  },
  {
    id: 'reviews',
    label: 'Trader Field Reports',
    shortLabel: 'Reviews',
    icon: ExternalLink,
    group: 'Safeguards & Audit',
  },
  {
    id: 'history',
    label: 'Rule Change History',
    shortLabel: 'Changelog',
    icon: Calendar,
    group: 'Safeguards & Audit',
  },
];

interface GoatV3VerticalNavProps {
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
  onSearchOpen?: () => void;
  isMobileModal?: boolean;
  onCloseMobileModal?: () => void;
}

export const GoatV3VerticalNav: React.FC<GoatV3VerticalNavProps> = ({
  activeSection,
  onSelectSection,
  onSearchOpen,
  isMobileModal = false,
  onCloseMobileModal,
}) => {
  const groups: Array<NavSectionItem['group']> = [
    'Core & Models',
    'Analysis & Simulator',
    'Safeguards & Audit',
  ];

  useEffect(() => {
    const activeEl = document.getElementById(`nav-item-${activeSection}`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeSection]);

  const handleItemClick = (id: string) => {
    onSelectSection(id);
    if (onCloseMobileModal) {
      onCloseMobileModal();
    }
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onCloseMobileModal) {
      onCloseMobileModal();
    }
  };

  return (
    <nav
      aria-label="Section navigation"
      className={`flex flex-col bg-[#0b0e17] border border-[#1b202e] rounded-2xl shadow-xl overflow-hidden ${
        isMobileModal ? 'w-full' : 'w-full'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-white/[0.06] bg-[#0e121d] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-tight">
              Table of Contents
            </div>
            <div className="text-[10px] text-slate-400">
              13 Verified Sections
            </div>
          </div>
        </div>

        {onSearchOpen && (
          <button
            onClick={onSearchOpen}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs flex items-center gap-1 cursor-pointer transition-colors border border-white/[0.06]"
            title="Search (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <kbd className="text-[10px] font-mono text-slate-400">⌘K</kbd>
          </button>
        )}
      </div>

      {/* Nav List Groups */}
      <div className="p-2 space-y-4 overflow-y-auto max-h-[calc(100vh-14rem)] scrollbar-thin">
        {groups.map((group) => {
          const items = NAV_SECTIONS.filter((s) => s.group === group);
          return (
            <div key={group} className="space-y-1">
              <div className="px-2.5 pt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {group}
              </div>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      id={`nav-item-${item.id}`}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-all cursor-pointer group ${
                        isActive
                          ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                          : 'text-slate-300 hover:text-white hover:bg-white/[0.04] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? 'text-blue-400'
                              : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        <span className="truncate leading-tight">
                          {item.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded leading-none ${
                              isActive
                                ? 'bg-blue-500/25 text-blue-200'
                                : 'bg-white/[0.05] text-slate-400 group-hover:text-slate-300'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer / Quick Jump Top */}
      <div className="p-2 border-t border-white/[0.06] bg-[#0a0d16] flex items-center justify-between gap-2">
        <button
          onClick={handleScrollTop}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer border border-white/[0.06]"
        >
          <ArrowUp className="w-3.5 h-3.5 text-slate-400" />
          <span>Back to Top</span>
        </button>
      </div>
    </nav>
  );
};
