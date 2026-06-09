import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { initLogger, logger, setLogSink } from '../logger'

describe('logger', () => {
  beforeEach(() => setLogSink(null))
  afterEach(() => {
    vi.restoreAllMocks()
    initLogger({ environment: 'development' })
  })

  it('calls remote sink when set', () => {
    const sink = vi.fn()
    setLogSink(sink)
    logger.info('hello', { foo: 'bar' })
    expect(sink).toHaveBeenCalled()
    const payload = sink.mock.calls[0][0]
    expect(payload.level).toBe('info')
    expect(payload.message).toBe('hello')
  })

  it('does not throw when sink throws', () => {
    const bad = () => { throw new Error('boom') }
    setLogSink(() => bad())
    expect(() => logger.error('fail')).not.toThrow()
  })

  it('suppresses debug and info logs in production by default', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => undefined)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    initLogger({ environment: 'production' })

    logger.debug('debug')
    logger.info('info')
    logger.warn('warn')
    logger.error('error')

    expect(debugSpy).not.toHaveBeenCalled()
    expect(infoSpy).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalled()
  })
})
