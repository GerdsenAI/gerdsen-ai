# Security Review Notes

## 2026-11-24 Review

### Live Status
- **https://gerdsen.ai/** : HTTP/2 200 via Cloudflare + GitHub Pages (Varnish). Last-Modified 2026-11-22. Cache-Control max-age=600. Site is up and serving the static content.
- **https://www.gerdsen.ai** : 301 to apex.
- **https://portal.gerdsen.ai** : HTTP/2 401 with Cloudflare Access (www-authenticate Bearer realm=OAuth, error=invalid_token). Edge protected. Origin connection health behind Access unverified from public vantage; repository GerdsenAI/GerdsenAI-ShepherdMCP-Cloudflare-Portal is empty (no commits).
- **https://keepawake.gerdsen.ai** and **https://status.gerdsen.ai** : no DNS / connection failed. GerdsenAI/GerdsenAI_KeepAwake contains only a LICENSE file.
- **https://grumman.ai** : HTTP/2 200 with strong security headers (HSTS preload, full CSP with trusted-types and frame-ancestors none, COOP/CORP, Permissions-Policy, nosniff, no-referrer).

### Security Headers (gerdsen.ai)
Missing response headers (confirmed via curl):
- No Strict-Transport-Security
- No Content-Security-Policy (meta tag present in HTML, but no response header)
- No X-Frame-Options / frame-ancestors
- No X-Content-Type-Options
- No Referrer-Policy
- No Permissions-Policy

access-control-allow-origin: * is present.

### Dependabot Alerts (open)
4 open on gerdsen-ai (dev dependencies only; production is pure static):
- qs (multiple DoS / arrayLimit issues)
- follow-redirects (custom auth header leak on cross-domain redirect)

Open Dependabot PR #12 exists for a qs bump.

### Code Review (line-by-line)
Pure static site (index.html, assets/js/main.js, assets/css/main.css, config files).
- Contact form posts to Formspree (https://formspree.io/f/xeozyrwa) via fetch JSON. No user-controlled content inserted into DOM (status messages are static strings). No innerHTML of untrusted data, no eval, no document.write, no sensitive localStorage.
- CSP meta tag present with reasonable restrictions (script-src self + sha256, connect-src self + formspree).
- No server-side code.
- Production risk from reviewed code is low.

### Grumman AI
No public website or security alerts exposed on gerdsen.ai. Private repos (GrummanAI-Agent, research skills, Orin Camera Lab, etc.) exist but are unrelated to this public site and not exposed.

### Recommendations
1. Configure security response headers at the Cloudflare zone for gerdsen.ai (preferred):
   - Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
   - Content-Security-Policy (match or tighten the meta, allow Formspree)
   - X-Frame-Options: SAMEORIGIN or CSP frame-ancestors 'none'
   - X-Content-Type-Options: nosniff
   - Referrer-Policy: strict-origin-when-cross-origin or no-referrer
   - Permissions-Policy restricting camera, microphone, geolocation, etc.
2. Merge Dependabot PR #12 (or newer) to clear qs alerts; consider removing unused http-server if local dev only.
3. Self-host Google Fonts or add SRI to further tighten CSP.
4. Portal origin remains empty; keep-awake has no implementation.

Site is security-minded (minimal static surface) but missing response headers are the primary actionable gap.
