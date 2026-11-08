# Security Review — Gerdsen AI Website (gerdsen.ai)

**Date:** 2026-11-08  
**Scope:** Full line-by-line review of static site (index.html, assets/js/main.js, CSS, configs, robots.txt, sitemap, workflows).  
**Live site status:** Operational at https://gerdsen.ai/ (HTTP 200, Cloudflare + GitHub Pages). No portal, keep-awake, or live-status endpoints present on the public site.

## Summary
The site is a clean static GitHub Pages deployment. No user-controlled content is rendered. Contact form posts to Formspree. No secrets, no dynamic server code in production. Risk is low. The following hardening items are recommended for a security-minded public presence.

## Findings

### 1. Missing Content Security Policy (High priority for defense-in-depth)
- No CSP header or meta tag on the live site.
- External resources: Google Fonts, Formspree.
- Recommendation: Add `<meta http-equiv="Content-Security-Policy" ...>` (or Cloudflare header) restricting script-src, style-src, font-src, connect-src, form-action, frame-ancestors 'none', etc.
- Branch `security/site-hardening-csp-and-review` attempted an initial meta addition.

### 2. Missing other security headers
Live response lacks:
- Strict-Transport-Security
- X-Frame-Options / frame-ancestors
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

Recommendation: Configure via Cloudflare (preferred, since site is already proxied) or GitHub Pages custom domain settings.

### 3. Development dependency vulnerabilities (Dependabot alerts)
Open alerts (all development-only, not used in production static serving):
- qs (multiple: GHSA-q8mj-m7cp-5q26 / CVE-2026-8723, GHSA-w7fw-mjwx-w883 / CVE-2026-2391, GHSA-6rw7-vpxm-498p / CVE-2025-15284)
- follow-redirects (GHSA-r4q5-vmmm-2653 / CVE-2026-40895)

Existing open PR #12 bumps qs to 6.14.1 (partial). Further bumps needed for full remediation. These do not affect the live static site.

### 4. External Google Fonts
- Preconnect + stylesheet from fonts.googleapis.com / fonts.gstatic.com.
- No SRI. Supply-chain risk is low but present.
- Recommendation: Self-host the two font families or add integrity attributes if feasible.

### 5. Contact form
- Formspree endpoint hard-coded. JS uses textContent for status messages (safe).
- No client-side rate limiting or honeypot visible. Formspree provides backend protections.
- Recommendation: Consider adding a hidden honeypot field.

### 6. Other observations
- Inline script only adds a class (`js`); JSON-LD is static.
- Videos are local, autoplay muted (acceptable).
- robots.txt and sitemap are appropriate.
- No code scanning or secret scanning alerts open.
- Portal repo (GerdsenAI-ShepherdMCP-Cloudflare-Portal) is empty; no live portal connection health endpoint on this site.
- No keep-awake or live status implementation present.

## Recommendations
1. Merge or extend the security branch to land CSP meta.
2. Set security headers at the Cloudflare edge.
3. Close or further update Dependabot PRs for dev deps (or remove unused http-server if local serving is only via Python).
4. Periodically re-review after any addition of third-party scripts or dynamic content.

**Reviewer note:** Production attack surface is minimal. Hardening improves posture without changing functionality.
