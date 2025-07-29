'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Button } from './button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      // Default error UI
      return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const getErrorMessage = (error: Error): string => {
    const errorMessage = error.message;
    
    // Handle specific database constraint errors
    if (errorMessage.includes('SQLITE_CONSTRAINT')) {
      if (errorMessage.includes('FOREIGN KEY constraint failed')) {
        if (errorMessage.includes('owner_id')) {
          return 'Invalid owner ID provided. Please select a valid user or leave the owner field empty.';
        }
        return 'Database constraint violation. Please check all required fields and relationships.';
      }
      if (errorMessage.includes('UNIQUE constraint failed')) {
        if (errorMessage.includes('vin')) {
          return 'A car with this VIN already exists in the database.';
        }
        return 'Duplicate entry detected. Please check for duplicate values.';
      }
      if (errorMessage.includes('NOT NULL constraint failed')) {
        return 'Required field is missing. Please fill in all required fields.';
      }
      return `Database constraint violation: ${errorMessage}`;
    }
    
    // Handle network errors
    if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    
    // Handle validation errors
    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return 'Validation error. Please check your input and try again.';
    }
    
    // Default error message
    return errorMessage || 'An unexpected error occurred. Please try again.';
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="mt-2">
          {getErrorMessage(error)}
        </AlertDescription>
      </Alert>
      
      <div className="mt-4 flex gap-2">
        <Button 
          onClick={resetError} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-xs text-gray-500">
          <summary className="cursor-pointer">Error Details (Development)</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}

// Hook for functional components to handle errors
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    
    // You can add additional error handling logic here
    // For example, sending to an error reporting service
    
    return getErrorMessage(error);
  }, []);

  const getErrorMessage = (error: Error): string => {
    const errorMessage = error.message;
    
    if (errorMessage.includes('SQLITE_CONSTRAINT')) {
      if (errorMessage.includes('FOREIGN KEY constraint failed')) {
        if (errorMessage.includes('owner_id')) {
          return 'Invalid owner ID provided. Please select a valid user or leave the owner field empty.';
        }
        return 'Database constraint violation. Please check all required fields and relationships.';
      }
      if (errorMessage.includes('UNIQUE constraint failed')) {
        if (errorMessage.includes('vin')) {
          return 'A car with this VIN already exists in the database.';
        }
        return 'Duplicate entry detected. Please check for duplicate values.';
      }
      if (errorMessage.includes('NOT NULL constraint failed')) {
        return 'Required field is missing. Please fill in all required fields.';
      }
      return `Database constraint violation: ${errorMessage}`;
    }
    
    return errorMessage || 'An unexpected error occurred. Please try again.';
  };

  return { handleError, getErrorMessage };
}