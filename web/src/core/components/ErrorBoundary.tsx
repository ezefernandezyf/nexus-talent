import React from 'react'
import mapError from '../error-mapper'
import logger from '../logger'
import { toast } from '../toast'

type State = { hasError: boolean }

type ErrorBoundaryProps = React.PropsWithChildren<{
  onRetry?: () => void
}>

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    const mapped = mapError(error)
    logger.error('Uncaught error in component', { message: mapped.userMessage, componentStack: info.componentStack })
    toast({ title: mapped.userMessage, type: mapped.severity === 'error' ? 'error' : 'warn' })
    window.location.href = '/500'
  }

  render() {
    if (this.state.hasError) {
      return null
    }

    return this.props.children
  }
}

export default ErrorBoundary
