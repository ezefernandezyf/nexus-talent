import React from 'react'
import { Card } from './ui/Card'
import mapError from '../lib/error-mapper'
import logger from '../lib/logger'
import { toast } from '../lib/toast'

type State = { hasError: boolean; message?: string }

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
    this.setState({ message: mapped.userMessage })
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: undefined })
    if (this.props.onRetry) {
      this.props.onRetry()
      return
    }

    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card
          role="alert"
          className="mx-auto mt-10 flex max-w-2xl flex-col gap-4 p-6 text-on-surface"
        >
          <div className="space-y-2">
            <h2 className="font-sans text-2xl font-semibold tracking-[-0.02em] text-white">Ups — algo salió mal</h2>
            <p className="text-sm leading-6 text-on-surface-variant">
              {this.state.message ?? 'Intentá recargar la página.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="primary-button" type="button" onClick={this.handleRetry}>
              Recargar aplicación
            </button>
          </div>
        </Card>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
