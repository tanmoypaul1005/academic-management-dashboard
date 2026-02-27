'use client';

import CommonModal from '@/components/CommonModal';

interface BulkSuccessModalProps {
  isOpen: boolean;
  action: 'enroll' | 'unenroll';
  studentCount: number;
  onClose: () => void;
}

export default function BulkSuccessModal({
  isOpen,
  action,
  studentCount,
  onClose,
}: BulkSuccessModalProps) {
  const isEnroll = action === 'enroll';

  return (
    <CommonModal isOpen={isOpen} onClose={onClose} title="Bulk Operation Successful" size="sm">
      <div className="py-4 px-2 text-center space-y-3">
        <div className="text-4xl">{isEnroll ? '🎓' : '✅'}</div>
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEnroll ? 'Enrollment Complete' : 'Unenrollment Complete'}
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          <span className="font-bold text-blue-600 dark:text-blue-400">{studentCount}</span>{' '}
          student{studentCount !== 1 ? 's' : ''} successfully{' '}
          {isEnroll ? 'enrolled' : 'unenrolled'}.
        </p>
        <div className="pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </CommonModal>
  );
}
