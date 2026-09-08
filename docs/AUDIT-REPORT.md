# PropFirmRules.io — Developer Audit Report (update.txt implementation)

## 1. What was inspected
- `README.md`, `package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.js`, `index.html`, `.env.example`
- `src/` (App router, 11 pages, 12 components, schema, calculator, crawler x4, pipeline x4, data x3)
- `tests/` (3 files, 13 tests), `scripts/`, `dist/`, crawl dumps (`fundednext`, `goatfundedtrader`, `saveweb2zip`, `all_prop_firm`, `json/`)
- Verified README claims vs implementation: README claimed real crawler / 100% success / complete tests — implementation contained `Math.random()` latency, fake `sha256_` hashes, hardcoded sublinks, 2 hardcoded conflicts.

## 2. What was broken
- Simulated crawler (`crawlerCLI.ts`): fake latency, fake hashes, hardcoded links, fixed `averageResponseTimeMs: 142`, always 0 failures.
- Disconnected sources: `propFirmsData.ts` (canonical 9 firms) vs `propFirmMatchReal.ts` vs `realFirmsForTable.json` used interchangeably; homepage used one dataset, compare used another.
- Fabricated fallbacks: `App.tsx` guessed `price: 499`, `website: https://<slug>.com`, `drawdown 4%/8%`, `CEO: <name> Leadership`; `PropFirmsListPage.tsx` cloned GFT accounts onto 20 directory firms.
- Hardcoded stats: Homepage `35 / 4 / Today`; conflicts limited to 2 hardcoded cases.
- Search: exact-match only, dead-end on no result, no intent parsing.
- Compare: ranked by price/split only, no evidence quality, claimed "Official" for unsourced cells.
- TS: `strict: false`, 5 existing type errors; missing scripts (`typecheck`, `validate:data`, `audit`); no runtime validation; no unknown/conflict states in UI.

## 3. What was fixed
- **Real crawler**: `fetch` + `AbortController` timeout, retries with exponential backoff, rate limiting, `robots.txt`, `sitemap.xml`, canonical URL, SHA-256 (`node:crypto`), content-type validation, HTML title/text/link extraction, redirect + status handling, error classification, metrics. `crawl:dry-run` supported. No `Math.random`, no fake hashes.
- **Canonical store** (`src/core/canonical/store.ts`): single ownership `Firm → Program → Account → Rule → Evidence → Snapshot`; `getFirmBySlug`, `getAccountById`, `getAllCanonicalAccounts`, `findDuplicateIds`, `getCanonicalStats` (derived, never hardcoded), `getTrustStateForRule`, `getDirectoryFirms` (metadata-only, `UNKNOWN`).
- **Validation** (`src/core/validation/validate.ts` + `scripts/validate-data.ts`): firms/accounts/rules/evidence/snapshots; percentages, URLs, dates, IDs, enums; fails build on invalid data.
- **Extraction** (`ruleExtractor.ts`): generic topic-grouped conflict detection with `SOURCE_PRIORITY` (terms > official > support > response > promo > review > report > inference), `extractRawStatements`, `buildReviewQueue`, `assignConfidence`. Removed 2-conflict cap.
- **Calculator** (`engine.ts`): added `describeAssumptions`, `toPublicEligibility` (`Eligible / Not eligible / Potentially eligible / Insufficient information / Blocked by missing evidence / Conflicting rules`), boundary-safe math preserved.
- **Search** (`core/search/search.ts` + modal): intent patterns (news, overnight, weekend, EA, copy, consistency, trailing, instant, payout, min-days, price/size), related-search alternatives on no result, never fabricates.
- **Compare** (`core/compare/compare.ts` + page): fit scoring by stated requirements, evidence quality, warnings, `AFFILIATE_DISCLOSURE`; unknown cells render "Unknown — under verification".
- **Filters** (`core/filters/filters.ts`): 4-state (`allowed/prohibited/conditional/unknown`) — `EA allowed` includes only explicitly verified `true`.
- **Trust UI** (`components/trust/TrustBadge.tsx`): `Verified / Partially verified / Needs review / Conflicting / Unknown / Outdated / Unavailable / Not applicable` + `VerificationWarning`.
- **Router** (`App.tsx`): query+hash preserved, anchor scroll, scroll restoration, directory-only firms render honest Unknown card (no fabricated rules/prices/websites).
- **Homepage**: stats bound to `getCanonicalStats()`; directory page no longer clones GFT tiers.
- **TS**: `strict: true`, `noImplicitReturns`, fixed all errors; `typecheck` passes.
- **Gates**: `typecheck`, `validate:data`, `validate:rules`, `crawl:dry-run`, `audit` scripts; `pipelineCLI verify` now also reports validation + duplicates + generic conflict scan.

