# Security Policy

## Content Security Policy

The site ships a strict Content-Security-Policy via `<meta http-equiv>`.

```
default-src 'self';
script-src 'self' 'sha256-WZRJfWvsnNCPcxzZwvyhovnZGqhZaC+8gPGPRbx6wTk=';
style-src 'self' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data:;
connect-src 'self' https://formspree.io;
base-uri 'self';
form-action 'self' https://formspree.io;
frame-ancestors 'none';
```

`frame-ancestors` is response-header-only. Browsers ignore it in a meta policy; it must be set as an HTTP response header by the host (GitHub Pages / Vercel / CDN).

## Reporting

Report vulnerabilities to info@gerdsen.ai.

## Dependencies

Development dependencies (http-server and its transitive packages including qs and follow-redirects) are monitored via Dependabot. Production site is static HTML/CSS/JS with no server-side runtime.
