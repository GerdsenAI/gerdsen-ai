# Security Review — 2026-11-27

Security-minded review of the public **gerdsen.ai** static site, related portal/keep-awake assets, live endpoints, Dependabot alerts, and full source review of `index.html` + `assets/js/main.js`.

## Live Status

- **https://gerdsen.ai/** → HTTP/2 200 via Cloudflare + GitHub Pages / Fastly. Site is up. Last-Modified: 2026-11-22.
- **Missing response security headers** on the Cloudflare zone for gerdsen.ai: no Content-Security-Policy (header), Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, or Permissions-Policy. securityheaders.com grade remains poor (F). Meta CSP (defense-in-depth) is present in the HTML.
- **https://grumman.ai** continues to serve a strong header set (HSTS preload, tight CSP with `require-trusted-types-for 'script'`, COOP, CORP, Permissions-Policy, nosniff, no-referrer).
- **https://portal.gerdsen.ai** → HTTP 401 Cloudflare Access (Bearer realm=OAuth, resource_metadata present). Edge is reachable and protected as expected.
- **status.gerdsen.ai** and **keepawake.gerdsen.ai** → no DNS resolution.

## Portal Connection Health & Keep-Awake

- **GerdsenAI/GerdsenAI-ShepherdMCP-Cloudflare-Portal**: empty repository (no commits/tree).
- **GerdsenAI/GerdsenAI_KeepAwake**: contains only a LICENSE file.
- No portal health endpoint, status widget, or keep-awake logic exists in the public website codebase.
- Related private repos (e.g. shepherdmcp-web) exist but are not connected to this public site.

## Dependabot / Security Alerts

4 open Dependabot alerts, all **development scope** (`package-lock.json` / `http-server` local tooling):

- qs < 6.14.1 (GHSA-6rw7-vpxm-498p / CVE-2025-15284) — arrayLimit bypass (medium)
- qs <= 6.14.1 (GHSA-w7fw-mjwx-w883 / CVE-2026-2391) — comma parsing arrayLimit bypass (low)
- follow-redirects <= 1.15.11 (GHSA-r4q5-vmmm-2653 / CVE-2026-40895) — custom auth header leak on cross-domain redirect (medium)
- qs >= 6.11.1 <= 6.15.1 (GHSA-q8mj-m7cp-5q26 / CVE-2026-8723) — stringify TypeError DoS on null/undefined in comma + encodeValuesOnly (medium)

Production site is pure static HTML/JS/CSS with no server-side runtime. Risk is limited to local development. Recommend merging open Dependabot PR #12 and/or removing the unused `http-server` npm dependency (Python `http.server` is already documented).

No open code-scanning or secret-scanning alerts.

## Code Review (every line of index.html + assets/js/main.js + supporting config)

**Strengths / no action required:**
- Pure static site. No server-side rendering or user-controlled content injection points.
- No XSS vectors: no `eval`, `innerHTML`/`outerHTML` with user data, `document.write`, or dynamic script insertion of untrusted content.
- Contact form posts to Formspree (`https://formspree.io/f/xeozyrwa`) over HTTPS. Status messages are static strings. No untrusted dynamic content.
- CSP meta tag present (defense-in-depth only; response headers preferred).
- No secrets, API keys, or sensitive data in the repository.
- `robots.txt` is not an access control; it only influences crawlers.

**Grumman AI note:** Grumman AI research skill and related private repos (e.g. GrummanAI-Orin-Camera-Lab) are out of scope for this public static site. No security alerts or portal/keep-awake linkage found there in this pass.

## Recommendations

1. **Configure security headers** on the Cloudflare zone for gerdsen.ai (preferred over meta CSP): CSP, HSTS (preload-ready), X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin or no-referrer, Permissions-Policy. Match or approach the posture of grumman.ai.
2. Merge Dependabot PR #12 (qs bump) to clear the development-scope alerts.
3. Consider removing the unused `http-server` npm dependency if local preview uses Python `http.server`.
4. Portal and Keep-Awake remain empty/stub; no live connection health or keep-awake service is currently deployed from those repos.

Review date: 2026-11-27. Live checks performed against production endpoints. Source reviewed at main (SHA 4fab98e48eb4ba47280f105f0e5428de469c0e66).
