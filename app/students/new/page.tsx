'use client';

import StudentForm from '@/components/StudentForm';
import AnimatedSection from '@/components/AnimatedSection';

export default function NewStudentPage() {
  return (
    <AnimatedSection>
      <StudentForm mode="create" />
    </AnimatedSection>
  );
}
