# Security Review — gerdsen.ai (2026-11-06)

Static GitHub Pages site. Reviewed `index.html`, `assets/js/main.js`, `package.json`, `robots.txt`, `vercel.json`, live headers on https://gerdsen.ai/, and related portal context in GerdsenAI-Local.

## Live Site Headers (curl -sI)
- Cloudflare + GitHub Pages/Fastly.
- `access-control-allow-origin: *`
- No `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy` observed in the response.
- Cache-Control present; last-modified from April 2026.

## Findings (security-minded)

### 1. Missing security headers (Medium)
Static site can still benefit from CSP, frame denial, nosniff, strict referrer, and permissions policy. GitHub Pages has limited header control; consider Cloudflare Page Rules / Transform Rules or a thin edge config if available.

**Recommendation:** Add via Cloudflare (or document expected headers). Example CSP skeleton (tighten as needed):
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'self' https://formspree.io; frame-ancestors 'none';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 2. Contact form → public Formspree endpoint (Low/Medium)
`index.html` form action = `https://formspree.io/f/xeozyrwa` (public form ID). `main.js` POSTs JSON with name/email/company/project/message. No honeypot, no client-side rate limit, no CSRF token (Formspree mitigates some). Data leaves the origin.

**Recommendation:**
- Add a honeypot field (hidden input that bots fill).
- Consider self-hosted or authenticated form backend if PII volume grows.
- Document that Formspree is the processor.

### 3. External Google Fonts (Low)
`preconnect` + stylesheet to fonts.googleapis.com / fonts.gstatic.com. Sends user IP to Google; external dependency.

**Recommendation:** Self-host the two font families (Courier Prime, IBM Plex Mono) under `assets/fonts/` and update CSS.

### 4. Dependency hygiene
Open Dependabot PR #12 bumps `qs` 6.14.0 → 6.14.1 (transitive via `http-server`). Low risk for a static site, but merge for cleanliness. No direct production deps that process untrusted input.

### 5. Positive observations
- No secrets, API keys, or private endpoints in the public repo.
- Form fields use appropriate `autocomplete` / `inputmode`.
- JS is minimal, no `eval`/`innerHTML` with user data, reduced-motion respected, particles are canvas-only.
- Portal (GerdsenAI-Local) is hard-isolated (dedicated network, secrets in Infisical, VPN egress for scrape/search, Redis requirepass, etc.). Public site does not expose portal health, keep-awake, or live connection status — none present on gerdsen.ai.

## Portal / Grumman context (private)
No keep-awake, live-status, or connection-health widgets on the public site. Portal admin has a health board (documented in README as of 2026-09). Dated status notes (Orin offline, Redis ACL not fully activated, etc.) should be treated as historical until re-verified against current deployment. Isolation guarantees remain the primary security control.

## Next actions
- [ ] Apply or document security headers at the Cloudflare edge.
- [ ] Optional: honeypot + self-hosted fonts.
- [ ] Merge Dependabot #12.
- [ ] No public exposure of portal internals.

Review performed 2026-11-06 by automated agent against public repo + live headers. Full line-by-line review of `index.html` (~31k) and `main.js` completed; no additional high-severity issues found.
