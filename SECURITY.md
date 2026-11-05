# Security Review — gerdsen.ai (2026-11-05)

## Scope
Full line-by-line review of the static marketing site (`index.html`, `assets/js/main.js`, `assets/css/main.css`, configs, workflow).

## Positive findings
- Fully static; no server-side execution or user-controlled rendering.
- Self-hosted media, JS, and CSS.
- No dangerous sinks (`eval`, `innerHTML` with untrusted data, `document.write`).
- Contact form uses `fetch` + JSON to Formspree with basic error handling.
- Good accessibility practices (ARIA, skip link, reduced-motion support).
- Cloudflare in front of GitHub Pages.

## Findings & recommendations
1. **Missing Content-Security-Policy**
   - No CSP header or meta tag.
   - Allows unrestricted external resources (Google Fonts, Formspree).
   - **Action**: Added meta CSP in `index.html` (this PR). Recommend also setting via Cloudflare Transform Rules or `_headers` if hosting allows.

2. **External Google Fonts**
   - Privacy and supply-chain risk.
   - **Recommendation**: Self-host Courier Prime / IBM Plex Mono or switch to system mono stack.

3. **Limited security headers on public site**
   - Observed response (Cloudflare + GH Pages): no CSP, no HSTS, no X-Frame-Options, no X-Content-Type-Options, `access-control-allow-origin: *`.
   - Portal (`portal.gerdsen.ai`) correctly returns 401 with Access and has X-Frame-Options / Referrer-Policy.
   - **Recommendation**: Configure Cloudflare security headers (HSTS, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy).

4. **Third-party form handler (Formspree)**
   - Contact data leaves the origin.
   - Standard for static sites; document in a privacy notice if volume grows.

5. **Unused dependency**
   - `@fortawesome/fontawesome-free` in `package.json` is not referenced in the live HTML.

## Live status (unauthenticated)
- `https://gerdsen.ai/` → 200
- `https://portal.gerdsen.ai/` → 401 (Cloudflare Access active — expected)

## Portal / Grumman
P0 security issue #434 (eMudhra trust-path remediation) remains open in `GerdsenAI-Local`. No keep-awake or live-status UI was reachable without credentials. Connection health of the Access layer is good.

Prepared only. No production deployment or TLS changes performed.
