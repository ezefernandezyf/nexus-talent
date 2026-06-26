import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ErrorBoundary from '../ErrorBoundary'
import { setLogSink } from '../../logger'
import { setToastHandler } from '../../toast'

function Bomb() {
  throw new Error('boom')
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

  it('navigates to /500 on uncaught render error', () => {
    const sink = vi.fn()
    setLogSink(sink)
    const toast = vi.fn()
    setToastHandler(toast)

    // Stub window.location href via setter
    let href: string = ''
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, href: '' },
      writable: true,
      configurable: true,
    })

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    )

    expect(window.location.href).toBe('/500')
    expect(sink).toHaveBeenCalled()
    expect(toast).toHaveBeenCalled()
  })
})
