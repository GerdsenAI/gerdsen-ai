# Security Review Notes

**Date:** 2026-11-06  
**Scope:** Full review of `gerdsen-ai` static site (index.html, assets/js/main.js, assets/css/main.css, config, workflows, dependencies).

## Summary
The site is a clean static GitHub Pages marketing site. No server-side code, no secrets in repo, no client-side XSS vectors (form does not render user input). Live site (https://gerdsen.ai/) is healthy and serving correctly via Cloudflare + GitHub Pages.

No portal, keep-awake logic, or dynamic live status indicators exist beyond a decorative pulsing status dot in the hero. No security alerts beyond the open Dependabot PR.

## Findings & Recommendations

### 1. Missing Security Headers (Medium)
Live response headers (Cloudflare/GitHub Pages) lack:
- Content-Security-Policy
- Strict-Transport-Security
- X-Content-Type-Options
- X-Frame-Options
- Referrer-Policy
- Permissions-Policy

**Recommendation:** Configure these in Cloudflare (or via a `_headers` file if moving to Netlify/Vercel). A restrictive CSP can be started as a meta tag; see index.html updates in this PR.

### 2. Third-Party Form Endpoint (Low-Medium)
Contact form posts JSON to `https://formspree.io/f/xeozyrwa`. User PII leaves the first-party domain.

**Recommendation:** Document the data flow. Consider a self-hosted alternative or Formspree's enterprise options if privacy requirements increase. Add a honeypot field for basic bot mitigation (not implemented here to avoid breaking existing endpoint).

### 3. External Google Fonts (Low)
Fonts loaded from fonts.googleapis.com / fonts.gstatic.com. Supply-chain and privacy consideration for a security-minded site.

**Recommendation:** Self-host the two font families (Courier Prime, IBM Plex Mono) under `assets/fonts/` and update the stylesheet link.

### 4. Unused Dependency (Low)
`@fortawesome/fontawesome-free` is listed in package.json and package-lock.json but never referenced in HTML, CSS, or JS.

**Action in this PR:** Removed from package.json. Run `npm install` locally to refresh package-lock.json.

### 5. Dependabot Alert / PR #12 (Low)
Open PR bumps `qs` 6.14.0 → 6.14.1 (dev dependency of http-server). Includes parse fixes.

**Recommendation:** Merge PR #12. Local `npm run dev` only.

### 6. Other Observations
- Workflow uses `actions/checkout@v4`, `actions/configure-pages@v5`, etc. — pin to SHAs for supply-chain hardening if desired.
- No analytics, no third-party JS beyond Google Fonts and Formspree fetch.
- Videos are autoplay/muted/loop — acceptable.
- robots.txt and sitemap are present and sensible.
- vercel.json disables deployment (correct; site uses GitHub Pages).

## Next Steps
- [ ] Merge Dependabot PR #12
- [ ] Configure Cloudflare security headers
- [ ] Self-host fonts (optional)
- [ ] Refresh package-lock.json after dependency removal
- [ ] Consider adding a simple status/health badge if a portal or fleet status is desired in the future

No critical vulnerabilities found. Site is appropriate for a public marketing presence.
