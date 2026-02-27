'use client';

import { ReactNode } from 'react';
import Pagination from '@/components/Pagination';

export interface TableColumn {
  label: string;
  /** Extra classes on the <th> — e.g. 'text-right' */
  className?: string;
}

interface CommonTableProps<T extends { id: string }> {
  columns: TableColumn[];
  rows: T[];
  /** Return the <td> cells for a single row */
  renderRow: (row: T) => ReactNode;
  /** Extra className for each <tr>. Use for highlight / delete animations. */
  getRowClassName?: (row: T) => string;
  onRowClick?: (row: T) => void;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
}

export default function CommonTable<T extends { id: string }>({
  columns,
  rows,
  renderRow,
  getRowClassName,
  onRowClick,
  totalPages,
  currentPage,
  onPageChange,
  emptyMessage = 'No records found.',
}: CommonTableProps<T>) {
  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md dark:bg-slate-800 dark:border-slate-700">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50 dark:bg-slate-700 dark:border-slate-700">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.label}
                  className={`px-6 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400 text-left ${col.className ?? ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-10 text-sm text-center text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-all duration-500 ${onRowClick ? 'cursor-pointer' : ''} ${getRowClassName?.(row) ?? 'hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                >
                  {renderRow(row)}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages && totalPages > 1 && currentPage !== undefined && onPageChange && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
