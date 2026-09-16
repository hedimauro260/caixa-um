import type { MiddlewareHandler } from 'hono'
import type { AppContext } from '../lib/context'

export const requestLogger: MiddlewareHandler<AppContext> = async (c, next) => {
  const requestId = crypto.randomUUID().slice(0, 8)
  const start = performance.now()
  const method = c.req.method
  const path = new URL(c.req.url).pathname

  c.set('requestId', requestId)

  await next()

  const duration = (performance.now() - start).toFixed(1)
  const status = c.res.status

  const statusColor =
    status >= 500 ? '\x1b[31m' :
    status >= 400 ? '\x1b[33m' :
    status >= 300 ? '\x1b[36m' :
    '\x1b[32m'
  const reset = '\x1b[0m'
  const dim = '\x1b[2m'

  console.log(
    `${dim}[${requestId}]${reset} ${method} ${path} ${statusColor}${status}${reset} ${dim}${duration}ms${reset}`
  )
}
