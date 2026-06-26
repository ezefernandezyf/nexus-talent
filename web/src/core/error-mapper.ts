import { ZodError } from 'zod'

export type MappedError = {
  userMessage: string
  code?: string
  severity?: 'info' | 'warn' | 'error'
  meta?: Record<string, unknown>
}

export function mapError(err: unknown): MappedError {
  // Zod validation errors
  if (err instanceof ZodError) {
    const first = err.issues?.[0]
    return { userMessage: first?.message ?? 'Invalid input', code: 'validation', severity: 'warn' }
  }

  // Narrow unknown to a safe shape instead of using `any`.
  type ErrorLike = { name?: string; status?: number; message?: string; code?: string }
  function isErrorLike(v: unknown): v is ErrorLike {
    return typeof v === 'object' && v !== null && (
      'message' in (v as Record<string, unknown>) ||
      'code' in (v as Record<string, unknown>) ||
      'status' in (v as Record<string, unknown>) ||
      'name' in (v as Record<string, unknown>)
    )
  }

  // Distinguish HTTP error types by status code before falling through to db_error
  if (isErrorLike(err) && typeof err.status !== 'undefined') {
    if (err.status === 401 || err.status === 403) {
      const msg = err.message || 'Authentication error'
      return { userMessage: msg, code: 'auth_error', severity: 'error', meta: { status: err.status } }
    }
    if (err.status >= 500) {
      const msg = err.message || 'API error'
      return { userMessage: msg, code: 'api_error', severity: 'error', meta: { status: err.status } }
    }
  }

  // Postgrest / Prisma database errors
  if (isErrorLike(err) && err.name === 'PostgrestError') {
    const msg = err.message || 'Database error'
    return { userMessage: msg, code: 'db_error', severity: 'error', meta: { status: err.status } }
  }

  // AI / network errors may include a code or message
  if (isErrorLike(err) && (typeof err.code !== 'undefined' || typeof err.message !== 'undefined')) {
    const msg = err.message || 'Request failed'
    return { userMessage: msg, code: err.code, severity: 'error' }
  }

  // Fallback
  return { userMessage: 'Algo salió mal. Intentá de nuevo más tarde.', severity: 'error' }
}

export default mapError
