# Security Policy

## Content Security Policy

The site ships a strict Content-Security-Policy via `<meta http-equiv>` in `index.html`. Because `frame-ancestors` is ignored in meta policies, the recommended response header (set at the hosting layer) is:

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

Browsers ignore `frame-ancestors` in a meta policy; it is response-header-only. The meta policy matches the above except for the frame-ancestors directive.

The early bootstrap inline script is the only inline script and is hash-pinned:

```js
document.documentElement.classList.add("js");
```

No `'unsafe-inline'` or `'unsafe-eval'` is permitted for scripts or styles.

## Contact Form

The contact form posts JSON to the existing Formspree endpoint (`https://formspree.io/f/xeozyrwa`). No secrets are embedded. Input is not reflected into the DOM.

## Review Notes (2026-11-23)

- Public site at https://gerdsen.ai is live and serving the static content.
- No portal connection health, keep-awake, or Grumman AI status indicators are present on the public site (related private repos `GerdsenAI_KeepAwake` and `GerdsenAI-ShepherdMCP-Cloudflare-Portal` are currently empty).
- Dependabot PR #12 is open for a transitive `qs` bump; review and merge if CI passes.
- Google Fonts are loaded from fonts.googleapis.com / fonts.gstatic.com (allowed by CSP). Self-hosting would further reduce third-party surface.
- GitHub Pages provides limited control over response headers; consider a Cloudflare or similar proxy if stronger headers (HSTS, frame-ancestors, etc.) are required.
- Local CSP regression tests live in `tests/test_csp.py` and should be run before merges that touch `index.html` or this file.

## Reporting

Please report security issues to the repository owners via GitHub private vulnerability reporting or by contacting info@gerdsen.ai.
