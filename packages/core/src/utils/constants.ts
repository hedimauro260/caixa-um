import type {
  AccountType,
  CategoryType,
  TransactionType,
  Currency,
} from '@caixa1/shared'

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  BRL: 'R$',
  USD: '$',
  EUR: '€',
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Conta Corrente',
  savings: 'Poupança',
  credit_card: 'Cartão de Crédito',
  cash: 'Dinheiro',
  investment: 'Investimento',
}

export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  income: 'Receita',
  expense: 'Despesa',
  transfer: 'Transferência',
}

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: 'Receita',
  expense: 'Despesa',
  transfer: 'Transferência',
}

export const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  income: '#00CC88',
  expense: '#CC4444',
  transfer: '#4488CC',
}

export const DEFAULT_LOCALE = 'pt-BR'

export const DEFAULT_TIMEZONE = 'America/Sao_Paulo'