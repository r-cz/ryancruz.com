// Cloudflare Worker for serving static Vite build
export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    
    // Handle root requests
    if (url.pathname === '/' || url.pathname === '/index.html') {
      // Return the index.html from assets
      const response = await env.ASSETS.fetch(new Request(`${url.origin}/index.html`))
      if (response.ok) {
        return new Response(response.body, {
          ...response,
          headers: {
            ...response.headers,
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=0, must-revalidate',
          },
        })
      }
    }
    
    // Handle static assets
    const assetResponse = await env.ASSETS.fetch(request)
    if (assetResponse.ok) {
      const newHeaders = new Headers(assetResponse.headers)
      
      // Set appropriate cache headers based on file type
      if (url.pathname.match(/\.(js|css|woff2?|ttf|otf)$/)) {
        newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable')
      } else if (url.pathname.match(/\.(svg|png|jpg|jpeg|gif|avif|webp)$/)) {
        newHeaders.set('Cache-Control', 'public, max-age=2592000')
      }
      
      return new Response(assetResponse.body, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers: newHeaders,
      })
    }
    
    // Fallback to index.html for SPA routing
    const indexResponse = await env.ASSETS.fetch(new Request(`${url.origin}/index.html`))
    if (indexResponse.ok) {
      return new Response(indexResponse.body, {
        ...indexResponse,
        headers: {
          ...indexResponse.headers,
          'Content-Type': 'text/html; charset=utf-8',
        },
      })
    }
    
    return new Response('Not Found', { status: 404 })
  }
}