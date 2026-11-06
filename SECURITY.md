# Security Review — gerdsen.ai (GerdsenAI/gerdsen-ai)

**Date:** 2026-11-05  
**Scope:** Full line-by-line review of `index.html`, `assets/js/main.js`, CSS, workflow, package files, live site headers, and related private repos (KeepAwake, ShepherdMCP Portal).  
**Reviewer:** Automated security pass (Grok)

## Summary

The public site is a static HTML/CSS/JS GitHub Pages deployment (Cloudflare in front). Client-side code is clean: no `eval`, no `innerHTML` with untrusted data, no secrets, form posts to Formspree via `fetch`. No open code-scanning alerts. Dependabot PR #12 exists for a `qs` bump that does not appear in production runtime.

Private repos `GerdsenAI_KeepAwake` and `GerdsenAI-ShepherdMCP-Cloudflare-Portal` are empty or near-empty; code scanning is not enabled (requires Advanced Security).

**No critical or high-severity issues in application code.** Findings below are defense-in-depth and operational hygiene.

## Findings

### 1. Missing security response headers (Medium — operational)
Live response from `https://gerdsen.ai` (Cloudflare + GitHub Pages) contains:
- `access-control-allow-origin: *`
- No `Content-Security-Policy`
- No `Strict-Transport-Security` (HSTS)
- No `X-Content-Type-Options: nosniff`
- No `X-Frame-Options` or `frame-ancestors`
- No `Referrer-Policy`
- No `Permissions-Policy`

**Recommendation:** Configure via Cloudflare Transform Rules / Page Rules / Security Headers (or `_headers` if migrating to Cloudflare Pages). Minimum set:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'self' https://formspree.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://formspree.io
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-Frame-Options: DENY
```
Tune CSP after testing (Google Fonts + Formspree + videos).

### 2. External Google Fonts without SRI (Low)
`index.html` loads fonts from `fonts.googleapis.com` / `fonts.gstatic.com` with no Subresource Integrity.

**Recommendation:** Self-host the two font families (Courier Prime, IBM Plex Mono) under `assets/fonts/` or add SRI hashes once the stylesheet URL is pinned.

### 3. Contact form (Low / accepted)
- Posts JSON to `https://formspree.io/f/xeozyrwa` via client `fetch` (see `assets/js/main.js` `initContactForm`).
- No client-side sanitization beyond browser validation; Formspree handles backend.
- No visible honeypot or CAPTCHA (Formspree may provide spam protection).

**Recommendation:** Confirm Formspree spam settings; optionally add a hidden honeypot field.

### 4. Dependency hygiene (Informational)
- `package.json` only lists `@fortawesome/fontawesome-free` and `http-server` (dev).
- Dependabot PR #12 bumps `qs` (likely transitive or lockfile noise). Production site does not execute Node.

**Recommendation:** Merge or close #12 after confirming no runtime use; enable Dependabot only for actually used packages if desired.

### 5. Portal / Keep-Awake / Live status
- Public site status line is static text (`Full-stack AI · Lafayette, LA`), not a live health indicator.
- No portal connection health UI on the public site.
- Related private repos appear empty; no code to review.

## Positive observations
- Clean JS (no dangerous sinks).
- Form uses modern `fetch` + JSON.
- GitHub Actions workflow uses least-privilege permissions and concurrency control.
- robots.txt and sitemap present.
- No secrets or credentials in repo.

## Next steps
1. Apply Cloudflare security headers.
2. Self-host fonts or add SRI.
3. Close or merge Dependabot #12.
4. Enable Advanced Security + code scanning on private repos if they become active.

---
*This document is the output of a security-minded full review of every tracked source file on the default branch.*
