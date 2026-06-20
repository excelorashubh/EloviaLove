Component Spec — Discover (Elovia Love)

Guidelines
- Build components as Figma Components with Variants for states (default, hover, pressed, disabled, loading).
- Use token names from `figma_tokens.json` to create Color, Text and Effect styles.
- Use 8pt grid for spacing; use token spacing values.

Core components

1) Button
- Variants: Primary, Secondary, Ghost
- Sizes: sm (32px), md (44px), lg (56px)
- Primary: background `color.primary.600`, text `white`, radius `radius.md`, shadow `shadow.primary` on hover.
- Accessible contrast: ensure primary text >= 4.5:1
- Interaction: hover (lift + shadow), pressed (scale 0.98)

2) ProfileCard (compound)
- Frame size (desktop grid card): 320 x 420 (padding 16)
- Parts: Photo area (top 240px), details area (padding 16), action row (buttons)
- Variants: Default / Reported / Bookmarked
- States: hover (elevate shadow), focus (outline ring 2px color.primary.600)
- Accessibility: images have descriptive alt; name is H3; actions have aria-labels
- Actions: Pass (left), Like (primary circular center), Super (right), Save (bookmark), Report

3) SwipeCard
- Frame size: 360 x 640 (mobile full-bleed card)
- Interaction: drag left/right to trigger pass/like; double-tap to super-like; flick velocity threshold triggers action
- Visual overlays: LEFT "NOPE" red badge rotates -20deg; RIGHT "LIKE" green badge rotates 20deg; fade in during drag

4) FilterPanel
- Desktop: right-side panel width 340px, full height
- Mobile: bottom sheet height 70vh, rounded top corners
- Sections: Basic / Premium / Pro sections with lock badge when disabled
- Interaction: tapping outside closes panel; panel slides in/out (spring)

5) Hero
- Frame width: full width; content max-width 1200; left text column + right promo card
- CTA: Primary and secondary CTA; show premium benefits

6) Match Popup
- Center modal (max-width 420px), celebratory emoji, profile image (96px), actions: Message (primary), Continue (secondary)
- Interaction: tap outside closes; Esc to close; focus trap inside modal

7) Mobile Actions
- Bottom fixed bar height 80px with three actions: pass, like, super-like
- Buttons are large circular with touch target 56-64px

Accessibility & ARIA notes
- All interactive controls must be reachable via Tab and have aria-labels.
- Modal must trap focus; Escape closes overlays.
- Color contrast: ensure text over gradient uses white with shadow or solid text to meet contrast.

Assets
- Use SVG icons (Heart, X, Star, More) as Figma components for easy swap.

Interactions (prototype)
- From Discover stack: drag top card right -> animate removal, show like-toast; if mutual, open Match Popup
- Tap "Browse" -> switch to grid view with smooth crossfade
- Tap filter -> open FilterPanel (slide from right on desktop, bottom on mobile)

Tokens mapping
- Map component fill/fill-hover to `color.primary.600` / `color.primary.700` and gradients composed of `color.primary.600` -> `color.pink.500`.

Export checklist
- Export SVGs for icons with 24px and 48px sizes.
- Export profile placeholder SVG (circle) at 512px.

