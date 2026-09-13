# ryancruz.com

Ryan Cruz’s personal portfolio, set inside an illustrated 2D interpretation of Dallas Love Field. Painted textures, timber beams, concrete columns and charcoal seating frame the distant Dallas skyline. A glass boarding corridor turns left from the entrance and continues offscreen.

A black Patagonia Mini MLC backpack and a closed MacBook Pro rest on the foreground seats. The bag opens the travel journal at `/travel/`; the laptop and “Skip to portfolio” jump to the existing portfolio below. Scrolling follows normal document flow. The belongings keep their proportions during resizing and have subtle glowing edges to identify their links.

A Southwest 737 MAX 8 taxis across the apron, two cloud layers drift, and independent provisioning, baggage and pushback vehicles move below the aircraft route. Lighting follows the visitor’s local clock through dawn, daylight, sunset and night. There is no gameplay, audio, flight-data service or location request.

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

- `src/scene-art.ts`: independent artwork layers, keyed window openings, shared skyline silhouette and aligned night illumination.
- `src/scene-assets.ts`: bounded loading, optional ambient sprite failure handling, and cancellation during disposal.
- `src/scene2d.ts`: DOM renderer with `resize(width, height)`, `render(progress, elapsed, pointer, date)` and `dispose()`, plus artwork readiness. The retained progress parameter is unused.
- `src/scene-layout.ts`: responsive ambient routes and fully offscreen sprite wrapping.
- `src/scene-lighting.ts`: interpolated CSS colors and blend weights from the visitor’s local clock. Objects stay in place across lighting states.
- `src/main.ts`: progressive enhancement, native scroll/hash navigation, keyboard focus, reduced motion, visibility handling and container-based resizing.
- `src/page.ts`, `src/portfolio.ts` and `src/travel.ts`: semantic HTML, prerendered by `build.ts`. The travel journal has clearly unpublished story placeholders and needs no JavaScript.
- `src/scene.css`, `src/travel.css` and `src/style.css`: scene, travel journal and existing responsive portfolio, using Georgia and Inter.
- `public/scene/`: optimized WebP layers. See [art direction and references](docs/scene-art-direction.md) and [revision prompts](docs/scene-art-prompts-v2.json).

The plane loops in approximately 90 seconds; clouds take 180 and 260 seconds. Ground vehicles use separate lanes and 76–132 second loops, with artwork facing its direction of travel. Entire sprites pass beyond the viewport before wrapping. Fine mouse pointers can shift outdoor layers by up to 6px horizontally and 3px vertically. Portrait and short landscape layouts recompose the scene while preserving the belongings’ intrinsic proportions and keeping the aircraft above them.

The portfolio remains readable without JavaScript. Essential artwork failure or a renderer exception reveals that same document; optional aircraft, cloud or ground-vehicle failures omit the affected layer. Loading has a 12-second limit. Reduced motion disables ambient movement, parallax and object pulses; lighting still refreshes each minute. Hidden tabs and offscreen scenes stop both animation and clock work, catching up on return without a movement jump. Navigation uses ordinary links and browser history.

## Content and setting

Career and education are sourced from `public/Resume.pdf`, dated February 24, 2025. Project descriptions are based on the public READMEs for [IAM Tools](https://github.com/r-cz/iam-tools) and [.dsconfig Helper](https://github.com/r-cz/dsconfig-helper). Visitors do not trigger GitHub API requests. The travel journal contains placeholders rather than invented trips.

The skyline follows Ryan’s Love Field photographs, including their ordered roof profiles. Terminal references include the [June 10, 2022 concourse photograph by EEJCC](https://commons.wikimedia.org/wiki/File:Dallas_Love_Field_gate_concourse.jpg) and the [2026 Love Field boarding-area photograph](https://www.reddit.com/r/SouthwestAirlines/comments/1qom0hg/new_sign_at_love_field_for_boarding/). This is a photo-informed composite, not an exact surveyed gate view. Gate displays were removed to simplify the scene. Aircraft, equipment and backpack references are recorded in the art-direction document.
