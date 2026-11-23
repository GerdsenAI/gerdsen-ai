# Security Policy

## Content Security Policy

This static site (hosted on GitHub Pages) delivers a Content-Security-Policy via `<meta http-equiv>` because GitHub Pages does not support arbitrary response headers.

### Meta tag policy (enforced by browsers from the document)

The live policy in `index.html` is:

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

- No `'unsafe-inline'` or `'unsafe-eval'`.
- The single early bootstrap inline script is covered by a SHA-256 hash (verified by `tests/test_csp.py`).
- Contact form posts only to Formspree (allowed in `connect-src` / `form-action`).

### Response-header-only directives

The following must be set as a real HTTP response header (browsers ignore it in a meta policy):

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

`frame-ancestors 'none'` (equivalent to `X-Frame-Options: DENY`) is response-header-only. Browsers ignore it when delivered via `<meta>`. Where possible (e.g., Cloudflare transform rules in front of GitHub Pages, or a custom host), set the full header above.

## Other security notes

- No user-controlled content is inserted into the DOM via `innerHTML` or similar in `assets/js/main.js`.
- Form status messages are static strings.
- All media and scripts are first-party (`'self'`).
- Dependabot is enabled; review and merge security updates promptly (see open PRs).
- No secrets are committed.

## Reporting vulnerabilities

Email info@gerdsen.ai with details. We aim to acknowledge within 48 hours.

## Live status / connection health

The public marketing site is fully static. There is currently no dynamic portal connection health, keep-awake, or live status endpoint. Any operator dashboards or lab systems live in private repositories and are not exposed here.
