# Security Review — Gerdsen AI Website (gerdsen.ai)

**Date:** 2026-11-07  
**Scope:** Full review of `GerdsenAI/gerdsen-ai` (static GitHub Pages site), related Dependabot/code/secret scanning, portal/connection health, keep-awake, and live status features.  
**Reviewer:** Automated security pass (every line of tracked source reviewed).

## Summary
The site is a pure static HTML/CSS/JS GitHub Pages deployment. No server-side code, no secrets in the repository, and client-side JavaScript is clean (no dynamic HTML injection of user input). Production attack surface is minimal. Open Dependabot alerts exist only on development dependencies used by the local `http-server` preview.

No portal, live connection-health dashboard, keep-awake feature, or dynamic live status is present on the public site. The hero contains a static status line and decorative particle/video loops that pause on document visibility change (good for battery, opposite of keep-awake).

## Findings

### 1. Open Dependabot Alerts (dev-only)
- **qs** (multiple): arrayLimit bypasses / stringify TypeError — medium/low. Patched in later versions. See open PR #12.
- **follow-redirects**: custom auth headers leaked on cross-domain redirects — medium.

These appear in `package-lock.json` as transitive dependencies of the `http-server` devDependency. The production site does not run Node.js. **Impact: local development only.**

**Recommendation:** Merge PR #12, run `npm update` / regenerate lockfile, or explicitly document that these are accepted for the local preview. Re-enable Dependabot if desired for ongoing monitoring.

### 2. Contact Form (Formspree)
- Endpoint: `https://formspree.io/f/xeozyrwa` (public by design).
- Client-side only; no CAPTCHA or rate limiting in the page.
- Status messages are static strings; user input is never reflected into the DOM → no XSS.
- Formspree provides its own spam protection.

**Recommendation:** Monitor Formspree for abuse. Consider adding a simple honeypot field or relying on Formspree’s built-in protections. No code change required for security.

### 3. External Resources
- Google Fonts loaded via `fonts.googleapis.com` without Subresource Integrity (SRI).
- Minor privacy/tracking consideration.

**Recommendation:** Self-host the two font families (Courier Prime, IBM Plex Mono) under `assets/fonts/` for stronger privacy and offline resilience, or add SRI hashes if keeping the CDN.

### 4. Security Headers / CSP
GitHub Pages provides basic protections. No Content-Security-Policy is declared.

**Recommendation:** Add a meta CSP that locks down scripts/styles to self + the known Formspree and fonts origins, e.g.:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'self' https://formspree.io; form-action https://formspree.io;">
```

(Adjust if additional assets are introduced.)

### 5. Portal / Connection Health / Keep-Awake / Live Status
- No portal, dashboard, connection-health endpoint, keep-awake (Wake Lock / NoSleep), or live status feed exists in this repository.
- Related private repositories (`GerdsenAI-ShepherdMCP-Cloudflare-Portal`, `GerdsenAI-Local-AI-Suite`, `GerdsenAI-Fleet`, `GrummanAI-*`) are either empty, archived, or local-only and were not part of the public site surface.
- Particle animation correctly pauses on `visibilitychange` (battery-friendly).

**Recommendation:** If a public live status or portal link is desired, add it as an explicit, authenticated feature rather than embedding connection health in the marketing site. Keep any keep-awake logic behind a user gesture if ever needed.

### 6. Other Positive Notes
- No secrets or credentials committed.
- Code scanning and secret scanning: no open alerts.
- Workflow permissions are least-privilege (`contents: read`, `pages: write`, `id-token: write`).
- `vercel.json` correctly disables automatic Vercel deployments (primary host is GitHub Pages).
- Accessibility attributes (ARIA, skip link, reduced-motion handling) are present.

## Conclusion
The public site is in good security shape for a static marketing page. Primary actions are closing the low-impact Dependabot items and optionally hardening CSP / fonts. No critical or high-severity issues affecting production.

---
*Generated as part of a security-minded full-code review.*
