import { describe, expect, it } from 'bun:test'
import worker from './src/worker'

async function serve(
  path: string,
  options: { method?: string; status?: number; contentType?: string; cacheControl?: string } = {},
) {
  const request = new Request(`https://ryancruz.com${path}`, { method: options.method ?? 'GET' })
  const status = options.status ?? 200
  const headers = new Headers({
    'Content-Type': options.contentType ?? 'application/octet-stream',
    ETag: '"asset-version"',
    'X-Asset-Header': 'preserved',
  })
  if (options.cacheControl) headers.set('Cache-Control', options.cacheControl)
  const assets = {
    fetch: async (received: Request) => {
      expect(received).toBe(request)
      return new Response(request.method === 'HEAD' || status === 304 ? null : 'asset body', {
        status,
        headers,
      })
    },
  } as unknown as Fetcher
  return worker.fetch(request, { ASSETS: assets })
}

describe('static asset cache policy', () => {
  it('never stores HTML, including extensionless SPA fallbacks and fallback HTML at asset paths', async () => {
    for (const path of ['/', '/index.html', '/about', '/missing.js']) {
      const response = await serve(path, {
        contentType: 'text/html; charset=utf-8',
        cacheControl: 'public, max-age=31536000, immutable',
      })
      expect(response.headers.get('Cache-Control')).toBe('no-store')
    }
  })

  it('uses HTML path detection if an upstream response omits the HTML content type', async () => {
    for (const path of ['/', '/index.html']) {
      expect((await serve(path)).headers.get('Cache-Control')).toBe('no-store')
    }
  })

  it('revalidates JavaScript and CSS on every use, including HEAD and 304 responses', async () => {
    for (const path of ['/main.js', '/style.css', '/module.mjs']) {
      for (const method of ['GET', 'HEAD']) {
        for (const status of [200, 304]) {
          const response = await serve(path, { method, status })
          expect(response.headers.get('Cache-Control')).toBe('no-cache')
          expect(response.status).toBe(status)
        }
      }
    }
  })

  it('gives mutable images, fonts, and résumé assets a bounded cache lifetime', async () => {
    for (const path of ['/images/love-field-desktop.webp', '/fonts/inter.woff2', '/Resume.pdf']) {
      const response = await serve(path)
      expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600, must-revalidate')
      expect(response.headers.get('ETag')).toBe('"asset-version"')
      expect(response.headers.get('X-Asset-Header')).toBe('preserved')
      expect(await response.text()).toBe('asset body')
    }
  })

  it('preserves error status and upstream error cache policy', async () => {
    const response = await serve('/missing.webp', { status: 404, cacheControl: 'no-cache' })
    expect(response.status).toBe(404)
    expect(response.headers.get('Cache-Control')).toBe('no-cache')
    expect(await response.text()).toBe('asset body')
  })

  it('does not apply successful GET cache policy to other methods', async () => {
    const response = await serve('/asset.webp', { method: 'POST', cacheControl: 'private' })
    expect(response.headers.get('Cache-Control')).toBe('private')
  })
})
