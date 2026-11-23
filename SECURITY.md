# Security Review — gerdsen.ai

Last reviewed: 2026-11-23

This is a static GitHub Pages + Cloudflare site. Production risk is limited to client-side assets and the Formspree contact endpoint.

## Live status

- `https://gerdsen.ai/` returns HTTP 200.
- Content-Security-Policy is present as a meta tag (defense-in-depth).
- Response headers do **not** currently include HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy`.

## Portal connection health

- `GerdsenAI-ShepherdMCP-Cloudflare-Portal` repository is empty (409 on tree).

## Keep-awake

- `GerdsenAI_KeepAwake` contains only a LICENSE file.

## Dependabot / development alerts

Open alerts (all development-scope, low production impact):

- `qs` (multiple DoS / arrayLimit issues) — see open Dependabot PR #12.
- `follow-redirects` header leak on cross-domain redirects.

Production site does not ship these packages.

## Code review notes

- Single hashed inline script for JS class bootstrap; no `unsafe-inline` / `unsafe-eval`.
- Contact form posts to `https://formspree.io/f/xeozyrwa` (allowed by CSP `connect-src` / `form-action`).
- No obvious XSS sinks (`innerHTML`, `eval`, dynamic script injection).
- `main.js` uses `textContent` / FormData safely.

## Recommended response headers

Configure these on the Cloudflare zone (preferred over meta). The meta policy cannot enforce `frame-ancestors`; browsers ignore it in a meta policy. Use a response-header-only policy that includes:

```
default-src 'self'; script-src 'self' 'sha256-WZRJfWvsnNCPcxzZwvyhovnZGqhZaC+8gPGPRbx6wTk='; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://formspree.io; base-uri 'self'; form-action 'self' https://formspree.io; frame-ancestors 'none';
```

Additional headers:

- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`

## Local verification

```bash
python -m unittest discover -s tests -v
```

The CSP regression tests expect this document to contain the exact policy block above.
