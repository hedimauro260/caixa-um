import { useQuery } from '@tanstack/react-query'
import type { Ping } from '@caixa1/shared'
import type { ApiClient } from '../api/client'

export function usePing(api: ApiClient) {
  return useQuery<Ping>({
    queryKey: ['ping'],
    queryFn: () => api('/health'),
  })
}
