import { useAuth } from '@clerk/clerk-react'
import { useMemo } from 'react'
import { createApiClient } from '@caixa1/core'

export function useApi() {
  const { getToken } = useAuth()

  return useMemo(
    () =>
      createApiClient({
        baseUrl: import.meta.env.VITE_API_URL,
        getToken: () => getToken(),
      }),
    [getToken]
  )
}
