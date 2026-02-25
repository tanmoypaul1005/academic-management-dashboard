'use client';

import { useEffect, useState } from 'react';
import { studentsApi, coursesApi, facultyApi } from '@/lib/api';
import { Student, Course, Faculty } from '@/types';
import { getTopStudents, getMostPopularCourses } from '@/lib/utils';
import StatCard from '@/components/StatCard';
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
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
    },
    colors: ['#3B82F6'],
    title: {
      text: 'Course Enrollments',
      align: 'left' as const,
    },
  };

  const courseChartSeries = [
    {
      name: 'Students Enrolled',
      data: popularCourses.map(c => c.enrollmentCount),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to the Academic Management System</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Students"
          value={students.length}
          icon="👨‍🎓"
          color="blue"
        />
        <StatCard
          title="Total Courses"
          value={courses.length}
          icon="📚"
          color="green"
        />
        <StatCard
          title="Faculty Members"
          value={faculty.length}
          icon="👨‍🏫"
          color="purple"
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Chart
            options={courseChartOptions}
            series={courseChartSeries}
            type="bar"
            height={300}
          />
        </div>

        {/* Top Students Leaderboard */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            🏆 Top Students (by GPA)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3 text-gray-600 font-medium">Rank</th>
                  <th className="pb-3 text-gray-600 font-medium">Student</th>
                  <th className="pb-3 text-gray-600 font-medium">GPA</th>
                </tr>
              </thead>
              <tbody>
                {topStudents.map((student, index) => (
                  <tr key={student.id} className="border-b last:border-b-0">
                    <td className="py-3">
                      <span className={`
                        inline-flex items-center justify-center w-8 h-8 rounded-full font-bold
                        ${index === 0 ? 'bg-yellow-400 text-yellow-900' : ''}
                        ${index === 1 ? 'bg-gray-300 text-gray-900' : ''}
                        ${index === 2 ? 'bg-orange-400 text-orange-900' : ''}
                        ${index > 2 ? 'bg-gray-100 text-gray-700' : ''}
                      `}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.major}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="font-bold text-blue-600">{student?.gpa?.toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Most Popular Courses */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          📈 Most Popular Courses
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3 text-gray-600 font-medium">Course Code</th>
                <th className="pb-3 text-gray-600 font-medium">Course Name</th>
                <th className="pb-3 text-gray-600 font-medium">Department</th>
                <th className="pb-3 text-gray-600 font-medium text-right">Enrollments</th>
              </tr>
            </thead>
            <tbody>
              {popularCourses.map((course) => (
                <tr key={course.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="py-3">
                    <span className="font-mono font-medium text-blue-600">{course.code}</span>
                  </td>
                  <td className="py-3 font-medium text-gray-900">{course.name}</td>
                  <td className="py-3 text-gray-600">{course.department}</td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                      {course.enrollmentCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
