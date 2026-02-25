"use client";

import React from 'react';
import CommonModal from './CommonModal';

type Props = {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
};

export default function ConfirmModal({
  isOpen,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  size = 'sm',
}: Props) {
  return (
    <CommonModal isOpen={isOpen} onClose={onCancel} title={title} size={size}>
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </CommonModal>
  );
}
