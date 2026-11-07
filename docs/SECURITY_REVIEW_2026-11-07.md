# Security Review — Gerdsen AI / Grumman AI Site (2026-11-07)

## Scope
Public site: https://gerdsen.ai (repo GerdsenAI/gerdsen-ai, static GitHub Pages).
Related private repos checked: GerdsenAI_KeepAwake, GerdsenAI-ShepherdMCP-Cloudflare-Portal, GrummanAI-*.

## Security Alerts
- **Dependabot (open)**: 4 alerts in package-lock.json (dev-only scope):
  - qs: GHSA-q8mj-m7cp-5q26 (CVE-2026-8723, medium), GHSA-w7fw-mjwx-w883 (CVE-2026-2391, low), GHSA-6rw7-vpxm-498p (CVE-2025-15284, medium). Open PR #12 only reaches 6.14.1; some require 6.14.2+ or 6.15.2.
  - follow-redirects: GHSA-r4q5-vmmm-2653 (CVE-2026-40895, medium). Affects http-server local dev only.
- **Code scanning**: Not enabled (requires GitHub Advanced Security). No open alerts.
- **Secret scanning**: No open alerts reported.
- Recommendation: Merge or supersede PR #12 after bumping to patched versions, or run `npm update` and commit clean lockfile. Low risk for production (static site, no Node runtime).

## Live Site Status
- Site is live and healthy at https://gerdsen.ai.
- Content is the expected static marketing page (hero, AI stack, services, applied systems, process, contact).
- **No portal connection health UI**, **no keep-awake controls**, and **no live status dashboard** are present in the rendered page or source.
- Hero "status line" is static text ("Full-stack AI · Lafayette, LA").
- "Connection layer" is marketing copy only.

## Related Repos
- GerdsenAI_KeepAwake: private, no public README or visible code via API in this pass.
- GerdsenAI-ShepherdMCP-Cloudflare-Portal: empty repository.
- GrummanAI-* repos exist but are private and outside the public site scope.

## Full Code Review (application surface)
### assets/js/main.js
- Reviewed line-by-line. No eval, Function, innerHTML/outerHTML with user data, document.write, or unsafe sinks.
- Contact form: FormData → JSON fetch to Formspree endpoint with Accept and Content-Type headers. Proper disable/busy states, error handling, reset on success. No credential or sensitive data leakage.
- Navigation, smooth scroll, reveal animations, service details, particle canvas: all local, respect prefers-reduced-motion, no external data.
- Visibilitychange handler only pauses/resumes animation.

### index.html
- Static content, no inline event handlers with dynamic values.
- Form action="https://formspree.io/f/xeozyrwa" method="POST" (JS overrides to JSON POST). HTML5 required + autocomplete attributes present. No honeypot field.
- External Google Fonts (preconnect + stylesheet) without SRI.
- Videos (autoplay muted loop playsinline) and images are local assets.
- Structured data (JSON-LD) is static and correct.
- No CSP, X-Frame-Options, or other security meta tags.

### Supporting files
- .github/workflows/jekyll-gh-pages.yml: official actions, least-privilege permissions (contents:read, pages:write, id-token:write), concurrency safe.
- vercel.json: deploymentEnabled false.
- robots.txt / sitemap.xml / _config.yml / serve-local.sh: no security issues (local server is Python http.server).
- package.json: http-server (dev) + unused @fortawesome/fontawesome-free.
- CSS and assets: no executable content of concern.

## Findings & Recommended Actions
1. **Missing security headers** on live responses (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy). Configure via Cloudflare (in front of GitHub Pages) or equivalent. Suggest starting CSP: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'self' https://formspree.io; form-action https://formspree.io; frame-ancestors 'none'.
2. **Dependabot hygiene**: Update or close the open alerts. PR #12 is insufficient for all listed CVEs.
3. **Google Fonts**: Prefer self-hosting or add integrity attributes if feasible to reduce third-party surface.
4. **Contact form**: Acceptable for marketing; add honeypot or Turnstile if spam observed. Data leaves to Formspree by design.
5. **Portal / keep-awake / live status**: Not implemented on the public site. If required, treat as a separate authenticated service with rate limiting, CSP, and no exposure of internal health details.

## Conclusion
Low-risk static marketing site. No critical or high-severity issues in reviewed code. Primary items are dependency hygiene (dev-only) and missing response headers. Live site, portal connection health, keep-awake, and status features are not present in the public codebase.

Reviewed 2026-11-07 via full source inspection + live browse.
