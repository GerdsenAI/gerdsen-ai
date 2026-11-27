# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |

## Reporting a Vulnerability

Please report security issues to the repository owners via GitHub private vulnerability reporting or by contacting info@gerdsen.ai.

Do not open public issues for undisclosed vulnerabilities.

## Security Review — 2026-11-27

**Scope**: Public static site https://gerdsen.ai/ (this repository), related surfaces (portal, status, keep-awake), Grumman AI context, and full code review of index.html + assets/js/main.js.

### Live status (checked 2026-11-27 ~15:18 UTC)

- **https://gerdsen.ai/** → HTTP/2 200 via Cloudflare + GitHub Pages/Fastly. Last-Modified: 2026-11-22. Site is up.
  - Response headers: **missing** Strict-Transport-Security, Content-Security-Policy (header), X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
  - Meta CSP is present (defense-in-depth).
  - `access-control-allow-origin: *` observed.
  - securityheaders.com grade remains low (historical F).
- **https://portal.gerdsen.ai/** → HTTP 401 Cloudflare Access (www-authenticate Bearer realm). Edge reachable and protected. Expected healthy state.
- **https://status.gerdsen.ai/** and **https://keepawake.gerdsen.ai/** → DNS/connection failure (no public resolution).
- **https://grumman.ai/** (reference) → HTTP 200 with strong header set: HSTS preload (includeSubDomains), tight CSP (`require-trusted-types-for 'script'`, frame-ancestors 'none'), COOP same-origin, CORP same-origin, Permissions-Policy, nosniff, no-referrer.

### Repositories

- This repo (gerdsen-ai): pure static HTML/JS/CSS. Production has no server-side runtime.
- GerdsenAI-ShepherdMCP-Cloudflare-Portal: empty repository.
- GerdsenAI_KeepAwake: LICENSE-only.
- GrummanAI-Orin-Camera-Lab and related Grumman AI private repos: documentation/engineering artifacts only. No public web surface or alerts linked to this site.

### Code review (every line of index.html and assets/js/main.js)

- Meta CSP present and restrictive: default-src 'self'; script-src 'self' + specific sha256; style/font limited; connect-src formspree; form-action formspree; base-uri 'self'.
- Contact form posts via fetch to https://formspree.io/f/xeozyrwa over HTTPS. Payload built from FormData; status messages use textContent (no innerHTML of user data).
- main.js: no eval, no Function constructor, no document.write, no untrusted HTML insertion, no localStorage/sessionStorage of sensitive data. Particles, nav, and form handling are safe.
- No secrets, API keys, or credentials in the repository.
- Inline script only adds a class; hash is covered by CSP.

### Dependabot / alerts

- Open PR #12: Bump qs 6.14.0 → 6.14.1 (dev dependency via http-server). Low production risk (static site). Recommend merge or drop the npm tooling dependency entirely for production purity.
- Historical open alerts were all development-scope (qs, follow-redirects). No runtime exposure.

### Findings summary

1. **Primary gap**: Missing response security headers on the Cloudflare zone for gerdsen.ai. Mirror the posture of grumman.ai (HSTS, full CSP header, COOP/CORP, Permissions-Policy, nosniff, no-referrer).
2. Meta CSP is good defense-in-depth but does not replace response headers.
3. Portal connection health is good (Access enforced).
4. Keep-awake and status pages have no public DNS.
5. No code-level XSS, injection, or secret exposure issues.
6. SECURITY.md was previously a placeholder; this update documents the review.

### Recommendations

- Configure Cloudflare (or GitHub Pages custom headers if supported) to emit the missing response headers. Compare against grumman.ai.
- Merge or close Dependabot PR #12.
- Keep production free of any server-side runtime or untrusted third-party scripts.
- Continue periodic live header checks.

Source: Live curl checks 2026-11-27, repository tree and file contents on main, prior reviews in PR #16.
