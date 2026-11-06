# Security Review Findings — Gerdsen AI Website (gerdsen.ai)

**Date**: 2026-11-06  
**Scope**: Full code review of `GerdsenAI/gerdsen-ai` (static site) + live site check.  
**Reviewer**: Automated security-minded pass (every line of HTML/JS/CSS/config reviewed).

## Live Site Status
- **https://gerdsen.ai/** is live, responsive, and serving the current static content.  
- No runtime errors, console issues, or status banners observed.  
- No existing "portal connection health", "keep-awake", or "live status" indicators on the public marketing site (these appear to belong to internal tools such as GerdsenAI-Fleet).

## Security Alerts
- **Dependabot PR #12** (open): Bump transitive `qs` from 6.14.0 → 6.14.1.  
  This addresses query-string parsing edge cases. **Recommendation: merge immediately.**  
- No published GitHub Security Advisories or security policy file detected.

## Code Review Findings (Security-Minded)

### 1. Missing Content Security Policy (High priority for a security-minded site)
No CSP meta tag or header is present.  
A static site should ship a strict CSP to prevent XSS and unauthorized resource loading.

**Recommended addition to `<head>` of `index.html`:**
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'self' https://formspree.io; base-uri 'self'; form-action 'self' https://formspree.io;">
```

### 2. Third-party contact form (Privacy / data residency)
Contact form posts to Formspree (`https://formspree.io/f/xeozyrwa`).  
For a brand that emphasizes local/private AI and controlled operations, customer contact data leaving the organization is a note-worthy control gap.

**Recommendations:**
- Document the third-party processor in a privacy note on the form.
- Prefer a self-hosted endpoint (or email-only) if the contact volume is low.
- Ensure Formspree account has strong access controls and data retention settings.

### 3. External Google Fonts without SRI
Fonts are loaded from `fonts.googleapis.com` / `fonts.gstatic.com` with no Subresource Integrity.  
Self-hosting the two font families (Courier Prime + IBM Plex Mono) eliminates the external dependency and improves privacy.

### 4. Security headers (deployment limitation)
Site is deployed via GitHub Pages (Jekyll workflow). GitHub Pages does not allow custom security headers (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).  
`vercel.json` has deployments disabled.  
**Recommendation:** Place Cloudflare (or similar) in front of the custom domain for header control, or migrate to a host that supports them.

### 5. Positive observations
- `assets/js/main.js` is clean: no `eval`, no `innerHTML` with untrusted data, proper FormData handling, passive scroll listeners, reduced-motion support, Escape-key menu close.
- All media assets are local.  
- Form inputs use appropriate `autocomplete` and `required` attributes.  
- No sensitive data or secrets in the repository.  
- Static architecture (no server-side rendering) reduces attack surface.

## Next Actions
1. Merge Dependabot PR #12.  
2. Add the CSP meta tag (or move to a host that can set headers).  
3. Decide on form data residency (document or replace Formspree).  
4. Consider self-hosting fonts.  
5. Add a `SECURITY.md` policy file.

This file can be removed after the findings are addressed, or converted into a standing security checklist.
