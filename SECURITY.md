# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |

This is a static marketing site. Only the `main` branch is considered production.

## Reporting a Vulnerability

Please report security issues privately to **security@gerdsen.ai** (or info@gerdsen.ai if that is not monitored). Do not open public issues for vulnerabilities.

We aim to acknowledge reports within 48 hours and provide a timeline for remediation.

## Content Security Policy

The site enforces a strict Content-Security-Policy via `<meta http-equiv>` in `index.html`:

```
default-src 'self';
script-src 'self' 'sha256-WZRJfWvsnNCPcxzZwvyhovnZGqhZaC+8gPGPRbx6wTk=';
style-src 'self' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data:;
connect-src 'self' https://formspree.io;
base-uri 'self';
form-action 'self' https://formspree.io;
```

**Notes:**
- The SHA-256 hash covers the early inline bootstrap script (`document.documentElement.classList.add("js");`).
- `frame-ancestors 'none'` is **response-header-only** (browsers ignore it in a meta policy). Deploy a response header with that directive (and preferably the full CSP) at the CDN/proxy layer (Cloudflare, GitHub Pages custom domain, etc.).
- Cloudflare Insights beacon (`static.cloudflareinsights.com`) is currently injected on the live site. If analytics are required, add `https://static.cloudflareinsights.com` to `script-src` and `connect-src`. Prefer self-hosted or privacy-focused alternatives for a security-minded deployment.

## Contact Form

The contact form posts JSON to Formspree (`https://formspree.io/f/xeozyrwa`).
- No secrets are stored client-side.
- Formspree handles rate limiting and spam filtering.
- Avoid collecting sensitive data through this form.

## General Hardening

- No server-side code or secrets in the repository.
- Dependencies are minimal (`http-server` for local preview only).
- Videos and canvas particle animations pause on `visibilitychange` to reduce background resource use ("keep-awake" mitigation).
- Prefer response headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy) over meta tags where possible.

## Live Status

The public site at https://gerdsen.ai is a static GitHub Pages deployment. No internal portal, connection health dashboard, or live status endpoint is exposed on this property.
