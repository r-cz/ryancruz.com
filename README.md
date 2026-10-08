# ryancruz.com

Ryan Cruz’s personal site: a single, minimal page covering who he is, what he’s built and where he’s worked.

Every visual decision comes from one seed, `0xcc0fe108`, rolled with `crypto.getRandomValues`. `src/design.ts` feeds it to a small PRNG that picks the hue and palette for light and dark mode, the display typeface, the type-scale ratio, the easing curve and animation timing, and the harmonograph drawn beside the name. To redesign the site, replace `SEED` and rebuild.

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

- `src/design.ts`: the seed, the PRNG, and the derived design: OKLCH palettes, typography, motion tokens and the harmonograph path. Its tests check WCAG AA contrast and figure bounds across hundreds of seeds, so any replacement seed stays readable.
- `src/content.ts`: profile, projects, experience and education.
- `src/page.ts`: semantic HTML, prerendered by `build.ts` with the seeded tokens inlined in `<head>`.
- `src/style.css`: layout and animation, driven entirely by the seeded custom properties.
- `src/main.ts`: optional extras. The figure leans toward a mouse, project cards glow under the cursor, and the seed decodes itself when it scrolls into view.

The page is complete without JavaScript. The name settles in letter by letter while the harmonograph draws itself, then a glint follows the curve as it slowly turns. Sections reveal with CSS scroll-driven animations where supported. Reduced motion turns off every animation.

## Content

Career and education are sourced from `public/Resume.pdf`, dated February 24, 2025. Project descriptions are based on the public READMEs for [IAM Tools](https://github.com/r-cz/iam-tools) and [.dsconfig Helper](https://github.com/r-cz/dsconfig-helper). Visitors do not trigger GitHub API requests.
