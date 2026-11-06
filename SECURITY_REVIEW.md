# Security Review: gerdsen.ai Static Site

**Date:** 2026-11-06  
**Reviewer:** Automated security pass (Grok)  
**Scope:** Full review of index.html, assets/js/main.js, robots.txt, vercel.json, package.json, and live site behavior. Focus on security-minded practices, absence of dynamic status/portal features, and supply-chain/CSP hygiene.

## Summary
The site is a clean static GitHub Pages / static hosting marketing page. No server-side code, no authentication, no user data storage on origin. Contact form delegates to Formspree. Overall low attack surface. No presence of Grumman AI / Gerdsen portal security alerts, connection health, keep-awake, or live status widgets (hero status-line is static text only).

## Findings

### 1. Missing Content-Security-Policy (Medium)
No CSP meta tag or response header observed. External resources include Google Fonts and Cloudflare Insights beacon. Recommend adding a strict CSP to mitigate XSS if any future dynamic content is added.

**Suggested meta (add to <head>):**
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'self' https://formspree.io;">
```

### 2. External resources without SRI (Low)
- Google Fonts CSS loaded without Subresource Integrity.
- Cloudflare Insights script loaded without SRI.
Self-host fonts or add integrity attributes where possible. Cloudflare beacon is for analytics; consider if needed on a marketing site.

### 3. Formspree contact form (Info)
`initContactForm` in main.js posts JSON to https://formspree.io/f/xeozyrwa. Client-side only; no sensitive fields beyond contact info. Formspree handles rate limiting and spam. Ensure Formspree dashboard has appropriate notifications and does not store data longer than needed.

### 4. No keep-awake / live status / portal health (Info / Gap)
No Screen Wake Lock API usage, no polling for connection health, no security alert banners, no live status indicators for portal or Grumman systems. The hero `.status-line` is static ("Full-stack AI · Lafayette, LA"). If operational status is desired on the public site, it would require a new authenticated or public status endpoint (not currently present) and careful isolation from internal portal.

### 5. Dependabot open PR #12 (Info)
Existing open PR bumps `qs` (indirect). Review and merge if applicable; static site has minimal runtime deps (http-server is dev-only).

### 6. robots.txt and meta (Good)
robots.txt correctly disallows test/dev files. Canonical, OG tags, and structured data are present and accurate. No sensitive paths exposed.

### 7. Asset handling (Good)
Local videos (muted autoplay), images, and CSS. No inline event handlers. Vanilla JS is straightforward and does not eval or introduce DOM XSS vectors in current form.

## Recommendations
1. Add CSP meta tag (or configure at Cloudflare/GitHub Pages edge if available).
2. Self-host critical fonts or add SRI.
3. Confirm Formspree endpoint permissions and retention.
4. If live portal/Grumman status is required on the public site, design a separate, rate-limited, non-sensitive public status endpoint and keep internal portal isolated.
5. Merge or close Dependabot PR #12 after review.
6. Consider adding a simple security.txt at /.well-known/security.txt.

## Portal / Grumman Note
The internal GerdsenAI Portal (portal.gerdsen.ai, behind Cloudflare Access) and Grumman isolation are documented in private repos (GerdsenAI-Local). This public site has no connection to them. Security alerts, connection health, and keep-awake logic belong in the authenticated portal UI, not this marketing site.

No critical vulnerabilities identified. Site is suitable for public marketing use with the above hardening.
