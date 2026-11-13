# Gerdsen AI Website

Static GitHub Pages site for [gerdsen.ai](https://gerdsen.ai).

## Local Preview

```bash
npm install
npm run dev
```

The dev server runs the static site from the repository root at `http://127.0.0.1:4000`.

## Local regression checks

```bash
python3 -m unittest discover -s tests -v
```

These dependency-free source checks keep the early bootstrap hash, CSP resource allowances, stylesheet-based reveal delay, and documented policy in sync. They do not replace browser or deployed-header validation.

## Deployment

This site is designed to publish directly from GitHub Pages with no build step.

- Keep `CNAME` set to `gerdsen.ai`.
- Keep public assets under `assets/`.
- Do not require server-side rendering or a runtime framework for production.
- The contact form posts to the existing Formspree endpoint in `index.html`.

## Preview Branches

The `codex/ui-typewriter-hero-a` branch is the closest match to the provided typewriter/server-room hero reference.

The `codex/ui-command-center-b` branch is the more polished command-center variant with the same GitHub Pages-compatible static architecture.
