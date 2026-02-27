import { SelectHTMLAttributes } from 'react';
import CommonLabel from './CommonLabel';

interface CommonSemesterProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  required?: boolean;
  error?: string;
}

const SEMESTER_OPTIONS = [
  'Fall 2021',
  'Spring 2022',
  'Fall 2022',
  'Spring 2023',
  'Fall 2023',
  'Spring 2024',
  'Fall 2024',
  'Spring 2025',
  'Fall 2025',
  'Spring 2026',
  'Fall 2026',
];

export default function CommonSemester({ label, required, error, className, ...props }: CommonSemesterProps) {
  return (
    <div>
      <CommonLabel required={required}>
        {label}
      </CommonLabel>
      <select
        {...props}
        className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-slate-600'
        } ${className ?? ''}`}
      >
        <option value="">Select Semester</option>
        {SEMESTER_OPTIONS.map((semester) => (
          <option key={semester} value={semester}>{semester}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
}