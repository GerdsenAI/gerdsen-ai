# Security Review — gerdsen.ai (2026-11-09)

Reviewed the public static website repository for security posture.

## Dependabot / Alerts

- 4 open Dependabot alerts on `qs` (medium/low DoS related) and 1 on `follow-redirects`.
- These come from the local-dev `http-server` dependency in `package.json` / lockfile.
- Risk on the live site is low because the production deployment is pure static GitHub Pages + Cloudflare; `http-server` is not used in production.
- Existing open PR #12 bumps `qs` to 6.14.1 and should be merged to clear the alerts.

## Live Site Status

- https://gerdsen.ai returns HTTP 200.
- Served via Cloudflare in front of GitHub Pages.
- No Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, or Referrer-Policy headers observed on the response.

## Portal / Keep-Awake

- `GerdsenAI-ShepherdMCP-Cloudflare-Portal` repository is empty.
- `GerdsenAI_KeepAwake` repository contains only a LICENSE file.
- No live portal connection health or keep-awake endpoints discovered in this website codebase.

## Code Review Findings (static site)

### Positive
- Contact form uses HTTPS Formspree endpoint.
- Form status messages are static strings (no user-controlled HTML injection).
- No `eval`, `innerHTML` with untrusted data, or dynamic script loading of untrusted sources.
- `robots.txt` disallows common development paths.
- Workflow uses least-privilege pages permissions.

### Recommendations / Findings
1. **Missing security headers** (high priority for a public site)
   - Recommend enabling on Cloudflare:
     - Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
     - Content-Security-Policy (see suggested policy below)
     - X-Frame-Options: DENY
     - X-Content-Type-Options: nosniff
     - Referrer-Policy: strict-origin-when-cross-origin
     - Permissions-Policy: camera=(), microphone=(), geolocation=()

2. **CSP meta tag added in this PR** as a defense-in-depth measure (headers are preferred).

3. **Formspree form**
   - Form ID is public (expected).
   - Consider adding a honeypot field or Formspree’s built-in spam protection if not already enabled.
   - Client-side validation is HTML5 only; server-side is handled by Formspree.

4. **Local development script**
   - `serve-local.sh` uses Python’s `http.server` (fine for local).
   - `package.json` still lists `http-server`; consider removing the npm dependency if Python is the preferred local server, which would eliminate the `qs` alerts.

5. **Workflow**
   - Standard GitHub Pages workflow. No secrets in the repo.

## Suggested CSP (for Cloudflare or meta)
```
default-src 'self';
script-src 'self';
style-src 'self' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data:;
connect-src 'self' https://formspree.io;
frame-ancestors 'none';
base-uri 'self';
form-action 'self' https://formspree.io;
```

## Next Steps
- Merge Dependabot PR #12.
- Configure the security headers on the Cloudflare zone for gerdsen.ai.
- If a portal or keep-awake status page is intended, it lives outside this repository (empty repos noted above).


## Live Portal Check (2026-11-09)

- `https://portal.gerdsen.ai` returns HTTP 401 with Cloudflare Access (`Bearer realm="OAuth"`, resource_metadata present). Endpoint is reachable and correctly protected.
- `https://status.gerdsen.ai` and `https://keepawake.gerdsen.ai` do not resolve or respond (not currently configured).

This matches a security-minded setup: the portal requires authentication before any content is served.
