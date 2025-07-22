"use client";

import { motion } from "motion/react";

interface LoadingSpinnerProps {
  height?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "gradient" | "pulse";
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8", 
  lg: "w-12 h-12"
};

export default function LoadingSpinner({ 
  height = "h-24", 
  size = "md", 
  variant = "default" 
}: LoadingSpinnerProps) {
  const renderSpinner = () => {
    switch (variant) {
      case "gradient":
        return (
          <motion.div
            className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 p-1`}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="w-full h-full bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
            </div>
          </motion.div>
        );
        
      case "pulse":
        return (
          <motion.div
            className={`${sizeClasses[size]} bg-blue-500 rounded-full`}
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
        
      default:
        return (
          <motion.div
            className={`${sizeClasses[size]} border-4 border-blue-200 dark:border-blue-800 border-t-blue-500 dark:border-t-blue-400 rounded-full`}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        );
    }
  };

  return (
    <motion.div 
      className={`flex items-center justify-center w-full ${height}`} 
      role="status"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center gap-4">
        {renderSpinner()}
        
        {/* Loading dots */}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"
              animate={{
                y: [0, -10, 0],
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
        
        <motion.p 
          className="text-sm text-gray-600 dark:text-gray-400 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          aria-live="polite"
        >
          Loading amazing content...
        </motion.p>
      </div>
    </motion.div>
  );
} 