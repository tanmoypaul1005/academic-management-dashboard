'use client';

import CourseForm from '@/components/CourseForm';
import AnimatedSection from '@/components/AnimatedSection';

export default function NewCoursePage() {
  return (
    <AnimatedSection>
      <CourseForm mode="create" />
    </AnimatedSection>
  );
}
