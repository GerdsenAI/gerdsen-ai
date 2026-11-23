# Security Policy

## Reporting a Vulnerability

Please report security issues privately to security@gerdsen.ai (or info@gerdsen.ai if that is not monitored). Do not open public issues for undisclosed vulnerabilities.

We aim to acknowledge reports within 48 hours and provide a status update within 7 days.

## Content Security Policy

The site ships a strict meta Content-Security-Policy. The equivalent response-header policy (preferred) should also include frame-ancestors, which browsers ignore in a meta policy:

```
default-src 'self'; script-src 'self' 'sha256-WZRJfWvsnNCPcxzZwvyhovnZGqhZaC+8gPGPRbx6wTk='; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://formspree.io; base-uri 'self'; form-action 'self' https://formspree.io; frame-ancestors 'none';
```

This is response-header-only for the frame-ancestors directive; browsers ignore it in a meta policy.

Additional recommended response headers (via Cloudflare Transform Rules, Pages, or equivalent):

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (once HSTS preload is confirmed)

## Contact Form

The public contact form posts to Formspree (https://formspree.io/f/xeozyrwa). Only non-sensitive project inquiry data is collected. CSP `connect-src` and `form-action` are limited to that origin.

## Dependencies

Production site is static (no runtime Node server). Dev dependencies (http-server) and any transitive packages should be kept current via Dependabot. Review open security PRs promptly.

## Scope

This policy covers the public gerdsen.ai static site. Internal portals, keep-awake mechanisms, and live status dashboards (if any) are out of scope for this repository and should follow separate hardened configurations (mTLS, private mesh, session invalidation, etc.).

No portal connection health, keep-awake, or live status features are present on this public site.
