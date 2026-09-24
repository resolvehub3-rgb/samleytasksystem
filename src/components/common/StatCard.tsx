import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'green' | 'yellow' | 'red';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  onClick,
}) => {
  const iconVariants = {
    default: 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800',
    green: 'text-[#0B5D3B] dark:text-[#28A76B] bg-[#EBF7F0] dark:bg-[#0B5D3B]/20',
    yellow: 'text-[#9A7400] dark:text-[#E6B41D] bg-[#FDF9E8] dark:bg-[#D9A400]/20',
    red: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30',
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#121A15] transition-colors ${
        onClick ? 'cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1 tabular-nums">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconVariants[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