## 4. Files changed
- `package.json` (scripts), `tsconfig.json` (strict), `src/App.tsx`, `src/pages/HomePage.tsx`, `src/pages/PropFirmsListPage.tsx`, `src/pages/ComparePage.tsx`, `src/components/search/GlobalSearchModal.tsx`, `src/components/rules/RuleCard.tsx`, `src/components/comparison/SameTradeVisual.tsx`, `src/core/calculator/engine.ts`, `src/core/crawler/crawlerCLI.ts`, `src/core/crawler/urlUtils.ts`, `src/core/pipeline/ruleExtractor.ts`, `src/core/pipeline/pipelineCLI.ts`, `tests/pipeline.test.ts`

## 5. Files added
- `src/core/canonical/store.ts`, `src/core/validation/validate.ts`, `src/core/search/search.ts`, `src/core/compare/compare.ts`, `src/core/filters/filters.ts`, `src/components/trust/TrustBadge.tsx`, `scripts/validate-data.ts`, `tests/calculator-edge.test.ts`, `tests/honesty.test.ts`, `docs/AUDIT-REPORT.md`

## 6. Files removed
- None deleted (per "confirm unused before delete"). Candidates isolated for future removal: `dist/` (build output, git-ignored), large screenshot PNGs, `*.txt` transcripts, `all_prop_firm/`, `json/`, `prop-firm-intelligence-platform/`, `saveweb2zip-com-*`, `fundednext.com-*`, `www.goatfundedtrader.com-*` dumps — all excluded from Vite watch and never imported by production code.

## 7. Data sources consolidated
- Canonical: `propFirmsData.ts` (9 firms, 110 rules) — sole source for rules/calculator/compare/search.
- Directory-only: `propFirmMatchReal.ts` / `realFirmsForTable.json` — third-party metadata (name, logo, rating, platforms), explicitly `UNKNOWN`, never merged into rule math.

## 8. How the crawler now works
`seed → sitemap.xml → queue(priority) → robots check → rate-limit → fetch(AbortController 15s) → content-type gate → title/text/links → SHA-256 → snapshot node → enqueue internal links (depth≤max) → retry 3x exp-backoff on 5xx/network → summary(crawled/failed/skipped/docs/jsNeeded/avgMs)`. Failures stored with error, never marked verified.

## 9. How evidence is stored
`SourceEvidence { id, sourceUrl, sourceTitle, sourceType, sourceExcerpt, retrievedAt, confidence A-E, verificationStatus }` attached per rule; `CrawlSnapshotNode { url, title, category, httpStatus, depth, contentHash, discoveredFrom, crawledAt }` per page. Inference-derived rules use `INFERENCE` + "clause-level citation pending".

## 10. How conflicts are handled
Group facts by normalized topic → if ≥2 distinct values → emit `RuleConflict` ordered by `SOURCE_PRIORITY`, show both sources + dates + difference + authoritative pick + "manual review required". Never silently merged.

## 11. How unknown values are handled
Explicit states everywhere; `Unknown`/`Not yet verified`/`Not publicly stated`/`Conflicting`/`Needs review`. Filters keep `unknown` separate; calculator returns `Insufficient information`/`Blocked by missing evidence`; directory firms show verification warning banner. No `false/0/allowed/verified` coercion.

## 12. How calculations were verified
Deterministic engine + 33 tests: static/trailing/EOD/intraday floors, cap-at-initial, floor-at-static, daily floor, profit target, splits, all-in cost, payout eligibility, consistency impact, exactly-at-limit / ±1¢, profit→loss, payout→loss, floating P&L, reset, high-water, zero/negative, missing/conflicting. Assumptions surfaced via `describeAssumptions`.

## 13. How search works
`searchAll(query)` → intent detection → canonical firm/rule/account scan + price (`under $X`) + size (`100k`) → dedupe → top 20. No hit → 4 related suggestions + "No verified results — unknown stays unknown".

