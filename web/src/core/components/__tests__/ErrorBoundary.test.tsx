import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ErrorBoundary from '../ErrorBoundary'
import { setLogSink } from '../../logger'
import { setToastHandler } from '../../toast'

function Bomb() {
  throw new Error('boom')
}

function GoodChild() {
  return <div>Todo bien</div>
}

describe('ErrorBoundary', () => {
  let originalLocation: Location

  beforeEach(() => {
    originalLocation = window.location
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    })
    vi.restoreAllMocks()
  })

  it('renders fallback UI with error message on uncaught render error', () => {
    const sink = vi.fn()
    setLogSink(sink)
    const toast = vi.fn()
    setToastHandler(toast)

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    )

    // Must NOT redirect
    expect(window.location.href).not.toBe('/500')

    // Must render fallback UI
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('boom')).toBeInTheDocument()

    // Must show a retry button
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()

    // Must still log
    expect(sink).toHaveBeenCalled()
    expect(toast).toHaveBeenCalled()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Todo bien')).toBeInTheDocument()
  })

  it('resets to children after error when onRetry prop changes state', () => {
    const sink = vi.fn()
    setLogSink(sink)

    const { rerender } = render(
      <ErrorBoundary onRetry={vi.fn()}>
        <Bomb />
      </ErrorBoundary>,
    )

    // Error state renders
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('boom')).toBeInTheDocument()
  })
})
