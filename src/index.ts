import { Hono } from 'hono'

const app = new Hono()

// CORS middleware
app.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type')
  await next()
})

// Proxy handler
app.all('/proxy/*', async (c) => {
  const targetUrl = c.req.query('url')
  
  if (!targetUrl) {
    return c.json({ error: 'Missing target URL' }, 400)
  }

  try {
    const response = await fetch(targetUrl, {
      method: c.req.method,
      headers: c.req.raw.headers,
      body: ['GET', 'HEAD'].includes(c.req.method) ? undefined : c.req.raw.body
    })

    const data = await response.text()
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    return c.json({ error: 'Proxy request failed' }, 500)
  }
})

app.get('/', (c) => {
  return c.text('Proxy service is running')
})

export default app
