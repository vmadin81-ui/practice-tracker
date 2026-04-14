export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const raw = error.message?.trim()
    if (!raw) return 'Произошла ошибка'

    try {
      const parsed = JSON.parse(raw)

      if (typeof parsed?.detail === 'string') {
        return parsed.detail
      }

      if (typeof parsed?.message === 'string') {
        return parsed.message
      }

      if (typeof parsed?.error?.message === 'string') {
        return parsed.error.message
      }
    } catch {
      // ignore JSON parse failure
    }

    return raw
  }

  if (typeof error === 'string') {
    return error
  }

  return 'Произошла ошибка'
}