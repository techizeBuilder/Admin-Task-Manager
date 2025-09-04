import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * TaskErrorBoundary Component
 * Comprehensive error handling for task-related operations
 */
export class TaskErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to monitoring service
    console.error('Task Error Boundary caught an error:', error, errorInfo);
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service like Sentry
      // Sentry.captureException(error, { contexts: { errorBoundary: errorInfo } });
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      const { error, retryCount } = this.state;
      const maxRetries = 3;
      const canRetry = retryCount < maxRetries;

      // Different error messages based on error type
      let errorMessage = 'Something went wrong while loading the task.';
      let errorDetails = 'An unexpected error occurred.';

      if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        errorMessage = 'Network error occurred.';
        errorDetails = 'Please check your internet connection and try again.';
      } else if (error?.message?.includes('permission') || error?.message?.includes('401') || error?.message?.includes('403')) {
        errorMessage = 'Permission denied.';
        errorDetails = 'You don\'t have permission to view this task.';
      } else if (error?.message?.includes('404') || error?.message?.includes('not found')) {
        errorMessage = 'Task not found.';
        errorDetails = 'The task you\'re looking for doesn\'t exist or has been deleted.';
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {errorMessage}
              </h2>
              
              <p className="text-gray-600 mb-6">
                {errorDetails}
              </p>

              {process.env.NODE_ENV === 'development' && (
                <details className="text-left mb-6 p-4 bg-gray-100 rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto">
                    {error?.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                {canRetry && (
                  <Button 
                    onClick={this.handleRetry}
                    className="flex-1"
                    data-testid="button-retry"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again {retryCount > 0 && `(${retryCount}/${maxRetries})`}
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome}
                  className="flex-1"
                  data-testid="button-go-home"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>

              {retryCount >= maxRetries && (
                <p className="text-xs text-gray-500 mt-4">
                  If the problem persists, please contact support.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * TaskOperationError Component
 * For handling specific task operation errors
 */
export const TaskOperationError = ({ 
  error, 
  operation, 
  onRetry, 
  onCancel,
  retryDisabled = false 
}) => {
  const getErrorMessage = (error, operation) => {
    const messages = {
      'update': 'Failed to update task',
      'delete': 'Failed to delete task', 
      'create': 'Failed to create task',
      'upload': 'Failed to upload file',
      'comment': 'Failed to post comment',
      'status': 'Failed to change status'
    };

    return messages[operation] || 'Operation failed';
  };

  const getErrorIcon = (operation) => {
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  };

  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-4">
        <div className="flex items-start space-x-3">
          {getErrorIcon(operation)}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-red-800">
              {getErrorMessage(error, operation)}
            </h4>
            <p className="text-sm text-red-600 mt-1">
              {error?.message || 'An unexpected error occurred. Please try again.'}
            </p>
          </div>
          <div className="flex space-x-2">
            {onRetry && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                disabled={retryDisabled}
                className="text-red-700 border-red-300 hover:bg-red-100"
                data-testid="button-retry-operation"
              >
                Retry
              </Button>
            )}
            {onCancel && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onCancel}
                className="text-red-700 hover:bg-red-100"
                data-testid="button-cancel-operation"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskErrorBoundary;