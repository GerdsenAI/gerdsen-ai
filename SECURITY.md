# Security Policy

## Supported Versions

The public site at https://gerdsen.ai is a static GitHub Pages + Cloudflare deployment. Only the latest content on the `main` branch is supported.

## Reporting a Vulnerability

Please report security issues privately to info@gerdsen.ai or via GitHub Security Advisories if available. Do not open public issues for undisclosed vulnerabilities.

## Current Security Posture (reviewed 2026-11-26)

### Live status
- **https://gerdsen.ai**: HTTP/2 200 via Cloudflare + GitHub Pages. Last-Modified: Sun, 22 Nov 2026 21:34:57 GMT. Cache-Control: max-age=600. No security response headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP/CORP) observed.
- **https://www.gerdsen.ai**: 301 redirect to apex.
- **https://portal.gerdsen.ai**: HTTP/2 401 with Cloudflare Access (WWW-Authenticate: Bearer realm="OAuth", error="invalid_token", resource_metadata present). Edge is reachable and protected. Some headers present (Referrer-Policy: same-origin, X-Frame-Options: SAMEORIGIN).
- **https://status.gerdsen.ai** and **https://keepawake.gerdsen.ai**: No DNS / connection failure.
- Comparison: https://grumman.ai serves strong headers including HSTS preload, tight CSP with `require-trusted-types-for 'script'`, COOP, CORP, Permissions-Policy, nosniff, no-referrer.

### Portal connection health
GerdsenAI/GerdsenAI-ShepherdMCP-Cloudflare-Portal remains an empty repository (no commits/tree). No application code or connection health monitoring present.

### Keep-awake
GerdsenAI/GerdsenAI_KeepAwake contains only a LICENSE file. No application code.

### Dependabot / alerts
4 open Dependabot alerts on development dependencies (qs and follow-redirects, pulled in by local-dev `http-server`). Production site is pure static HTML/JS/CSS with no server-side runtime using these packages. Production risk is low. Related open PR: #12 (Bump qs from 6.14.0 to 6.14.1).

No open code scanning or secret scanning alerts.

### Code review (every line of index.html + assets/js/main.js)
Pure static site. No `eval`, `innerHTML` with untrusted content, or dynamic script injection. Contact form uses `fetch` to Formspree over HTTPS with JSON payload and proper error handling. Inline bootstrap script is hashed in CSP. No secrets or API keys in the public repo.

CSP meta tag is present and matches the policy below (without `frame-ancestors`, which browsers ignore in a meta policy).

Recommended response-header CSP (to be set at Cloudflare / GitHub Pages / edge; meta is complementary but headers are preferred for enforcement on all resources):

```
default-src 'self'; script-src 'self' 'sha256-WZRJfWvsnNCPcxzZwvyhovnZGqhZaC+8gPGPRbx6wTk='; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://formspree.io; base-uri 'self'; form-action 'self' https://formspree.io; frame-ancestors 'none';
```

Additional recommended headers (missing on live site):
- Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
- X-Content-Type-Options: nosniff
- Referrer-Policy: no-referrer or strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
- Cross-Origin-Opener-Policy: same-origin
- Cross-Origin-Resource-Policy: same-origin

### Actions
- Merge Dependabot PR #12 and keep dev dependencies updated.
- Remove unused `@fortawesome/fontawesome-free` dependency if not referenced.
- Configure the response headers above at the Cloudflare / edge layer (GitHub Pages alone does not emit them).
- Populate SECURITY.md was previously a placeholder; this update documents the review.
- Portal and KeepAwake repos remain empty — no connection health or keep-awake functionality to monitor.

Production risk from the reviewed public code surface is low. The primary actionable gap is the missing security response headers.
