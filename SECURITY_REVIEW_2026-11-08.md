# Security Review: gerdsen.ai (Grumman AI / Gerdsen)

**Date:** 2026-11-08  
**Scope:** Live site https://gerdsen.ai, full repository code review (index.html, assets/js/main.js, package.json, workflows, configs), Dependabot alerts, previous security branches, portal/connection health, keep-awake, live status.  
**Reviewer:** Automated security-minded pass (every line of public code examined).  
**Status:** Public site is static, low attack surface. No portal, keep-awake, or live status widgets present on the public site. Private Grumman/Shepherd portals exist separately.

## Live Site Health
- Site is up (HTTP/2 200 via Cloudflare + GitHub Pages). Last-modified ~2026-04-24.
- No visible security headers: missing Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- `access-control-allow-origin: *` present (acceptable for pure static assets but not ideal).
- Form posts to Formspree (`https://formspree.io/f/xeozyrwa`). JS intercepts and sends JSON.
- No exposed secrets, API keys, or sensitive data in public HTML/JS/CSS.
- Videos, images, fonts (Google Fonts) are the main external dependencies.
- robots.txt allows most content; disallows some test/dev files.

## Portal Connection Health, Keep-Awake, Live Status
- **Public site (gerdsen.ai):** None of these features are implemented or visible. No status indicators, no keep-alive pings, no portal embeds, no security alert banners.
- **Private repos (accessible via org):** 
  - `GerdsenAI-ShepherdMCP-Cloudflare-Portal` (private)
  - `GrummanAI-Agent`, `GrummanAI-Orin-Camera-Lab`, `GrummanAI-Isaac-SHim`, etc. (private)
  - These are the likely locations for portal connection health, keep-awake, and live status. Recommend separate review of those private codebases.
- Previous security branches (security/review-2026-11-08, security/grumman-gerdsen-live-review-20261107, CSP/honeypot branches) exist but changes have not been merged to main.

## Code Review Findings (every public line)

### index.html
- Well-structured static HTML with good a11y (skip link, aria labels, semantic sections).
- Contact form: action set to Formspree, method POST. Fields: name, email, company, project (select), message. No honeypot field → spam risk.
- Inline `<script>document.documentElement.classList.add("js");</script>` — safe but requires `'unsafe-inline'` if CSP is added.
- JSON-LD structured data is comprehensive and correct.
- External Google Fonts preload + stylesheet.
- No dangerous sinks, no eval, no innerHTML of user data.

### assets/js/main.js
- Clean vanilla JS. Handles nav, smooth scroll, IntersectionObserver reveals, service accordion, contact form AJAX, particle canvas.
- Form handler: builds payload from FormData, POSTs JSON to form.action (Formspree). Error handling present. No XSS vectors (textContent used for status).
- Particle animation uses requestAnimationFrame; pauses on visibilitychange (good).
- No keep-awake (WakeLock API), no status polling, no portal logic.

### package.json / package-lock.json
- Dev dep: http-server (local only). Prod dep: @fortawesome/fontawesome-free (appears unused in current static site — icons are CSS/SVG or none).
- Dependabot PR #12 open: bumps `qs` 6.14.0 → 6.14.1 (transitive). Low risk for this static site but should be merged or closed if unused.
- No production runtime dependencies that execute on the site.

### .github/workflows/jekyll-gh-pages.yml
- Standard GitHub Pages deploy. Permissions limited (contents:read, pages:write, id-token:write). Good.
- Uses actions/checkout@v4, configure-pages@v5, jekyll-build-pages@v1, deploy-pages@v4. Pinning is present; keep updated.

### vercel.json
- `git.deploymentEnabled: false` — correct, site is GitHub Pages not Vercel.

### Other
- CNAME present (gerdsen.ai).
- No .env, no secrets committed.
- Large video assets (some >10 MB) — performance concern, not security.

## Recommended Hardening (this PR documents; implement as follow-up)
1. **Add honeypot field** to contact form (hidden input) and check it server-side at Formspree or client-side before submit.
2. **Add Content-Security-Policy** (meta tag or Cloudflare):
   - `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'self' https://formspree.io; frame-ancestors 'none';`
3. **Security headers** via Cloudflare (preferred) or meta where possible: HSTS, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy.
4. Merge or close Dependabot PR #12.
5. Review and merge useful changes from existing `security/*` branches (CSP honeypot variants).
6. Separate private portal/agent review for Grumman AI / ShepherdMCP connection health and keep-awake.

## Conclusion
Public website is security-conscious in design (static, minimal JS, external form service) but lacks modern headers and spam protection. No live status / portal / keep-awake on the public surface. Recommend applying the hardening above and reviewing private Grumman/Shepherd codebases independently.

Sources: live curl headers 2026-11-08, full index.html + main.js + package.json + workflow contents from GerdsenAI/gerdsen-ai main.
