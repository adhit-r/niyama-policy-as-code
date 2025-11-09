import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    // You might want to also navigate the user away or reload the page
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-niyama-gray-50 p-8 text-center" role="alert">
          <div className="bg-white p-12 border-4 border-niyama-error shadow-brutal-lg rounded-lg max-w-2xl">
            <div className="flex justify-center items-center w-20 h-20 bg-niyama-error mx-auto rounded-full border-4 border-niyama-black mb-6">
                <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-niyama-black mb-2">Oops! Something went wrong.</h1>
            <p className="text-niyama-gray-600 mb-6">
              We're sorry for the inconvenience. An unexpected error occurred. Please try refreshing the page.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="bg-niyama-gray-100 border-2 border-niyama-black p-4 text-left mb-6 text-sm">
                <summary className="font-bold cursor-pointer">Error Details</summary>
                <pre className="mt-2 whitespace-pre-wrap font-mono text-niyama-error text-xs">
                  {this.state.error.toString()}
                  <br />
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReset}
              className="bg-niyama-accent px-8 py-4 font-bold text-niyama-black border-2 border-niyama-black shadow-brutal hover:shadow-brutal-lg transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
