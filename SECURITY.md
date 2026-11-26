# Security Policy

## Supported Versions

The live static site at https://gerdsen.ai is the production surface. It is a pure static site published from this repository via GitHub Pages + Cloudflare.

## Reporting a Vulnerability

Please report security issues privately to info@gerdsen.ai. Do not open public issues for undisclosed vulnerabilities.

## 2026-11-26 Security Review (Grumman AI / Gerdsen)

Fresh security-minded review requested: Grumman AI / Gerdsen security alerts, portal connection health, keep-awake, live status, and full line-by-line code review.

### Live status

- https://gerdsen.ai/ → HTTP/2 200 via Cloudflare + GitHub Pages (Varnish). Last-Modified 2026-11-22.
- No response-header security posture (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy). Compare to the strong header set on https://grumman.ai (HSTS preload, strict CSP with trusted-types + frame-ancestors, COOP/CORP, Permissions-Policy, nosniff, no-referrer).
- Meta CSP is present in index.html as defense-in-depth (see below). Browsers ignore frame-ancestors in a meta policy; it is response-header-only.
- https://portal.gerdsen.ai/ → HTTP 401 Cloudflare Access (WWW-Authenticate Bearer). Edge healthy and protected.
- https://status.gerdsen.ai and https://keepawake.gerdsen.ai → no DNS / connection failed.

### Portal connection health

GerdsenAI/GerdsenAI-ShepherdMCP-Cloudflare-Portal is a private empty repository (created 2026-05-27, no commits / 409 on tree). No application code or health endpoint exposed.

### Keep-awake

GerdsenAI/GerdsenAI_KeepAwake is a private repository containing only a LICENSE file (last updated 2025-08-15). No keep-awake implementation or status surface.

### Dependabot / security alerts

Open Dependabot PR #12 remains: bump qs 6.14.0 → 6.14.1 (dev dependency of local http-server). Production risk is low (pure static site; no runtime dependency on qs). No open code-scanning or secret-scanning alerts observed on the public repository.

### Code review (every line of index.html + assets/js/main.js)

- Pure static site. No server-side rendering, no user-controlled content injection points.
- Single inline script (early bootstrap adding `js` class) is hash-allowlisted in the CSP meta.
- Contact form posts to Formspree (https://formspree.io/f/xeozyrwa) over HTTPS via fetch + JSON. Status messages are static strings. No innerHTML/eval/document.write of untrusted data. No localStorage of sensitive data.
- CSP meta (defense-in-depth):

```
default-src 'self'; script-src 'self' 'sha256-WZRJfWvsnNCPcxzZwvyhovnZGqhZaC+8gPGPRbx6wTk='; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://formspree.io; base-uri 'self'; form-action 'self' https://formspree.io; frame-ancestors 'none'
```

frame-ancestors is response-header-only; browsers ignore it in a meta policy. The live site does not yet emit the matching response headers.

- No secrets, API keys, or sensitive data in the public repository.
- package.json includes an unused `@fortawesome/fontawesome-free` dependency (dev/local only).

### Grumman AI context

Brand is Grumman AI; GitHub organization is GerdsenAI. Selected baseline lives in private GrummanAI-Orin-Camera-Lab (docs only). https://grumman.ai continues to serve a full security-header set. No public website or portal code under the Grumman name requires additional review beyond the above.

### Recommendations

1. Configure matching response headers (CSP including frame-ancestors, HSTS, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy, COOP/CORP) on the Cloudflare zone for gerdsen.ai to match the posture of grumman.ai.
2. Merge Dependabot PR #12 (or drop the local http-server dependency if unused in CI).
3. Restore a non-placeholder SECURITY.md (this update) so the CSP regression tests pass.
4. Portal and Keep-Awake repositories remain empty/LICENSE-only; no connection health or keep-awake functionality is present to monitor on the public site.

Deployment hold for production header changes remains recommended until Cloudflare response headers are verified.
