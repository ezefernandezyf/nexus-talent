import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ErrorBoundary from '../../components/ErrorBoundary'
import { setLogSink } from '../../lib/logger'
import { setToastHandler } from '../../lib/toast'

function Bomb() {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  it('renders fallback UI and logs the error', () => {
    const sink = vi.fn()
    setLogSink(sink)
    const toast = vi.fn()
    setToastHandler(toast)
    const retry = vi.fn()

    render(
      <ErrorBoundary onRetry={retry}>
        <Bomb />
      </ErrorBoundary>
    )

    expect(screen.getByRole('alert')).toBeDefined()
    expect(sink).toHaveBeenCalled()
    expect(toast).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /recargar aplicación/i }))
    expect(retry).toHaveBeenCalled()
  })
})
