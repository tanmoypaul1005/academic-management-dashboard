"use client";

import React from 'react';

type Props = {
  totalPages: number;
  currentPage: number;
  onPageChange: (p: number) => void;
  className?: string;
};

function getPageList(total: number, current: number) {
  const delta = 1;
  const range: Array<number | string> = [];
  const left = Math.max(1, current - delta);
  const right = Math.min(total, current + delta);

  if (left > 1) {
    range.push(1);
    if (left > 2) range.push('...');
  }

  for (let i = left; i <= right; i++) range.push(i);

  if (right < total) {
    if (right < total - 1) range.push('...');
    range.push(total);
  }

  return range;
}

export default function Pagination({ totalPages, currentPage, onPageChange, className }: Props) {
  return (
    <div className={className}>
      <div className="bg-gray-50 dark:bg-slate-700 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
        </div>

        <nav className="flex items-center gap-2" aria-label="Pagination">
          {getPageList(totalPages, currentPage).map((p, idx) =>
            typeof p === 'string' ? (
              <span key={"dot-" + idx} className="px-2 text-gray-500">{p}</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                aria-current={p === currentPage ? 'page' : undefined}
                className={
                  (p === currentPage
                    ? 'inline-flex  items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white shadow'
                    : 'inline-flex cursor-pointer items-center justify-center h-8 w-8 rounded-full bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600')
                }
              >
                {p}
              </button>
            )
          )}
        </nav>

        <div className="flex items-center">
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 disabled:opacity-50"
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
