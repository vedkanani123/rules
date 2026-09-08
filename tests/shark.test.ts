import { describe, it, expect } from 'vitest';
import { SHARK_FUNDED } from '../src/data/sharkFunded.ts';
import { PROP_FIRMS_DATA } from '../src/data/propFirmsData.ts';
import { validateFirm } from '../src/core/validation/validate.ts';
import { findDuplicateIds } from '../src/core/canonical/store.ts';
import { displayPrice } from '../src/core/canonical/store.ts';

describe('Shark Funded dossier', () => {
  it('is registered as canonical firm with 7 programs', () => {
    const f = PROP_FIRMS_DATA.find((x) => x.slug === 'shark-funded');
    expect(f).toBeTruthy();
    expect(f!.programs.length).toBe(7);
    expect(f!.website).toBe('https://sharkfunded.com/');
  });

  it('passes runtime validation with zero issues', () => {
    expect(validateFirm(SHARK_FUNDED)).toEqual([]);
  });

  it('introduces no duplicate canonical IDs', () => {
    expect(findDuplicateIds()).toEqual([]);
  });

  it('every rule carries verbatim evidence with valid URL and date', () => {
    expect(SHARK_FUNDED.rules.length).toBeGreaterThanOrEqual(15);
    for (const r of SHARK_FUNDED.rules) {
      expect(r.sources.length).toBeGreaterThan(0);
      for (const s of r.sources) {
        expect(s.sourceUrl).toMatch(/^https:\/\//);
        expect(s.sourceExcerpt.length).toBeGreaterThan(20);
        expect(Date.parse(s.retrievedAt)).not.toBeNaN();
      }
      expect(Date.parse(r.lastVerified)).not.toBeNaN();
    }
  });

  it('marks unverified prices Unknown and never $0-displayable', () => {
    const unknownTiers = SHARK_FUNDED.programs.flatMap((p) => p.accounts).filter((a) => a.priceUnknown);
    expect(unknownTiers.length).toBe(6); // all except Lite 2-Step $100K
    for (const a of unknownTiers) expect(displayPrice(a)).toBe('Unknown');
    const verified = SHARK_FUNDED.programs.flatMap((p) => p.accounts).find((a) => !a.priceUnknown)!;
    expect(displayPrice(verified)).toBe('$214');
  });

  it('flags the Lite 1-Step floor contradiction as conflicting evidence', () => {
    const c = SHARK_FUNDED.conflicts.find((x) => x.id === 'conflict-shark-lite1-floor');
    expect(c).toBeTruthy();
    const rule = SHARK_FUNDED.rules.find((r) => r.id === 'shark-max-lite1-conflict')!;
    expect(rule.sources.some((s) => s.verificationStatus === 'CONFLICTING')).toBe(true);
  });

  it('covers all 7 evaluations with distinct risk numbers', () => {
    const slugs = new Set(SHARK_FUNDED.programs.map((p) => p.slug));
    expect(slugs.size).toBe(7);
    // every program has at least one scoped rule
    for (const p of SHARK_FUNDED.programs) {
      const scoped = SHARK_FUNDED.rules.filter((r) => !r.accountModelScope || r.accountModelScope.includes(p.slug));
      expect(scoped.length).toBeGreaterThan(0);
    }
  });

  it('contains no fabrication markers', () => {
    const dump = JSON.stringify(SHARK_FUNDED);
    expect(dump).not.toMatch(/499/);
    expect(dump).not.toMatch(/lorem|TODO|FIXME/i);
  });
});
