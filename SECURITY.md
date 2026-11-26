# Security Review — gerdsen.ai

**Date**: 2026-11-26  
**Scope**: Public static site (GitHub Pages + Cloudflare), local-dev dependencies, related private portals, Grumman AI surface.

## Live Status

- `https://gerdsen.ai/` returns **HTTP/2 200** via Cloudflare + GitHub Pages.
- No response headers for CSP, HSTS, X-Frame-Options, X-Content-Type-Options, or Referrer-Policy.
- CSP is present only as a `<meta http-equiv="Content-Security-Policy">` tag (defense-in-depth).
- `access-control-allow-origin: *` is set (acceptable for a static marketing site).

## Code Scanning / Secret Scanning

- **Code scanning alerts**: None open.
- **Secret scanning alerts**: None open.

## Dependabot Alerts (open)

All four open alerts are **development-only** (transitive via local `http-server` / `package-lock.json`). The production site is pure static HTML/CSS/JS with no server-side runtime dependency on these packages.

| Alert | Package | Severity | Notes |
|-------|---------|----------|-------|
| #1 | qs | medium | arrayLimit bypass (bracket) — fixed in 6.14.1 |
| #2 | qs | low | arrayLimit bypass (comma) — fixed in 6.14.2 |
| #3 | follow-redirects | medium | Custom auth header leak on cross-domain redirect |
| #4 | qs | medium | stringify DoS on null/undefined in comma + encodeValuesOnly — fixed in 6.15.2 |

Open Dependabot PR: [#12](https://github.com/GerdsenAI/gerdsen-ai/pull/12) (qs 6.14.0 → 6.14.1). Additional alerts remain; consider a broader `npm update` or removing the unused `http-server` dependency (prefer Python `http.server` for local preview).

## Portal Connection Health

- `GerdsenAI/GerdsenAI-ShepherdMCP-Cloudflare-Portal` is an **empty repository** (no commits, 409 on tree).

## Keep-Awake

- `GerdsenAI/GerdsenAI_KeepAwake` contains **only a LICENSE file** (no implementation).

## Grumman AI

- No public surface or alerts on gerdsen.ai related to Grumman AI.
- Private repositories exist (`GrummanAI-Agent`, `GrummanAI-Orin-Camera-Lab`, research skills, etc.) but are unrelated to this website and not exposed.

## Code Review (every line)

Reviewed `index.html`, `assets/js/main.js`, `assets/css/main.css`, form handling, and asset loading.

- Pure static site. No server-side code.
- Contact form posts to Formspree (`https://formspree.io/f/xeozyrwa`) over HTTPS. Client-side fetch with JSON; no sensitive data stored locally.
- No `eval`, `innerHTML` with untrusted input, `document.write`, or dynamic script injection.
- Inline bootstrap script is minimal and covered by CSP hash (`sha256-WZRJfWvsnNCPcxzZwvyhovnZGqhZaC+8gPGPRbx6wTk=`).
- Particles canvas and IntersectionObserver usage are safe.
- No XSS, CSRF (static + external form), or injection vectors identified.
- Branding, accessibility attributes, and reduced-motion handling look solid.

## Recommended Security Headers (Cloudflare)

Prefer response headers over meta tags. Example policy (includes framing control that browsers ignore in meta):

```
default-src 'self'; script-src 'self' 'sha256-WZRJfWvsnNCPcxzZwvyhovnZGqhZaC+8gPGPRbx6wTk='; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://formspree.io; base-uri 'self'; form-action 'self' https://formspree.io; frame-ancestors 'none';
```

Also set:
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

`frame-ancestors` is response-header-only; browsers ignore it in a meta policy.

## Recommendations

1. Merge or extend Dependabot PR #12 and clear remaining dev-only alerts (or drop `http-server`).
2. Configure the above security headers on the Cloudflare zone for gerdsen.ai.
3. Keep SECURITY.md updated after material changes.
4. Portal and Keep-Awake repos remain stubs; no production connection health impact on this site.

---

*This document is the authoritative public security status for the gerdsen.ai static site.*
