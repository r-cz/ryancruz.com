#!/usr/bin/env bun
import { cpSync, existsSync, mkdirSync, rmSync, watch, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { deriveDesign, designCSS } from './src/design'
import { education, experience, profile } from './src/content'
import { renderPage } from './src/page'

const srcDir = 'src'
const distDir = 'dist'
const publicDir = 'public'
const watchMode = process.argv.includes('--watch')
const minifyWanted = process.argv.includes('--minify')
// Watch rebuilds run in a fresh process so imported page content is never stale.
const watchRebuild = process.argv.includes('--watch-rebuild')

if (!watchRebuild) rmSync(distDir, { recursive: true, force: true })
mkdirSync(distDir, { recursive: true })

if (existsSync(publicDir)) cpSync(publicDir, distDir, { recursive: true })

const fontFile = 'inter-latin-wght-normal.woff2'
mkdirSync(join(distDir, 'fonts'), { recursive: true })
cpSync(
  join('node_modules/@fontsource-variable/inter/files', fontFile),
  join(distDir, 'fonts', fontFile),
)

const tailwindArgs = ['-i', `${srcDir}/style.css`, '-o', `${distDir}/style.css`]
if (minifyWanted) tailwindArgs.push('--minify')

if (!watchRebuild) {
  const cssProcess = Bun.spawn(['./node_modules/.bin/tailwindcss', ...tailwindArgs], {
    stdio: ['ignore', 'inherit', 'inherit'],
  })
  if ((await cssProcess.exited) !== 0) process.exit(1)
}

const result = await Bun.build({
  entrypoints: [`${srcDir}/main.ts`],
  outdir: distDir,
  target: 'browser',
  minify: minifyWanted,
  splitting: true,
  sourcemap: watchMode || watchRebuild ? 'external' : undefined,
})

if (!result.success) {
  console.error('JavaScript build failed:', result.logs)
  process.exit(1)
}

const design = deriveDesign()
const displayFont =
  design.display === 'mono'
    ? '\n  <link rel="preload" href="/fonts/jetbrains-mono-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />'
    : ''

const siteUrl = 'https://ryancruz.com'
const title = `${profile.name} — Identity & Cybersecurity Engineer`
const description = `${profile.name} is a Senior Cybersecurity Engineer specializing in identity and access management at ${experience[0].org} in Dallas, Texas.`
const socialImage = `${siteUrl}/images/Profile.png`

// Person structured data helps search engines connect the name to its profiles.
const structuredData = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: profile.name,
  url: `${siteUrl}/`,
  image: socialImage,
  email: `mailto:${profile.email}`,
  jobTitle: experience[0].role,
  worksFor: { '@type': 'Organization', name: experience[0].org },
  alumniOf: { '@type': 'CollegeOrUniversity', name: education.school },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Dallas',
    addressRegion: 'TX',
    addressCountry: 'US',
  },
  knowsAbout: [
    'Identity and access management',
    'Cybersecurity',
    'LDAP',
    'OAuth',
    'OpenID Connect',
    'SAML',
  ],
  sameAs: profile.links.filter((link) => link.href.startsWith('https://')).map((link) => link.href),
}).replace(/</g, '\\u003c')

const head = (pageTitle: string, extra: string) => `<meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="${design.light.bg}" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="${design.dark.bg}" media="(prefers-color-scheme: dark)" />
  <title>${pageTitle}</title>${extra}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="preload" href="/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />${displayFont}`

