# PlutoHacks 2026 — About Orbi Starter

This is a fresh 2026 redesign scaffold based on the new visual direction.

## Files
- `index.html` — page structure
- `styles.css` — the new design system and responsive layout
- `script.js` — archive dropdown, mobile nav, subtle starfield, reveal animation
- `design-reference.png` — visual direction mockup
- `assets/images/` — temporary assets copied from the 2025 project

## First things to replace
1. `orbi-2025-temp.png` in the hero with the final transparent 2026 Orbi artwork.
2. The temporary gallery artwork with 2026 images.
3. The 2026 placeholder circle in the evolution section.
4. The old archive path after the 2025 page is moved to `/archive/2025/`.
5. Bring the exact approved legal/footer wording from the published 2025 page before launch.

## Recommended archive structure
```
/
  index.html             <- current 2026 page
  styles.css
  script.js
  assets/
  archive/
    2025/
      index.html         <- preserved 2025 page
      ...2025 files
```

This lets `orbi.plutohacks.com/` always show the current mascot while older designs live under stable year URLs.
