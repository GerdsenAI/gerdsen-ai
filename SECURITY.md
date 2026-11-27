# Security Policy and Review Notes

## Reporting a Vulnerability
Please email security@gerdsen.ai (or info@gerdsen.ai) with details. We aim to respond within 48 hours.

## Security Review — 2026-11-27

### Live Status
- **https://gerdsen.ai/**: HTTP/2 200 via Cloudflare + GitHub Pages/Fastly. Site is up. Last-Modified: Sun, 22 Nov 2026 21:34:57 GMT.
- **Missing response security headers**: No Strict-Transport-Security, no Content-Security-Policy (HTTP header), no X-Frame-Options, no X-Content-Type-Options, no Referrer-Policy, no Permissions-Policy. securityheaders.com grade remains poor (F). Meta CSP is present in index.html.
- **https://grumman.ai/**: Strong header posture (HSTS preload, full CSP with require-trusted-types-for 'script', COOP, CORP, Permissions-Policy, nosniff, no-referrer).
- **https://portal.gerdsen.ai/**: HTTP 401 Cloudflare Access (edge healthy and protected). Expected for secured portal.
- **https://status.gerdsen.ai/** and **https://keepawake.gerdsen.ai/**: No DNS / connection failure.

### Portal / Keep-Awake Repositories
- GerdsenAI-ShepherdMCP-Cloudflare-Portal: still empty (or minimal).
- GerdsenAI_KeepAwake: still LICENSE-only.

### Code Review (full pass of index.html + assets/js/main.js)
- Meta CSP present and reasonably tight (script-src self + one sha256, style/font limited, connect-src self + formspree.io, form-action limited).
- No XSS vectors: status messages use textContent, no innerHTML with user data, no eval/new Function, no untrusted dynamic content.
- Contact form posts to Formspree over HTTPS with JSON; payload fields are standard text.
- No secrets or sensitive data in client code.
- Particles, animations, nav, and form handling are safe.
- Inline script only for classList.add("js") — covered by CSP hash.

### Dependabot / Security Alerts
4 open Dependabot alerts, all development-scope (package-lock.json / local http-server tooling):
1. qs < 6.14.1 (GHSA-6rw7-vpxm-498p / CVE-2025-15284) — arrayLimit bypass (medium)
2. qs <= 6.14.1 (GHSA-w7fw-mjwx-w883 / CVE-2026-2391) — comma parsing arrayLimit bypass (low)
3. follow-redirects <= 1.15.11 (GHSA-r4q5-vmmm-2653 / CVE-2026-40895) — custom auth header leak on cross-domain redirect (medium)
4. qs >= 6.11.1 <= 6.15.1 (GHSA-q8mj-m7cp-5q26 / CVE-2026-8723) — stringify TypeError DoS on null/undefined in comma + encodeValuesOnly (medium)

Production site is pure static HTML/JS/CSS with no server-side runtime. Risk is low. Recommend merging Dependabot update PRs and considering removal of unused http-server dependency if not needed for local dev.

### Code Scanning Alerts
No open code scanning alerts.

### Recommendations
1. Configure response security headers on the Cloudflare zone for gerdsen.ai to match grumman.ai posture (HSTS, CSP header, X-Frame-Options / frame-ancestors, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
2. Merge Dependabot PRs for qs / follow-redirects.
3. Populate or archive empty portal/keep-awake repos if they are no longer needed.
4. Keep SECURITY.md updated with review notes.

Previous related PR: #16 (merged 2026-11-22). This is a follow-up review.
