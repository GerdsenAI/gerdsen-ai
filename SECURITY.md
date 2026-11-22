# Security Policy

GERDSEN AI treats the public website as a security-minded surface. The site is static (GitHub Pages / Vercel-compatible), ships a strict Content-Security-Policy, and avoids unnecessary runtime dependencies.

## Content-Security-Policy

The live site embeds the following policy in a `<meta http-equiv="Content-Security-Policy">` tag. The policy is also the source of truth for the regression tests in `tests/test_csp.py`.

```
default-src 'self'; script-src 'self' 'sha256-WZRJfWvsnNCPcxzZwvyhovnZGqhZaC+8gPGPRbx6wTk='; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://formspree.io; base-uri 'self'; form-action 'self' https://formspree.io; frame-ancestors 'none';
```

- `frame-ancestors 'none'` is **response-header-only**. Browsers ignore it when it appears only in a meta policy. The production hosting response headers must supply it (or an equivalent `X-Frame-Options: DENY`).
- No `'unsafe-inline'` or `'unsafe-eval'` on `script-src`.
- The single early bootstrap script (`document.documentElement.classList.add("js");`) is hash-pinned.
- External connections are limited to the Formspree contact endpoint.

## Reporting a Vulnerability

Please report security issues privately to **info@gerdsen.ai**. Include:

- Description and impact
- Steps to reproduce
- Affected URL / component
- Suggested fix (if any)

Do not open a public issue for unfixed vulnerabilities. We will acknowledge receipt and coordinate a fix.

## Scope

- Public marketing site: https://gerdsen.ai/
- Related private systems (Portal, KeepAwake, local AI suites) are out of scope for this repository; they have their own owners and remediation tracks (see GerdsenAI-Local #434 and related issues).

## Dependency Hygiene

- Dependabot is enabled. Review and merge security bumps promptly.
- Transitive packages (e.g. `qs` via the local `http-server` devDependency) should stay current.
- Unused production dependencies should be removed.

## Live Status / Portal Health

This public site intentionally does **not** expose live operational status, portal connection health, keep-awake state, or internal security alerts. Those signals belong on authenticated private surfaces. Adding public health badges would require a reviewed, non-sensitive design and separate approval.

## Last reviewed

2026-11-22 — full source review of `index.html`, `assets/js/main.js`, CSP tests, and dependency files.
