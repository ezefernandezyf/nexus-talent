import { it, expect, describe } from 'vitest'
import { z, ZodError } from 'zod'
import mapError from '../error-mapper'

describe('mapError', () => {
  it('maps ZodError to user-friendly message', () => {
    let zErr: ZodError
    try {
      z.string().parse(123)
      throw new Error('Expected parse to fail')
    } catch (error) {
      if (!(error instanceof ZodError)) {
        throw error
      }
      zErr = error
    }
    const out = mapError(zErr)
    expect(out.userMessage).toMatch(/expected string|invalid input/i)
    expect(out.code).toBe('validation')
  })

  it('maps generic objects with message', () => {
    const e: { message: string; code: string } = { message: 'AI quota reached', code: 'ai_quota' }
    const out = mapError(e)
    expect(out.userMessage).toBe('AI quota reached')
    expect(out.code).toBe('ai_quota')
  })

  it('returns fallback for unknown errors', () => {
    const out = mapError(null)
    expect(out.userMessage).toMatch(/Algo salió mal/)
  })
})
