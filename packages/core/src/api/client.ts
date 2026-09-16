import { ApiError, NetworkError } from './errors'
import { downloadFile } from './export'
import type { DownloadResult } from './export'

interface ApiSuccessResponse<T> {
  data: T
  meta?: {
    total: number
    limit?: number
    offset?: number
  }
}

interface ApiErrorResponse {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export interface ApiClientOptions {
  baseUrl: string
  getToken: () => Promise<string | null>
}

export interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined | null>
  signal?: AbortSignal
}

export interface ListResult<T> {
  data: T[]
  meta: {
    total: number
    limit?: number
    offset?: number
  }
}

export function createApiClient(options: ApiClientOptions) {
  const { baseUrl, getToken } = options

  function buildUrl(
    path: string,
    query?: RequestOptions['query']
  ): string {
    const url = new URL(path, baseUrl)

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) continue
        url.searchParams.append(key, String(value))
      }
    }

    return url.toString()
  }

  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    reqOptions?: RequestOptions
  ): Promise<ApiSuccessResponse<T>> {
    const token = await getToken()

    const headers: Record<string, string> = {
      Accept: 'application/json',
    }

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json'
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    let response: Response

    try {
      response = await fetch(buildUrl(path, reqOptions?.query), {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: reqOptions?.signal,
      })
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err
      }
      throw new NetworkError()
    }

    if (response.status === 204) {
      return { data: undefined as T }
    }

    let payload: unknown

    try {
      payload = await response.json()
    } catch {
      if (!response.ok) {
        throw new ApiError({
          code: 'INTERNAL_ERROR',
          message: `Erro ${response.status} (resposta inválida)`,
          status: response.status,
        })
      }
      throw new ApiError({
        code: 'INTERNAL_ERROR',
        message: 'Resposta inválida do servidor',
        status: response.status,
      })
    }

    if (!response.ok) {
      const errPayload = payload as ApiErrorResponse

      if (errPayload?.error?.code) {
        throw new ApiError({
          code: errPayload.error.code,
          message: errPayload.error.message,
          status: response.status,
          details: errPayload.error.details,
        })
      }

      throw new ApiError({
        code: 'INTERNAL_ERROR',
        message: `Erro ${response.status}`,
        status: response.status,
      })
    }

    return payload as ApiSuccessResponse<T>
  }

  return {
    async get<T>(
      path: string,
      reqOptions?: RequestOptions
    ): Promise<ApiSuccessResponse<T>> {
      return request<T>('GET', path, undefined, reqOptions)
    },

    async getData<T>(
      path: string,
      reqOptions?: RequestOptions
    ): Promise<T> {
      const res = await request<T>('GET', path, undefined, reqOptions)
      return res.data
    },

    async getList<T>(
      path: string,
      reqOptions?: RequestOptions
    ): Promise<ListResult<T>> {
      const res = await request<T[]>('GET', path, undefined, reqOptions)
      return {
        data: res.data,
        meta: res.meta ?? { total: res.data.length },
      }
    },

    async post<T>(
      path: string,
      body?: unknown,
      reqOptions?: RequestOptions
    ): Promise<T> {
      const res = await request<T>('POST', path, body, reqOptions)
      return res.data
    },

    async patch<T>(
      path: string,
      body?: unknown,
      reqOptions?: RequestOptions
    ): Promise<T> {
      const res = await request<T>('PATCH', path, body, reqOptions)
      return res.data
    },

    async delete(path: string, reqOptions?: RequestOptions): Promise<void> {
      await request('DELETE', path, undefined, reqOptions)
    },

    async download(
      path: string,
      query?: Record<string, string | number | boolean | undefined | null>
    ): Promise<DownloadResult> {
      const token = await getToken()
      return downloadFile({
        url: buildUrl(path, query),
        token,
      })
    },
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
