'use client';

import { useEffect, useState } from 'react';
import { studentsApi, coursesApi, gradesApi } from '@/lib/api';
import { Student, Course, Grade } from '@/types';
import { exportToCSV, sortByGPA } from '@/lib/utils';
import dynamic from 'next/dynamic';
import AnimatedSection from '@/components/AnimatedSection';
import AnimatedCard from '@/components/AnimatedCard';

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
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent',
    },
    theme: {
      mode: 'dark' as const,
    },
    xaxis: {
      categories: courses.map(c => c.code),
      labels: {
        rotate: -45,
        style: {
          colors: '#94a3b8',
          fontSize: '11px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#94a3b8',
        },
      },
    },
    colors: ['#3B82F6'],
    stroke: {
      curve: 'smooth' as const,
    },
    grid: {
      borderColor: '#334155',
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: { height: 260 },
          xaxis: {
            labels: {
              rotate: -60,
              style: { fontSize: '9px', colors: '#94a3b8' },
            },
          },
        },
      },
    ],
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
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent',
    },
    theme: {
      mode: 'dark' as const,
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
      },
    },
    xaxis: {
      categories: coursePerformance.slice(0, 10).map(cp => cp.course.code),
      labels: {
        style: {
          colors: '#94a3b8',
          fontSize: '11px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#94a3b8',
          fontSize: '11px',
        },
      },
    },
    colors: ['#10B981'],
    grid: {
      borderColor: '#334155',
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: { height: 260 },
          yaxis: {
            labels: {
              style: { fontSize: '9px', colors: '#94a3b8' },
            },
          },
        },
      },
    ],
  };

  const performanceChartSeries = [
    {
      name: 'Average Grade (%)',
      data: coursePerformance.slice(0, 10).map(cp => parseFloat(cp.averageGrade.toFixed(1))),
    },
  ];

  return (
    <div className="space-y-6">
      <AnimatedSection animation="fadeIn">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">View and export comprehensive academic reports</p>
        </div>
      </AnimatedSection>

      {/* Export Buttons */}
      <AnimatedCard delay={0.1}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Export Reports</h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <button
              onClick={handleExportEnrollments}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors text-sm"
            >
              📊 Export Course Enrollments (CSV)
            </button>
            <button
              onClick={handleExportTopStudents}
              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors text-sm"
            >
              🏆 Export Top Students (CSV)
            </button>
            <button
              onClick={handleExportGrades}
              className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors text-sm"
            >
              📝 Export All Grades (CSV)
            </button>
          </div>
        </div>
      </AnimatedCard>

      {/* Report Tabs */}
      <AnimatedCard delay={0.2}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700">
          <div className="border-b border-gray-200 dark:border-slate-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setSelectedReport('enrollments')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  selectedReport === 'enrollments'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600'
                }`}
              >
                Enrollment Trends
              </button>
              <button
                onClick={() => setSelectedReport('performance')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  selectedReport === 'performance'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600'
                }`}
              >
                Course Performance
              </button>
            </nav>
          </div>

          <div className="p-3 sm:p-6">
            {selectedReport === 'enrollments' ? (
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-slate-200 mb-3">Course Enrollments Over Time</h3>
                <div className="overflow-x-auto">
                  <Chart
                    options={enrollmentChartOptions}
                    series={enrollmentChartSeries}
                    type="line"
                    height={350}
                    width="100%"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-slate-200 mb-3">Top 10 Courses by Average Grade</h3>
                <div className="overflow-x-auto">
                  <Chart
                    options={performanceChartOptions}
                    series={performanceChartSeries}
                    type="bar"
                    height={350}
                    width="100%"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </AnimatedCard>

      {/* Detailed Reports Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Enrollments */}
        <AnimatedCard delay={0.3}>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Course Enrollments</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="pb-2 text-left text-gray-600 dark:text-gray-400">Course</th>
                    <th className="pb-2 text-right text-gray-600 dark:text-gray-400">Students</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {courses.slice(0, 5).map((course) => (
                    <tr key={course.id}>
                      <td className="py-2">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{course.code}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{course.name}</p>
                        </div>
                      </td>
                      <td className="py-2 text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium">
                          {course.enrollmentCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AnimatedCard>

        {/* Top Performing Students */}
        <AnimatedCard delay={0.4}>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Performing Students</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="pb-2 text-left text-gray-600 dark:text-gray-400">Student</th>
                    <th className="pb-2 text-right text-gray-600 dark:text-gray-400">GPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {sortByGPA(students, true).slice(0, 5).map((student) => (
                    <tr key={student.id}>
                      <td className="py-2">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{student.major}</p>
                        </div>
                      </td>
                      <td className="py-2 text-right">
                        <span className="font-bold text-blue-600 dark:text-blue-400">{student?.gpa?.toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Course Performance Table */}
      <AnimatedSection animation="slideUp">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Course Performance Analysis</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Department</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Avg Grade</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Students</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {coursePerformance.map(({ course, averageGrade, studentsCount }) => (
                  <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-mono font-medium text-blue-600 dark:text-blue-400">{course.code}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{course.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{course.department}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold ${averageGrade >= 85 ? 'text-green-600 dark:text-green-400' : averageGrade >= 70 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                        {averageGrade > 0 ? averageGrade.toFixed(1) + '%' : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{studentsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
