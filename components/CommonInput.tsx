'use client';

import { InputHTMLAttributes } from 'react';

interface CommonInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
}

export default function CommonInput({ label, required, error, className, ...props }: CommonInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500 dark:text-red-400">*</span>}
      </label>
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
