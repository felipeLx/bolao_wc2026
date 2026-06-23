# Bolao 2026 — World Cup Betting Pool

## What This Is

World Cup 2026 betting pool web app for friends. Static site + Cloudflare Pages Functions. No database — all state is JSON committed to GitHub via API.

## Tech Stack

- Vanilla JS frontend (no framework, no build step)
- Cloudflare Pages Functions (serverless backend)
- GitHub Contents API for persistence (every save = git commit)
- Entry fee: R$100

## Structure

```
index.html, app.js, style.css     — frontend
functions/api/                     — serverless endpoints
  data.js, join.js, payments.js,
  predictions.js, results.js,
  sync-results.js, _lib.js        — shared GitHub read/write helpers
data/
  matches.json                     — 104 matches
  pools.json                       — participants + predictions
  results.json                     — official scores (admin-only)
  config.json                      — admin emails
tools/convert_schedule.py          — knockout bracket converter
```

## Key Architecture Decisions

- `GITHUB_TOKEN` server-side only (Cloudflare secret)
- Every save = git commit tagged `[CI Skip]` — auditable history, no cheating
- Match-lock: can't bet after kickoff (server clock enforced)
- No passwords — friends identify by name+email, git history exposes tampering
- Concurrent write retry (4x) via `mutateJson` in `_lib.js`

## Scoring

- Exact score: 10 pts
- Winner/draw + goal difference: 7 pts
- Winner/draw only: 5 pts

## Rules

1. Keep it simple — no frameworks, no build tools, friends need to use it
2. Security through transparency (git history), not complexity
3. `app.js` has configurable `POINTS` and `ENTRY_FEE` constants
