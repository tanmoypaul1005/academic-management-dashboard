import { getStudents, getCourses, getFaculty } from '@/app/api/data';
import { getTopStudents, getMostPopularCourses } from '@/lib/utils';
import StatCard from '@/components/StatCard';
import AnimatedSection from '@/components/AnimatedSection';
import SectionCard from '@/components/ui/SectionCard';
import SectionHeader from '@/components/ui/SectionHeader';
import DashboardChart from '@/components/DashboardChart';
import TopStudentsTable from '@/components/dashboard/TopStudentsTable';
import PopularCoursesTable from '@/components/dashboard/PopularCoursesTable';

export default async function Dashboard() {
  const [students, courses, faculty] = await Promise.all([
    getStudents(),
    getCourses(),
    getFaculty(),
  ]);

  const topStudents = getTopStudents(students, 5);
  const popularCourses = getMostPopularCourses(courses, 5);

  const stats = [
    { title: 'Total Students',  value: students.length, icon: '👨‍🎓', color: 'blue',   delay: 0.1 },
    { title: 'Total Courses',   value: courses.length,  icon: '📚',  color: 'green',  delay: 0.2 },
    { title: 'Faculty Members', value: faculty.length,  icon: '👨‍🏫', color: 'purple', delay: 0.3 },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <AnimatedSection animation="fadeIn">
        <SectionHeader
          title="Dashboard"
          subtitle="Welcome to the Academic Management System"
        />
      </AnimatedSection>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      {/* Chart + Leaderboard */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard delay={0.4} padding="sm">
          <h2 className="mb-2 text-base font-bold text-gray-900 sm:text-lg dark:text-white px-3 pt-3">
            📊 Course Enrollments
          </h2>
          <DashboardChart
            codes={popularCourses.map((c) => c.code)}
            enrollments={popularCourses.map((c) => c.enrollmentCount)}
          />
        </SectionCard>

        <SectionCard delay={0.5}>
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            🏆 Top Students (by GPA)
          </h2>
          <TopStudentsTable students={topStudents} />
        </SectionCard>
      </div>

      {/* Most Popular Courses */}
      <AnimatedSection animation="slideUp" delay={0.6}>
        <SectionCard animated={false}>
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            📈 Most Popular Courses
          </h2>
          <PopularCoursesTable courses={popularCourses} />
        </SectionCard>
      </AnimatedSection>
    </div>
  );
}
