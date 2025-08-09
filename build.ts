#!/usr/bin/env bun
import { readFileSync, writeFileSync, cpSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'

const srcDir = 'src'
const distDir = 'dist'
const publicDir = 'public'

// Clean and create dist directory
if (existsSync(distDir)) {
  await Bun.$`rm -rf ${distDir}`
}
mkdirSync(distDir, { recursive: true })

// Copy public assets
if (existsSync(publicDir)) {
  cpSync(publicDir, distDir, { recursive: true })
}

// Process CSS with Tailwind
console.log('Processing CSS with Tailwind...')
const minifyFlag = process.argv.includes('--minify') ? '--minify' : ''
try {
  await Bun.$`./node_modules/.bin/tailwindcss -i ${srcDir}/style.css -o ${distDir}/style.css ${minifyFlag}`.quiet()
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
  minify: process.argv.includes('--minify'),
  splitting: true,
})

if (!buildResult.success) {
  console.error('Build failed:', buildResult.logs)
  process.exit(1)
}

// Generate index.html
const jsFiles = buildResult.outputs
  .filter(output => output.path.endsWith('.js'))
  .map(output => output.path.split('/').pop())

const cssFiles = buildResult.outputs
  .filter(output => output.path.endsWith('.css'))
  .map(output => output.path.split('/').pop())

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ryan Cruz</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css" />
  ${cssFiles.map(css => `  <link rel="stylesheet" href="/${css}" />`).join('\n')}
</head>
<body>
  <div id="app"></div>
  ${jsFiles.map(js => `  <script type="module" src="/${js}"></script>`).join('\n')}
</body>
</html>`

writeFileSync(join(distDir, 'index.html'), html)

console.log('✓ Build complete!')
console.log(`✓ Generated ${jsFiles.length} JS files, ${cssFiles.length} CSS files`)