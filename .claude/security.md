# Claude Code Security & Egress Policy

Based on `gstack-egress` hash-chained receipts and `gstack-context-bill`.

- Every external call produces a BLAKE3 hash receipt.
- Token costs audited per agent pipeline step.
- Anti-bot: ML classifier + stealth profiles (`sonpiaz/hidrix-tools`).
- Safe permissions only: no `dangerously-skip-permissions`.
- Work-tree isolation for multi-session agents.
- Browser agent uses isolated sidecar (`/browse`) with stealth.
