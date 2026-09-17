import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CategoryResponse,
  CreateCategoryInput,
  UpdateCategoryInput,
  ListCategoriesQuery,
} from '@caixa1/shared'
import { queryKeys } from '../queryKeys'
import { endpoints } from '../api/endpoints'
import { useApi } from './useApi'

export function useCategories(filters?: ListCategoriesQuery) {
  const api = useApi()

  return useQuery({
    queryKey: queryKeys.categories.list(filters),
    queryFn: () =>
      api.getList<CategoryResponse>(endpoints.categories.list, {
        query: filters as Record<string, string | number | boolean | undefined>,
      }),
  })
}

export function useCategory(id: string | undefined) {
  const api = useApi()

  return useQuery({
    queryKey: queryKeys.categories.detail(id ?? ''),
    queryFn: () => {
      if (!id) throw new Error('Category id é obrigatório')
      return api.getData<CategoryResponse>(endpoints.categories.detail(id))
    },
    enabled: !!id,
  })
}

export function useCreateCategory() {
  const api = useApi()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCategoryInput) =>
      api.post<CategoryResponse>(endpoints.categories.create, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.categories.all })
    },
  })
}

export function useUpdateCategory() {
  const api = useApi()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      api.patch<CategoryResponse>(endpoints.categories.update(id), input),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.categories.all })
      qc.invalidateQueries({
        queryKey: queryKeys.categories.detail(variables.id),
      })
    },
  })
}

export function useArchiveCategory() {
  const api = useApi()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      api.post<CategoryResponse>(endpoints.categories.archive(id)),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.categories.all })
      qc.invalidateQueries({ queryKey: queryKeys.categories.detail(id) })
    },
  })
}

export function useUnarchiveCategory() {
  const api = useApi()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      api.post<CategoryResponse>(endpoints.categories.unarchive(id)),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.categories.all })
      qc.invalidateQueries({ queryKey: queryKeys.categories.detail(id) })
    },
  })
}

export function useDeleteCategory() {
  const api = useApi()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(endpoints.categories.delete(id)),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.categories.all })
      qc.removeQueries({ queryKey: queryKeys.categories.detail(id) })
    },
  })
}