writeFileSync(
  join(distDir, 'index.html'),
  `<!DOCTYPE html>
<html lang="en">
<head>
  ${head(
    title,
    `
  <meta name="description" content="${description}" />
  <meta name="author" content="${profile.name}" />
  <link rel="canonical" href="${siteUrl}/" />
  <meta property="og:type" content="profile" />
  <meta property="og:url" content="${siteUrl}/" />
  <meta property="og:site_name" content="${profile.name}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${socialImage}" />
  <meta property="og:image:width" content="499" />
  <meta property="og:image:height" content="499" />
  <meta property="og:image:alt" content="Portrait of ${profile.name}" />
  <meta property="profile:first_name" content="${profile.name.split(' ')[0]}" />
  <meta property="profile:last_name" content="${profile.name.split(' ').slice(1).join(' ')}" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${socialImage}" />
  <script type="application/ld+json">${structuredData}</script>`,
  )}
  <script>document.documentElement.classList.add('js')</script>
  <style>${designCSS(design)}</style>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  ${renderPage()}
  <script type="module" src="/main.js" onerror="document.documentElement.classList.remove('js')"></script>
</body>
</html>`,
)

// Served with a 404 status by the assets binding, so unknown URLs are not indexed as the homepage.
writeFileSync(
  join(distDir, '404.html'),
  `<!DOCTYPE html>
<html lang="en">
<head>
  ${head(`Page not found — ${profile.name}`, '\n  <meta name="robots" content="noindex" />')}
  <style>${designCSS(design)}</style>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <div class="page">
    <header class="intro">
      <h1 class="name">Page not found</h1>
      <p class="role"><a class="link" href="/">Back to ${profile.name}</a></p>
    </header>
  </div>
</body>
</html>`,
)

writeFileSync(
  join(distDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
  </url>
</urlset>
`,
)

console.log('✓ Built JavaScript, prerendered HTML, 404 page, and sitemap')

if (watchMode) {
  const cssWatcher = Bun.spawn(
    ['./node_modules/.bin/tailwindcss', ...tailwindArgs, '--watch=always'],
    { stdio: ['ignore', 'inherit', 'inherit'] },
  )
  let rebuildProcess: ReturnType<typeof Bun.spawn> | undefined
  let debounceTimer: ReturnType<typeof setTimeout> | undefined
  let rebuildPending = false
  let stopping = false

  const rebuild = async () => {
    if (stopping) return
    if (rebuildProcess) {
      rebuildPending = true
      return
    }

    rebuildPending = false
    const args = [process.execPath, 'run', import.meta.path, '--watch-rebuild']
    if (minifyWanted) args.push('--minify')
    rebuildProcess = Bun.spawn(args, { stdio: ['ignore', 'inherit', 'inherit'] })
    const exitCode = await rebuildProcess.exited
    rebuildProcess = undefined
    if (exitCode !== 0 && !stopping) console.error('Rebuild failed; watching for the next change.')
    if (rebuildPending && !stopping) scheduleRebuild()
  }

  const scheduleRebuild = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => void rebuild(), 120)
  }

  const watchers = [
    watch(srcDir, { recursive: true }, (_event, filename) => {
      // Tailwind owns CSS rebuilds; script changes also rerender the HTML.
      if (!filename?.endsWith('.css')) scheduleRebuild()
    }),
    watch(import.meta.path, scheduleRebuild),
  ]
  if (existsSync(publicDir)) {
    watchers.push(
      watch(publicDir, { recursive: true }, (_event, filename) => {
        if (filename && !existsSync(join(publicDir, filename))) {
          rmSync(join(distDir, filename), { recursive: true, force: true })
        }
        scheduleRebuild()
      }),
    )
  }

  const stop = (exitCode: number) => {
    if (stopping) return
    stopping = true
    if (debounceTimer) clearTimeout(debounceTimer)
    watchers.forEach((watcher) => watcher.close())
    rebuildProcess?.kill()
    cssWatcher.kill()
    process.exit(exitCode)
  }
  process.on('SIGINT', () => stop(0))
  process.on('SIGTERM', () => stop(0))
  console.log('Watching source, page content, styles, and public assets…')
  const cssExitCode = await cssWatcher.exited
  if (!stopping) {
    console.error('CSS watcher stopped.')
    stop(cssExitCode || 1)
  }
}
