/**
 * Helpers para geração de CSV.
 *
 * Regras implementadas (RFC 4180):
 * - Campos com vírgula, aspas ou quebra de linha são envoltos em aspas duplas
 * - Aspas duplas dentro de campos são escapadas como ""
 * - Linhas terminam com \r\n (compatibilidade Excel)
 * - BOM UTF-8 no início (Excel reconhece acentuação corretamente)
 */

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return ''

  const str = String(value)

  const needsQuotes = /[",\r\n]/.test(str)

  if (!needsQuotes) return str

  return `"${str.replace(/"/g, '""')}"`
}

export function toCsv(headers: string[], rows: Array<Array<unknown>>): string {
  const lines: string[] = []

  lines.push(headers.map(escapeCsvValue).join(','))

  for (const row of rows) {
    lines.push(row.map(escapeCsvValue).join(','))
  }

  return '\uFEFF' + lines.join('\r\n') + '\r\n'
}