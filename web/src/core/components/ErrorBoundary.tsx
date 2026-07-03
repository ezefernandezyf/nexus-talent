import React from "react";
import { Button } from "@/shared/components/button/Button";
import mapError from "../error-mapper";
import logger from "../logger";
import { toast } from "../toast";

type State = { hasError: boolean; error: Error | null };

type ErrorBoundaryProps = React.PropsWithChildren<{
  onRetry?: () => void;
}>;

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    const mapped = mapError(error);
    logger.error("Uncaught error in component", { message: mapped.userMessage, componentStack: info.componentStack });
    toast({ title: mapped.userMessage, type: mapped.severity === "error" ? "error" : "warn" });
  }

  handleRetry = () => {
    if (this.props.onRetry) {
      this.props.onRetry();
    }
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface-container-lowest p-8 text-center"
        >
          <h2 className="font-display text-5xl font-black tracking-tight text-on-surface">Error</h2>
          <p className="max-w-md text-lg leading-relaxed text-on-surface-variant">
            {this.state.error?.message || "Ha ocurrido un error inesperado."}
          </p>
          <Button variant="primary" onClick={this.handleRetry}>
            Reintentar
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
