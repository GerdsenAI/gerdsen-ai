# Security Review — gerdsen.ai (2026-11-07)

## Scope
Static GitHub Pages site (`GerdsenAI/gerdsen-ai`). Live at https://gerdsen.ai/. No server-side code, no authentication, no dynamic backend beyond the Formspree contact form.

## Live Site Status
- Site is up and serving over HTTPS via Cloudflare + GitHub Pages.
- No `/status`, `/health`, `/portal`, `/live`, or `/api/*` endpoints exist (all 404).
- No keep-awake, portal connection health, or live operational status indicators are present on the public site.
- Contact form is the only interactive element.

## Dependabot / Security Alerts (open)
Multiple open Dependabot alerts on development dependencies in `package-lock.json` (used only for local `http-server` preview):

- **qs** (multiple): arrayLimit bypasses and stringify TypeError DoS (GHSA-6rw7-vpxm-498p, GHSA-w7fw-mjwx-w883, GHSA-q8mj-m7cp-5q26 / CVE-2025-15284, CVE-2026-2391, CVE-2026-8723). Existing open PR #12 updates only to 6.14.1; current alerts require >=6.14.2 / 6.15.2.
- **follow-redirects**: custom auth header leak on cross-domain redirects (GHSA-r4q5-vmmm-2653 / CVE-2026-40895).

**Risk**: Low for production (devDependencies only, static site). Still recommend merging/updating the lockfile and closing the alerts.

No open code scanning or secret scanning alerts.

## Code Review Findings (every line reviewed)

### Positive
- Pure static HTML/CSS/JS. No `eval`, `innerHTML` with untrusted data, or dynamic script loading beyond Google Fonts.
- Contact form uses `fetch` + JSON to Formspree; client does not render unsanitized user input.
- External resources limited to Google Fonts (preconnect present) and Formspree.
- Videos/images are local assets.
- Workflow permissions are least-privilege (`contents: read`, `pages: write`, `id-token: write`).
- `robots.txt` and `sitemap.xml` present.

### Recommendations
1. **Security headers** (currently missing on live responses): Add via Cloudflare (preferred, since GitHub Pages does not support `_headers` or custom response headers natively):
   - `Content-Security-Policy`: `default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'self' https://formspree.io; form-action https://formspree.io; frame-ancestors 'none';`
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY` (or CSP frame-ancestors)
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
   - Ensure HSTS is enabled at Cloudflare.

2. **Form**: Formspree endpoint is intentionally public. Consider adding a simple honeypot field or rate-limiting note. No client-side XSS vector observed.

3. **Dependencies**: Update `package-lock.json` / run `npm update` and merge Dependabot PR #12 (or recreate for latest patched versions). Mark as resolved once updated.

4. **Optional hardening**:
   - Add Subresource Integrity (SRI) hashes for Google Fonts if desired.
   - Consider moving form submission fully to Formspree's native form (no JS) as a progressive enhancement fallback (current JS already has error handling).

## Portal / Keep-Awake / Live Status
Not applicable to this repository or the public site. No related code or endpoints found.

## Next Steps
- Merge or close Dependabot PR #12 after lockfile update.
- Apply security headers at Cloudflare.
- Close this review PR once items are tracked or addressed.
