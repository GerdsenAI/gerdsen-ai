# Security Review: gerdsen.ai (GerdsenAI/gerdsen-ai)

**Date:** 2026-11-13
**Reviewer:** Automated agent review (security-minded pass)
**Scope:** Live site https://gerdsen.ai + full static source (index.html, assets/js/main.js, package.json, workflows, robots.txt, vercel.json)
**Brand context:** Public site for GERDSEN AI LLC / Grumman AI related work. No portal, keep-awake, or live connection-health dashboard present on this surface.

## Live Status
- Site is **UP** (HTTP 200, Cloudflare in front of GitHub Pages).
- Last-modified from headers: 2026-04-24.
- No portal connection health, keep-awake, or dynamic status indicators observed.
- Contact form posts to Formspree endpoint `https://formspree.io/f/xeozyrwa`.

## Security Findings

### 1. Missing Security Headers (Medium)
Observed response headers (via HEAD request):
- No `Content-Security-Policy`
- No `X-Frame-Options` / `frame-ancestors`
- No `X-Content-Type-Options: nosniff`
- No `Referrer-Policy`
- No `Permissions-Policy`
- No `Strict-Transport-Security` (HSTS) visible

**Impact:** Clickjacking, MIME sniffing, information leakage via referrer, missing CSP increases XSS blast radius if any script injection occurs.
**Recommendation:** Configure via Cloudflare Transform Rules / Page Rules or GitHub Pages custom headers if available. Minimum set:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'self' https://formspree.io; frame-ancestors 'none';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### 2. Third-Party Google Fonts (Low / Privacy)
`<link>` to `fonts.googleapis.com` and `fonts.gstatic.com` without SRI.
**Impact:** Privacy (client IP/User-Agent sent to Google), supply-chain dependency.
**Recommendation:** Self-host the two font families (Courier Prime, IBM Plex Mono) under `assets/fonts/` and update CSS. Removes external request.

### 3. Contact Form (Low)
- Formspree endpoint hardcoded in `assets/js/main.js` and form action.
- Client-side only basic HTML5 required attributes; no visible honeypot or CAPTCHA.
- Error messages do not leak stack traces (good).
- Uses `textContent` for status (XSS-safe).
**Recommendation:** Confirm Formspree reCAPTCHA / spam protection is enabled on the form. Consider adding a simple honeypot field.

### 4. Dependencies
- `http-server@^14.1.1` (dev only) and `@fortawesome/fontawesome-free@^7.1.0` checked against GitHub Advisory Database: **no known vulnerabilities**.
- Font Awesome is listed but not referenced in the reviewed HTML/CSS/JS (dead dependency?).

### 5. Positive Observations
- Static site, no server-side code.
- JS uses `textContent`, no `innerHTML` on user data.
- Videos are `muted` + `playsinline`.
- robots.txt present and reasonable.
- Canonical, OG, Twitter cards, JSON-LD present.
- No open security advisories published on the repository.
- No open issues at time of review.

### 6. Other Repos Noted
- `GerdsenAI_KeepAwake`: contains only LICENSE (no implementation).
- `GerdsenAI-ShepherdMCP-Cloudflare-Portal`: empty repository.
- Multiple open security-related PRs exist in `GerdsenAI-CLI` (workspace boundary / symlink escape fixes). Those are out of scope for this site but indicate active security work elsewhere in the org.

## Next Steps
1. Apply header policy at Cloudflare or equivalent.
2. Self-host fonts.
3. Verify Formspree spam controls.
4. Remove unused `@fortawesome/fontawesome-free` if confirmed unused.
5. Consider adding a public status page or health endpoint if portal/keep-awake features are planned.

---
*Generated as part of a security-minded full-code review request.*