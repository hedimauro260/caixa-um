import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type {
  JournalEntryResponse,
  ListJournalQuery,
  ExportJournalQuery,
} from '@caixa1/shared'
import { queryKeys } from '../queryKeys'
import { endpoints } from '../api/endpoints'
import { useApi } from './useApi'
import type { DownloadResult } from '../api/export'

export function useJournal(filters?: ListJournalQuery) {
  const api = useApi()

  return useQuery({
    queryKey: queryKeys.journal.list(filters),
    queryFn: () =>
      api.getList<JournalEntryResponse>(endpoints.journal.list, {
        query: filters as Record<string, string | number | boolean | undefined>,
      }),
  })
}

export function useJournalEntry(id: string | undefined) {
  const api = useApi()

  return useQuery({
    queryKey: queryKeys.journal.detail(id ?? ''),
    queryFn: () =>
      api.getData<JournalEntryResponse>(endpoints.journal.detail(id ?? '')),
    enabled: !!id,
  })
}

export interface UseExportJournalResult {
  export: (filters?: ExportJournalQuery) => Promise<DownloadResult>
  isExporting: boolean
  error: Error | null
}

export function useExportJournal(): UseExportJournalResult {
  const api = useApi()
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const exportFn = useCallback(
    async (filters?: ExportJournalQuery): Promise<DownloadResult> => {
      setIsExporting(true)
      setError(null)

      try {
        const result = await api.download(
          endpoints.journal.export,
          filters as Record<string, string | number | boolean | undefined>
        )
        return result
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err))
        setError(e)
        throw e
      } finally {
        setIsExporting(false)
      }
    },
    [api]
  )

  return {
    export: exportFn,
    isExporting,
    error,
  }
}