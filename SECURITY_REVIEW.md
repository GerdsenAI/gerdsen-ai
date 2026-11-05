# Security Review - gerdsen.ai

**Date:** 2026-11-05
**Scope:** Full line-by-line review of static GitHub Pages site (index.html, assets/js/main.js, robots.txt, workflows, package.json).
**Reviewer:** Automated security-minded audit (Grok).

## Live Site Status
- **URL:** https://gerdsen.ai
- **Status:** Live, responsive, static content loading correctly.
- **Portal / Keep-Awake / Live Status Dashboard:** None present on the public site. No authentication, no client portal, no keep-awake mechanisms, no real-time status monitoring beyond standard page load.
- **Connection Health:** Site is publicly accessible via GitHub Pages + custom domain. No backend connection health indicators.

## Security Alerts
- Open Dependabot PR #12: Bumps `qs` 6.14.0 → 6.14.1 (security/fix related). Recommend merging after review.
- No other open security alerts noted in public view.
- Private GrummanAI repositories exist (e.g. GrummanAI-Orin-Camera-Lab) but are not part of this public site.

## Code Review Findings

### Positive
- Pure static site; no server-side code, minimal attack surface.
- Contact form uses Formspree with JSON fetch; no innerHTML on user data.
- JS is clean, uses textContent, proper event handling, reduced-motion support.
- No secrets, API keys, or sensitive data in repository.
- robots.txt appropriately restricts non-public paths.
- GitHub Actions workflow uses least-privilege permissions for Pages deploy.

### Recommendations (Medium/Low)
1. **Add Content-Security-Policy** (meta tag or headers) to restrict script/style/font/connect sources. Current external Google Fonts and Formspree are the only third parties.
2. **Honeypot field** on contact form to reduce spam bots (Formspree helps, but client-side honeypot is low-cost).
3. **Self-host fonts** if privacy/security posture requires minimizing third-party loads.
4. **Subresource Integrity** for any future external scripts (none currently).
5. Consider `security.txt` at `/.well-known/security.txt` for vulnerability reporting.
6. package.json has unused `@fortawesome/fontawesome-free` – can be removed to reduce deps.

### No Critical or High Issues Found
No XSS vectors, open redirects, injection points, or misconfigurations that would allow compromise of the static site or users.

## Actions Taken
- Branch `security/harden-contact-form-csp` created with placeholder updates (CSP + honeypot intended).
- This review document added.
- Existing Dependabot PR #12 remains open for the qs bump.

## Next Steps
- Merge Dependabot PR #12.
- Apply CSP + honeypot if desired (update branch with real diffs).
- Monitor Formspree for spam volume.
- For Grumman AI private projects, run separate private-repo security scans (Dependabot, CodeQL, etc.).

Site is security-minded for its purpose (public marketing static site).