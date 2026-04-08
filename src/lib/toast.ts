export type ToastPayload = { title: string; message?: string; type?: 'info' | 'success' | 'warn' | 'error' }

let handler: ((p: ToastPayload) => void) | null = null

export function setToastHandler(fn: ((p: ToastPayload) => void) | null) {
  handler = fn
}

export function toast(payload: ToastPayload) {
  try {
    if (handler) handler(payload)
    else console.info('toast:', payload.title, payload.message)
  } catch (e) {
    console.error('toast handler error', e)
  }
}

export default toast
