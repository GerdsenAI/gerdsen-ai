# Security Review – gerdsen.ai (2026-11-27)

## Live Status
- **https://gerdsen.ai/** → HTTP/2 200 via Cloudflare + GitHub Pages/Fastly.
- Site is up. Last-Modified: 2026-11-22 (matches merge of previous security PR).
- **securityheaders.com grade**: F (missing response headers).
- Meta CSP is present (defense-in-depth).

## Security Headers
No response security headers observed on gerdsen.ai:
- Missing: Content-Security-Policy (header), Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.

**Comparison**: https://grumman.ai serves a strong set (HSTS preload, tight CSP with require-trusted-types-for 'script', COOP, CORP, Permissions-Policy, nosniff, no-referrer).

**Recommendation**: Configure the same header posture on the Cloudflare zone for gerdsen.ai. Meta CSP remains useful but is weaker than a response header.

## Portal Connection Health
- **https://portal.gerdsen.ai/** → HTTP 401 with Cloudflare Access (www-authenticate: Bearer realm="OAuth"...).
- Edge is reachable and protected. This is the expected healthy state for an authenticated portal.
- Repository `GerdsenAI/GerdsenAI-ShepherdMCP-Cloudflare-Portal` is empty (409 on tree).

## Keep-Awake
- **https://keepawake.gerdsen.ai/** and **https://status.gerdsen.ai/** → no DNS / connection failure.
- Repository `GerdsenAI/GerdsenAI_KeepAwake` contains only LICENSE.

## Code Review (full pass)
Reviewed `index.html`, `assets/js/main.js`, `assets/css/main.css`, tests, and config:
- Pure static site. No server-side rendering or user-controlled content reflected into the DOM.
- Contact form posts to Formspree (`https://formspree.io/f/xeozyrwa`) over HTTPS via `fetch` with JSON body. Status messages are static strings. No XSS vectors.
- No `eval`, `innerHTML`, `document.write`, dynamic script injection, or inline event handlers.
- CSP meta tag present with hash for the single early bootstrap inline script (`document.documentElement.classList.add("js");`). No `'unsafe-inline'` or `'unsafe-eval'`.
- External resources limited to Google Fonts (preconnect + stylesheet) and Formspree.
- `robots.txt` is not an access control.
- Unused dependency: `@fortawesome/fontawesome-free` is listed in `package.json` but not referenced.

## Dependabot / Security Alerts
4 open Dependabot alerts, all **development scope** (from local-dev `http-server`):
1. qs – arrayLimit bypass in bracket notation (medium, GHSA / CVE)
2. qs – arrayLimit bypass in comma parsing (low)
3. follow-redirects – custom auth header leak on cross-domain redirect (medium)
4. qs – stringify TypeError DoS on null/undefined in comma + encodeValuesOnly (medium)

Production site is pure static HTML/JS/CSS with no server-side runtime. Risk is low.
Existing PR #12 (qs bump) remains open. Recommend merging it (and considering removal of the unused `http-server` / FontAwesome deps if Python `http.server` or no local server is preferred).

## Grumman AI Note
Grumman AI research skill and related private repos are out of scope for this public static site. No security alerts or portal/keep-awake linkage found in this pass. grumman.ai continues to demonstrate a stronger header posture.

## Recommended Follow-ups
1. Add response security headers (HSTS, CSP, X-Frame-Options / frame-ancestors, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) on the Cloudflare zone.
2. Merge Dependabot PR #12.
3. Consider cleaning unused npm dependencies.
4. Restore or expand this SECURITY.md with any future findings (current tests expect a documented CSP block).

---
*Review performed 2026-11-27. Site and portal connection health confirmed live.*
