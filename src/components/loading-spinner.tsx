interface LoadingSpinnerProps {
  height?: string;
}

export default function LoadingSpinner({ height = "h-16" }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center w-full ${height}`} role="status">
      <div
        className="w-8 h-8 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin"
        aria-label="Loading"
      />
    </div>
  );
} 