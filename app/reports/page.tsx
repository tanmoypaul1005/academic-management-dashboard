'use client';

import { useEffect, useState } from 'react';
import { studentsApi, coursesApi, gradesApi } from '@/lib/api';
import { Student, Course, Grade } from '@/types';
import { exportToCSV, sortByGPA } from '@/lib/utils';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function ReportsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<'enrollments' | 'performance'>('enrollments');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [studentsData, coursesData, gradesData] = await Promise.all([
        studentsApi.getAll(),
        coursesApi.getAll(),
        gradesApi.getAll(),
      ]);
      setStudents(studentsData);
      setCourses(coursesData);
      setGrades(gradesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleExportEnrollments() {
    const data = courses.map(course => ({
      'Course Code': course.code,
      'Course Name': course.name,
      'Department': course.department,
      'Credits': course.credits,
      'Semester': course.semester,
      'Enrollments': course.enrollmentCount,
      'Faculty': course.facultyIds.length,
    }));
    exportToCSV(data, 'course_enrollments_report');
  }

  function handleExportTopStudents() {
    const topStudents = sortByGPA(students, true).slice(0, 20);
    const data = topStudents.map(student => ({
      'Name': student.name,
      'Email': student.email,
      'Major': student.major,
      'Year': student.year,
      'GPA': student.gpa,
      'Enrolled Courses': student.enrolledCourses.length,
    }));
    exportToCSV(data, 'top_students_report');
  }

  function handleExportGrades() {
    const data = grades.map(grade => {
      const student = students.find(s => s.id === grade.studentId);
      const course = courses.find(c => c.id === grade.courseId);
      return {
        'Student Name': student?.name || 'Unknown',
        'Student Email': student?.email || 'Unknown',
        'Course Code': course?.code || 'Unknown',
        'Course Name': course?.name || 'Unknown',
        'Grade': grade.grade,
        'Numeric Grade': grade.numericGrade,
        'Semester': grade.semester,
      };
    });
    exportToCSV(data, 'grades_report');
  }

  function getCoursePerformance() {
    return courses.map(course => {
      const courseGrades = grades.filter(g => g.courseId === course.id);
      const avgGrade = courseGrades.length > 0
        ? courseGrades.reduce((sum, g) => sum + g.numericGrade, 0) / courseGrades.length
        : 0;
      return {
        course,
        averageGrade: avgGrade,
        studentsCount: courseGrades.length,
      };
    }).sort((a, b) => b.averageGrade - a.averageGrade);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Chart data for enrollment trends
  const enrollmentChartOptions = {
    chart: {
      type: 'line' as const,
      toolbar: { show: true },
    },
    xaxis: {
      categories: courses.map(c => c.code),
    },
    colors: ['#3B82F6'],
    title: {
      text: 'Course Enrollments Over Time',
      align: 'left' as const,
    },
    stroke: {
      curve: 'smooth' as const,
    },
  };

  const enrollmentChartSeries = [
    {
      name: 'Enrollments',
      data: courses.map(c => c.enrollmentCount),
    },
  ];

  // Performance chart data
  const coursePerformance = getCoursePerformance();
  const performanceChartOptions = {
    chart: {
      type: 'bar' as const,
      toolbar: { show: true },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
      },
    },
    xaxis: {
      categories: coursePerformance.slice(0, 10).map(cp => cp.course.code),
    },
    colors: ['#10B981'],
    title: {
      text: 'Top 10 Courses by Average Grade',
      align: 'left' as const,
    },
  };

  const performanceChartSeries = [
    {
      name: 'Average Grade (%)',
      data: coursePerformance.slice(0, 10).map(cp => parseFloat(cp.averageGrade.toFixed(1))),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">View and export comprehensive academic reports</p>
      </div>

      {/* Export Buttons */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Export Reports</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportEnrollments}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📊 Export Course Enrollments (CSV)
          </button>
          <button
            onClick={handleExportTopStudents}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            🏆 Export Top Students (CSV)
          </button>
          <button
            onClick={handleExportGrades}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            📝 Export All Grades (CSV)
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setSelectedReport('enrollments')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedReport === 'enrollments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Enrollment Trends
            </button>
            <button
              onClick={() => setSelectedReport('performance')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedReport === 'performance'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Course Performance
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedReport === 'enrollments' ? (
            <div>
              <Chart
                options={enrollmentChartOptions}
                series={enrollmentChartSeries}
                type="line"
                height={400}
              />
            </div>
          ) : (
            <div>
              <Chart
                options={performanceChartOptions}
                series={performanceChartSeries}
                type="bar"
                height={400}
              />
            </div>
          )}
        </div>
      </div>

      {/* Detailed Reports Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Enrollments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Course Enrollments</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="pb-2 text-left text-gray-600">Course</th>
                  <th className="pb-2 text-right text-gray-600">Students</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {courses.slice(0, 5).map((course) => (
                  <tr key={course.id}>
                    <td className="py-2">
                      <div>
                        <p className="font-medium text-gray-900">{course.code}</p>
                        <p className="text-xs text-gray-500">{course.name}</p>
                      </div>
                    </td>
                    <td className="py-2 text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                        {course.enrollmentCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performing Students */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Performing Students</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="pb-2 text-left text-gray-600">Student</th>
                  <th className="pb-2 text-right text-gray-600">GPA</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortByGPA(students, true).slice(0, 5).map((student) => (
                  <tr key={student.id}>
                    <td className="py-2">
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.major}</p>
                      </div>
                    </td>
                    <td className="py-2 text-right">
                      <span className="font-bold text-blue-600">{student?.gpa?.toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Course Performance Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Course Performance Analysis</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Grade</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Students</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {coursePerformance.map(({ course, averageGrade, studentsCount }) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-mono font-medium text-blue-600">{course.code}</p>
                      <p className="text-sm text-gray-600">{course.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{course.department}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-bold ${averageGrade >= 85 ? 'text-green-600' : averageGrade >= 70 ? 'text-blue-600' : 'text-orange-600'}`}>
                      {averageGrade > 0 ? averageGrade.toFixed(1) + '%' : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900">{studentsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
