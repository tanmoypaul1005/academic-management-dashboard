import { ReactNode } from 'react';

type BadgeVariant = 'blue' | 'green' | 'red' | 'orange' | 'gray';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: 'full' | 'md';
  className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
  blue:   'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  green:  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  red:    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  gray:   'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300',
};

const sizeMap: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

/** Reusable badge/pill for statuses, counts, labels etc. Server-safe. */
export default function Badge({
  children,
  variant = 'blue',
  size = 'md',
  rounded = 'full',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-${rounded} ${variantMap[variant]} ${sizeMap[size]} ${className}`}
    >
      {children}
    </span>
  );
}
