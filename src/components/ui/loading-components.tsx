"use client";

import { motion } from "motion/react";
import { Loader2, Upload, Download, FileText, Car, User, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Standardized Loading Components
 * 
 * This file provides consistent loading indicators across the application.
 * All loading states should use these components for consistency.
 */

// ============================================================================
// BASIC LOADING COMPONENTS
// ============================================================================

interface BaseLoadingProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12"
};

/**
 * Standard Spinner Component
 */
export function LoadingSpinner({ size = "md", className }: BaseLoadingProps) {
    return (
        <Loader2
            className={cn(
                "animate-spin text-primary",
                sizeClasses[size],
                className
            )}
        />
    );
}

/**
 * Circular Progress Spinner
 */
export function CircularSpinner({ size = "md", className }: BaseLoadingProps) {
    return (
        <motion.div
            className={cn(
                "border-2 border-muted border-t-primary rounded-full",
                sizeClasses[size],
                className
            )}
            animate={{ rotate: 360 }}
            transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
            }}
        />
    );
}

/**
 * Pulsing Dot Spinner
 */
export function PulsingSpinner({ size = "md", className }: BaseLoadingProps) {
    return (
        <motion.div
            className={cn(
                "bg-primary rounded-full",
                sizeClasses[size],
                className
            )}
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        />
    );
}

// ============================================================================
// CONTEXTUAL LOADING COMPONENTS
// ============================================================================

interface ContextualLoadingProps extends BaseLoadingProps {
    message?: string;
    showIcon?: boolean;
}

/**
 * Upload Loading Component
 */
export function UploadLoading({ size = "md", message = "Uploading...", showIcon = true, className }: ContextualLoadingProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {showIcon && <Upload className={cn("animate-pulse", sizeClasses[size])} />}
            <LoadingSpinner size={size} />
            <span className="text-sm text-muted-foreground">{message}</span>
        </div>
    );
}

/**
 * Download Loading Component
 */
export function DownloadLoading({ size = "md", message = "Downloading...", showIcon = true, className }: ContextualLoadingProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {showIcon && <Download className={cn("animate-pulse", sizeClasses[size])} />}
            <LoadingSpinner size={size} />
            <span className="text-sm text-muted-foreground">{message}</span>
        </div>
    );
}

/**
 * File Processing Loading Component
 */
export function FileProcessingLoading({ size = "md", message = "Processing...", showIcon = true, className }: ContextualLoadingProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {showIcon && <FileText className={cn("animate-pulse", sizeClasses[size])} />}
            <LoadingSpinner size={size} />
            <span className="text-sm text-muted-foreground">{message}</span>
        </div>
    );
}

/**
 * Car Data Loading Component
 */
export function CarDataLoading({ size = "md", message = "Loading car data...", showIcon = true, className }: ContextualLoadingProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {showIcon && <Car className={cn("animate-pulse", sizeClasses[size])} />}
            <LoadingSpinner size={size} />
            <span className="text-sm text-muted-foreground">{message}</span>
        </div>
    );
}

/**
 * User Data Loading Component
 */
export function UserDataLoading({ size = "md", message = "Loading user data...", showIcon = true, className }: ContextualLoadingProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {showIcon && <User className={cn("animate-pulse", sizeClasses[size])} />}
            <LoadingSpinner size={size} />
            <span className="text-sm text-muted-foreground">{message}</span>
        </div>
    );
}

/**
 * Payment Processing Loading Component
 */
export function PaymentProcessingLoading({ size = "md", message = "Processing payment...", showIcon = true, className }: ContextualLoadingProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {showIcon && <CreditCard className={cn("animate-pulse", sizeClasses[size])} />}
            <LoadingSpinner size={size} />
            <span className="text-sm text-muted-foreground">{message}</span>
        </div>
    );
}

// ============================================================================
// FULL PAGE LOADING COMPONENTS
// ============================================================================

interface FullPageLoadingProps {
    message?: string;
    variant?: "default" | "minimal" | "detailed";
    showProgress?: boolean;
    progress?: number;
}

