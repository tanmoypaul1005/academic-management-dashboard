'use client';

import CommonModal from '@/components/CommonModal';
import { CheckCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
}

export default function SuccessModal({
  isOpen,
  title = 'Success',
  message = 'Operation completed successfully!',
  onClose,
}: Props) {
  return (
    <CommonModal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="py-4 px-2 text-center">
        <div className="flex justify-center mb-3">
          <CheckCircle size={48} className="text-green-500 dark:text-green-400" />
        </div>
        <p className="text-gray-700 dark:text-gray-200 text-base">{message}</p>
        <div className="mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </CommonModal>
  );
}
