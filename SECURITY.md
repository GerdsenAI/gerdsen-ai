# Security Review — gerdsen.ai

**Date:** 2026-11-05  
**Scope:** Full review of `index.html`, `assets/js/main.js`, `package.json` / lock, workflows, live site headers, robots.txt, `_config.yml`.

## Summary
Static GitHub Pages site behind Cloudflare. Client-side JS is clean. Primary issues are missing response security headers and third-party form handling.

## Findings

### 1. Missing security headers (High)
Live `curl -I https://gerdsen.ai/` shows **no** of the following:
- Content-Security-Policy
- X-Frame-Options / frame-ancestors
- Strict-Transport-Security
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

Also returns `Access-Control-Allow-Origin: *`.

**Recommendation:**
- Prefer Cloudflare Transform Rules (or Pages `_headers` if applicable) for real headers.
- Interim: add a meta CSP in `<head>` of `index.html` (note: meta CSP cannot set frame-ancestors; use header for that).

Suggested starting CSP (adjust hashes after any inline script changes):
```
default-src 'self';
script-src 'self' 'sha256-<hash-of-inline>';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src https://fonts.gstatic.com;
img-src 'self' data:;
media-src 'self';
connect-src 'self' https://formspree.io;
form-action https://formspree.io;
base-uri 'self';
object-src 'none';
upgrade-insecure-requests;
```

Also recommend:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### 2. Contact form → Formspree (Medium)
Form posts to public endpoint `https://formspree.io/f/xeozyrwa` (hard-coded in HTML).
- No visible CAPTCHA.
- User PII leaves the origin to a third party.
- No client-side rate limiting.

**Recommendation:** Enable Formspree CAPTCHA / reCAPTCHA, add a short privacy note near the form, or move to a self-hosted endpoint if data residency matters.

### 3. Dependency hygiene (Low)
Open Dependabot PR #12 bumps transitive `qs` (devDependency of `http-server`). Safe to merge; does not affect production.

### 4. Other observations
- `main.js`: no `eval`, no unsafe DOM sinks with user input. Good.
- Inline scripts minimal (JS class + JSON-LD). Compatible with hash-based CSP.
- Large video assets present — performance consideration only.
- No secrets found in the repository.
- Related private repos (`GerdsenAI-ShepherdMCP-Cloudflare-Portal` empty, `GerdsenAI_KeepAwake` LICENSE-only) contain no active portal or keep-awake implementation in this website tree.

## Next steps
1. Merge or close #12.
2. Add Cloudflare security headers (or meta CSP + header rules).
3. Harden the contact form (CAPTCHA + privacy text).
4. Re-check live headers after changes.

This file is for review; no production runtime change is made by this PR.
