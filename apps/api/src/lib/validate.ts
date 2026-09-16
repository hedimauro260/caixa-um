import type { Context } from 'hono'
import { z } from 'zod'
import type { AppContext } from './context'

export async function parseBody<T extends z.ZodTypeAny>(
  c: Context<AppContext>,
  schema: T
): Promise<z.infer<T>> {
  const raw = await c.req.json()
  return schema.parse(raw)
}

export function parseQuery<T extends z.ZodTypeAny>(
  c: Context<AppContext>,
  schema: T
): z.infer<T> {
  const raw = c.req.query()
  return schema.parse(raw)
}

export function parseParams<T extends z.ZodTypeAny>(
  c: Context<AppContext>,
  schema: T
): z.infer<T> {
  const raw = c.req.param()
  return schema.parse(raw)
}

export const idParamSchema = z.object({
  id: z.string().uuid('ID inválido'),
})
