# Security Policy

## Supported Versions

The live site at https://gerdsen.ai is the supported version. It is a static site published from this repository via GitHub Pages (with Cloudflare in front).

## Reporting a Vulnerability

Please email security@gerdsen.ai (or info@gerdsen.ai) with details. We aim to acknowledge within 72 hours.

Do not open public issues for undisclosed vulnerabilities.

## Content Security Policy

The site ships a strict meta Content-Security-Policy (browsers apply it). The corresponding response-header policy (recommended for full coverage, including frame-ancestors) is:

```
default-src 'self'; script-src 'self' 'sha256-WZRJfWvsnNCPcxzZwvyhovnZGqhZaC+8gPGPRbx6wTk='; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://formspree.io; base-uri 'self'; form-action 'self' https://formspree.io; frame-ancestors 'none';
```

frame-ancestors is response-header-only; browsers ignore it in a meta policy. The meta policy is the authoritative source for the other directives and is kept in sync by tests/test_csp.py.

## Recommended Response Headers

As of the 2026-11-27 review, the live site (behind Cloudflare) returns no Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, or Permissions-Policy response headers. SecurityHeaders.com scores the site F for this reason. The meta CSP provides partial protection; response headers are required for the remaining directives and for scanners/tools.

Recommended minimum set (add via Cloudflare Transform Rules, Page Rules, or Workers):

- Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
- Content-Security-Policy: (the policy above)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()

Also review Access-Control-Allow-Origin: * (currently present) and tighten if cross-origin access is not required.

## Contact Form

Submissions go to Formspree (https://formspree.io/f/xeozyrwa). Treat the endpoint as public; do not rely on it for sensitive data. Formspree handles the transport.

## Live Status, Portal Health, Keep-Awake

The current site is a static marketing page. It does not include a live status indicator, portal connection health check, or keep-awake mechanism. Those features are not present in the codebase or on the deployed site as of this review.

## Dependencies

Dependabot is enabled. Review and merge security updates promptly (an open PR for qs was present at review time).
