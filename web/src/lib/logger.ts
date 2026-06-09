import { z } from 'zod'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export const loggerConfigSchema = z.object({
  environment: z.enum(['development', 'production']).default('development'),
  enableDebug: z.boolean().optional(),
  enableInfo: z.boolean().optional(),
  telemetryEndpoint: z.string().url().optional(),
})

export type LoggerConfig = z.infer<typeof loggerConfigSchema>

type LogPayload = {
  level: LogLevel
  message: string
  meta?: Record<string, unknown>
  ts: string
}

type LoggerSink = (p: LogPayload) => void

let remoteSink: LoggerSink | null = null
let currentConfig: LoggerConfig = { environment: 'development' }

export function initLogger(config?: unknown) {
  currentConfig = loggerConfigSchema.parse(config ?? {})

  if (currentConfig.telemetryEndpoint) {
    remoteSink = (payload) => {
      void fetch(currentConfig.telemetryEndpoint as string, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch((error) => {
        console.error('logger telemetry error', error)
      })
    }
  }

  return currentConfig
}

export function setLogSink(fn: LoggerSink | null) {
  remoteSink = fn
}

function shouldLog(level: LogLevel) {
  if (currentConfig.environment !== 'production') {
    return true
  }

  if (level === 'debug') {
    return currentConfig.enableDebug ?? false
  }

  if (level === 'info') {
    return currentConfig.enableInfo ?? false
  }

  return true
}

function emit(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const payload: LogPayload = { level, message, meta, ts: new Date().toISOString() }

  if (shouldLog(level)) {
    if (level === 'error') console.error(payload.message, payload.meta)
    else if (level === 'warn') console.warn(payload.message, payload.meta)
    else if (level === 'debug') console.debug(payload.message, payload.meta)
    else console.info(payload.message, payload.meta)
  }

  if (remoteSink) {
    try {
      remoteSink(payload)
    } catch (error) {
      console.error('logger sink error', error)
    }
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => emit('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => emit('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => emit('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => emit('error', message, meta),
}

export default logger
