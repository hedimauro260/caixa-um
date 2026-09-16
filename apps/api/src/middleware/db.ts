import type { MiddlewareHandler } from 'hono'
import { createDbFromBindings } from '../lib/db'
import type { AppContext } from '../lib/context'

export const withDb: MiddlewareHandler<AppContext> = async (c, next) => {
  const db = createDbFromBindings(c.env)
  c.set('db', db)
  await next()
}
