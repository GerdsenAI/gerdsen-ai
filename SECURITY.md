# Security Review — gerdsen.ai (updated 2026-11-10)

Reviewed the public static website repository for security posture. Live observations re-verified on 2026-11-10.

## Dependabot / Alerts (authenticated inventory 2026-11-10)

4 open Dependabot alerts, all development-scope from the local `http-server` dependency in `package.json` / `package-lock.json`:

1. **qs < 6.14.1** (GHSA-6rw7-vpxm-498p / CVE-2025-15284) — arrayLimit bypass in bracket notation.
2. **qs <= 6.14.1** (GHSA-w7fw-mjwx-w883 / CVE-2026-2391) — arrayLimit bypass in comma parsing.
3. **follow-redirects <= 1.15.11** (GHSA-r4q5-vmmm-2653 / CVE-2026-40895) — custom authentication headers leaked on cross-domain redirects.
4. **qs >= 6.11.1 <= 6.15.1** (GHSA-q8mj-m7cp-5q26 / CVE-2026-8723) — `stringify` TypeError DoS on null/undefined entries when `arrayFormat: 'comma'` and `encodeValuesOnly: true`.

Risk on the live site is low because the production deployment is pure static GitHub Pages + Cloudflare; `http-server` is not used in production. No open secret-scanning or code-scanning alerts.

Existing PR #12 bumps only `qs` from 6.14.0 to 6.14.1. It does not clear the remaining alerts. Both #12 and this PR remain under the deployment hold below. Do not merge while a main-branch push can trigger GitHub-hosted Actions.

## Live Site Status (re-verified 2026-11-10)

- https://gerdsen.ai returns HTTP 200. Served via Cloudflare in front of GitHub Pages (Varnish). Last-Modified 2026-04-24. Cache-Control: max-age=600.
- No Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, or Referrer-Policy headers observed on the response.
- https://www.gerdsen.ai returns 301 → https://gerdsen.ai/ (correct redirect).

## Portal / Keep-Awake (re-verified 2026-11-10)

- `GerdsenAI-ShepherdMCP-Cloudflare-Portal` repository is empty (409 on tree).
- `GerdsenAI_KeepAwake` repository contains only a LICENSE file.
- **https://portal.gerdsen.ai**: HTTP 401. Cloudflare Access challenge (`www-authenticate: Bearer realm="OAuth"`, error="invalid_token", resource_metadata present). Edge is reachable and protected by Access. Authorized origin/connection health behind the challenge remains unverified.
- **https://status.gerdsen.ai** and **https://keepawake.gerdsen.ai**: connection failed (no DNS resolution / no response).
- No live portal connection health or keep-awake endpoints discovered in this website codebase.

## Code Review Findings (static site — full review of index.html + assets/js/main.js)

### Positive
- Contact form uses HTTPS Formspree endpoint (`https://formspree.io/f/xeozyrwa`). Client submits via `fetch` with JSON; status messages are static strings (no user-controlled HTML injection).
- No `eval`, `innerHTML` with untrusted data, `document.write`, or dynamic script loading of untrusted sources.
- Single inline script only adds a `js` class to `<html>` (harmless). External script is local and deferred.
- Accessibility: skip link, ARIA attributes on navigation and form, prefers-reduced-motion respected for animations and particles.
- `robots.txt` discourages crawling common development paths; it is not an access-control mechanism.
- Workflow uses least-privilege pages permissions.

### Recommendations / Findings
1. **Missing security headers** (high priority for a public site)
   - Recommend enabling on Cloudflare:
     - Strict-Transport-Security: choose a policy after verifying HTTPS coverage; use includeSubDomains/preload only after checking all affected subdomains.
     - Content-Security-Policy (see suggested policy below)
     - X-Frame-Options: DENY
     - X-Content-Type-Options: nosniff
     - Referrer-Policy: strict-origin-when-cross-origin
     - Permissions-Policy: camera=(), microphone=(), geolocation=()

2. **CSP meta tag added in this PR** as a defense-in-depth measure (headers are preferred). It allows the exact early reveal bootstrap by SHA-256 hash without allowing arbitrary inline scripts. The contact-panel delay is defined in the stylesheet. If the bootstrap changes, update the hash and run the local regression checks.

3. **Formspree form**
   - Form ID is public (expected).
   - Consider adding a honeypot field or Formspree’s built-in spam protection if not already enabled.
   - Client-side validation is HTML5 only; server-side is handled by Formspree.

4. **Local development script**
   - `serve-local.sh` uses Python’s `http.server`, expects an existing `.venv`, and stops processes occupying port 4000. Review those prerequisites and side effects before running it.
   - `package.json` still lists `http-server`; consider removing the npm dependency if Python is the preferred local server, which would eliminate the `qs` and `follow-redirects` alerts.

5. **Workflow**
   - The current Pages workflow builds and deploys on `ubuntu-latest` after pushes to `main`. Keep tests local or on owned cloud. A merge can trigger GitHub-hosted Actions, so the merge hold remains until a separately approved deployment path satisfies that restriction.
   - This source review is not an exhaustive secret-scanning attestation.

## Suggested CSP response header (for Cloudflare)

The `frame-ancestors` directive is response-header-only: browsers ignore it in a meta policy. The HTML meta policy provides the resource restrictions below but cannot prevent framing. Deliver `frame-ancestors` (or `X-Frame-Options`) as an HTTP response header and verify the deployed result.
```
default-src 'self';
script-src 'self' 'sha256-WZRJfWvsnNCPcxzZwvyhovnZGqhZaC+8gPGPRbx6wTk=';
style-src 'self' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data:;
connect-src 'self' https://formspree.io;
frame-ancestors 'none';
base-uri 'self';
form-action 'self' https://formspree.io;
```

## Next Steps
- Keep #12 and this PR unmerged while the hosted-Actions deployment hold applies. Qualify remaining dependency updates separately (or remove the unused npm devDependency).
- Configure the security headers on the Cloudflare zone for gerdsen.ai.
- Portal edge is healthy (401 + Cloudflare Access). Status and keep-awake subdomains remain unresolved; related repositories are empty or LICENSE-only.
