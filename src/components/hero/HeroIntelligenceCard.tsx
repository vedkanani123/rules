import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calculator,
  FileText,
  Search,
  Shield,
} from 'lucide-react';
import { PROP_FIRMS_DATA } from '../../data/propFirmsData.ts';
import { AccountTier, PropFirm } from '../../types/schema.ts';

const FLOW_STEPS = [
  { icon: FileText, label: 'Official Source' },
  { icon: Search, label: 'Rule Found' },
  { icon: Calculator, label: '$ Calculation' },
  { icon: Shield, label: 'Risk' },
] as const;

type Tone = 'emerald' | 'amber' | 'sky';

interface RuleRow {
  label: string;
  value: string;
  sub: string;
  status: string;
  tone: Tone;
}

function hostFromWebsite(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
}

function pickAccount(firm: PropFirm): { program: PropFirm['programs'][number]; account: AccountTier } | null {
  for (const program of firm.programs) {
    const hundred = program.accounts.find((a) => a.nominalSize === 100000);
    if (hundred) return { program, account: hundred };
    if (program.accounts[0]) return { program, account: program.accounts[0] };
  }
  return null;
}

function dollars(size: number, pct: number): string {
  return `$${Math.round((size * pct) / 100).toLocaleString()}`;
}

function drawdownLabel(type: AccountTier['drawdownType']): string {
  if (type === 'static') return 'Static floor';
  if (type === 'trailing_equity' || type === 'trailing_balance') return 'Trailing';
  if (type === 'end_of_day') return 'End of day';
  return 'Intraday';
}

function newsFrom(firm: PropFirm, account: AccountTier): RuleRow {
  const buried = firm.rules.some((rule) => /news|buffer|red.?folder/i.test(`${rule.slug} ${rule.name}`));
  if (account.newsTradingRule === 'Prohibited') {
    return { label: 'News Trading', value: 'Prohibited', sub: 'No event trades', status: 'Watch', tone: 'amber' };
  }
  if (account.newsTradingRule === 'Restricted' || buried) {
    return { label: 'News Trading', value: 'Conditional', sub: '2-min buffer', status: 'Watch', tone: 'amber' };
  }
  return { label: 'News Trading', value: 'Allowed', sub: 'Policy cited', status: 'Verified', tone: 'emerald' };
}

function extraPool(firm: PropFirm, account: AccountTier): RuleRow[] {
  const pool: RuleRow[] = [newsFrom(firm, account)];

  const days = account.minimumTradingDays;
  const daysFromCopy = account.firstPayoutConditions.match(/(\d+)\s+[a-z ]{0,28}days/i);
  const payoutDays = days > 0 ? days : daysFromCopy ? Number(daysFromCopy[1]) : 0;
  const freq = account.payoutFrequency.split('(')[0].trim();
  pool.push({
    label: 'Payout',
    value: freq.length > 12 ? 'Rule-based' : freq || 'Rule-based',
    sub: payoutDays > 0 ? `${payoutDays} days + profit` : 'Profit unlock',
    status: 'Verified',
    tone: 'sky',
  });

  pool.push({
    label: 'Profit Split',
    value: `${account.profitSplit}%`,
    sub: account.profitSplitMaxWithAddon ? `up to ${account.profitSplitMaxWithAddon}%` : 'Trader share',
    status: 'Verified',
    tone: 'emerald',
  });

  pool.push({
    label: 'Weekend Hold',
    value: account.weekendHolding ? 'Allowed' : 'Restricted',
    sub: account.weekendHolding ? 'Positions can stay' : 'Close before weekend',
    status: account.weekendHolding ? 'Verified' : 'Watch',
    tone: account.weekendHolding ? 'emerald' : 'amber',
  });

  pool.push({
    label: 'Inactivity',
    value: `${account.inactivityLimitDays}d`,
    sub: 'Account lockout window',
    status: account.inactivityLimitDays <= 30 ? 'Watch' : 'Verified',
    tone: account.inactivityLimitDays <= 30 ? 'amber' : 'sky',
  });

  pool.push({
    label: 'Copy Trading',
    value: account.copyTradingAllowed ? 'Allowed' : 'Prohibited',
    sub: account.copyTradingAllowed ? 'Signals permitted' : 'Cluster risk',
    status: account.copyTradingAllowed ? 'Verified' : 'Watch',
    tone: account.copyTradingAllowed ? 'emerald' : 'amber',
  });

  if (account.consistencyRule && account.consistencyRule !== 'None') {
    pool.push({
      label: 'Consistency',
      value: 'Applies',
      sub: account.consistencyRule.slice(0, 22),
      status: 'Watch',
      tone: 'amber',
    });
  }

  pool.push({
    label: 'EAs / Bots',
    value: account.eaAllowed ? 'Allowed' : 'Restricted',
    sub: account.eaAllowed ? 'Automation ok' : 'Manual only',
    status: 'Verified',
    tone: account.eaAllowed ? 'emerald' : 'amber',
  });

  return pool;
}

