'use client';

import { InputHTMLAttributes } from 'react';
import CommonLabel from './CommonLabel';

interface CommonInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
}

export default function CommonInput({ label, required, error, className, ...props }: CommonInputProps) {
  return (
    <div>
      <CommonLabel required={required}>
        {label}
      </CommonLabel>
      <input
        {...props}
        className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-slate-600'
        } ${className ?? ''}`}
      />
      {error && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
}
