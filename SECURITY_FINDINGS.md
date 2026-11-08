# Security Review Findings — Gerdsen AI Website (gerdsen.ai)

**Date:** 2026-11-08  
**Scope:** Full line-by-line review of primary source (`index.html`, `assets/js/main.js`, `assets/css/main.css` structure, `package.json`, `vercel.json`, `robots.txt`, `_config.yml`, GitHub Actions workflow). Live site health check. Related private repos for portal / keep-awake.  
**Live status:** https://gerdsen.ai/ returns 200 OK. Proxied through Cloudflare (cf-ray present). GitHub Pages origin.  
**Portal connection health:** `GerdsenAI-ShepherdMCP-Cloudflare-Portal` repository is empty. No code or status endpoint available.  
**Keep-awake:** `GerdsenAI_KeepAwake` contains only a LICENSE file. No implementation present.

## Summary
The site is a clean static GitHub Pages deployment with a single client-side contact form. Attack surface is low. Main concerns are third-party data flow, missing security headers, and external font/script dependencies. JS is well-written with no obvious XSS vectors.

## Findings

### 1. Contact form posts to third-party Formspree (Medium)
- Form action: `https://formspree.io/f/xeozyrwa`
- Client JS (`assets/js/main.js`) intercepts submit, sends JSON via `fetch` with `Accept: application/json`.
- Fields collected: name, email, company, project type, message.
- **Risk:** User PII leaves the domain to Formspree. No client-side honeypot or CAPTCHA visible. Spam/abuse possible (Formspree has server-side mitigations).
- **Recommendation:** Add a honeypot field, document the data processor in a privacy note, consider Cloudflare Worker or self-hosted endpoint for higher control. Confirm Formspree account has appropriate retention and access controls.

### 2. Missing security headers (High for a security-minded site)
Live `HEAD` response (2026-11-08) contains **none** of:
- `Content-Security-Policy` (or Report-Only)
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options` / `frame-ancestors`
- `Referrer-Policy`
- `Permissions-Policy`

GitHub Pages does not allow easy custom headers. Cloudflare is already in front of the domain.

**Recommendation:** Configure the missing headers via Cloudflare Transform Rules or a Worker. Strong CSP example (adjust after testing):
```
default-src 'self';
script-src 'self' https://static.cloudflareinsights.com;
style-src 'self' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data:;
connect-src 'self' https://formspree.io;
frame-ancestors 'none';
base-uri 'self';
form-action 'self' https://formspree.io;
```
Also enable HSTS with includeSubDomains; preload once stable.

### 3. External third-party resources (Low-Medium)
- Google Fonts (`fonts.googleapis.com` + `fonts.gstatic.com`) — privacy leak + extra origin.
- Cloudflare Insights beacon injected by proxy (`static.cloudflareinsights.com/beacon.min.js`) — third-party script.

**Recommendation:** Self-host the two font families (Courier Prime, IBM Plex Mono) under `assets/fonts/` and update CSS. This also simplifies CSP.

### 4. Positive observations
- `main.js` uses `textContent`, no `innerHTML` with untrusted data, proper `aria-live`, reduced-motion support, passive scroll listeners.
- No `eval`, no dynamic script injection.
- Static assets only; no server-side rendering or secrets in repo.
- Dependabot is active (open PR #12 for transitive `qs` bump).
- `vercel.json` has `deploymentEnabled: false` (not used for production).

### 5. Minor / housekeeping
- `robots.txt` disallows several paths that do not exist in the tree (harmless).
- Open Dependabot PR #12 should be reviewed and merged if CI passes.
- No privacy policy or data-processing note linked from the contact form.

## Suggested next actions
1. Merge or close Dependabot PR #12 after review.
2. Add Cloudflare security headers (priority).
3. Self-host fonts.
4. Add honeypot + short privacy note near the form.
5. Optionally add a `<meta http-equiv="Content-Security-Policy" ...>` as a belt-and-suspenders (note: meta CSP cannot set all directives).

---
*Review performed by automated security pass on 2026-11-08. Sources: live site HEAD, full source of primary files, related private repositories.*
