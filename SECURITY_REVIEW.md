# Security Review — Gerdsen AI Website (gerdsen.ai)

**Date:** 2026-11-05  
**Reviewer:** Grok / GerdsenAI-Admin  
**Scope:** Full line-by-line review of `index.html`, `assets/js/main.js`, workflows, package files, live site headers, Dependabot alerts. Focus on security posture, portal connection health, keep-awake, and live status indicators.

## Summary
The site is a clean static GitHub Pages deployment. No high-severity issues in application code. Several hardening gaps and missing operational status features noted. Dependabot alerts exist only on development dependencies and do not affect production.

## Live Site Observations
- Served via GitHub Pages + Cloudflare.
- **Missing security headers:** No `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, or `Strict-Transport-Security` (beyond Cloudflare defaults).
- `Access-Control-Allow-Origin: *` is present (broad).
- Cloudflare Insights beacon loaded (`beacon.min.js`).
- Contact form posts to Formspree (`https://formspree.io/f/xeozyrwa`) via JSON from `main.js` — good isolation, no client-side secrets.

## Code Review Findings

### `assets/js/main.js` (reviewed line-by-line)
- Clean: no `eval`, no `innerHTML` with untrusted data, proper event handling, passive listeners, reduced-motion support.
- Form submission: `preventDefault`, FormData extraction, fetch with Accept/JSON headers, error handling, button state management. Safe.
- Particles / header / nav: pure client-side, no external data fetches except form.
- **Recommendation:** Add SRI hashes if any external scripts are introduced.

### `index.html`
- Static content, structured data (JSON-LD) is safe.
- Status line is static: `<p class="status-line"><span aria-hidden="true"></span> Full-stack AI · Lafayette, LA</p>` — **no live portal / keep-awake / connection health indicator**.
- Form has proper labels, required fields, autocomplete. No CAPTCHA (Formspree may rate-limit server-side).
- External Google Fonts loaded without SRI.
- Hero / brand videos are local assets — good.

### Dependencies (`package.json` / `package-lock.json`)
- Dev-only `http-server` and Font Awesome.
- **Open Dependabot alerts (all development scope):**
  - `qs` (medium): GHSA-q8mj-m7cp-5q26 / CVE-2026-8723 — DoS in stringify with null arrays.
  - `follow-redirects` (medium): GHSA-r4q5-vmmm-2653 / CVE-2026-40895 — custom auth header leak on cross-domain redirect.
  - Additional low/medium `qs` arrayLimit bypasses.
- These do not affect the static production site. Update lockfile or remove unused deps if not needed for local preview.

### Workflows
- `jekyll-gh-pages.yml`: Standard GitHub Pages deploy. Permissions are scoped (contents:read, pages:write, id-token:write). Good.
- `vercel.json` disables auto-deploy (site is Pages-first). Fine.

## Portal / Keep-Awake / Live Status
- **Public site:** No live status for portal connection health, keep-awake state, or related indicators. Hero status line is decorative only.
- Related private repos:
  - `GerdsenAI-ShepherdMCP-Cloudflare-Portal` — empty repository.
  - `GerdsenAI_KeepAwake` — contains only LICENSE.
  - GrummanAI-* repos: Dependabot/code scanning not enabled or no open alerts accessible.
- **Recommendation:** If operational status is desired on the public site, implement a read-only, CORS-safe endpoint (or static badge) that reports non-sensitive health (e.g., "Portal: reachable", "Keep-awake: active") without leaking internal details. Add corresponding CSP `connect-src`.

## Recommendations (prioritized)
1. **Headers:** Configure Cloudflare or Pages to emit CSP (start with `default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:;`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.
2. **SRI:** Add integrity attributes for any third-party scripts/fonts if retained.
3. **Dependabot:** Update or prune dev dependencies; consider enabling Dependabot security updates.
4. **Status surface:** Add a small, privacy-preserving live status component if portal/keep-awake visibility is required.
5. **Form:** Consider Formspree honeypot or CAPTCHA if spam becomes an issue.
6. **Monitoring:** Enable GitHub Advanced Security / code scanning on private Grumman and portal repos where appropriate.

## Conclusion
No critical vulnerabilities in the reviewed code. Site is appropriately static and low-attack-surface. Primary gaps are missing security headers and the absence of the requested live operational status indicators. Findings are ready for triage.

---
*Generated as part of a security-minded full review. All claims sourced from repository contents, live headers, and Dependabot data as of 2026-11-05.*
