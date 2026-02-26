'use client';

import CommonModal from '@/components/CommonModal';

interface Props {
  isOpen: boolean;
  message?: string;
  onClose: () => void;
}

export default function GradeSuccessModal({ isOpen, message = 'Operation successful', onClose }: Props) {
  return (
    <CommonModal isOpen={isOpen} onClose={onClose} title="Success" size="sm">
      <div className="py-4 px-2 text-center">
        <div className="text-3xl">✅</div>
        <p className="mt-3 text-gray-700 dark:text-gray-200">{message}</p>
        <div className="mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </CommonModal>
  );
}
