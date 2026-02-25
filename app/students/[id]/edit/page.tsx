'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { studentsApi } from '@/lib/api';
import { Student } from '@/types';
import StudentForm from '@/components/StudentForm';

export default function EditStudentPage() {
  const params = useParams();
  const studentId = params.id as string;
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudent() {
      try {
        const data = await studentsApi.getById(studentId);
        setStudent(data);
      } catch (error) {
        console.error('Error fetching student:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStudent();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Student Not Found</h2>
      </div>
    );
  }

  return (
    <div>
      <StudentForm student={student} mode="edit" />
    </div>
  );
}
