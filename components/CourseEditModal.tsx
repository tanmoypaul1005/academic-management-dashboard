"use client";
import CommonModal from './CommonModal';
import CourseForm from './CourseForm';
import { Course } from '@/types';

type Props = {
  isOpen: boolean;
  course: Course | null;
  onClose: () => void;
  onSuccess?: (updated?: Course) => void;
};

export default function CourseEditModal({ isOpen, course, onClose, onSuccess }: Props) {
  return (
    <CommonModal isOpen={isOpen} onClose={onClose} title="Edit Course" size="lg">
      {course && (
        <CourseForm course={course} mode="edit" onSuccess={(c) => {
          if (onSuccess) onSuccess(c);
          onClose();
        }} />
      )}
    </CommonModal>
  );
}
