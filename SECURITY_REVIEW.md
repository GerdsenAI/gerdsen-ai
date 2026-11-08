# Security Review: gerdsen.ai (GerdsenAI/gerdsen-ai)

**Date:** 2026-11-08  
**Scope:** Full line-by-line review of static site (index.html, assets/js/main.js, assets/css/main.css, config files, package-lock.json). Live site checked via headers.  
**Related:** Grumman AI / Gerdsen private repos (Orin Camera Lab, KeepAwake, ShepherdMCP Portal) reviewed where accessible; no public portal/status/keep-awake features found on the public site.

## Summary
The site is a pure static HTML/CSS/JS GitHub Pages deployment (Cloudflare in front). No server-side code, no dynamic rendering of user input. Overall low risk. Main issues are missing security headers/CSP and open Dependabot alerts on development dependencies.

## Dependabot / Security Alerts
Open Dependabot alerts (all on package-lock.json, development/transitive scope from `http-server`):

- **qs** (multiple): arrayLimit bypasses, stringify DoS on null/undefined in comma format (GHSA-6rw7-vpxm-498p, GHSA-w7fw-mjwx-w883, GHSA-q8mj-m7cp-5q26 / CVEs). Versions >=6.11.1 affected; open PR #12 bumps only to 6.14.1 (insufficient for all). Recommend `npm update qs` or `npm audit fix` to latest patched (6.15.2+).
- **follow-redirects** <=1.15.11: leaks custom auth headers on cross-domain redirects (GHSA-r4q5-vmmm-2653). Update to >=1.16.0.

**Risk:** Low for production (deps only used for local `npm run dev` via http-server). Still recommend closing alerts for hygiene. No code scanning or secret scanning alerts open. No secrets found in code.

## Code Review Findings (every relevant line)
### index.html
- Clean semantic HTML, good ARIA, skip link, proper labels.
- Contact form posts to Formspree (`https://formspree.io/f/xeozyrwa`) via client-side `fetch` in JS (JSON). No client-side echo of user data → no XSS vector.
- External Google Fonts (`fonts.googleapis.com` + `fonts.gstatic.com`). Privacy consideration; recommend self-hosting or documenting the third-party.
- JSON-LD structured data is static and safe.
- No inline event handlers or dangerous attributes.
- Meta robots, canonical, OG tags present and correct.

### assets/js/main.js
- No `eval`, `innerHTML` with user data, `document.write`, or other injection sinks.
- Form handling: prevents default, builds payload from FormData, posts JSON, resets on success, shows status via textContent (safe).
- Smooth scroll, reveal animations, mobile nav, particles: all defensive, respect prefers-reduced-motion, use passive listeners where appropriate.
- Event listeners properly bound; no global pollution of concern.

### assets/css/main.css
- Pure styles, no CSS injection vectors. Uses CSS variables, modern features. No external resources beyond the font families already noted.

### Other files
- vercel.json: deployment disabled (correct for GH Pages).
- Workflow: standard GitHub Pages deploy with least-privilege token scopes.
- CNAME, robots.txt, sitemap.xml: standard, no issues.
- package.json: only http-server (dev) and fontawesome (unused in current HTML?); lockfile contains the vulnerable transitive deps.

## Live Site Observations
- Served via Cloudflare + GitHub Pages.
- `Access-Control-Allow-Origin: *` (acceptable for pure static, but broad).
- No Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, or Permissions-Policy observed in response headers.
- Cache-Control present; last-modified reasonable.

## Portal / Keep-Awake / Live Status
- No portal connection health, keep-awake logic, or dynamic live status found in the public site code or on https://gerdsen.ai/.
- Related private repos: `GerdsenAI_KeepAwake` contains only a LICENSE; `GerdsenAI-ShepherdMCP-Cloudflare-Portal` is empty. GrummanAI-* repos are private research/hardware notes (no website surface).
- Hero has a static CSS-animated green status dot (visual only, not live health).

## Recommendations (priority)
1. **Add CSP** (meta tag or Cloudflare header): 
   `default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'self' https://formspree.io; object-src 'none'; base-uri 'self'; form-action 'self' https://formspree.io;`
   (Adjust if more external resources are added. Prefer Cloudflare Transform Rules or Page Rules for headers.)
2. Update development dependencies to clear Dependabot alerts (merge/rebase PR #12 or open a full `npm audit fix` PR).
3. Consider self-hosting the two Google Fonts to eliminate the external dependency and improve privacy/CSP strictness.
4. Add `X-Content-Type-Options: nosniff` and a strict Referrer-Policy via Cloudflare if possible.
5. Enable GitHub Advanced Security / code scanning if the org plan supports it for future changes.
6. The Formspree endpoint is public in source; this is expected for this pattern, but ensure the Formspree form has spam protection (honeypot, reCAPTCHA) enabled on the Formspree dashboard.

No critical or high-severity issues in the production static assets. The site is appropriately security-minded for a static marketing page.
