import React from 'react';

interface LoadingMessageProps {
  darkMode: boolean;
}

function LoadingMessage({ darkMode }: LoadingMessageProps) {
  return (
    <div className="brutal-card animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="h-6 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-6">
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-6">
        <div className="h-8 w-20 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        <div className="h-8 w-20 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <div className="h-10 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="h-10 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    </div>
  );
}

export default LoadingMessage;
