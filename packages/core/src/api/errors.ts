export class ApiError extends Error {
  readonly code: string
  readonly status: number
  readonly details?: unknown

  constructor(params: {
    code: string
    message: string
    status: number
    details?: unknown
  }) {
    super(params.message)
    this.name = 'ApiError'
    this.code = params.code
    this.status = params.status
    this.details = params.details
  }

  isUnauthorized(): boolean {
    return this.status === 401
  }

  isValidation(): boolean {
    return this.code === 'VALIDATION_ERROR'
  }

  isNotFound(): boolean {
    return this.status === 404
  }

  isConflict(): boolean {
    return this.status === 409
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'Falha de conexão com o servidor') {
    super({ code: 'NETWORK_ERROR', message, status: 0 })
    this.name = 'NetworkError'
  }
}
