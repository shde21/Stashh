import React, { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled UI render error caught by ErrorBoundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '280px',
            padding: 'var(--space-6)',
          }}
        >
          <div
            className="vl-card"
            style={{
              maxWidth: '520px',
              width: '100%',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-4)',
              padding: 'var(--space-8)',
              borderColor: 'var(--negative-border)',
              boxShadow: 'var(--shadow-modal)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--negative-subtle)',
                color: 'var(--negative-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-hidden="true"
            >
              <AlertTriangle size={24} strokeWidth={2} />
            </div>

            <div>
              <h2
                style={{
                  fontSize: 'var(--font-h3)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--text)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                Something went wrong
              </h2>
              <p
                style={{
                  fontSize: 'var(--font-small)',
                  color: 'var(--text-secondary)',
                  lineHeight: 'var(--lh-body)',
                  margin: 0,
                }}
              >
                An unexpected error occurred while rendering this interface. Your data and session are intact.
              </p>
              {this.state.error?.message && (
                <div
                  style={{
                    marginTop: 'var(--space-3)',
                    padding: 'var(--space-2) var(--space-3)',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-caption)',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)',
                    wordBreak: 'break-word',
                  }}
                >
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                gap: 'var(--space-3)',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: 'var(--space-2)',
              }}
            >
              <button
                type="button"
                className="vl-btn vl-btn-primary vl-btn-md"
                onClick={this.handleReset}
                style={{ minHeight: '40px' }}
              >
                <RefreshCw size={15} strokeWidth={1.75} aria-hidden="true" />
                <span>Try again</span>
              </button>
              <a
                href="/app"
                className="vl-btn vl-btn-secondary vl-btn-md"
                style={{ minHeight: '40px' }}
              >
                <Home size={15} strokeWidth={1.75} aria-hidden="true" />
                <span>Return to workspace</span>
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
