import { Hono } from 'hono'
import type { Bindings } from '../bindings'

export const healthRoute = new Hono<{ Bindings: Bindings }>()

healthRoute.get('/', (c) => {
  return c.json({
    ok: true,
    service: 'caixa1-api',
    timestamp: new Date().toISOString(),
  })
})
