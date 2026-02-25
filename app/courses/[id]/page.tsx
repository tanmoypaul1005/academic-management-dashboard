'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { coursesApi, facultyApi, studentsApi } from '@/lib/api';
import { Course, Faculty, Student } from '@/types';
import AnimatedSection from '@/components/AnimatedSection';
import AnimatedCard from '@/components/AnimatedCard';
import { ArrowLeft } from 'lucide-react';

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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Course Not Found</h2>
                <Link href="/courses" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                    Back to Courses
                </Link>
            </div>
        );
    }

    const assignedFaculty = faculty.filter(f => course.facultyIds.includes(f.id));

    return (
        <div className="space-y-6">
            {/* Header */}
            <AnimatedSection>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

                    <Link className='cursor-pointer' href="/courses">
                        <ArrowLeft />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-lg font-mono font-bold">
                                {course.code}
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{course.name}</h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{course.department}</p>
                    </div>
                    {/* <div className="flex gap-3">
            <Link
              href={`/courses/${courseId}/edit`}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Edit Course
            </Link>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              Back
            </button>
          </div> */}
                </div>
            </AnimatedSection>

            {/* Course Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimatedCard>
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6">
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Credits</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{course.credits}</p>
                    </div>
                </AnimatedCard>
                <AnimatedCard>
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6">
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Semester</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{course.semester}</p>
                    </div>
                </AnimatedCard>
                <AnimatedCard>
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6">
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Faculty</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{assignedFaculty.length}</p>
                    </div>
                </AnimatedCard>
                <AnimatedCard>
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6">
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Enrollments</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{course.enrollmentCount}</p>
                    </div>
                </AnimatedCard>
            </div>

            {/* Assigned Faculty */}
            <AnimatedSection>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Assigned Faculty</h2>
                    {assignedFaculty.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">No faculty assigned</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {assignedFaculty?.map((member) => (
                                <div key={member.id} className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-slate-700/50">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{member?.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{member?.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{member?.email}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{member?.department}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </AnimatedSection>

            {/* Enrolled Students */}
            <AnimatedSection>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Enrolled Students</h2>
                    {students.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">No students enrolled</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-200 dark:border-slate-700">
                                    <tr>
                                        <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Name</th>
                                        <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Email</th>
                                        <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Major</th>
                                        <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Year</th>
                                        <th className="pb-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">GPA</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                    {students.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                            <td className="py-3 font-medium text-gray-900 dark:text-white">
                                                <Link href={`/students/${student.id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                                    {student.name}
                                                </Link>
                                            </td>
                                            <td className="py-3 text-sm text-gray-600 dark:text-gray-400">{student.email}</td>
                                            <td className="py-3 text-sm text-gray-600 dark:text-gray-400">{student.major}</td>
                                            <td className="py-3 text-sm text-gray-900 dark:text-white">{student.year}</td>
                                            <td className="py-3 font-bold text-blue-600 dark:text-blue-400">{student?.gpa?.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </AnimatedSection>
        </div>
    );
}
