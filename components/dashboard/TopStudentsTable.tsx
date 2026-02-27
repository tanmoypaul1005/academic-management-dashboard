import { Student } from '@/types';
import Badge from '@/components/ui/Badge';

interface TopStudentsTableProps {
  students: Student[];
}

const rankStyle: Record<number, string> = {
  0: 'bg-yellow-400 text-yellow-900',
  1: 'bg-gray-300 text-gray-900',
  2: 'bg-orange-400 text-orange-900',
};

/** Server component — no 'use client' needed. */
export default function TopStudentsTable({ students }: TopStudentsTableProps) {
  if (students.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No student data available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left border-b border-gray-200 dark:border-slate-700">
            {['Rank', 'Student', 'GPA'].map((h) => (
              <th key={h} className="pb-3 font-medium text-gray-600 dark:text-gray-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr
              key={student.id}
              className="border-b border-gray-200 dark:border-slate-700 last:border-b-0"
            >
              <td className="py-3">
                <span
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                    ${rankStyle[index] ?? 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'}`}
                >
                  {index + 1}
                </span>
              </td>
              <td className="py-3">
                <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{student.major}</p>
              </td>
              <td className="py-3">
                <Badge variant="blue" size="md">
                  {student.gpa?.toFixed(2)}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