/**
 * Full Page Loading Component
 */
export function FullPageLoading({
    message = "Loading...",
    variant = "default",
    showProgress = false,
    progress = 0
}: FullPageLoadingProps) {
    if (variant === "minimal") {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="flex flex-col items-center gap-4">
                    <LoadingSpinner size="lg" />
                    <span className="text-sm text-muted-foreground">{message}</span>
                </div>
            </div>
        );
    }

    if (variant === "detailed") {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <motion.div
                    className="flex flex-col items-center gap-6 p-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="relative"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full" />
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-primary/50 rounded-full animate-pulse" />
                    </motion.div>

                    <div className="text-center space-y-2">
                        <h3 className="text-lg font-semibold">{message}</h3>
                        <p className="text-sm text-muted-foreground">
                            Please wait while we process your request...
                        </p>
                    </div>

                    {showProgress && (
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Progress</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <motion.div
                                    className="bg-primary h-2 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 bg-primary rounded-full"
                                animate={{
                                    y: [0, -8, 0],
                                }}
                                transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: i * 0.2,
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    }

    // Default variant
    return (
        <div className="flex items-center justify-center min-h-[300px]">
            <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <LoadingSpinner size="lg" />
                <span className="text-muted-foreground">{message}</span>
            </motion.div>
        </div>
    );
}

// ============================================================================
// INLINE LOADING COMPONENTS
// ============================================================================

interface InlineLoadingProps {
    message?: string;
    size?: "sm" | "md";
    variant?: "spinner" | "dots" | "pulse";
}

/**
 * Inline Loading Component
 */
export function InlineLoading({
    message,
    size = "sm",
    variant = "spinner"
}: InlineLoadingProps) {
    const renderLoader = () => {
        switch (variant) {
            case "dots":
                return (
                    <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className={cn(
                                    "bg-primary rounded-full",
                                    size === "sm" ? "w-1 h-1" : "w-2 h-2"
                                )}
                                animate={{
                                    y: [0, -4, 0],
                                }}
                                transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: i * 0.2,
                                }}
                            />
                        ))}
                    </div>
                );
            case "pulse":
                return <PulsingSpinner size={size} />;
            default:
                return <LoadingSpinner size={size} />;
        }
    };

    return (
        <div className="flex items-center gap-2">
            {renderLoader()}
            {message && (
                <span className={cn(
                    "text-muted-foreground",
                    size === "sm" ? "text-xs" : "text-sm"
                )}>
                    {message}
                </span>
            )}
        </div>
    );
}

// ============================================================================
// BUTTON LOADING COMPONENTS
// ============================================================================

interface ButtonLoadingProps {
    loading?: boolean;
    children: React.ReactNode;
    loadingText?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

/**
 * Button with Loading State
 */
export function ButtonWithLoading({
    loading = false,
    children,
    loadingText,
    size = "md",
    className
}: ButtonLoadingProps) {
    const sizeClasses = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5"
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {loading && (
                <LoadingSpinner
                    size={size === "sm" ? "sm" : size === "lg" ? "lg" : "md"}
                />
            )}
            <span>
                {loading && loadingText ? loadingText : children}
            </span>
        </div>
    );
}

// ============================================================================
// SKELETON LOADING COMPONENTS
// ============================================================================

interface SkeletonProps {
    className?: string;
    variant?: "text" | "rectangular" | "circular";
}

/**
 * Skeleton Loading Component
 */
export function Skeleton({ className, variant = "rectangular" }: SkeletonProps) {
    const baseClasses = "animate-pulse bg-muted";

    const variantClasses = {
        text: "h-4 w-full rounded",
        rectangular: "h-4 w-full rounded-md",
        circular: "h-4 w-4 rounded-full"
    };

    return (
        <div
            className={cn(
                baseClasses,
                variantClasses[variant],
                className
            )}
        />
    );
}

/**
 * Table Row Skeleton
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <tr>
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    );
}

/**
 * Card Skeleton
 */
export function CardSkeleton() {
    return (
        <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
            </div>
        </div>
    );
}