function buildRows(firm: PropFirm, account: AccountTier, variant: number): RuleRow[] {
  const daily: RuleRow = {
    label: 'Daily Drawdown',
    value: `${account.dailyLossLimit}%`,
    sub: dollars(account.nominalSize, account.dailyLossLimit),
    status: 'Verified',
    tone: 'emerald',
  };
  const maxLoss: RuleRow = {
    label: 'Max Drawdown',
    value: `${account.maxTotalLoss}%`,
    sub: `${dollars(account.nominalSize, account.maxTotalLoss)} · ${drawdownLabel(account.drawdownType)}`,
    status: 'Verified',
    tone: 'emerald',
  };

  const extras = extraPool(firm, account);
  const seen = new Set(['Daily Drawdown', 'Max Drawdown']);
  const unique = extras.filter((row) => {
    if (seen.has(row.label)) return false;
    seen.add(row.label);
    return true;
  });

  const offset = (variant * 2) % Math.max(1, unique.length);
  const picked = [unique[offset], unique[(offset + 1) % unique.length]].filter(Boolean) as RuleRow[];

  return [daily, maxLoss, ...picked].slice(0, 4);
}

interface HeroIntelligenceCardProps {
  onOpenFirm: (slug: string) => void;
}

export const HeroIntelligenceCard: React.FC<HeroIntelligenceCardProps> = ({ onOpenFirm }) => {
  const roster = useMemo(
    () => PROP_FIRMS_DATA.filter((firm) => pickAccount(firm)).slice(0, 6),
    []
  );

  const [firmIdx, setFirmIdx] = useState(0);
  const [variant, setVariant] = useState(0);
  const [rowIdx, setRowIdx] = useState(0);
  const [flowIdx, setFlowIdx] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [swap, setSwap] = useState(true);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(media.matches);
    const onChange = () => setReduceMotion(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion || roster.length === 0) return undefined;

    const firmTimer = window.setInterval(() => {
      setSwap(false);
      window.setTimeout(() => {
        setFirmIdx((i) => (i + 1) % roster.length);
        setVariant(0);
        setRowIdx(0);
        setSwap(true);
      }, 180);
    }, 6400);

    const variantTimer = window.setInterval(() => {
      setVariant((v) => v + 1);
      setRowIdx(0);
    }, 3200);

    const rowTimer = window.setInterval(() => setRowIdx((i) => (i + 1) % 4), 800);
    const flowTimer = window.setInterval(() => setFlowIdx((i) => (i + 1) % FLOW_STEPS.length), 900);

    return () => {
      window.clearInterval(firmTimer);
      window.clearInterval(variantTimer);
      window.clearInterval(rowTimer);
      window.clearInterval(flowTimer);
    };
  }, [reduceMotion, roster.length]);

  const firm = roster[firmIdx] ?? roster[0];
  if (!firm) return null;

  const picked = pickAccount(firm);
  if (!picked) return null;

  const { program, account } = picked;
  const sizeLabel = `$${(account.nominalSize / 1000).toFixed(0)}K`;
  const easyCount = firm.rules.filter((r) => r.isEasyToMiss).length;
  const host = hostFromWebsite(firm.website);
  const rows = buildRows(firm, account, variant);

  return (
    <div className="relative">
      <div className="hidden sm:flex items-center justify-between gap-3 mb-2.5 px-0.5">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111318] border border-amber-500/20 text-[10px] font-mono text-amber-300/90">
          <AlertTriangle className="w-3 h-3" />
          {easyCount > 0 ? `${easyCount} easy-to-miss` : 'Watch conditions'}
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111318] border border-emerald-500/20 text-[10px] font-mono text-emerald-300/90">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-emerald-400 hero-pulse-ring" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Verified · {host}
        </span>
      </div>

      <div
        className="overflow-hidden mb-3 hidden sm:block"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div className="hero-crawl-track flex w-[200%] gap-6 text-[10px] font-mono uppercase tracking-[0.14em] text-white/25 whitespace-nowrap">
          {[...roster, ...roster].map((item, i) => (
            <span key={`${item.id}-${i}`} className={item.id === firm.id ? 'text-white/55' : ''}>
              {item.name}
              <span className="mx-3 text-white/15">·</span>
              verified
              <span className="mx-3 text-white/15">·</span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-[#0E0F14] border border-[#1E232B] shadow-[0_20px_60px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.02)_inset]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '22px 22px',
          }}
        />
        <div className="pointer-events-none absolute -top-20 right-6 w-[360px] h-[180px] rounded-full bg-[#2563eb]/[0.08] blur-2xl" />

        <div className="relative flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-emerald-500/12 border border-emerald-500/20 flex items-center justify-center">
              <Search className="w-3.5 h-3.5 text-emerald-400" />
            </span>
            <div>
              <div className="text-[11px] font-mono tracking-[0.18em] uppercase text-white/85 font-semibold leading-none">
                Prop Firm Intelligence
              </div>
              <div className="text-[11px] font-mono text-white/30 leading-none mt-1">
                Evidence instrument · Source-backed
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-emerald-400 hero-pulse-ring" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-400">Verified</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenFirm(firm.slug)}
          className={`relative w-full px-4 sm:px-5 py-3 flex items-center justify-between text-left hover:bg-white/[0.02] transition-opacity duration-300 ${swap ? 'opacity-100' : 'opacity-40'}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-[#1c202d] to-[#10121a] border border-[#2b3244] flex items-center justify-center overflow-hidden shrink-0 p-0.5">
              <img
                src={(firm as any).logoUrl || firm.countryFlag}
                alt=""
                className="w-full h-full object-contain"
                onError={(event) => {
                  (event.currentTarget as HTMLImageElement).src = firm.countryFlag;
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-white leading-none truncate">{firm.name}</div>
              <div className="text-[11px] font-mono text-white/35 truncate">
                {host} · official sources
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#111318] border border-[#1F2228] text-[11px] font-mono font-medium text-white/80">
              {sizeLabel} · {program.programType}
            </span>
            <span className="text-[10px] font-mono tracking-widest uppercase text-white/25">Account model</span>
          </div>
        </button>

        <div className={`relative mx-3 sm:mx-4 rounded-xl overflow-hidden border border-white/[0.06] bg-[#080A10] transition-opacity duration-300 ${swap ? 'opacity-100' : 'opacity-40'}`}>
          {rows.map((row, index) => {
            const isActive = rowIdx === index;
            return (
              <div
                key={`${firm.id}-${variant}-${row.label}`}
                className={`flex items-center justify-between px-3 sm:px-4 py-[11px] border-b last:border-b-0 border-white/[0.04] transition-all duration-500 ${
                  isActive ? 'bg-white/[0.045]' : 'bg-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 transition-transform duration-500 ${
                      row.tone === 'emerald'
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                        : row.tone === 'amber'
                          ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.45)]'
                          : 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                    } ${isActive ? 'scale-125' : 'scale-100'}`}
                  />
                  <span className="text-[11px] font-mono tracking-wide uppercase text-white/55 truncate">{row.label}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-mono font-medium text-white leading-none">{row.value}</div>
                    <div className="text-[10px] font-mono text-white/30 leading-none mt-1 max-w-[140px] truncate">{row.sub}</div>
                  </div>
                  <div className="sm:hidden text-xs font-mono font-medium text-white">{row.value}</div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono font-semibold tracking-widest uppercase border ${
                      row.tone === 'emerald'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : row.tone === 'amber'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          : 'bg-sky-500/10 text-sky-300 border-sky-500/20'
                    }`}
                  >
                    <span
                      className={`w-1 h-1 rounded-full ${
                        row.tone === 'emerald' ? 'bg-emerald-400' : row.tone === 'amber' ? 'bg-amber-400' : 'bg-sky-400'
                      }`}
                    />
                    {row.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative px-4 sm:px-5 py-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono tracking-[0.16em] uppercase text-white/25">Evidence flow</span>
            <span className="text-[10px] font-mono text-white/20">Source → meaning</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {FLOW_STEPS.map((step, i) => {
              const isOn = flowIdx === i;
              return (
                <React.Fragment key={step.label}>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-mono transition-all duration-500 ${
                      isOn
                        ? 'bg-emerald-500/12 border-emerald-500/30 text-emerald-200 shadow-[0_0_16px_rgba(16,185,129,0.12)]'
                        : 'bg-[#111318] border-white/[0.06] text-white/55'
                    }`}
                  >
                    <step.icon className={`w-3 h-3 ${isOn ? 'text-emerald-300' : 'text-white/40'}`} />
                    {step.label}
                  </span>
                  {i < FLOW_STEPS.length - 1 && (
                    <span className={`text-[11px] transition-colors duration-500 ${flowIdx > i ? 'text-emerald-400/70' : 'text-white/15'}`}>
                      →
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div className="mt-3 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>

        <div className="relative flex items-center justify-between px-4 sm:px-5 py-3 border-t border-white/[0.06] bg-white/[0.02]">
          <span className="inline-flex items-center gap-2 text-[11px] font-mono text-white/60">
            {easyCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold">
                <AlertTriangle className="w-3 h-3" /> {easyCount} Easy-to-Miss
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/50 text-[11px] font-semibold">
                Conditions cited
              </span>
            )}
            <span className="hidden sm:inline text-white/30">· account-specific</span>
          </span>
          <span className="text-[11px] font-mono text-white/30 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Last verified today
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        {roster.map((item, i) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Show ${item.name}`}
            onClick={() => {
              setFirmIdx(i);
              setVariant(0);
              setRowIdx(0);
              setSwap(true);
            }}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === firmIdx ? 'w-5 bg-emerald-400' : 'w-1.5 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
      <p className="mt-2 text-center text-[11px] font-mono text-white/25">
        {firm.name} — {sizeLabel} · {program.name} · {account.dailyLossLimit}% daily · {account.maxTotalLoss}% max
      </p>
    </div>
  );
};
