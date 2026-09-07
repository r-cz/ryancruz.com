# ryancruz.com

Ryan Cruz’s personal portfolio, set inside a live 3D interpretation of Dallas Love Field.

The terminal, MacBook Pro, linked gate seating, window grids, beams and Southwest-inspired aircraft are modeled Three.js geometry. Aircraft movement and departure-board updates are simulated. Clicking the laptop or scrolling moves the camera into the screen, then hands off to a normal HTML portfolio with About, Experience, Projects and Education.

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

- `src/terminal-environment.ts`: instanced terminal architecture, furnishings, signs and animated aircraft. Physical sign text is drawn on small canvas textures; there is no generated background image.
- `src/scene3d.ts`: WebGL renderer, lighting, MacBook model, CSS3D screen and departure monitor, responsive camera path, resource disposal.
- `src/main.ts`: progressive enhancement, native scroll navigation, keyboard focus, motion preferences and renderer fallback.
- `src/page.ts` and `src/portfolio.ts`: shared semantic page content, prerendered into the built HTML by `build.ts`.
- `src/style.css`: scene chrome and responsive portfolio typography/layout.

Portfolio content and links work without JavaScript or WebGL. A lost graphics context or renderer error reveals the same document. Reduced-motion preferences disable ambient movement and camera zoom; the motion button can also pause animation. Hidden tabs and the expanded portfolio stop the continuous render loop. The 3D engine loads separately from the initial interaction code.

## Content and visual references

Career and education are sourced from `public/Resume.pdf`, dated February 24, 2025. Project descriptions are based on the public READMEs for [IAM Tools](https://github.com/r-cz/iam-tools) and [.dsconfig Helper](https://github.com/r-cz/dsconfig-helper). Visitors do not trigger GitHub or flight-data API requests.

Architecture is informed by [Corgan’s DAL modernization photography](https://www.corgan.com/projects/dal-love-field-modernization-program-lfmp) and the real gate photos in [Travel Codex’s Love Field walkthrough](https://www.travelcodex.com/the-new-terminal-at-dallas-love-field-airport-in-pictures/). The geometry is an original, stylized interpretation of DAL rather than a surveyed model of a specific gate. Southwest colors and signage provide airport context; this is a personal website.

No API keys, live flight service, sound, video, or generated-image assets are required.
