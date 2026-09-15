type TokenGetter = () => Promise<string | null>

export interface ApiClientOptions {
  baseUrl: string
  getToken: TokenGetter
}

export function createApiClient({ baseUrl, getToken }: ApiClientOptions) {
  return async function request<T>(
    path: string,
    init: RequestInit = {}
  ): Promise<T> {
    const token = await getToken()

    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...init.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(error.message ?? `HTTP ${response.status}`)
    }

    return response.json()
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
