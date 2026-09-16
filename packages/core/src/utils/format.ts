import type {
  AccountType,
  CategoryType,
  TransactionType,
  Currency,
} from '@caixa1/shared'
import {
  ACCOUNT_TYPE_LABELS,
  CATEGORY_TYPE_LABELS,
  CURRENCY_SYMBOLS,
  DEFAULT_LOCALE,
  TRANSACTION_TYPE_COLORS,
  TRANSACTION_TYPE_LABELS,
} from './constants'

export function formatCurrency(
  value: string | number,
  currency: Currency = 'BRL'
): string {
  const numeric = typeof value === 'number' ? value : parseFloat(value)

  if (!Number.isFinite(numeric)) {
    return '—'
  }

  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric)
}

export function formatSignedAmount(
  amount: string | number,
  type: TransactionType,
  currency: Currency = 'BRL'
): string {
  const formatted = formatCurrency(amount, currency)

  if (type === 'income') {
    return `+${formatted}`
  }

  if (type === 'expense') {
    return `-${formatted}`
  }

  return formatted
}

export function formatSignedValue(
  value: string | number,
  currency: Currency = 'BRL'
): string {
  const numeric = typeof value === 'number' ? value : parseFloat(value)

  if (!Number.isFinite(numeric)) {
    return '—'
  }

  if (numeric > 0) {
    return `+${formatCurrency(numeric, currency)}`
  }

  if (numeric < 0) {
    return formatCurrency(numeric, currency)
  }

  return formatCurrency(0, currency)
}

export function formatDate(dateString: string): string {
  const parts = dateString.split('-')
  if (parts.length !== 3) return '—'

  const [year, month, day] = parts.map(Number)
  if (!year || !month || !day) return '—'

  const date = new Date(year, month - 1, day)

  if (isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatDateLong(dateString: string): string {
  const parts = dateString.split('-')
  if (parts.length !== 3) return '—'

  const [year, month, day] = parts.map(Number)
  if (!year || !month || !day) return '—'

  const date = new Date(year, month - 1, day)
  if (isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function toDateInputValue(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return '—'

  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 60) return 'agora mesmo'

  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `há ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`

  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `há ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`

  const diffDay = Math.floor(diffHour / 24)
  if (diffDay === 1) return 'ontem'
  if (diffDay < 7) return `há ${diffDay} dias`

  return formatDate(toDateInputValue(date))
}

export function formatAccountType(type: AccountType): string {
  return ACCOUNT_TYPE_LABELS[type] ?? type
}

export function formatCategoryType(type: CategoryType): string {
  return CATEGORY_TYPE_LABELS[type] ?? type
}

export function formatTransactionType(type: TransactionType): string {
  return TRANSACTION_TYPE_LABELS[type] ?? type
}

export function getTransactionTypeColor(type: TransactionType): string {
  return TRANSACTION_TYPE_COLORS[type] ?? '#888888'
}

export function getCurrencySymbol(currency: Currency = 'BRL'): string {
  return CURRENCY_SYMBOLS[currency] ?? currency
}

export function formatCount(
  count: number,
  singular: string,
  plural?: string
): string {
  const word = count === 1 ? singular : (plural ?? `${singular}s`)
  return `${count} ${word}`
}