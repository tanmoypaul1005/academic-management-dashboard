import { Course } from '@/types';
import Badge from '@/components/ui/Badge';

interface PopularCoursesTableProps {
  courses: Course[];
}

/** Server component — no 'use client' needed. */
export default function PopularCoursesTable({ courses }: PopularCoursesTableProps) {
  if (courses.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No course data available.</p>;
  }

  return (
    <>
      {/* Mobile: card list */}
      <div className="flex flex-col gap-3 sm:hidden">
        {courses.map((course, idx) => (
          <div
            key={course.id}
            className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50"
          >
            <span className="flex items-center justify-center text-xs font-bold text-blue-600 bg-blue-100 rounded-full shrink-0 w-7 h-7 dark:bg-blue-900/40 dark:text-blue-400">
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate dark:text-white">
                {course.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                <span className="font-mono text-blue-600 dark:text-blue-400">{course.code}</span>
                <span className="mx-1">·</span>
                {course.department}
              </p>
            </div>
            <Badge variant="blue" size="sm">{course.enrollmentCount}</Badge>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-slate-700">
              {[
                { label: 'Course Code', className: 'whitespace-nowrap' },
                { label: 'Course Name', className: '' },
                { label: 'Department', className: 'whitespace-nowrap' },
                { label: 'Enrollments', className: 'text-right whitespace-nowrap' },
              ].map(({ label, className }) => (
                <th
                  key={label}
                  className={`pb-3 px-3 font-medium text-gray-600 dark:text-gray-400 ${className}`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr
                key={course.id}
                className="transition-colors border-b border-gray-200 rounded-lg group dark:border-slate-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-slate-700/50"
              >
                <td className="px-3 py-3 rounded-l-lg whitespace-nowrap">
                  <span className="font-mono font-medium text-blue-600 dark:text-blue-400">
                    {course.code}
                  </span>
                </td>
                <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">{course.name}</td>
                <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{course.department}</td>
                <td className="px-3 py-3 text-right rounded-r-lg">
                  <Badge variant="blue">{course.enrollmentCount}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
