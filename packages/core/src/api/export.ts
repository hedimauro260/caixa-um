import { ApiError, NetworkError } from './errors'

export interface DownloadOptions {
  url: string
  token?: string | null
  fallbackFilename?: string
}

export interface DownloadResult {
  filename: string
  size: number
  headers: {
    totalCount?: string
    exportCount?: string
    truncated?: boolean
  }
}

function parseFilenameFromHeader(header: string | null): string | null {
  if (!header) return null

  const modernMatch = header.match(/filename\*=UTF-8''([^;]+)/i)
  if (modernMatch) {
    try {
      return decodeURIComponent(modernMatch[1])
    } catch {
      // ignora erro de decode
    }
  }

  const classicMatch = header.match(/filename="?([^";]+)"?/i)
  if (classicMatch) {
    return classicMatch[1]
  }

  return null
}

export async function downloadFile(
  options: DownloadOptions
): Promise<DownloadResult> {
  const { url, token, fallbackFilename = 'download' } = options

  const headers: Record<string, string> = {}

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let response: Response

  try {
    response = await fetch(url, { headers })
  } catch {
    throw new NetworkError()
  }

  if (!response.ok) {
    const errPayload = await response.json().catch(() => null)

    if (errPayload?.error?.code) {
      throw new ApiError({
        code: errPayload.error.code,
        message: errPayload.error.message,
        status: response.status,
        details: errPayload.error.details,
      })
    }

    throw new ApiError({
      code: 'INTERNAL_ERROR',
      message: `Erro ${response.status} ao baixar arquivo`,
      status: response.status,
    })
  }

  const filename =
    parseFilenameFromHeader(response.headers.get('Content-Disposition')) ??
    fallbackFilename

  const totalCount = response.headers.get('X-Total-Count') ?? undefined
  const exportCount = response.headers.get('X-Export-Count') ?? undefined
  const truncatedHeader = response.headers.get('X-Truncated')
  const truncated = truncatedHeader === 'true'

  const blob = await response.blob()

  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  setTimeout(() => URL.revokeObjectURL(objectUrl), 100)

  return {
    filename,
    size: blob.size,
    headers: {
      totalCount,
      exportCount,
      truncated,
    },
  }
}