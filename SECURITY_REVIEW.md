# Security Review Findings - gerdsen.ai

**Date:** 2026-11-06  
**Scope:** Full line-by-line review of static site (index.html, assets/js/main.js, assets/css/main.css, config files, live headers).  
**Repos checked:** gerdsen-ai (public), GrummanAI-Orin-Camera-Lab, GerdsenAI-Fleet and others under GerdsenAI org.  
**Alerts:** No open code scanning alerts on public repo. Advanced Security not enabled on private GrummanAI repos. One open Dependabot PR (#12) for qs (transitive/unused in current package.json).

## Summary
The site is a clean, modern static marketing site with good accessibility (skip link, ARIA, reduced-motion support). No XSS vectors found in client JS. Contact form posts JSON to Formspree (https://formspree.io/f/xeozyrwa) without client-side rendering of user input. No secrets, no eval, no innerHTML of untrusted data.

No portal, keep-awake, connection-health, or live-status features exist on the public site or in searched code.

## Findings (security-minded)

### 1. Missing security headers (Medium)
Live response (Cloudflare → GitHub Pages) shows:
- `access-control-allow-origin: *` (overly permissive CORS)
- No Content-Security-Policy
- No X-Frame-Options / frame-ancestors
- No X-Content-Type-Options: nosniff
- No Referrer-Policy
- No Permissions-Policy

**Recommendation:** Add headers via Cloudflare dashboard (preferred) or a `_headers` / vercel.json equivalent if switching hosts. Example CSP starting point:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'self' https://formspree.io; frame-ancestors 'none';
```
Also set `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

### 2. Third-party Google Fonts (Low)
Fonts loaded from fonts.googleapis.com / fonts.gstatic.com without Subresource Integrity or self-hosting. Potential privacy leak and supply-chain risk.

**Recommendation:** Self-host the two font families (Courier Prime, IBM Plex Mono) under assets/fonts/ and update CSS `@font-face` rules. Or add SRI hashes if keeping external.

### 3. Formspree endpoint hard-coded (Informational)
Public Formspree form ID is visible. Expected for static forms. Ensure Formspree plan has spam protection / rate limits enabled and that submissions do not contain secrets.

### 4. Large binary assets in git (Informational)
Multiple large .mp4 / .webp files committed. Increases clone time and attack surface for supply-chain if repo is compromised, but not a direct vuln.

### 5. No portal / keep-awake / live status (Missing feature)
Requested checks for Grumman AI / Gerdsen security alerts, portal connection health, keep-awake, and live status found none on the public site.
- Code search across org returned zero matches for keep-awake, portal, connection health, live status.
- Live site has only a decorative green status-line pulse in the hero (CSS animation), not a real health check.

**Recommendation:** If a status/portal is desired, add a lightweight `/status` static page or external statuspage.io / Better Uptime integration, and a small JS poller for any internal health endpoints (never expose internal IPs or auth tokens client-side).

### 6. Dependabot PR #12
Open Dependabot update for qs 6.14.0 → 6.14.1. Review and merge if the dependency is still present; otherwise close and remove unused deps.

## Positive notes
- Good use of `defer` on script, passive event listeners, reduced-motion media queries.
- Form uses `preventDefault` + JSON fetch with proper error handling; status messages are static strings.
- Canonical, OG, Twitter cards, and JSON-LD are present and correctly escaped.
- No client-side storage of sensitive data.

## Next steps
1. Apply header hardening at the Cloudflare edge.
2. Self-host fonts.
3. Decide whether a public status/portal is in scope; if yes, implement separately with least-privilege design.
4. Enable Advanced Security / code scanning on private GrummanAI repos if not already done.

Review performed by automated security pass on 2026-11-06. All claims sourced from repository contents and live HTTP response.
