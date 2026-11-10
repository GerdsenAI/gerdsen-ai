# Security Review — gerdsen.ai (2026-11-09)

Reviewed the public static website repository for security posture. Live observations below were reported on 2026-11-09 and were not independently retested during the 2026-11-10 source corrections.

## Dependabot / Alerts

- Review notes reported development-tool advisories affecting `qs` and `follow-redirects`. Counts differed between notes; use a dated authenticated Dependabot inventory to establish the current open count.
- These come from the local-dev `http-server` dependency in `package.json` / lockfile.
- Risk on the live site is low because the production deployment is pure static GitHub Pages + Cloudflare; `http-server` is not used in production.
- Existing PR #12 bumps only `qs` from 6.14.0 to 6.14.1. It does not update `follow-redirects` or establish that all alerts are cleared. The prior review identified remaining `qs` advisories fixed in later releases; recheck the dependency inventory after any update.
- Both #12 and this PR remain under the deployment hold below. Do not merge while a main-branch push can trigger GitHub-hosted Actions.

## Reported Live Site Status (2026-11-09)

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
   - `package.json` still lists `http-server`; consider removing the npm dependency if Python is the preferred local server, which would eliminate the `qs` alerts.

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
- Keep #12 and this PR unmerged while the hosted-Actions deployment hold applies. Qualify remaining dependency updates separately.
- Configure the security headers on the Cloudflare zone for gerdsen.ai.
- If a portal or keep-awake status page is intended, it lives outside this repository (empty repos noted above).


## Reported Portal Check (2026-11-09)

- An unauthenticated request to `https://portal.gerdsen.ai` reportedly returned HTTP 401 with a Cloudflare Access challenge (`Bearer realm="OAuth"`, resource_metadata present). This supports edge reachability and an authentication challenge for that request.
- Requests to `https://status.gerdsen.ai` and `https://keepawake.gerdsen.ai` reportedly did not resolve or respond. Their current configuration was not verified.

Authorized access, origin health, connection health, and the full access policy remain unverified. An unauthenticated 401 or an empty repository cannot establish those properties.
