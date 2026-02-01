import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./button";

interface MessageErrorBoundaryProps {
  children: React.ReactNode;
  fallbackContent?: string;
}

interface MessageErrorBoundaryState {
  hasError: boolean;
  showRaw: boolean;
}

/**
 * Error boundary for chat message content.
 * Catches render errors and shows fallback UI with raw content option.
 */
export class MessageErrorBoundary extends React.Component<
  MessageErrorBoundaryProps,
  MessageErrorBoundaryState
> {
  constructor(props: MessageErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, showRaw: false };
  }

  static getDerivedStateFromError(): Partial<MessageErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Message render error:", error, errorInfo);
  }

  handleShowRaw = () => {
    this.setState({ showRaw: true });
  };

  handleRetry = () => {
    this.setState({ hasError: false, showRaw: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.state.showRaw && this.props.fallbackContent) {
        return (
          <div className="space-y-2">
            <pre className="whitespace-pre-wrap break-words text-sm font-mono bg-muted/50 p-3 rounded-lg">
              {this.props.fallbackContent}
            </pre>
            <Button
              variant="ghost"
              size="sm"
              onClick={this.handleRetry}
              className="text-xs"
            >
              Try rendering again
            </Button>
          </div>
        );
      }

      return (
        <MessageErrorFallback
          onShowRaw={this.props.fallbackContent ? this.handleShowRaw : undefined}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

interface MessageErrorFallbackProps {
  onShowRaw?: () => void;
  onRetry?: () => void;
}

function MessageErrorFallback({ onShowRaw, onRetry }: MessageErrorFallbackProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3",
        "text-sm text-destructive"
      )}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span>Failed to render message</span>
      </div>
      <div className="flex gap-2">
        {onShowRaw && (
          <Button
            variant="outline"
            size="sm"
            onClick={onShowRaw}
            className="text-xs h-7"
          >
            Show raw content
          </Button>
        )}
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="text-xs h-7"
          >
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
