# Coolstory — Agent Briefing

## What we're doing
Building the Coolstory.me marketing website. Pages are built section-by-section from a shared design system. The live site already exists (built in Framer) — we're rebuilding it in clean HTML/CSS using our own component system.

**Live site:** https://coolstory.me  
**Repo:** `/Users/igor/Documents/GitHub/igormalchenko.github.io/coolstory/`

---

## Before touching anything
Read `design-system.html`. All rules, components, tokens, and conventions live there.

---

## Workflow

1. **Edit** source files in `/Users/igor/Documents/GitHub/igormalchenko.github.io/coolstory/`
2. **Preview** at `http://localhost:8799/` — server runs via:
   ```
   npx serve -p 8799 /Users/igor/Documents/GitHub/igormalchenko.github.io/coolstory
   ```
   Restart if needed. No copy step — edits are live immediately.
3. **Commit and push** to deploy to GitHub Pages

---

## File structure

```
coolstory/
  css/
    tokens.css          design tokens
    main.css            all component CSS
  js/
    main.js             minimal JS
  images/               static assets
  design-system.html    components, tokens, all rules ← read first
  index.html            homepage (design reference)
  CLAUDE.md             this file
  user-onboarding/
  product-updates/
  shoppable-stories/
  blog/
  docs/
  terms/
  privacy/
```

---

## Starting a new page

1. Read `design-system.html`
2. Scrape the live page URL for copy, section order, and asset URLs
3. Use `index.html` for design patterns only
4. Build section by section — verify in browser after each one
