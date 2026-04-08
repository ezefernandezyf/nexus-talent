import { QueryClient } from '@tanstack/react-query'
import mapError from './error-mapper'
import { toast } from './toast'
import logger from './logger'

export function createQueryClient() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  // Subscribe to query cache to pick up global query errors
  try {
    client.getQueryCache().subscribe((event: any) => {
      try {
        const q = event?.query
        if (q?.state?.status === 'error') {
          const err = q.state.error
          const m = mapError(err)
          toast({ title: m.userMessage, type: m.severity === 'error' ? 'error' : 'warn' })
          logger.error(m.userMessage, { code: m.code })
        }
      } catch (e) {
        logger.error('query-client cache handler failed', { e })
      }
    })
  } catch (e) {
    logger.error('query-client subscribe failed', { e })
  }

  // Subscribe to mutation cache to pick up global mutation errors
  try {
    client.getMutationCache().subscribe((event: any) => {
      try {
        const mtn = event?.mutation
        if (mtn?.state?.status === 'error') {
          const err = mtn.state.error
          const mapped = mapError(err)
          toast({ title: mapped.userMessage, type: mapped.severity === 'error' ? 'error' : 'warn' })
          logger.error(mapped.userMessage, { code: mapped.code })
        }
      } catch (e) {
        logger.error('query-client mutation cache handler failed', { e })
      }
    })
  } catch (e) {
    logger.error('mutation-cache subscribe failed', { e })
  }

  return client
}

export default createQueryClient
export const queryClient = createQueryClient()