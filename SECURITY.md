# Security Review

Last reviewed: 2026-11-07

This is a static marketing site. Production serves static assets only (GitHub Pages + Cloudflare). No server-side code executes in production.

## Live Status

- Site is operational (HTTP 200 at https://gerdsen.ai/).
- Status line in hero is static cosmetic text + CSS pulse animation. No dynamic health check or live status API.

## Portal / Keep-Awake

- No portal connection health monitoring implemented on this site.
- Related private repos (ShepherdMCP-Cloudflare-Portal, KeepAwake) are empty or contain only LICENSE.

## Code Review Summary (every line of index.html + assets/js/main.js)

### Strengths
- Pure static HTML/CSS/JS. Contact form submits via JSON to Formspree; form data is never rendered back into the DOM (no XSS).
- No secrets, credentials, or sensitive data in repository.
- Local media assets only.
- Good accessibility practices (ARIA, skip link, reduced motion).

### Findings

#### 1. Missing Response Security Headers (live site)
Observed headers lack:
- Content-Security-Policy
- X-Frame-Options (or frame-ancestors)
- X-Content-Type-Options: nosniff
- Referrer-Policy
- Permissions-Policy

GitHub Pages does not allow custom response headers. Mitigate via Cloudflare Transform Rules (preferred) or meta tags where partial coverage is acceptable.

#### 2. Dependabot Alerts (devDependencies only)
Open alerts for `qs` (DoS / arrayLimit bypasses) and `follow-redirects` (auth header leakage on cross-domain redirects). These are pulled in by the `http-server` devDependency used only for local preview (`npm run dev`). Production does not execute them.

See open Dependabot PR #12. Update to latest patched versions and regenerate lockfile.

#### 3. External Fonts
Google Fonts loaded without Subresource Integrity. Consider self-hosting the font files for privacy and supply-chain control.

#### 4. Third-Party Form Endpoint
Formspree (`https://formspree.io/f/xeozyrwa`) receives name, email, company, project type, and message. Confirm this matches data classification policy.

## Recommendations
1. Configure security headers in Cloudflare.
2. Merge and extend Dependabot updates for `qs` / `follow-redirects`.
3. Self-host fonts or add SRI.
4. Keep this file updated after future reviews.

No critical production runtime vulnerabilities identified.