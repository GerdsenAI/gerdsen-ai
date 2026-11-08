# Security Review — gerdsen.ai

**Date:** 2026-11-08  
**Scope:** Static GitHub Pages site (`index.html`, `assets/js/main.js`, `assets/css/main.css`, package.json/lockfile, workflow).  
**Reviewer:** Automated security pass (every line of application code + dependency surface).

## Summary

The live site (https://gerdsen.ai) is a pure static site with no server-side runtime. Attack surface is small: client-side JS, a contact form that posts to Formspree, external fonts, and video/image assets.

**Live status:** Site is reachable and serving content.  
**Portal connection health / Keep-Awake / live status widgets:** No such features exist in this repository or on the live site. `GerdsenAI_KeepAwake` and `GerdsenAI-ShepherdMCP-Cloudflare-Portal` are empty or stub repos. No dynamic status, health checks, or portal links are present.

## Findings

### 1. Missing security headers (High — user-facing)
SecurityHeaders.com scores the site **F**. Missing:
- Strict-Transport-Security (HSTS)
- Content-Security-Policy (CSP)
- X-Frame-Options / frame-ancestors
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

GitHub Pages does not allow arbitrary response headers on the default domain. With a custom domain, these can be set via Cloudflare (recommended) or a reverse proxy. Meta tags can partially mitigate some (e.g. referrer, CSP report-only), but real headers are preferred.

**Recommendation:** Put Cloudflare in front of the custom domain and add a strict CSP + HSTS + other headers. Document the policy here once live.

### 2. Open Dependabot alerts (dev-only, Medium/Low)
Four open alerts (see PR #12 comment for details):
- `qs` (multiple DoS / arrayLimit issues)
- `follow-redirects` (custom auth header leak on redirect)

All are transitive via the `http-server` **devDependency**. They are not present in the production static assets.

**Recommendation:** Update lockfile / bump http-server after merging #12 so alerts clear. Optional: add `.github/dependabot.yml`.

### 3. Contact form (Low)
- Posts JSON to Formspree (`https://formspree.io/f/xeozyrwa`).
- No client-side validation beyond HTML5 required attributes.
- Formspree handles the endpoint; ensure the Formspree project has spam protection / rate limiting enabled.
- No secrets or sensitive data collected beyond name/email/company/project/message.

### 4. Client-side JavaScript (Low / Informational)
`assets/js/main.js`:
- No `eval`, `innerHTML` with untrusted data, or dynamic script loading.
- Particle canvas and IntersectionObserver are safe.
- Mobile nav and smooth scroll are straightforward.
- Form handler uses `fetch` with explicit JSON; error path is generic.

No XSS sinks identified in the reviewed code.

### 5. External resources
- Google Fonts (preconnect + stylesheet). Consider self-hosting or adding `font-display` / SRI if CSP is added.
- Video and image assets are first-party.

### 6. Workflow / Deployment
`.github/workflows/jekyll-gh-pages.yml` uses official GitHub Pages actions with least-privilege permissions (`contents: read`, `pages: write`, `id-token: write`). Good.

## Positive notes
- Static architecture minimizes attack surface.
- No secrets in the repository (confirmed via secret scanning).
- No code scanning alerts.
- Copyright year is dynamic.
- Skip link and basic ARIA present.

## Next steps
1. Merge or close Dependabot PR #12 and clear remaining dev alerts.
2. Add Cloudflare (or equivalent) and security headers for the custom domain.
3. Consider a short CSP meta tag as an interim measure.
4. If portal / keep-awake / live status features are planned, open a dedicated issue with threat model first.

---
*This document is the output of a full-line security review requested for the security-minded Gerdsen AI site.*
