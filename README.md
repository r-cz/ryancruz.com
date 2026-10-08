# ryancruz.com

Ryan Cruz’s personal site: a single, minimal page with his projects, experience and education.

Every visual decision comes from one seed, `0xcc0fe108`, rolled with `crypto.getRandomValues`. `src/design.ts` feeds it to a small PRNG that picks the hue and palette for light and dark mode, the display typeface, the type-scale ratio, and the easing curve and animation timing. The seed isn't shown on the page. To redesign the site, replace `SEED` and rebuild.

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

- `src/design.ts`: the seed, the PRNG, and the derived design: OKLCH palettes, typography and motion tokens. Its tests check WCAG AA contrast across hundreds of seeds, so any replacement seed stays readable.
- `src/content.ts`: links, projects, experience and education.
- `src/page.ts`: semantic HTML, prerendered by `build.ts` with the seeded tokens inlined in `<head>`.
- `src/style.css`: layout and animation, driven entirely by the seeded custom properties.
- `src/main.ts`: enhancements. Sections reveal once as they arrive, project cards glow under the cursor, and the email menu copies the address and dismisses on Escape or an outside click.

The page is complete without JavaScript: content stays visible and the email menu still opens. The intro is static. Below it, sections fade and rise in once as they arrive. These are one-shot transitions triggered by an IntersectionObserver, so they always finish, unlike scroll-linked animation, which Safari can leave half-finished. Nothing uses blur. Reduced motion turns off every animation.

## Content

Career and education are sourced from `public/Resume.pdf`, dated February 24, 2025. Project descriptions are based on [martenldap.com](https://martenldap.com) and the public READMEs for [IAM Tools](https://github.com/r-cz/iam-tools) and [.dsconfig Helper](https://github.com/r-cz/dsconfig-helper). Visitors do not trigger GitHub API requests.
