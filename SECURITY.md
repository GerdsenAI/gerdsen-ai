# Security Policy

## Content Security Policy

The site uses a restrictive Content-Security-Policy delivered via `<meta>` tag in `index.html` (for environments where response headers are limited, e.g. some static hosts) and recommended as a response header where supported.

### Meta CSP (current)

```
default-src 'self'; script-src 'self' 'sha256-WZRJfWvsnNCPcxzZwvyhovnZGqhZaC+8gPGPRbx6wTk='; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://formspree.io; base-uri 'self'; form-action 'self' https://formspree.io;
```

### Recommended response headers (where hosting allows)

In addition to the above, set the following as **response-header-only** directives (browsers ignore `frame-ancestors` in a meta policy):

```
default-src 'self'; script-src 'self' 'sha256-WZRJfWvsnNCPcxzZwvyhovnZGqhZaC+8gPGPRbx6wTk='; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://formspree.io; base-uri 'self'; form-action 'self' https://formspree.io; frame-ancestors 'none';
```

Notes:
- No `'unsafe-inline'` or `'unsafe-eval'`.
- Contact form posts only to Formspree (allowed by `form-action` and `connect-src`).
- Inline bootstrap script is hashed.
- `frame-ancestors 'none'` is response-header-only; browsers ignore it in a meta policy.

## Reporting a Vulnerability

Please email info@gerdsen.ai with details. We aim to respond within 48 hours.

## Dependency Hygiene

Development dependencies (e.g. http-server for local serving) are monitored via Dependabot. Production site is fully static.
