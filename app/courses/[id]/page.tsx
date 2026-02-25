'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { coursesApi, facultyApi, studentsApi } from '@/lib/api';
import { Course, Faculty, Student } from '@/types';

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [courseData, facultyData, studentsData] = await Promise.all([
          coursesApi.getById(courseId),
          facultyApi.getAll(),
          studentsApi.getAll(),
        ]);
        setCourse(courseData);
        setFaculty(facultyData);
        // Filter students enrolled in this course
        const enrolledStudents = studentsData.filter(s => 
          s.enrolledCourses.includes(courseId)
        );
        setStudents(enrolledStudents);
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
        <Link href="/courses" className="text-blue-600 hover:text-blue-800">
          Back to Courses
        </Link>
      </div>
    );
  }

  const assignedFaculty = faculty.filter(f => course.facultyIds.includes(f.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg font-mono font-bold">
              {course.code}
            </span>
            <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
          </div>
          <p className="text-gray-600">{course.department}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/courses/${courseId}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Course
          </Link>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      {/* Course Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Credits</p>
          <p className="text-2xl font-bold text-gray-900">{course.credits}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Semester</p>
          <p className="text-2xl font-bold text-gray-900">{course.semester}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Faculty</p>
          <p className="text-2xl font-bold text-purple-600">{assignedFaculty.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Enrollments</p>
          <p className="text-2xl font-bold text-green-600">{course.enrollmentCount}</p>
        </div>
      </div>

      {/* Assigned Faculty */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Assigned Faculty</h2>
        {assignedFaculty.length === 0 ? (
          <p className="text-gray-500">No faculty assigned</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedFaculty.map((member) => (
              <div key={member.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.title}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
                <p className="text-sm text-gray-500 mt-1">{member.department}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enrolled Students */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Enrolled Students</h2>
        {students.length === 0 ? (
          <p className="text-gray-500">No students enrolled</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="pb-3 text-left text-sm font-medium text-gray-600">Name</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-600">Email</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-600">Major</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-600">Year</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-600">GPA</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">
                      <Link href={`/students/${student.id}`} className="text-blue-600 hover:text-blue-800">
                        {student.name}
                      </Link>
                    </td>
                    <td className="py-3 text-sm text-gray-600">{student.email}</td>
                    <td className="py-3 text-sm text-gray-600">{student.major}</td>
                    <td className="py-3 text-sm text-gray-900">{student.year}</td>
                    <td className="py-3 font-bold text-blue-600">{student?.gpa?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
