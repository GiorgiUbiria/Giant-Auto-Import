"use client";

import React, { Component, ReactNode, Suspense } from 'react';
import { FullPageLoading, InlineLoading } from './loading-components';
import { Alert, AlertDescription } from './alert';
import { Button } from './button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Loading and Error Boundaries
 * 
 * This file provides React boundaries for handling loading states and errors
 * consistently across the application.
 */

// ============================================================================
// LOADING BOUNDARIES
// ============================================================================

interface LoadingBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    message?: string;
    variant?: "default" | "minimal" | "detailed";
}

/**
 * Loading Boundary Component
 */
export function LoadingBoundary({
    children,
    fallback,
    message = "Loading...",
    variant = "default"
}: LoadingBoundaryProps) {
    const defaultFallback = <FullPageLoading message={message} variant={variant} />;

    return (
        <Suspense fallback={fallback || defaultFallback}>
            {children}
        </Suspense>
    );
}

/**
 * Inline Loading Boundary
 */
export function InlineLoadingBoundary({
    children,
    fallback,
    message = "Loading..."
}: Omit<LoadingBoundaryProps, 'variant'>) {
    const defaultFallback = <InlineLoading message={message} />;

    return (
        <Suspense fallback={fallback || defaultFallback}>
            {children}
        </Suspense>
    );
}

// ============================================================================
// ERROR BOUNDARIES
// ============================================================================

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: (error: Error, retry: () => void) => ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    showDetails?: boolean;
}

/**
 * Error Boundary Component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({
            error,
            errorInfo
        });

        // Call onError callback if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Log error for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError && this.state.error) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback(this.state.error, this.handleRetry);
            }

            // Default error UI
            return <DefaultErrorFallback
                error={this.state.error}
                errorInfo={this.state.errorInfo}
                onRetry={this.handleRetry}
                showDetails={this.props.showDetails}
            />;
        }

        return this.props.children;
    }
}

/**
 * Default Error Fallback Component
 */
interface DefaultErrorFallbackProps {
    error: Error;
    errorInfo: React.ErrorInfo | null;
    onRetry: () => void;
    showDetails?: boolean;
}

function DefaultErrorFallback({
    error,
    errorInfo,
    onRetry,
    showDetails = false
}: DefaultErrorFallbackProps) {
    return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
            <div className="max-w-md w-full space-y-6">
                <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-destructive" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold">Something went wrong</h2>
                        <p className="text-muted-foreground">
                            We encountered an unexpected error. Please try again or contact support if the problem persists.
                        </p>
                    </div>
                </div>

                {showDetails && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <div className="space-y-2">
                                <p className="font-medium">Error Details:</p>
                                <p className="text-sm font-mono bg-muted p-2 rounded">
                                    {error.message}
                                </p>
                                {errorInfo && (
                                    <details className="text-xs">
                                        <summary className="cursor-pointer">Stack Trace</summary>
                                        <pre className="mt-2 bg-muted p-2 rounded overflow-auto">
                                            {errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex gap-3 justify-center">
                    <Button onClick={onRetry} variant="default">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                    <Button
                        onClick={() => window.location.href = '/'}
                        variant="outline"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// SPECIALIZED BOUNDARIES
// ============================================================================

/**
 * Data Loading Boundary
 * Specifically for data fetching operations
 */
export function DataLoadingBoundary({
    children,
    message = "Loading data...",
    errorMessage = "Failed to load data"
}: {
    children: ReactNode;
    message?: string;
    errorMessage?: string;
}) {
    return (
        <ErrorBoundary
            fallback={(error, retry) => (
                <div className="flex items-center justify-center min-h-[200px] p-6">
                    <div className="text-center space-y-4">
                        <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Data Loading Error</h3>
                            <p className="text-muted-foreground">{errorMessage}</p>
                        </div>
                        <Button onClick={retry} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </div>
            )}
        >
            <LoadingBoundary message={message}>
                {children}
            </LoadingBoundary>
        </ErrorBoundary>
    );
}

/**
 * Form Loading Boundary
 * Specifically for form operations
 */
export function FormLoadingBoundary({
    children,
    message = "Processing form...",
    errorMessage = "Form submission failed"
}: {
    children: ReactNode;
    message?: string;
    errorMessage?: string;
}) {
    return (
        <ErrorBoundary
            fallback={(error, retry) => (
                <div className="p-6">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <div className="space-y-2">
                                <p className="font-medium">{errorMessage}</p>
                                <p className="text-sm">{error.message}</p>
                                <Button onClick={retry} size="sm" variant="outline">
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                    Try Again
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                </div>
            )}
        >
            <LoadingBoundary message={message} variant="minimal">
                {children}
            </LoadingBoundary>
        </ErrorBoundary>
    );
}

/**
 * Table Loading Boundary
 * Specifically for table/data grid operations
 */
export function TableLoadingBoundary({
    children,
    message = "Loading table data...",
    errorMessage = "Failed to load table data"
}: {
    children: ReactNode;
    message?: string;
    errorMessage?: string;
}) {
    return (
        <ErrorBoundary
            fallback={(error, retry) => (
                <div className="flex items-center justify-center min-h-[300px] p-6">
                    <div className="text-center space-y-4">
                        <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
                        <div className="space-y-2">
                            <h3 className="text-base font-semibold">Table Loading Error</h3>
                            <p className="text-sm text-muted-foreground">{errorMessage}</p>
                        </div>
                        <Button onClick={retry} size="sm" variant="outline">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Retry
                        </Button>
                    </div>
                </div>
            )}
        >
            <LoadingBoundary message={message} variant="minimal">
                {children}
            </LoadingBoundary>
        </ErrorBoundary>
    );
}

// ============================================================================
// HOOKS FOR BOUNDARY INTEGRATION
// ============================================================================

/**
 * Hook to create error boundary with retry functionality
 */
export function useErrorBoundary() {
    const [error, setError] = React.useState<Error | null>(null);

    const resetError = React.useCallback(() => {
        setError(null);
    }, []);

    const captureError = React.useCallback((error: Error) => {
        setError(error);
    }, []);

    React.useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);

    return { captureError, resetError };
}

/**
 * Hook for async error handling
 */
export function useAsyncError() {
    const { captureError } = useErrorBoundary();

    return React.useCallback((error: Error) => {
        captureError(error);
    }, [captureError]);
}
