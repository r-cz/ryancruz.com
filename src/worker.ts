// Cloudflare Worker to serve static assets with better caching
// - HTML: no-store (always fresh)
// - Static assets: 1 year immutable

interface Env {
  ASSETS: Fetcher
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    const isHTML = url.pathname === '/' || url.pathname.endsWith('.html')

    // Delegate to static assets
    const res = await env.ASSETS.fetch(request)

    const headers = new Headers(res.headers)
    if (isHTML) {
      headers.set('Cache-Control', 'no-store')
    } else if (request.method === 'GET' && res.status === 200) {
      headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    }

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    })
  },
}
