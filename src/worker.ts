// Asset filenames are stable across deployments, so clients must revalidate them.

interface Env {
  ASSETS: Fetcher
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const res = await env.ASSETS.fetch(request)
    const headers = new Headers(res.headers)
    const contentType = headers.get('Content-Type')?.toLowerCase() ?? ''
    const isHTML =
      contentType.includes('text/html') ||
      contentType.includes('application/xhtml+xml') ||
      url.pathname === '/' ||
      url.pathname.endsWith('.html')

    if (isHTML) {
      headers.set('Cache-Control', 'no-store')
    } else if (
      (request.method === 'GET' || request.method === 'HEAD') &&
      (res.status === 200 || res.status === 304)
    ) {
      const isCode = /\.(?:m?js|css)$/i.test(url.pathname)
      headers.set('Cache-Control', isCode ? 'no-cache' : 'public, max-age=3600, must-revalidate')
    }

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    })
  },
}
