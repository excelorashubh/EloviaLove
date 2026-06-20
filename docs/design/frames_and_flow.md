Frames & Flow — Discover

Breakpoints & grids
- Desktop frame: 1440 x 1024, 12-column grid (max content width 1200, gutter 24)
- Tablet frame: 1024 x 768, 8-column grid
- Mobile frame: 375 x 812, single column with 16px side padding

Key frames to create

1) Discover — Desktop
- Frame: 1440 x 1024
- Top: Hero (full width) height 220
- Content: two-column layout: left main (centered max-width 680) and right sidebar (340px)
- Include 3 stacked SwipeCard mock in main area and FilterSidebar in right column

2) Discover — Mobile
- Frame: 375 x 812
- Top: compact Hero height 120
- Main: SwipeCard full-bleed 360 x 640; bottom MobileActions bar height 80
- Filter: bottom sheet overlays 70vh

3) Profile Grid View
- Desktop: grid of ProfileCard (3 columns) with 24 gap
- Mobile: single column stacked cards

Flow map (prototype)
- Entry -> Discover (stack view)
  - Drag right -> like -> toast -> remove card
  - Drag left -> pass -> remove card
  - Double-tap -> super-like -> highlight + toast
- Tap "Browse" -> crossfade to Profile Grid
- Tap filter icon -> open FilterPanel (desktop: slide from right; mobile: bottom sheet)
- On match -> open Match Popup modal; CTA "Send Message" -> navigate to chat

Developer handoff notes
- Provide `figma_tokens.json` to populate colors/typography in Figma.
- For motion: use spring (stiffness 300, damping 25) for panel slide; use ease-in-out for fades.
- Provide exported SVG assets in `assets/` for icons and profile placeholder.
