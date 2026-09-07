# ryancruz.com

Ryan Cruz’s personal portfolio, set inside a live 3D interpretation of Dallas Love Field.

The terminal, MacBook Pro, linked gate seating, window grids and beams are modeled Three.js geometry. The aircraft is an optimized version of Daniel Skomorovsky’s Southwest Airlines Boeing 737 model. Aircraft movement and digital gate information are simulated. The western-wing layout has two column displays, gate 20 on the left and gate 18 on the right, with back-to-back seating banks along the concourse, including window-facing seats on the left. Gate 20 shows Philadelphia (PHL), and gate 18 shows Atlanta (ATL). A small Ops Agent kiosk and boarding door occupy the rear-left corner, with a modeled jetbridge descending toward the lower apron. The aircraft taxis to the right beyond the windows. The window wall, timber roof and floor continue beyond the right edge on wide screens. Lighting follows the visitor’s local device time, from dawn through daylight and sunset to a warmly lit terminal at night. Clicking the laptop or scrolling moves the camera into the screen, then hands off to a normal HTML portfolio with About, Experience, Projects and Education.

## Development

Requires Bun. The site uses TypeScript, Three.js, Tailwind CSS v4, and Cloudflare Workers with static assets.

```sh
bun install
bun run build:site
bunx wrangler dev --port 8787
```

For live source, content, CSS and asset updates, run `bun run build:watch` in a second terminal. The existing `bun run dev` also starts the build watcher and Wrangler.

```sh
bun run typecheck
bun run lint
bun test
bun run build
```

Changes use a feature branch and PR. Merging into `main` runs the existing GitHub Actions deployment to Cloudflare Workers. The Worker runs before static assets so HTML is not stored and JavaScript/CSS revalidate; other assets use a bounded one-hour cache.

## Implementation

- `src/terminal-environment.ts`: instanced terminal architecture, furnishings, portrait digital gate displays and aircraft taxi path. Physical sign text is drawn on small canvas textures; there is no generated background image.
- `src/boarding-gate.ts`: modeled Ops Agent kiosk, boarding door and exterior jetbridge at gate 20.
- `src/scene3d.ts`: WebGL renderer, MacBook model and display, projected native laptop link, responsive camera path, resource disposal.
- `src/laptop-screen.ts`: high-resolution canvas preview drawn from the page’s existing portfolio copy, with a font-ready redraw for paused scenes.
- `src/scene-lighting.ts`: smoothly interpolated local-clock sky, sun, ambient light and warm interior fixtures.
- `src/aircraft.ts`: asynchronously loads the compressed aircraft GLB, redraws paused scenes when it arrives, and handles load failure/disposal.
- `scripts/convert-aircraft.ts`: converts the supplied FBX into an exterior-only, normalized GLB before compression.
- `src/main.ts`: progressive enhancement, native scroll navigation, keyboard focus, motion preferences, container-based viewport sizing and renderer fallback.
- `src/page.ts` and `src/portfolio.ts`: shared semantic page content, prerendered into the built HTML by `build.ts`.
- `src/style.css`: scene chrome and responsive portfolio typography/layout.

Portfolio content and links work without JavaScript or WebGL. A lost graphics context or renderer error reveals the same document. Reduced-motion preferences disable ambient movement and camera zoom; the motion button can also pause animation. Hidden tabs and the expanded portfolio stop the continuous render loop. The 3D engine loads separately from the initial interaction code. When motion is paused or reduced, a single frame each minute keeps lighting current. Clock refreshes also stop while the tab or terminal is hidden and catch up on return. This is a local-time atmosphere, not a weather feed or astronomical sunrise calculation; no location permission is needed.

Portrait viewports use a 60° horizontal field of view to keep both gates and the window seating visible around a smaller laptop. The display is part of the same WebGL scene as the bezel, avoiding alignment drift between separate HTML and WebGL renderers. A native link covers the laptop for tapping and keyboard access; the expanded portfolio remains normal, selectable HTML. Renderer dimensions come from the scene’s layout box, with coalesced resize observation that preserves scroll progress and ignores unchanged sizes when browser controls or pinch zoom change the visual viewport.

## Content and visual references

Career and education are sourced from `public/Resume.pdf`, dated February 24, 2025. Project descriptions are based on the public READMEs for [IAM Tools](https://github.com/r-cz/iam-tools) and [.dsconfig Helper](https://github.com/r-cz/dsconfig-helper). Visitors do not trigger GitHub or flight-data API requests.

Architecture is informed by [Corgan’s DAL modernization photography](https://www.corgan.com/projects/dal-love-field-modernization-program-lfmp) and the real gate photos in [Travel Codex’s Love Field walkthrough](https://www.travelcodex.com/the-new-terminal-at-dallas-love-field-airport-in-pictures/). The geometry is an original, stylized interpretation of DAL rather than a surveyed model of a specific gate. The portrait gate displays follow the reference photo supplied by Ryan: brushed-metal frames, large blue gate numbers, and light flight-information panels. Southwest colors and signage provide airport context; this is a personal website.

The aircraft is [Southwest Airlines Boeing 737](https://skfb.ly/6SnOs) by Daniel Skomorovsky, licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Ryan supplied the source FBX. The web adaptation removes the enclosed cabin, normalizes scale/orientation, adapts materials and compresses geometry. Attribution is included in the portfolio footer and alongside the model. See [aircraft references and provenance](docs/aircraft-reference.md) for details.

No API keys, live flight service, sound, video, or generated-image assets are required.
