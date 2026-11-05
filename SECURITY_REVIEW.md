# Security Review Findings for gerdsen.ai (static site)

## Positive Observations
- Pure static site with no server-side rendering or dynamic backend in this repo.
- Contact form uses Formspree (third-party) with client-side JS handling; no direct user-controlled HTML injection.
- JS is clean: no `eval`, `innerHTML` with untrusted data, or other obvious sinks.
- Local script only (`assets/js/main.js` with `defer`).
- `robots.txt` appropriately restricts development artifacts.
- JSON-LD structured data is static and safe.

## Findings & Recommendations

### 1. Missing Content Security Policy (High)
No CSP is defined. Recommend adding a strict CSP meta tag to mitigate XSS, even though current code is clean.

Suggested CSP:
```
default-src 'self';
script-src 'self';
style-src 'self' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data:;
media-src 'self';
connect-src 'self' https://formspree.io;
form-action https://formspree.io;
frame-ancestors 'none';
base-uri 'self';
```

### 2. Missing Security Headers
- Referrer-Policy: recommend `strict-origin-when-cross-origin` or `no-referrer`.
- X-Content-Type-Options: nosniff
- Permissions-Policy: restrictive defaults
- X-Frame-Options: DENY (or via CSP frame-ancestors)

These are best set at the CDN/hosting layer (Cloudflare, Vercel, or GitHub Pages + Cloudflare). Meta tags can approximate some.

### 3. Third-Party Dependencies in package-lock.json (Medium/Low for production)
Open Dependabot alerts:
- qs (multiple, medium/low) – development dependency (http-server)
- follow-redirects (medium)

Merge existing Dependabot PRs and keep lockfile updated. Production site does not ship these.

### 4. External Google Fonts
Loaded without Subresource Integrity. Consider self-hosting fonts for better privacy and CSP simplicity, or add integrity if possible.

### 5. Form Handling
Formspree endpoint is hardcoded in both HTML `action` and JS fallback. Ensure Formspree project has spam protection (honeypot, reCAPTCHA) enabled. No sensitive data is collected beyond standard contact fields.

### 6. Large Media Assets
Multiple multi-MB videos. Not a security issue, but consider optimization and lazy-loading for performance (already using preload=metadata).

### 7. Hosting Notes
- vercel.json disables Git deployments.
- GitHub Actions workflow deploys to GitHub Pages.
- Custom domain via CNAME. Recommend putting Cloudflare in front for WAF, HSTS, full security headers, and bot protection.

## Portal / Keep-Awake / Live Status
No portal connection health, keep-awake logic, or live status endpoints were found in this repository or on the live https://gerdsen.ai site. Related empty repos (GerdsenAI_KeepAwake, GerdsenAI-ShepherdMCP-Cloudflare-Portal) exist but contain no code.

## Action Items
- Add CSP meta tag (this PR).
- Enable and configure security headers at the edge.
- Merge Dependabot updates.
- Consider self-hosting fonts.