## 14. How comparison works
`scoreAccountFit` per requirement (news/overnight/weekend/EA/price/consistency) + refundability + evidence quality; reasons + warnings per account; labels like "Best match for overnight swing trading (82/100)"; affiliate disclosure footer; factual ranking never influenced by monetization.

## 15. Tests added
- `calculator-edge.test.ts` (8): boundaries, caps, assumptions, eligibility mapping, payout blockers, all-in cost, consistency, zero-profit.
- `honesty.test.ts` (12): duplicates, validation, stats, unknown trust, domain allowlist, queue depth, fetch error classification, generic conflicts, review queue, no-result alternatives, EA-unknown filter, fit warnings.
- Updated `pipeline.test.ts` for authoritative-first ordering.

## 16. Test results
`5 files, 33 tests, all pass`. `tsc --noEmit` clean. `validate:data` PASSED (9 firms, 0 issues, 0 dups). `verify` reports 110 rules (35 verified 32%, 70 partial, 5 conflicting, 0 unsourced).

## 17. Build results
`vite build` succeeds: `index 816KB` (warning >600KB — see §18), CSS 159KB. `manualChunks { vendor, ui }` retained.

## 18. Remaining limitations
- Bundle 816KB single chunk — needs route-level `React.lazy` code-splitting + virtualized tables (not applied to avoid UI risk).
- Only Goat fully verified; 8 canonical firms are parameter-derived (`INFERENCE`, needs clause citations); 20 directory firms fully `UNKNOWN`.
- Crawler has no headless-JS rendering (notes `jsRenderedCount` heuristically); PDF/login-gated rules go to review queue.
- Freshness window 30 days — some `lastVerified` will flip to `OUTDATED` until recrawl cron is wired.
- No scheduled recrawl / persistence DB yet (snapshots in-memory per run).

## 19. Manual review still required
- Clause-level citations for 8 `INFERENCE` firms; resolve 3 generic conflicting topic groups + 5 `CONFLICTING` rules; verify directory firms' official domains (never guess); confirm payout/KYC/country lists; review `buildReviewQueue` ambiguous items.

## 20. Security / legal concerns
- No secrets in repo (`.env` ignored); crawler respects `robots.txt`, rate limits, identification UA; no affiliate influence on rankings (disclosed); no "safe/legitimate/guaranteed payout" claims; financial-risk disclaimers retained; trader allegations kept separate from official facts (`TRADER_REPORT` vs `OFFICIAL_*`).

---

## Addendum — Shark Funded (2026-09-06)
- **Source**: `shark_funded_crawling/` (32/32 help-center pages, exported 2026-09-06) + `https://sharkfunded.com/` homepage fetched 2026-09-06. No simulated data.
- **Firm**: `src/data/sharkFunded.ts` → 10th canonical firm (`shark-funded`), 7 programs (Lite 2-Step, Lite 1-Step, Prime 2-Step, Prime Instant, Lite Instant, Strike 1-Step Daily Payout, Instant Bolt Daily Payout), 22 clause-level rules each with verbatim `sourceExcerpt` + URL + `retrievedAt`, 3 recorded conflicts.
- **Logo**: user-supplied mark copied to `public/sharkfunded-logo.png`, referenced as `logoUrl`; `PropFirm.logoUrl?` added to schema.
- **Honesty**: only Lite 2-Step $100K price verified ($214/$356 SHARK30); other 6 tiers use new `priceUnknown` flag (schema) rendered as "Unknown" in Firm/Account/Compare/directory/search/wizard/calculator paths — never $0. EAs, copy trading, hedging, platforms, overnight holding and eval instrument lists are explicitly Unknown (conservative `false` + `shark-unknowns` rule). Prime 2-Step split unverified (noted in conditions). Homepage promo stats ($8.7M, 150K) labeled "as reported".
- **Conflicts recorded**: Lite 1-Step floor (6% vs "90%"), country coverage (115 vs 140 vs 170), split promo (100% vs 70–80%).
- **Results**: 41/41 tests pass (new `tests/shark.test.ts`, 8 tests), `validate:data` PASSED (10 firms, 0 issues), `verify` 135 rules / 57 verified / 0 unsourced, `vite build` succeeds.
