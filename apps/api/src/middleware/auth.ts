import type { MiddlewareHandler } from 'hono'
import { verifyToken } from '@clerk/backend'
import type { AppContext } from '../lib/context'

function unauthorized(message: string) {
  return new Response(
    JSON.stringify({ error: { code: 'UNAUTHORIZED', message } }),
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  )
}

export const requireAuth: MiddlewareHandler<AppContext> = async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return unauthorized('Token ausente')
  }

  const token = authHeader.slice(7)

  try {
    const payload = await verifyToken(token, {
      secretKey: c.env.CLERK_SECRET_KEY,
    })

    if (!payload.sub) {
      return unauthorized('Token sem subject')
    }

    c.set('userId', payload.sub)
  } catch (err) {
    console.error('[auth] token validation failed', {
      requestId: c.get('requestId'),
      error: err instanceof Error ? err.message : 'unknown',
    })
    return unauthorized('Token inválido')
  }

  await next()
}
