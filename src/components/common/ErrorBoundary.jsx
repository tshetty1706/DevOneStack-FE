import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: 'var(--text-color, #e2e8f0)',
            fontSize: '13px',
            textAlign: 'center',
            margin: '8px 0',
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>
            Unable to display this content.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              background: 'var(--accent-color, #6366f1)',
              border: 'none',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
