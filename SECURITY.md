# Security Review — GERDSEN AI Public Website (gerdsen.ai)

**Review date:** 2026-11-25  
**Scope:** Public static site at https://gerdsen.ai, related portals/status/keep-awake subdomains, Dependabot/code/secret scanning, full line-by-line review of `index.html` + `assets/js/main.js` (and supporting files), portal/keep-awake repository health.

## Summary
The public site is a pure static HTML/CSS/JS GitHub Pages deployment. No server-side rendering, no user-controlled content injection points, and no production Node runtime. Risk surface is low. Primary remaining gaps are response-header hardening on the Cloudflare zone and the still-open development-only Dependabot alerts.

## Dependabot / Security Alerts
- **4 open Dependabot alerts**, all **development scope** (`package-lock.json` / `http-server` local tooling):
  - `qs` < 6.14.1 — arrayLimit bypass (medium, GHSA-6rw7-vpxm-498p / CVE-2025-15284)
  - `qs` <= 6.14.1 — comma parsing arrayLimit bypass (low, GHSA-w7fw-mjwx-w883 / CVE-2026-2391)
  - `follow-redirects` <= 1.15.11 — custom auth header leak on cross-domain redirect (medium, GHSA-r4q5-vmmm-2653 / CVE-2026-40895)
  - `qs` >= 6.11.1 <= 6.15.1 — stringify TypeError DoS on null/undefined in comma + encodeValuesOnly (medium, GHSA-q8mj-m7cp-5q26 / CVE-2026-8723)
- No open code-scanning or secret-scanning alerts.
- Production site does not execute these packages. Risk is limited to local development machines.
- **Action:** Merge existing Dependabot PR #12 (or recreate for latest patches). Consider removing `http-server` if the preferred local server is Python `http.server`.

## Live Site Status
- **https://gerdsen.ai** — Reachable, serves the static site (title: Lafayette Louisiana AI Pipelines & MCP | GERDSEN AI).
- CSP meta tag present (defense-in-depth).
- **https://portal.gerdsen.ai** — Cloudflare Access challenge (login page / 401-style). Edge reachable and protected. Expected healthy state for a secured portal.
- **https://status.gerdsen.ai** and **https://keepawake.gerdsen.ai** — Connection failed / 503 (no public DNS or origin).
- **https://grumman.ai** — Loads; currently "Nothing published yet".

## Portal / Keep-Awake Repositories
- `GerdsenAI/GerdsenAI-ShepherdMCP-Cloudflare-Portal` — empty repository (GitHub returns 409 / no commits).
- `GerdsenAI/GerdsenAI_KeepAwake` — contains only a LICENSE file.

## Code Review (every line of index.html + assets/js/main.js)
- Static site; no SSR or user-controlled content injection points.
- Contact form posts to Formspree (`https://formspree.io/f/xeozyrwa`) over HTTPS via `fetch` with JSON body. No secrets in client code.
- Inline script only adds a `js` class to `<html>`; SHA-256 hashed in the CSP meta.
- CSP meta:
  ```
  default-src 'self';
  script-src 'self' 'sha256-WZRJfWvsnNCPcxzZwvyhovnZGqhZaC+8gPGPRbx6wTk=';
  style-src 'self' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data:;
  connect-src 'self' https://formspree.io;
  base-uri 'self';
  form-action 'self' https://formspree.io;
  ```
- No `eval`, `innerHTML` with untrusted data, or dynamic script loading of untrusted origins.
- Videos, images, and CSS are same-origin.
- Accessibility: skip link, ARIA attributes, reduced-motion support, keyboard handling present.
- `robots.txt` is not an access control (expected).

## Recommendations
1. **Cloudflare zone headers** (highest priority for a security-minded public site): Add HSTS (preload-ready), full CSP (including frame-ancestors), COOP, CORP, Permissions-Policy, X-Content-Type-Options: nosniff, Referrer-Policy: no-referrer. Compare against the stronger posture observed on grumman.ai in prior reviews.
2. Merge Dependabot PR #12 and keep the lockfile updated.
3. Replace the SECURITY.md placeholder (this update) and keep it current.
4. Portal origin health behind Access remains unverified from external vantage — confirm internally.
5. status.gerdsen.ai / keepawake.gerdsen.ai: either provision or remove DNS records if unused.

No new code-level findings in this pass. Deployment hold not required for the static site itself; header configuration is the remaining external control.
