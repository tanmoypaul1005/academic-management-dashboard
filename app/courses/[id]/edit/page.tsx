'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { coursesApi } from '@/lib/api';
import { Course } from '@/types';
import CourseForm from '@/components/CourseForm';

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const data = await coursesApi.getById(courseId);
        setCourse(data);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Course Not Found</h2>
      </div>
    );
  }

  return (
    <div>
      <CourseForm course={course} mode="edit" />
    </div>
  );
}
