import React from 'react';

interface ProgressBarProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  completedTasks?: number;
  totalTasks?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = 'md',
  showLabel = true,
  className = '',
  completedTasks,
  totalTasks,
}) => {
  const clamped = Math.max(0, Math.min(100, isNaN(progress) ? 0 : progress));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-1.5">
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            {totalTasks !== undefined && completedTasks !== undefined ? (
              <span className="tabular-nums">
                {completedTasks} / {totalTasks} tasks completed
              </span>
            ) : (
              'Progress'
            )}
          </span>
          <span className="font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
            {clamped}%
          </span>
        </div>
      )}
      <div className={`w-full ${heights[size]} bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden`}>
        <div
          className="h-full bg-[#0B5D3B] rounded-full transition-all duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
