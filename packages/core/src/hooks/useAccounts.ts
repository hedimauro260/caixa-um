import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type {
  AccountResponse,
  CreateAccountInput,
  UpdateAccountInput,
  ListAccountsQuery,
} from '@caixa1/shared'
import { queryKeys } from '../queryKeys'
import { endpoints } from '../api/endpoints'
import { useApi } from './useApi'

export function useAccounts(filters?: ListAccountsQuery) {
  const api = useApi()

  return useQuery({
    queryKey: queryKeys.accounts.list(filters),
    queryFn: () =>
      api.getList<AccountResponse>(endpoints.accounts.list, {
        query: filters as Record<string, string | number | boolean | undefined>,
      }),
  })
}

export function useAccount(id: string | undefined) {
  const api = useApi()

  return useQuery({
    queryKey: queryKeys.accounts.detail(id ?? ''),
    queryFn: () => {
      if (!id) throw new Error('Account id é obrigatório')
      return api.getData<AccountResponse>(endpoints.accounts.detail(id))
    },
    enabled: !!id,
  })
}

export function useCreateAccount() {
  const api = useApi()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateAccountInput) =>
      api.post<AccountResponse>(endpoints.accounts.create, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all })
      qc.invalidateQueries({ queryKey: queryKeys.transactions.all })
      qc.invalidateQueries({ queryKey: queryKeys.journal.all })
    },
  })
}

export function useUpdateAccount() {
  const api = useApi()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAccountInput }) =>
      api.patch<AccountResponse>(endpoints.accounts.update(id), input),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all })
      qc.invalidateQueries({ queryKey: queryKeys.accounts.detail(variables.id) })
    },
  })
}

export function useArchiveAccount() {
  const api = useApi()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      api.post<AccountResponse>(endpoints.accounts.archive(id)),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all })
      qc.invalidateQueries({ queryKey: queryKeys.accounts.detail(id) })
    },
  })
}

export function useUnarchiveAccount() {
  const api = useApi()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      api.post<AccountResponse>(endpoints.accounts.unarchive(id)),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all })
      qc.invalidateQueries({ queryKey: queryKeys.accounts.detail(id) })
    },
  })
}

export function useDeleteAccount() {
  const api = useApi()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(endpoints.accounts.delete(id)),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all })
      qc.removeQueries({ queryKey: queryKeys.accounts.detail(id) })
    },
  })
}