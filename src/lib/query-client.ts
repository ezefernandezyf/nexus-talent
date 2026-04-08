import { QueryClient } from '@tanstack/react-query'
import mapError from './error-mapper'
import { toast } from './toast'
import logger from './logger'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        onError: (err: unknown) => {
          try {
            const m = mapError(err)
            toast({ title: m.userMessage, type: m.severity === 'error' ? 'error' : 'warn' })
            logger.error(m.userMessage, { code: m.code })
          } catch (e) {
            logger.error('query-client onError handler failed', { e })
          }
        },
      },
      mutations: {
        onError: (err: unknown) => {
          try {
            const m = mapError(err)
            toast({ title: m.userMessage, type: m.severity === 'error' ? 'error' : 'warn' })
            logger.error(m.userMessage, { code: m.code })
          } catch (e) {
            logger.error('query-client mutation onError failed', { e })
          }
        },
      },
    },
  })
}

export default createQueryClient
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false,
    },
    queries: {
      retry: false,
    },
  },
});