#!/usr/bin/env bun
import { cpSync, existsSync, mkdirSync, rmSync, watch, writeFileSync } from 'node:fs'
import { join } from 'node:path'
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

writeFileSync(
  join(distDir, 'index.html'),
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#f6f5f1" />
  <meta name="description" content="Ryan Cruz is a Senior Cybersecurity Engineer specializing in identity and access management at Southwest Airlines in Dallas, Texas." />
  <title>Ryan Cruz — Cybersecurity Engineer</title>
  <link rel="canonical" href="https://ryancruz.com/" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="preload" href="/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <div id="app">${renderPage()}</div>
  <script type="module" src="/main.js"></script>
</body>
</html>`,
)

console.log('✓ Built JavaScript and prerendered HTML')

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
