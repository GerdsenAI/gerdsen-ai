# Security Policy

## Supported Versions

The live site at https://gerdsen.ai is the supported version. It is a static site with no server-side runtime in production.

## Reporting a Vulnerability

If you discover a security issue, please email security@gerdsen.ai (or info@gerdsen.ai) with details. Do not open public issues for vulnerabilities.

We aim to respond within 48 hours and will coordinate disclosure.

## Content Security Policy

The production site enforces a strict Content-Security-Policy via `<meta http-equiv>`:

```
default-src 'self'; script-src 'self' 'sha256-WZRJfWvsnNCPcxzZwvyhovnZGqhZaC+8gPGPRbx6wTk='; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://formspree.io; base-uri 'self'; form-action 'self' https://formspree.io;
```

Notes:
- No `'unsafe-inline'` or `'unsafe-eval'`.
- The script hash covers the minimal early bootstrap (`document.documentElement.classList.add("js");`).
- `frame-ancestors` is response-header-only; browsers ignore it in a meta policy. Recommended additional header (when hosting supports it):

```
default-src 'self'; script-src 'self' 'sha256-WZRJfWvsnNCPcxzZwvyhovnZGqhZaC+8gPGPRbx6wTk='; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://formspree.io; base-uri 'self'; form-action 'self' https://formspree.io; frame-ancestors 'none';
```

GitHub Pages does not allow arbitrary response headers. Consider a reverse proxy (e.g. Cloudflare) if full header control is required.

## Other Controls

- Contact form posts only to the known Formspree endpoint (allowed by CSP `connect-src` / `form-action`).
- No user-controlled HTML reflection.
- External resources limited to Google Fonts (privacy note: consider self-hosting fonts for stricter isolation).
- Dependabot is enabled for dependency updates.
- Local CSP regression tests live in `tests/test_csp.py`.

## Scope

This policy covers the public marketing site. Internal portals, keep-awake tools, and private systems are out of scope for this repository.
