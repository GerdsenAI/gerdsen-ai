# Security Review – Gerdsen AI Website (gerdsen.ai)

**Date:** 2026-11-06  
**Reviewer:** Automated security pass (Grok / agent)  
**Scope:** Full line-by-line review of `index.html`, `assets/js/main.js`, package files, and live site.

## Summary
The site is a static GitHub Pages deployment. No server-side code, no secrets in the repository, contact form posts to Formspree (public endpoint). Overall posture is good for a marketing site.

## Findings

### Positive
- Contact form uses `fetch` with explicit JSON payload; no `innerHTML` on user data.
- No `eval`, `document.write`, or dangerous sinks.
- Formspree endpoint is the intended public form handler.
- No hard-coded secrets, API keys, or tokens in source.
- Accessibility attributes present (ARIA, labels).

### Dependabot / Dependency Alerts (development only)
Open alerts on `package-lock.json` (local `http-server` / fontawesome transitive deps):
- `qs` – multiple medium/low (arrayLimit bypass, stringify null crash). Existing PR #12 addresses one.
- `follow-redirects` – medium (custom auth header leak on redirect).

**Risk:** Low. These packages are only used by the local `npm run dev` server, not in production.  
**Recommendation:** Merge Dependabot PRs or run `npm update` and commit a fresh lockfile. Consider removing unused `@fortawesome/fontawesome-free` if not referenced.

### Hardening Applied in This PR
- Added Content-Security-Policy meta tag restricting sources to self + fonts + Formspree.
- `frame-ancestors 'none'`, `base-uri 'self'`.

### Recommendations
1. Merge or close the existing Dependabot PR #12 and keep lockfile current.
2. Consider adding a GitHub Actions workflow that fails on high/critical Dependabot alerts.
3. For the Research Chat portal (`GerdsenAI-Research-Chat`), numerous high-severity alerts exist for `undici` and `follow-redirects` in the frontend. Those should be prioritized separately.
4. No “keep-awake”, “connection health”, or live portal status widgets were found in this repository or on the public site. If those exist in private portals or other repos, please point to the specific path.

## Live Site Status
https://gerdsen.ai/ is reachable, static, no dynamic connection-health or keep-alive indicators observed.
