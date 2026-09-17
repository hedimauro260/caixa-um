import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { ApiClient } from './client'

const ApiClientContext = createContext<ApiClient | null>(null)

export interface ApiClientProviderProps {
  client: ApiClient
  children: ReactNode
}

export function ApiClientProvider({ client, children }: ApiClientProviderProps) {
  return (
    <ApiClientContext.Provider value={client}>
      {children}
    </ApiClientContext.Provider>
  )
}

export function useApiClient(): ApiClient {
  const client = useContext(ApiClientContext)

  if (!client) {
    throw new Error(
      'useApiClient deve ser usado dentro de <ApiClientProvider>. ' +
        'Você esqueceu de montar o provider no topo da árvore?'
    )
  }

  return client
}
