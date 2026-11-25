# Security Review — GERDSEN AI Website (gerdsen.ai)

**Last reviewed:** 2026-11-25 (UTC)

## Summary
Static GitHub Pages site behind Cloudflare. Pure client-side HTML/CSS/JS. No server-side code or user-generated content rendering. Production attack surface is minimal.

## Dependabot / Security Alerts
- **4 open Dependabot alerts** (all development scope, package-lock.json):
  - qs (multiple, medium/low): arrayLimit bypasses / stringify DoS (CVE-2025-15284, CVE-2026-2391, CVE-2026-8723). Fixed in 6.14.1+ / 6.15.2.
  - follow-redirects (medium): custom auth header leak on cross-domain redirects (CVE-2026-40895). Fixed in 1.16.0.
- No open code-scanning or secret-scanning alerts.
- **Risk:** Low for production. These are transitive from local-dev `http-server`. Production site does not execute Node.js code.
- **Action:** Merge existing Dependabot PR #12. Consider removing `http-server` if unused (local `serve-local.sh` / Python available).

## Live Status
- **https://gerdsen.ai/** → HTTP/2 200 (Cloudflare + GitHub Pages/Varnish). Site is up.
- **Security headers:** None observed on response (no HSTS, no CSP header, no X-Frame-Options, no nosniff, no Referrer-Policy, no Permissions-Policy, no COOP/CORP).
- **CSP meta tag:** Present (defense-in-depth) with sha256 for the inline class script, Google Fonts, Formspree.
- **Comparison:** https://grumman.ai returns full strong header set (HSTS preload, strict CSP with `require-trusted-types-for 'script'`, COOP, CORP, Permissions-Policy, nosniff, no-referrer).
- **https://status.gerdsen.ai** and **https://keepawake.gerdsen.ai** → no DNS / connection failed.

## Portal Connection Health
- `GerdsenAI/GerdsenAI-ShepherdMCP-Cloudflare-Portal` is an empty repository (GitHub returns 409 / no commits).
- No application code or health endpoints present.

## Keep-awake
- `GerdsenAI/GerdsenAI_KeepAwake` contains **only a LICENSE** file.
- No application code, no keep-alive service, no status surface.

## Code Review (every line of index.html + assets/js/main.js)
- Pure static site. No server-side rendering or user-controlled content injection points.
- Contact form posts to Formspree (`https://formspree.io/f/xeozyrwa`) via `fetch` with JSON body. No HTML injection, no `eval`, no `innerHTML` with untrusted data, no `document.write`.
- Inline script only adds `js` class (hashed in CSP). Particle canvas is local and safe.
- External resources limited to Google Fonts (allowed in CSP meta) and Formspree.
- Videos, images, CSS, JS are all self-hosted.
- No sensitive data, secrets, or credentials in source.
- Accessibility and reduced-motion handling present.

## Recommendations
1. **Configure Cloudflare zone headers** for gerdsen.ai (preferred over meta-only):
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
   - Tight `Content-Security-Policy` (matching or stricter than meta; allow only required origins + Formspree)
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin` or `no-referrer`
   - `Permissions-Policy` (restrict camera, mic, geolocation, etc.)
   - `Cross-Origin-Opener-Policy: same-origin`
   - `Cross-Origin-Resource-Policy: same-origin`
   - `X-Frame-Options: DENY` or CSP `frame-ancestors 'none'`
2. Merge Dependabot PR #12 and clear remaining alerts.
3. Consider self-hosting Google Fonts (or adding SRI) to tighten CSP further.
4. Portal and KeepAwake remain stubs — no connection health or keep-awake functionality to monitor.
5. Deployment hold from prior reviews remains in effect until headers are configured.

## Notes
Site is security-minded in source (minimal surface, CSP meta, no dynamic content). Primary remaining gap is production response headers on the Cloudflare zone.

---
*Reviewed against Grumman AI / Gerdsen security posture expectations.*
