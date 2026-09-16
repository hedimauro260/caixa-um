import type { MiddlewareHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import type { AppContext } from '../lib/context'

export const errorHandler: MiddlewareHandler<AppContext> = async (c, next) => {
  try {
    await next()
  } catch (err) {
    if (err instanceof ZodError) {
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados inválidos',
            details: err.flatten().fieldErrors,
          },
        },
        400
      )
    }

    if (err instanceof HTTPException) {
      return c.json(
        {
          error: {
            code: err.status === 401
                ? 'UNAUTHORIZED'
                : err.status === 403
                ? 'FORBIDDEN'
                : err.status === 404
                ? 'NOT_FOUND'
                : err.status === 409
                ? 'CONFLICT'
                : 'HTTP_ERROR',
            message: err.message,
          },
        },
        err.status
      )
    }

    console.error('[error]', {
      requestId: c.get('requestId'),
      error: err,
    })

    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor',
        },
      },
      500
    )
  }
}
