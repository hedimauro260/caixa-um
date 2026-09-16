export const queryKeys = {
  accounts: {
    all: ['accounts'] as const,
    lists: () => [...queryKeys.accounts.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.accounts.lists(), filters] as const,
    details: () => [...queryKeys.accounts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.accounts.details(), id] as const,
  },

  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.categories.lists(), filters] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
  },

  transactions: {
    all: ['transactions'] as const,
    lists: () => [...queryKeys.transactions.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.transactions.lists(), filters] as const,
    details: () => [...queryKeys.transactions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.transactions.details(), id] as const,
    summaries: () => [...queryKeys.transactions.all, 'summary'] as const,
    summary: (filters?: Record<string, unknown>) =>
      [...queryKeys.transactions.summaries(), filters] as const,
  },

  journal: {
    all: ['journal'] as const,
    lists: () => [...queryKeys.journal.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.journal.lists(), filters] as const,
    details: () => [...queryKeys.journal.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.journal.details(), id] as const,
  },

  health: ['health'] as const,
} as const
