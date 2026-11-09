# Security Review – gerdsen.ai static site

## Summary of review (2026-11-09)

The public site at https://gerdsen.ai/ is a static HTML/CSS/JS marketing site with no backend, no user authentication, and no dynamic content generation from user input.

### Positive findings
- Contact form submits via JSON to Formspree; status messages use `textContent` (no XSS).
- No secrets, API keys, or sensitive data in the repository.
- Accessibility attributes present.
- Minimal JavaScript with no eval or dangerous DOM sinks.
- Dependabot is active (open PR #12 for minor qs update).

### Recommendations
1. **Missing Content Security Policy** – Add a CSP meta tag or header restricting sources to self, Google Fonts, and Formspree. This mitigates XSS and injection even on a static site.
2. **No explicit security headers** – GitHub Pages has limited header control. Consider a Cloudflare or similar proxy for full headers (HSTS, X-Frame-Options, etc.).
3. **External font dependency** – Self-hosting fonts would further reduce third-party surface.
4. **Open Dependabot PR** – PR #12 bumps qs. Recommend merging after review for dependency hygiene (devDependency only).

### Portal connection health, keep-awake, live status
No such features exist on the public site. The page is purely static marketing content. If these are intended for a private dashboard or the Next.js site (`GerdsenAI-Website-NextJS`), they should be reviewed separately.

### Next steps
- Add CSP.
- Review and merge Dependabot PR #12.
- Periodically re-scan dependencies.
- For the private Next.js site, verify Next.js version against known CVEs (multiple high/critical advisories exist for recent Next.js releases).
