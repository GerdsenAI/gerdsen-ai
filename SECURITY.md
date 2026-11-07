# Security Review Findings - gerdsen.ai

## Date: 2026-11-06

### Live Site Status
- Site is up and serving static content from GitHub Pages / gerdsen-ai repo.
- No portal connection health, keep-awake, or live status indicators present on the public site.
- Contact form posts to Formspree (https://formspree.io/f/xeozyrwa) via client-side JS. No secrets exposed.

### Dependabot / Security Alerts
Open alerts on this repo (mostly transitive):
- qs: multiple medium/low DoS and parsing issues (CVE-2026-8723, CVE-2026-2391, CVE-2025-15284). Existing PR #12 bumps qs to 6.14.1 (partial fix). Recommend merging and further updates.
- follow-redirects: medium header leak (CVE-2026-40895).

### Code Review (every line of index.html + main.js)
- Static HTML with external CSS/JS. No dangerous innerHTML or eval.
- Inline script for .js class (removed in this branch for CSP).
- Form: client-side only validation via HTML5; payload is JSON to Formspree. No rate limiting on client.
- No CSP originally. Added meta CSP in this branch (strict-ish: script-src 'self', connect-src self + formspree).
- Added X-Content-Type-Options and Referrer-Policy meta.
- Videos and images are self-hosted. Fonts from Google (allowed in CSP).
- GitHub Pages has limited header control; meta tags provide partial protection. Consider Cloudflare in front for full headers if needed.

### Recommendations
1. Merge this branch for CSP hardening.
2. Merge Dependabot PR #12 and keep dependencies updated.
3. For portal/keep-awake/live status: these appear in other private repos (GerdsenAI_KeepAwake, GerdsenAI-ShepherdMCP-Cloudflare-Portal) which are empty or not integrated. If a status widget is desired, implement a secure /status endpoint or static badge.
4. Monitor for further alerts.

### NextJS Repo Note (GerdsenAI-Website-NextJS)
- Critical Next.js RCE alerts in 16.x (use cache functions). Current ^16.0.0 vulnerable; existing Dependabot PR only to 16.0.7 (insufficient if patch is 16.4.1+).
- High undici TLS validation bypass / DoS.
- Contact form rate limit uses client-supplied _ip from FormData (spoofable). Use headers() from next/headers instead.
- Rate limits fail-open on KV errors.
- Recommend urgent dependency updates and IP fix.

This is a security-minded review. No secrets committed. Local compute only.
