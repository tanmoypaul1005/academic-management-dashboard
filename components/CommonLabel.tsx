'use client';

import { LabelHTMLAttributes } from 'react';

interface CommonLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  spacing?: string;
}

export default function CommonLabel({
  required,
  spacing = 'mb-1',
  className,
  children,
  ...props
}: CommonLabelProps) {
  return (
    <label
      className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${spacing} ${className ?? ''}`}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 dark:text-red-400"> *</span>}
    </label>
  );
}
