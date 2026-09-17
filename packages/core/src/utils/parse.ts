export function parseAmount(input: string): number | null {
  if (!input) return null

  const cleaned = input.replace(/[^\d.,-]/g, '')

  if (!cleaned) return null

  const isNegative = cleaned.startsWith('-')
  const unsigned = isNegative ? cleaned.slice(1) : cleaned

  const normalized = unsigned.replace(/([.,])\1+/g, '$1')

  const lastComma = normalized.lastIndexOf(',')
  const lastDot = normalized.lastIndexOf('.')

  let decimalSeparator: ',' | '.' | null = null

  if (lastComma >= 0 && lastDot >= 0) {
    decimalSeparator = lastComma > lastDot ? ',' : '.'
  } else if (lastComma >= 0) {
    decimalSeparator = ','
  } else if (lastDot >= 0) {
    const afterLastDot = normalized.slice(lastDot + 1)
    if (afterLastDot.length === 3) {
      decimalSeparator = null
    } else {
      decimalSeparator = '.'
    }
  }

  let normalizedNumber: string

  if (decimalSeparator === ',') {
    normalizedNumber = normalized.replace(/\./g, '').replace(',', '.')
  } else if (decimalSeparator === '.') {
    normalizedNumber = normalized.replace(/,/g, '')
  } else {
    normalizedNumber = normalized.replace(/[.,]/g, '')
  }

  const result = parseFloat(normalizedNumber)

  if (!Number.isFinite(result)) return null

  return isNegative ? -result : result
}

export function parsePositiveAmount(input: string): number | null {
  const parsed = parseAmount(input)
  if (parsed === null || parsed <= 0) return null
  return parsed
}

export function parseDate(input: string): string | null {
  if (!input) return null

  const trimmed = input.trim()

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    if (
      date.getFullYear() !== y ||
      date.getMonth() !== m - 1 ||
      date.getDate() !== d
    ) {
      return null
    }
    return trimmed
  }

  const brMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (brMatch) {
    const [, d, m, y] = brMatch
    const day = d.padStart(2, '0')
    const month = m.padStart(2, '0')

    const date = new Date(Number(y), Number(month) - 1, Number(day))
    if (
      date.getFullYear() !== Number(y) ||
      date.getMonth() !== Number(month) - 1 ||
      date.getDate() !== Number(day)
    ) {
      return null
    }

    return `${y}-${month}-${day}`
  }

  return null
}

export function parseColor(input: string): string | null {
  if (!input) return null

  const cleaned = input.trim()

  const withHash = cleaned.startsWith('#') ? cleaned : `#${cleaned}`

  if (!/^#[0-9A-Fa-f]{6}$/.test(withHash)) return null

  return withHash.toUpperCase()
}

export function truncate(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input
  return `${input.slice(0, maxLength - 1)}…`
}