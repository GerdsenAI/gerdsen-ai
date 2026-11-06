# Security Review — gerdsen.ai (2026-11-06)

## Scope
Static site in `GerdsenAI/gerdsen-ai` serving https://gerdsen.ai (GitHub Pages + Cloudflare).

## Alerts Checked
- **Dependabot**: 4 open alerts, all in `package-lock.json` under development scope (`qs`, `follow-redirects`). These affect only local `npx http-server` and do not ship to production. Existing PR #12 addresses one of them. Recommend merging Dependabot PRs or running `npm update` and committing a clean lockfile.
- **Secret scanning**: none open.
- **Code scanning**: not enabled (Advanced Security required).

## Live Site Status
- Site is up and serving the expected static content.
- No portal connection health, keep-awake, or live status features are present in the current codebase or rendered page. The status line in the hero is static text.

## Code Review (every line of application code)
### `assets/js/main.js`
- Clean. No `eval`, `innerHTML` with untrusted data, `document.write`, or other sinks.
- Contact form uses `fetch` with explicit JSON, proper error handling, and Formspree endpoint. No credential leakage.
- Particle canvas and UI interactions are local and safe.
- Respects `prefers-reduced-motion`.

### `index.html`
- No inline event handlers or unsafe scripts.
- External Google Fonts loaded without SRI (privacy + supply-chain consideration).
- Contact form action points to Formspree (third-party; rate limiting and spam protection are on their side).
- Structured data and meta tags are present and correct.

### Other files
- `robots.txt`, `sitemap.xml`, `_config.yml`, CSS: no issues.
- `package.json` lists `@fortawesome/fontawesome-free` which is unused in the HTML (removed in this PR).

## Findings & Recommendations
1. **Missing security headers** (observed on live response): no `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, or `Strict-Transport-Security` visible from origin. Cloudflare is in front; recommend configuring these in the Cloudflare dashboard or via a `_headers` file if supported.
2. **Self-host fonts** or add SRI hashes for Google Fonts to reduce third-party exposure.
3. **Dependabot**: merge or close the open alerts; they are low-risk for this static site but should not be left open indefinitely.
4. **Formspree**: acceptable for a marketing site; consider adding a honeypot or Cloudflare Turnstile if spam becomes an issue.
5. No evidence of portal / keep-awake / live-status functionality. If these are required, they need to be implemented as a separate service or page with proper authentication and rate limiting.

## Conclusion
The site is a low-risk static marketing page. No critical vulnerabilities found in the reviewed code. The primary improvements are operational (headers, dependency hygiene) rather than code defects.

Reviewed: 2026-11-06 by automated security pass.
