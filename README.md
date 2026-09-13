# ryancruz.com

Ryan Cruz’s personal portfolio, set inside an illustrated 2D interpretation of Dallas Love Field. Painted artwork, dark drawn outlines, timber beams, concrete columns and charcoal gate seating frame the distant Dallas skyline. Gate 20 shows Philadelphia (PHL), and gate 18 shows Atlanta (ATL). The setting and gate information are illustrative.

A plane taxis right across the apron and two cloud layers drift at different speeds. Lighting follows the visitor’s local clock through dawn, daylight, sunset and night. Clicking the laptop or scrolling pushes into its live HTML screen, then reveals the existing About, Experience, Projects and Education portfolio. There is no gameplay, audio, flight-data service or location request.

## Development

Requires Bun. The site uses TypeScript, Tailwind CSS v4, and Cloudflare Workers with static assets.

```sh
bun install
bun run build:site
bunx wrangler dev --port 8787
```

For source, content, CSS and asset updates, run `bun run build:watch` in a second terminal. `bun run dev` starts the watcher and Wrangler together.

```sh
bun run typecheck
bun run lint
bun test
bun run build
```

Changes use a feature branch and PR. Merging into `main` runs the existing GitHub Actions deployment to Cloudflare Workers. The Worker runs before static assets so HTML is not stored and JavaScript/CSS revalidate; other assets use a bounded one-hour cache.

## Implementation

- `src/scene-art.ts`: independent artwork layers, measured window masks, shared skyline silhouette and aligned night illumination.
- `src/scene-assets.ts`: bounded asset loading, optional aircraft/cloud failure handling, and cancellation during disposal.
- `src/scene2d.ts`: DOM renderer with `resize(width, height)`, `render(progress, elapsed, pointer, date)` and `dispose()`, plus artwork readiness.
- `src/scene-layout.ts`: responsive laptop/screen alignment, fully offscreen sprite wrapping and the shared 2D push-in transform.
- `src/scene-lighting.ts`: interpolated CSS colors and blend weights from the visitor’s local clock. The same objects remain in place across lighting states.
- `src/main.ts`: progressive enhancement, native scroll/hash navigation, keyboard focus, persisted motion preferences, visibility handling and container-based resizing.
- `src/page.ts` and `src/portfolio.ts`: semantic HTML content, prerendered by `build.ts`. The laptop screen and outer controls are HTML, with Georgia and Inter typography.
- `src/scene.css` and `src/style.css`: illustrated scene composition and the existing responsive portfolio.
- `public/scene/`: optimized WebP sky, clouds, skyline, apron, aircraft, terminal, front/back seating, table and blank laptop shell. See [art direction and references](docs/scene-art-direction.md) and [generation prompts](docs/scene-art-prompts.json).

The plane loops in approximately 90 seconds; clouds take 180 and 260 seconds. Entire sprites pass beyond the viewport before wrapping. Fine mouse pointers can shift the outdoor layers by up to 6px horizontally and 3px vertically. Portrait layouts recompose the columns and signage, preserve both gate numbers, and keep the plane above a simplified name/role/action laptop preview. Short viewports reserve space for the entry cue and motion control.

The portfolio remains readable without JavaScript. Essential artwork failure or a renderer exception reveals that same document; aircraft/cloud failures simply omit the affected ambient layer. Loading has a 12-second limit. Reduced motion disables ambient movement and the push-in. A separate pause button persists the visitor’s choice. Paused scenes refresh lighting each minute, while hidden tabs and the expanded portfolio stop both animation and clock work and catch up on return. Resizing preserves scroll progress and aligns the painted shell with its HTML screen from one layout calculation.

## Content and setting

Career and education are sourced from `public/Resume.pdf`, dated February 24, 2025. Project descriptions are based on the public READMEs for [IAM Tools](https://github.com/r-cz/iam-tools) and [.dsconfig Helper](https://github.com/r-cz/dsconfig-helper). Visitors do not trigger GitHub API requests.

The skyline follows Ryan’s Love Field photographs, including their ordered roof profiles. The terminal references include the [June 10, 2022 concourse photograph by EEJCC](https://commons.wikimedia.org/wiki/File:Dallas_Love_Field_gate_concourse.jpg) and the [2026 Love Field boarding-area photograph](https://www.reddit.com/r/SouthwestAirlines/comments/1qom0hg/new_sign_at_love_field_for_boarding/). This is a photo-informed composite, not an exact surveyed view from a particular gate. Southwest colors and gate details provide setting for a personal website.
