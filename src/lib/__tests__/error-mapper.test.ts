import { it, expect, describe } from 'vitest'
import { ZodError } from 'zod'
import mapError from '../error-mapper'

describe('mapError', () => {
  it('maps ZodError to user-friendly message', () => {
    const zErr = new ZodError([{ code: 'invalid_type', message: 'Required', path: [] }])
    const out = mapError(zErr)
    expect(out.userMessage).toContain('Required')
    expect(out.code).toBe('validation')
  })

  it('maps generic objects with message', () => {
    const e: any = { message: 'AI quota reached', code: 'ai_quota' }
    const out = mapError(e)
    expect(out.userMessage).toBe('AI quota reached')
    expect(out.code).toBe('ai_quota')
  })

  it('returns fallback for unknown errors', () => {
    const out = mapError(null)
    expect(out.userMessage).toMatch(/Algo salió mal/)
  })
})
