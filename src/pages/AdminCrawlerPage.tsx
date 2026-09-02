import React, { useState } from 'react';
import { CRAWLER_SNAPSHOT_TREE } from '../data/propFirmsData.ts';
import { CrawlSnapshotNode } from '../types/schema.ts';
import { Terminal, FolderTree, Check, X, AlertTriangle, ExternalLink } from 'lucide-react';

export const AdminCrawlerPage: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<CrawlSnapshotNode>(CRAWLER_SNAPSHOT_TREE[0] as unknown as CrawlSnapshotNode);
  const [activeTab, setActiveTab] = useState<'run' | 'tree' | 'verify'>('run');
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  const verificationItems = [
    { id: 'item-1', sourceText: 'The maximum daily loss allowed is 4% of the starting balance of the trading day (measured at 00:00 CE(S)T server time).', sourceUrl: 'https://help.goatfundedtrader.com/en/articles/daily-drawdown-calculation', candidateRule: 'Daily Drawdown Limit', normalizedValue: '4% Starting Balance', status: 'PENDING_REVIEW' },
    { id: 'item-2', sourceText: 'Effective July 25, 2026: Traders must log a minimum of four (4) active trading days per payout cycle (previously 3 days).', sourceUrl: 'https://help.goatfundedtrader.com/en/articles/rewards-payout-rules', candidateRule: 'Funded Trading Days Requirement', normalizedValue: '4 Days', status: 'VERIFIED' },
    { id: 'item-3', sourceText: 'Accounts showing no trade activity for 30 consecutive calendar days are automatically deactivated.', sourceUrl: 'https://www.goatfundedtrader.com/legal/terms-and-conditions', candidateRule: '30-Day Inactivity Account Lockout', normalizedValue: '30 Days', status: 'VERIFIED' },
  ];

  const handleAction = (id: string, action: string) => {
    setVerificationFeedback(`Rule candidate ${id} marked as: ${action}`);
    setTimeout(() => setVerificationFeedback(null), 3000);
  };

  return (
    <div className="bg-[#080A10] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="pt-10 sm:pt-12 pb-8 border-b border-[#1F2228] text-center">
          <p className="text-[11px] tracking-[0.14em] uppercase font-medium text-[#8A8F98] mb-3">INTERNAL SYSTEMS</p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111318] border border-[#1F2228] text-xs font-bold text-[#8A8F98] mb-4">
            <Terminal className="w-3.5 h-3.5 shrink-0" /> Crawler Operations & Evidence Dashboard
          </div>
          <h1 className="text-[26px] sm:text-[36px] font-semibold text-white tracking-tight">Crawler Engine & Verification Admin</h1>
          <p className="text-[13px] text-[#8A8F98] mt-2 max-w-2xl mx-auto">Deterministic crawl, diff, and citation audit — no autonomous deployment without review.</p>
          <div className="flex gap-1.5 p-1 rounded-xl bg-[#111318] border border-[#1F2228] w-fit mx-auto mt-6">
            {(['run','tree','verify'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-colors min-h-[40px] whitespace-nowrap ${activeTab === tab ? 'bg-white text-[#080A10] shadow-sm' : 'text-[#8A8F98] hover:text-white'}`}>{tab==='run' ? 'Crawl Status' : tab==='tree' ? 'URL Tree' : 'Verification'}</button>
            ))}
          </div>
        </div>

        {verificationFeedback && (
          <div className="mt-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[13px] flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span className="break-words">{verificationFeedback}</span>
          </div>
        )}

        {activeTab === 'run' && (
          <div className="space-y-6 mt-8">
            <div className="p-6 rounded-2xl bg-[#111318] border border-[#1F2228] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="relative flex h-3 w-3 shrink-0"><span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>
                  <div className="min-w-0">
                    <span className="text-[13px] font-semibold text-white block">Target: Goat Funded Trader</span>
                    <span className="text-xs text-[#8A8F98] font-mono break-all">https://www.goatfundedtrader.com/</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full self-start sm:self-auto whitespace-nowrap">100% COMPLETE</span>
              </div>
              <div className="w-full bg-[#080A10] rounded-full h-2 overflow-hidden border border-[#1F2228]">
                <div className="bg-white h-full rounded-full w-full" />
              </div>
              <div className="grid grid-cols-2 sm:flex sm:justify-between gap-2 text-[13px] text-[#8A8F98] font-mono">
                <span>Duration: 12.4s</span><span>Crawled: 35 / 35</span><span>Errors: 0</span><span>Avg: 142ms</span>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Discovered URLs', value: '184', sub: 'Across 3 subdomains', color: 'text-white' },
                { label: 'Pages Crawled', value: '35', sub: '0 failures (100%)', color: 'text-emerald-400' },
                { label: 'JS Rendered', value: '8', sub: 'Selective fallback', color: 'text-blue-400' },
                { label: 'Documents', value: '7', sub: 'Terms & Policy', color: 'text-purple-400' },
              ].map((m) => (
                <div key={m.label} className="p-4 rounded-2xl bg-[#111318] border border-[#1F2228] space-y-1">
                  <span className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98] block leading-tight">{m.label}</span>
                  <span className="text-2xl font-semibold text-white font-mono block">{m.value}</span>
                  <span className={`text-[13px] ${m.color} block`}>{m.sub}</span>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-[#111318] border border-[#1F2228] space-y-3">
              <h3 className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98] flex items-center gap-2"><Terminal className="w-4 h-4" />CLI Crawler Commands</h3>
              <div className="space-y-2 text-xs font-mono">
                {[
                  ['npm run crawl -- https://www.goatfundedtrader.com/', 'Recursive crawl'],
                  ['npm run extract', 'Rule extraction'],
                  ['npm run detect-changes', 'Snapshot diff'],
                  ['npm run verify', 'Citation audit'],
                ].map(([cmd, desc]) => (
                  <div key={cmd} className="p-3 rounded-xl bg-[#080A10] border border-[#1F2228] text-[#8A8F98] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="break-all text-[13px] text-white/80">{cmd}</span><span className="text-[#8A8F98] text-xs shrink-0 hidden sm:block">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tree' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
            <div className="lg:col-span-5 rounded-2xl bg-[#111318] border border-[#1F2228] p-4 space-y-2 max-h-[40dvh] lg:max-h-[600px] overflow-y-auto">
              <h3 className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98] px-2 pb-2 border-b border-[#1F2228] flex items-center gap-1.5 sticky top-0 bg-[#111318]"><FolderTree className="w-4 h-4" /> Discovered Site Architecture</h3>
              <div className="space-y-1">
                {CRAWLER_SNAPSHOT_TREE.map((node) => (
                  <button key={node.url} onClick={() => setSelectedNode(node as unknown as CrawlSnapshotNode)} className={`w-full text-left p-3 rounded-xl text-[13px] transition-colors flex items-center justify-between gap-2 min-h-[56px] ${selectedNode.url === node.url ? 'bg-white text-[#080A10] border border-white' : 'hover:bg-[#080A10] text-[#8A8F98] border border-transparent hover:border-[#1F2228]'}`}>
                    <div className="min-w-0 flex-1 text-left"><span className="font-semibold block truncate text-[13px]">{node.title}</span><span className="text-[11px] font-mono truncate block opacity-60">{node.url}</span></div>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold shrink-0 hidden sm:inline-flex border ${selectedNode.url===node.url ? 'bg-[#080A10] text-white border-[#080A10]' : 'bg-[#080A10] text-[#8A8F98] border-[#1F2228]'}`}>{node.category}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 rounded-2xl bg-[#111318] border border-[#1F2228] p-6 space-y-4 min-w-0">
              <div className="flex flex-col gap-3 border-b border-[#1F2228] pb-4">
                <div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-[#080A10] text-[#8A8F98] border border-[#1F2228]">{selectedNode.category}</span>
                  <h3 className="text-[15px] font-semibold text-white mt-2 leading-tight break-words">{selectedNode.title}</h3>
                  <a href={selectedNode.url} target="_blank" rel="noopener noreferrer" className="text-[13px] text-blue-400 hover:underline flex items-center gap-1 mt-1 break-all"><span className="break-all">{selectedNode.url}</span><ExternalLink className="w-3 h-3 shrink-0" /></a>
                </div>
                <span className="self-start text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">HTTP {selectedNode.httpStatus}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div className="p-3 bg-[#080A10] rounded-xl border border-[#1F2228]"><span className="text-[#8A8F98] block text-[11px] tracking-wide uppercase">Crawl Depth</span><span className="font-mono font-bold text-white text-sm">Level {selectedNode.depth}</span></div>
                <div className="p-3 bg-[#080A10] rounded-xl border border-[#1F2228]"><span className="text-[#8A8F98] block text-[11px] tracking-wide uppercase">Extracted Rules</span><span className="font-mono font-bold text-white text-sm">{selectedNode.extractedRulesCount} rules</span></div>
                <div className="p-3 bg-[#080A10] rounded-xl border border-[#1F2228] col-span-2 sm:col-span-1"><span className="text-[#8A8F98] block text-[11px] tracking-wide uppercase">Internal Links</span><span className="font-mono font-bold text-white text-sm">{selectedNode.internalLinksCount}</span></div>
                <div className="p-3 bg-[#080A10] rounded-xl border border-[#1F2228] col-span-2 sm:col-span-1"><span className="text-[#8A8F98] block text-[11px] tracking-wide uppercase">Content Hash</span><span className="font-mono text-xs text-[#8A8F98] break-all block mt-1">{selectedNode.contentHash}</span></div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#080A10] border border-[#1F2228] text-[13px] text-[#8A8F98] space-y-1"><span className="font-bold text-white block text-[11px] tracking-wide uppercase">Parent Discovery Origin:</span><span className="font-mono text-xs break-all block">{selectedNode.discoveredFrom}</span></div>
            </div>
          </div>
        )}

        {activeTab === 'verify' && (
          <div className="space-y-4 mt-8">
            <div className="p-4 rounded-xl bg-[#111318] border border-[#1F2228] text-[13px] text-[#8A8F98] leading-relaxed text-center"><strong className="text-white">Evidence-First Guarantee:</strong> We do not deploy autonomous AI extractions without deterministic review. Extracted candidates are verified side-by-side with original page quotes.</div>
            <div className="space-y-3">
              {verificationItems.map((item) => (
                <div key={item.id} className="p-5 rounded-2xl bg-[#111318] border border-[#1F2228] space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <span className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98] block">Original Source Quote</span>
                      <blockquote className="p-3 rounded-xl bg-[#080A10] border border-[#1F2228] text-white italic font-mono text-[13px] leading-relaxed break-words">"{item.sourceText}"</blockquote>
                      <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 break-all"><span className="break-all">{item.sourceUrl}</span><ExternalLink className="w-3 h-3 shrink-0" /></a>
                    </div>
                    <div className="p-3 rounded-xl bg-[#080A10] border border-[#1F2228] space-y-1">
                      <span className="text-[11px] tracking-[0.12em] uppercase font-medium text-[#8A8F98] block">Extracted Rule Candidate</span>
                      <h4 className="font-semibold text-white text-[13px]">{item.candidateRule}</h4>
                      <div className="p-2.5 rounded-xl bg-[#111318] font-mono text-emerald-400 border border-[#1F2228] text-xs">Normalized: {item.normalizedValue}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button onClick={() => handleAction(item.id, 'APPROVED & VERIFIED')} className="py-3 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"><Check className="w-4 h-4 shrink-0" />Approve</button>
                    <button onClick={() => handleAction(item.id, 'MARKED CONFLICTING')} className="py-3 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"><AlertTriangle className="w-4 h-4 shrink-0" />Conflicting</button>
                    <button onClick={() => handleAction(item.id, 'REJECTED')} className="py-3 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"><X className="w-4 h-4 shrink-0" />Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
