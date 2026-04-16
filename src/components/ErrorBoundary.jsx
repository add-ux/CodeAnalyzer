import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      pathname: window.location.pathname
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Optional: Send error to logging service
    // logErrorToService(error, errorInfo);
  }

  componentDidUpdate(prevProps, prevState) {
    // Reset error state if pathname changes (user navigated away)
    if (this.state.pathname !== window.location.pathname) {
      this.setState({ 
        hasError: false, 
        error: null, 
        errorInfo: null,
        pathname: window.location.pathname
      });
    }
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">
              <i className="fa fa-exclamation-triangle"></i>
            </div>
            <h2>Something went wrong</h2>
            <p className="error-message-text">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <div className="error-boundary-actions">
              <button onClick={this.handleRefresh} className="error-btn-primary">
                <i className="fa fa-refresh"></i> Refresh Page
              </button>
              <button onClick={this.handleGoHome} className="error-btn-secondary">
                <i className="fa fa-home"></i> Go to Home
              </button>
              <button onClick={this.handleGoBack} className="error-btn-secondary">
                <i className="fa fa-arrow-left"></i> Go Back
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="error-details">
                <summary>Technical Details (Development Only)</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;