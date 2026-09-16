export const endpoints = {
  health: '/health',

  accounts: {
    list: '/accounts',
    create: '/accounts',
    detail: (id: string) => `/accounts/${id}`,
    update: (id: string) => `/accounts/${id}`,
    archive: (id: string) => `/accounts/${id}/archive`,
    unarchive: (id: string) => `/accounts/${id}/unarchive`,
    delete: (id: string) => `/accounts/${id}`,
  },

  categories: {
    list: '/categories',
    create: '/categories',
    detail: (id: string) => `/categories/${id}`,
    update: (id: string) => `/categories/${id}`,
    archive: (id: string) => `/categories/${id}/archive`,
    unarchive: (id: string) => `/categories/${id}/unarchive`,
    delete: (id: string) => `/categories/${id}`,
  },

  transactions: {
    list: '/transactions',
    create: '/transactions',
    detail: (id: string) => `/transactions/${id}`,
    update: (id: string) => `/transactions/${id}`,
    archive: (id: string) => `/transactions/${id}/archive`,
    unarchive: (id: string) => `/transactions/${id}/unarchive`,
    delete: (id: string) => `/transactions/${id}`,
    summary: '/transactions/summary',
  },

  journal: {
    list: '/journal',
    detail: (id: string) => `/journal/${id}`,
    export: '/journal/export',
  },
} as const