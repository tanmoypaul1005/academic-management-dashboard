'use client';

import { useEffect, useState } from 'react';
import { studentsApi, coursesApi, facultyApi } from '@/lib/api';
import { Student, Course, Faculty } from '@/types';
import { getTopStudents, getMostPopularCourses } from '@/lib/utils';
import StatCard from '@/components/StatCard';
import AnimatedSection from '@/components/AnimatedSection';
import AnimatedCard from '@/components/AnimatedCard';
import dynamic from 'next/dynamic';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function Dashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentsData, coursesData, facultyData] = await Promise.all([
          studentsApi.getAll(),
          coursesApi.getAll(),
          facultyApi.getAll(),
        ]);
        setStudents(studentsData);
        setCourses(coursesData);
        setFaculty(facultyData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const topStudents = getTopStudents(students, 5);
  const popularCourses = getMostPopularCourses(courses, 5);

  // Chart data for course enrollments
  const courseChartOptions = {
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
        horizontal: false,
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: popularCourses.map(c => c.code),
      labels: {
        style: {
          colors: '#94a3b8',
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
    grid: {
      borderColor: '#334155',
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: { height: 220 },
          xaxis: {
            labels: {
              rotate: -45,
              style: { fontSize: '10px', colors: '#94a3b8' },
            },
          },
        },
      },
    ],
  };

  const courseChartSeries = [
    {
      name: 'Students Enrolled',
      data: popularCourses.map(c => c.enrollmentCount),
    },
  ];

  return (
    <div className="space-y-6">
      <AnimatedSection animation="fadeIn">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome to the Academic Management System</p>
      </AnimatedSection>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Students"
          value={students.length}
          icon="👨‍🎓"
          color="blue"
          delay={0.1}
        />
        <StatCard
          title="Total Courses"
          value={courses.length}
          icon="📚"
          color="green"
          delay={0.2}
        />
        <StatCard
          title="Faculty Members"
          value={faculty.length}
          icon="👨‍🏫"
          color="purple"
          delay={0.3}
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <AnimatedCard delay={0.4} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-3 sm:p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">📊 Course Enrollments</h2>
          <div className="overflow-x-auto">
            <Chart
              options={courseChartOptions}
              series={courseChartSeries}
              type="bar"
              height={280}
              width="100%"
            />
          </div>
        </AnimatedCard>

        {/* Top Students Leaderboard */}
        <AnimatedCard delay={0.5} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            🏆 Top Students (by GPA)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-slate-700">
                  <th className="pb-3 text-gray-600 dark:text-gray-400 font-medium">Rank</th>
                  <th className="pb-3 text-gray-600 dark:text-gray-400 font-medium">Student</th>
                  <th className="pb-3 text-gray-600 dark:text-gray-400 font-medium">GPA</th>
                </tr>
              </thead>
              <tbody>
                {topStudents.map((student, index) => (
                  <tr key={student.id} className="border-b border-gray-200 dark:border-slate-700 last:border-b-0">
                    <td className="py-3">
                      <span className={`
                        inline-flex items-center justify-center w-8 h-8 rounded-full font-bold
                        ${index === 0 ? 'bg-yellow-400 text-yellow-900' : ''}
                        ${index === 1 ? 'bg-gray-300 text-gray-900' : ''}
                        ${index === 2 ? 'bg-orange-400 text-orange-900' : ''}
                        ${index > 2 ? 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300' : ''}
                      `}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{student.major}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="font-bold text-blue-600 dark:text-blue-400">{student?.gpa?.toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnimatedCard>
      </div>

      {/* Most Popular Courses */}
      <AnimatedSection animation="slideUp" delay={0.6}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📈 Most Popular Courses
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-slate-700">
                  <th className="pb-3 text-gray-600 dark:text-gray-400 font-medium">Course Code</th>
                  <th className="pb-3 text-gray-600 dark:text-gray-400 font-medium">Course Name</th>
                  <th className="pb-3 text-gray-600 dark:text-gray-400 font-medium">Department</th>
                  <th className="pb-3 text-gray-600 dark:text-gray-400 font-medium text-right">Enrollments</th>
                </tr>
              </thead>
              <tbody>
                {popularCourses.map((course) => (
                  <tr key={course.id} className="border-b border-gray-200 dark:border-slate-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="py-3">
                      <span className="font-mono font-medium text-blue-600 dark:text-blue-400">{course.code}</span>
                    </td>
                    <td className="py-3 font-medium text-gray-900 dark:text-white">{course.name}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{course.department}</td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-medium">
                        {course.enrollmentCount}
                      </span>
                    </td>
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
