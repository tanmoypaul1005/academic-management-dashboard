'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { studentsApi, coursesApi, gradesApi } from '@/lib/api';
import { Student, Course, Grade } from '@/types';
import { calculateStudentProgress } from '@/lib/utils';
import AnimatedSection from '@/components/AnimatedSection';
import AnimatedCard from '@/components/AnimatedCard';

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentData, coursesData, gradesData] = await Promise.all([
          studentsApi.getById(studentId),
          coursesApi.getAll(),
          gradesApi.getByStudentId(studentId),
        ]);
        setStudent(studentData);
        setCourses(coursesData);
        setGrades(gradesData);
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Student Not Found</h2>
        <Link href="/students" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
          Back to Students
        </Link>
      </div>
    );
  }

  const enrolledCourses = courses.filter(c => student.enrolledCourses.includes(c.id));
  const progress = calculateStudentProgress(grades);

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnimatedSection>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{student.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">{student.email}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/students/${studentId}/edit`}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Edit Student
            </Link>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </AnimatedSection>

      {/* Student Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedCard>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Major</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.major}</p>
          </div>
        </AnimatedCard>
        <AnimatedCard>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Year</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">Year {student.year}</p>
          </div>
        </AnimatedCard>
        <AnimatedCard>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Current GPA</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{student?.gpa?.toFixed(2)}</p>
          </div>
        </AnimatedCard>
        <AnimatedCard>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Enrolled Courses</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{enrolledCourses.length}</p>
          </div>
        </AnimatedCard>
      </div>

      {/* Progress Summary */}
      {grades.length > 0 && (
        <AnimatedSection>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Academic Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Courses Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{progress.totalCourses}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Average Grade</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{progress.averageGrade.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Letter Grade</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{progress.letterGrade}</p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Enrolled Courses */}
      <AnimatedSection>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Enrolled Courses</h2>
          {enrolledCourses.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No courses enrolled</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Course Code</th>
                    <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Course Name</th>
                    <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Department</th>
                    <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Credits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {enrolledCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                      <td className="py-3 font-mono font-medium text-blue-600 dark:text-blue-400">{course.code}</td>
                      <td className="py-3 text-gray-900 dark:text-white">{course.name}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{course.department}</td>
                      <td className="py-3 text-gray-900 dark:text-white">{course.credits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* Grades */}
      {grades.length > 0 && (
        <AnimatedSection>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Grades & Progress</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Course</th>
                    <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Semester</th>
                    <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Grade</th>
                    <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {grades.map((grade) => {
                    const course = courses.find(c => c.id === grade.courseId);
                    return (
                      <tr key={grade.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                        <td className="py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{course?.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{course?.code}</p>
                          </div>
                        </td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">{grade.semester}</td>
                        <td className="py-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 font-bold">
                            {grade.grade}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-gray-900 dark:text-white">{grade.numericGrade}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </AnimatedSection>
      )}
    </div>
  );
}
