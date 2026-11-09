# Security Review — gerdsen.ai (2026-11-08)

## Scope
Public static marketing site in this repository (`index.html`, `assets/js/main.js`, `assets/css/main.css`, package manifests) and live deployment at https://gerdsen.ai/. Also checked related endpoints and the protected portal subdomain.

## Summary
The site is a pure static HTML/CSS/JS GitHub Pages deployment (Cloudflare in front). No server-side application logic, no secrets, no authentication on the public site. This is a strong baseline for a marketing page.

## Findings

### 1. Missing security headers (Medium)
Live response headers (Cloudflare + GitHub Pages edge) do not include:
- Content-Security-Policy
- X-Frame-Options / frame-ancestors
- X-Content-Type-Options: nosniff
- Referrer-Policy
- Permissions-Policy

**Recommendation:** Add via Cloudflare Transform Rules (preferred, since site is already proxied) or a `_headers` file if the hosting platform supports it. Example CSP starting point:
```
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'self' https://formspree.io;
```

### 2. External Google Fonts without SRI (Low)
`index.html` loads fonts from fonts.googleapis.com / fonts.gstatic.com with no integrity attributes.

**Recommendation:** Self-host the two font families (Courier Prime, IBM Plex Mono) under `assets/fonts/` and update the stylesheet link. Removes a third-party dependency and potential tracking vector.

### 3. Contact form (Low / Informational)
Form posts JSON to `https://formspree.io/f/xeozyrwa` via `fetch`. No client-side honeypot or additional rate-limiting beyond what Formspree provides. Error handling is present.

**Recommendation:** Confirm Formspree project settings (spam filtering, CAPTCHA if needed, notification emails). Consider adding a hidden honeypot field if spam volume increases.

### 4. Live status indicator (Informational)
The hero contains a CSS-animated green pulse dot and the text “Full-stack AI · Lafayette, LA”. This is purely presentational; there is no actual health check, portal connection probe, or keep-awake logic on the public site.

No `/health`, `/status`, or keep-awake endpoints exist on gerdsen.ai (all 404).

### 5. Portal subdomain (Informational)
`https://portal.gerdsen.ai/` exists and is protected by Cloudflare Access (email one-time code login). Unauthenticated requests receive a login page. Connection health cannot be assessed without valid credentials. This is the correct security posture for an internal portal.

### 6. Dependency alert
Open Dependabot PR #12 updates transitive `qs` (dev dependency of http-server) from 6.14.0 to 6.14.1. Changelog contains bugfixes only. No impact on the production static site. Safe to merge.

### 7. Other observations
- `robots.txt` disallows several paths that do not appear to exist in the tree; harmless.
- `vercel.json` has `deploymentEnabled: false` (consistent with GitHub Pages primary hosting).
- All media assets are same-origin.
- No inline secrets, API keys, or sensitive data in HTML/JS/CSS.
- JSON-LD structured data is present and well-formed.

## Keep-awake / Portal connection health
- `GerdsenAI_KeepAwake` repository currently contains only a LICENSE file.
- No keep-awake logic or portal health probes are present in this website repository.
- Any operational status for internal tools lives behind Cloudflare Access or in private/local applications (e.g., GerdsenAI-Fleet).

## Recommendations (priority order)
1. Merge Dependabot PR #12.
2. Add security headers via Cloudflare Transform Rules.
3. Self-host the two Google Font families.
4. Optionally add a short note in README.md pointing to this review or to the Cloudflare Access setup for the portal.

Review performed by automated security pass on 2026-11-08. No critical or high-severity issues identified in the public website code.
