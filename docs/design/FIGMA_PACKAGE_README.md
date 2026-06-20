Figma Package — Elovia Love (Discover)

What this package contains

- `figma_tokens.json`: Design tokens compatible with the Figma Tokens plugin / Style Dictionary (colors, typography, spacing, radii, shadows).
- `components_spec.md`: Component system and variants to implement as Figma components (ProfileCard, SwipeCard, Buttons, FilterPanel, Hero, Mobile Actions, Match Popup, Like Toast).
- `frames_and_flow.md`: Frame sizes, layout grid, and interaction flow map for Discover (desktop / mobile / tablet) ready to replicate in Figma.
- `assets/`: A small set of SVG assets (profile placeholder) to import into the Figma file.

How to use

1. Create a new Figma file and enable the "Figma Tokens" plugin (or import tokens manually).
2. Import `figma_tokens.json` using the plugin to seed color/typography/spacing tokens.
3. Create styles in Figma (color/text/effects) matching the token names.
4. Create frames using the `frames_and_flow.md` sizes and overlay the components described in `components_spec.md`.
5. Import assets from the `assets/` folder (SVGs).
6. Implement interactions in Figma Prototype mode following the Interactions section in `components_spec.md`.

Notes

- Token names follow a hierarchical, semantic naming convention (color.primary.600, spacing.4, radius.md).
- All component variants list accessible contrast and ARIA notes.
- If you want, I can also export a Figma JSON (via Figma API) if you provide a Figma access token and target team/file.

License

This package is created for the Elovia Love project and intended for internal design use.
