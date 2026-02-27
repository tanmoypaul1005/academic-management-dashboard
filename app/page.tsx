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
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
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
        <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome to the Academic Management System</p>
      </AnimatedSection>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bar Chart */}
        <AnimatedCard delay={0.4} className="p-3 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-slate-800 sm:p-6 dark:border-slate-700">
          <h2 className="mb-2 text-base font-bold text-gray-900 sm:text-lg dark:text-white">📊 Course Enrollments</h2>
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
        <AnimatedCard delay={0.5} className="p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-slate-800 dark:border-slate-700">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            🏆 Top Students (by GPA)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-slate-700">
                  <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Rank</th>
                  <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Student</th>
                  <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">GPA</th>
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
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-slate-800 dark:border-slate-700">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            📈 Most Popular Courses
          </h2>
          {/* Mobile card layout */}
          <div className="flex flex-col gap-3 sm:hidden">
            {popularCourses.map((course, idx) => (
              <div
                key={course.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-700"
              >
                <span className="shrink-0 w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{course.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <span className="font-mono text-blue-600 dark:text-blue-400">{course.code}</span>
                    <span className="mx-1">·</span>
                    {course.department}
                  </p>
                </div>
                <span className="shrink-0 inline-flex items-center px-2.5 py-1 font-semibold text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900/30 dark:text-blue-300 text-sm">
                  {course.enrollmentCount}
                </span>
              </div>
            ))}
          </div>

          {/* Desktop table layout */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-slate-700">
                  <th className="pb-3 font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Course Code</th>
                  <th className="pb-3 font-medium text-gray-600 dark:text-gray-400">Course Name</th>
                  <th className="pb-3 font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Department</th>
                  <th className="pb-3 font-medium text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">Enrollments</th>
                </tr>
              </thead>
              <tbody>
                {popularCourses.map((course) => (
                  <tr key={course.id} className="transition-colors border-b border-gray-200 dark:border-slate-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="py-3 whitespace-nowrap">
                      <span className="font-mono font-medium text-blue-600 dark:text-blue-400">{course.code}</span>
                    </td>
                    <td className="py-3 font-medium text-gray-900 dark:text-white">{course.name}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{course.department}</td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center px-3 py-1 font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
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
