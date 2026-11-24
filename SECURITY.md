# Security Review — gerdsen.ai

**Review date:** 2026-11-24

## Live status

- `https://gerdsen.ai/` returns **HTTP/2 200** via Cloudflare in front of GitHub Pages / Varnish.
- Last-Modified: 2026-11-22 (post-merge of security-review PR #16).
- Cache-Control: max-age=600.
- Content-Security-Policy **meta tag is present** (defense-in-depth).
- **No response-level security headers** observed: missing Strict-Transport-Security, X-Frame-Options / frame-ancestors, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy.

### Comparison

`https://grumman.ai` serves a strong header set (HSTS preload, full CSP with `frame-ancestors 'none'` and `require-trusted-types-for 'script'`, COOP, CORP, Permissions-Policy, nosniff, no-referrer).

## Dependabot / security alerts

4 open alerts, all in the **development** dependency tree (`http-server` / `qs` / `follow-redirects`):

- qs DoS variants (CVE-2025-15284, CVE-2026-2391, CVE-2026-8723) — medium/low.
- follow-redirects custom auth header leak (CVE-2026-40895) — medium.

Production site is pure static HTML/JS/CSS with no Node runtime. Practical risk is low. Open Dependabot PR #12 addresses one qs bump; further updates or removal of unused local-dev deps recommended for hygiene.

## Portal connection health

`GerdsenAI/GerdsenAI-ShepherdMCP-Cloudflare-Portal` is an empty repository (no commits / tree returns 409).

## Keep-awake

`GerdsenAI/GerdsenAI_KeepAwake` contains only a LICENSE file.

## Grumman AI

`GerdsenAI/GrummanAI-Agent` is a private stub containing only README.md (no application code).

## Code review (every line)

Reviewed `index.html`, `assets/js/main.js`, `assets/css/main.css`, package files, workflow, and live site.

- No `eval`, no `innerHTML` of untrusted data, no `document.write`.
- Contact form posts JSON to `https://formspree.io/f/xeozyrwa` with static success/error status messages only.
- Deferred local JS, solid ARIA, `prefers-reduced-motion` respected, passive scroll listener.
- Minimal inline script for JS class toggle is safe; JSON-LD is static.
- CSP meta restricts scripts, styles, fonts, images, connect, form-action appropriately for current assets.
- No secrets or sensitive data in the public repository.

**No new code-level findings.**

## Recommendations

1. Configure response security headers on the Cloudflare zone for `gerdsen.ai` to match the posture of `grumman.ai` (HSTS, full CSP including frame-ancestors, nosniff, Referrer-Policy, Permissions-Policy, COOP/CORP).
2. Merge Dependabot PR #12 and consider further bumps or removal of the unused `http-server` local-dev dependency (Python `http.server` or similar can be used instead).
3. Keep SECURITY.md updated with periodic live header and alert checks.

Source: live `curl -sI` probes + full repository review on 2026-11-24.
