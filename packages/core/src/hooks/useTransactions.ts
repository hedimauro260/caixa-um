import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  TransactionResponse,
  CreateTransactionInput,
  UpdateTransactionInput,
  ListTransactionsQuery,
  SummaryQuery,
  SummaryResponse,
} from '@caixa1/shared'
import { queryKeys } from '../queryKeys'
import { endpoints } from '../api/endpoints'
import { useApi } from './useApi'

export function useTransactions(filters?: ListTransactionsQuery) {
  const api = useApi()

  return useQuery({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: () =>
      api.getList<TransactionResponse>(endpoints.transactions.list, {
        query: filters as Record<string, string | number | boolean | undefined>,
      }),
  })
}

export function useTransaction(id: string | undefined) {
  const api = useApi()

  return useQuery({
    queryKey: queryKeys.transactions.detail(id ?? ''),
    queryFn: () => {
      if (!id) throw new Error('Transaction id é obrigatório')
      return api.getData<TransactionResponse>(endpoints.transactions.detail(id))
    },
    enabled: !!id,
  })
}

export function useCreateTransaction() {
  const api = useApi()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      api.post<TransactionResponse>(endpoints.transactions.create, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.transactions.all })
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all })
      qc.invalidateQueries({ queryKey: queryKeys.journal.all })
    },
  })
}

export function useUpdateTransaction() {
  const api = useApi()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: UpdateTransactionInput
    }) =>
      api.patch<TransactionResponse>(endpoints.transactions.update(id), input),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.transactions.all })
      qc.invalidateQueries({
        queryKey: queryKeys.transactions.detail(variables.id),
      })
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all })
      qc.invalidateQueries({ queryKey: queryKeys.journal.all })
    },
  })
}

export function useArchiveTransaction() {
  const api = useApi()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      api.post<TransactionResponse>(endpoints.transactions.archive(id)),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.transactions.all })
      qc.invalidateQueries({
        queryKey: queryKeys.transactions.detail(id),
      })
      qc.invalidateQueries({ queryKey: queryKeys.journal.all })
    },
  })
}

export function useUnarchiveTransaction() {
  const api = useApi()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      api.post<TransactionResponse>(endpoints.transactions.unarchive(id)),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.transactions.all })
      qc.invalidateQueries({
        queryKey: queryKeys.transactions.detail(id),
      })
      qc.invalidateQueries({ queryKey: queryKeys.journal.all })
    },
  })
}

export function useDeleteTransaction() {
  const api = useApi()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(endpoints.transactions.delete(id)),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.transactions.all })
      qc.removeQueries({ queryKey: queryKeys.transactions.detail(id) })
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all })
      qc.invalidateQueries({ queryKey: queryKeys.journal.all })
    },
  })
}

export function useTransactionSummary(filters?: SummaryQuery) {
  const api = useApi()

  return useQuery({
    queryKey: queryKeys.transactions.summary(
      filters as Record<string, unknown> | undefined
    ),
    queryFn: () =>
      api.getData<SummaryResponse>(endpoints.transactions.summary, {
        query: filters as Record<string, string | number | boolean | undefined>,
      }),
  })
}