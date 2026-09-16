import { HTTPException } from 'hono/http-exception'

export function notFound(resource: string): HTTPException {
  return new HTTPException(404, { message: `${resource} não encontrado` })
}

export function forbidden(message = 'Acesso negado'): HTTPException {
  return new HTTPException(403, { message })
}

export function conflict(message: string): HTTPException {
  return new HTTPException(409, { message })
}

export function badRequest(message: string): HTTPException {
  return new HTTPException(400, { message })
}
