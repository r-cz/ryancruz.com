#!/usr/bin/env bun
import { writeFileSync, cpSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

const srcDir = 'src'
const distDir = 'dist'
const publicDir = 'public'

const watchMode = process.argv.includes('--watch')
const minifyWanted = process.argv.includes('--minify')

// Clean and create dist directory
if (existsSync(distDir)) {
  await Bun.$`rm -rf ${distDir}`
}
mkdirSync(distDir, { recursive: true })

// Copy public assets
if (existsSync(publicDir)) {
  cpSync(publicDir, distDir, { recursive: true })
}

// Copy local fonts (Inter variable latin normal/italic)
const fontSrcDir = 'node_modules/@fontsource-variable/inter/files'
const fontDestDir = join(distDir, 'fonts')
mkdirSync(fontDestDir, { recursive: true })
const fontsToCopy = [
  'inter-latin-wght-normal.woff2',
  'inter-latin-wght-italic.woff2',
]
for (const f of fontsToCopy) {
  const src = join(fontSrcDir, f)
  if (existsSync(src)) {
    cpSync(src, join(fontDestDir, f))
  }
}

// Process CSS with Tailwind (and optionally watch)
console.log('Processing CSS with Tailwind...')
const tailwindArgs = [
  '-i', `${srcDir}/style.css`,
  '-o', `${distDir}/style.css`,
]
if (watchMode) tailwindArgs.push('-w')
if (minifyWanted) tailwindArgs.push('--minify')

let tailwindProc: ReturnType<typeof Bun.spawn> | undefined
try {
  if (watchMode) {
    tailwindProc = Bun.spawn([
      './node_modules/.bin/tailwindcss',
      ...tailwindArgs,
    ], { stdio: ['inherit', 'inherit', 'inherit'] })
  } else {
    await Bun.$`./node_modules/.bin/tailwindcss ${tailwindArgs}`.quiet()
  }
  console.log('✓ CSS processed')
} catch (error) {
  console.error('CSS processing failed:', error)
  process.exit(1)
}

// Build main.ts
const buildResult = await Bun.build({
  entrypoints: [`${srcDir}/main.ts`],
  outdir: distDir,
  target: 'browser',
  minify: minifyWanted,
  splitting: true,
  sourcemap: watchMode ? 'external' : undefined,
  watch: watchMode ? {
    onRebuild(result) {
      if (result.success) {
        console.log('✓ Rebuilt JS')
      } else {
        console.error('✗ Rebuild failed:', result.logs)
      }
    }
  } : false,
})

if (!buildResult.success) {
  console.error('Build failed:', buildResult.logs)
  process.exit(1)
}

// Generate index.html (link only entry module & main stylesheet)
const entryScript = '/main.js'

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ryan Cruz</title>
  <link rel="preload" href="/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/inter-latin-wght-italic.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <div id="app"></div>
  <script type="module" src="${entryScript}"></script>
</body>
</html>`

writeFileSync(join(distDir, 'index.html'), html)

console.log('✓ Build complete!')

if (watchMode && tailwindProc) {
  console.log('👀 Watching for changes (JS & CSS)...')
  await tailwindProc.exited
}
