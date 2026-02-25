'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { coursesApi, facultyApi } from '@/lib/api';
import { Course, Faculty } from '@/types';
import { filterCourses, paginate, getUniqueDepartments } from '@/lib/utils';
import AnimatedSection from '@/components/AnimatedSection';
import AnimatedCard from '@/components/AnimatedCard';
import CommonModal from '@/components/CommonModal';
import CourseForm from '@/components/CourseForm';
import Pagination from '@/components/Pagination';
import CourseEditModal from '@/components/CourseEditModal';
import ConfirmModal from '@/components/ConfirmModal';
import { useRouter } from 'next/navigation';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCourses, setPageCourses] = useState<Course[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalPagesServer, setTotalPagesServer] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Course | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);
  const pageSize = 10;

  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [coursesData, facultyData] = await Promise.all([
        coursesApi.getAll(),
        facultyApi.getAll(),
      ]);
      setCourses(coursesData);
      setFaculty(facultyData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }


  async function handleConfirmDelete() {
    if (!confirmTargetId) return;
    const id = confirmTargetId;
    setShowConfirm(false);
    setConfirmTargetId(null);
    try {
      await coursesApi.delete(id);
      const updated = courses.filter(c => c.id !== id);
      setCourses(updated);
      // reload current page respecting filters
      const hasFilters = !!(searchTerm || selectedDepartment);
      if (hasFilters) {
        const filtered = filterCourses(updated, searchTerm, selectedDepartment);
        setPageCourses(paginate(filtered, currentPage, pageSize));
        setTotalCourses(filtered.length);
        setTotalPagesServer(Math.max(1, Math.ceil(filtered.length / pageSize)));
      } else {
        const payload = await coursesApi.getPage(currentPage, pageSize);
        setPageCourses(payload.data || []);
        setTotalCourses(payload.total || 0);
        setTotalPagesServer(payload.totalPages || 1);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  }

  function handleAddSuccess() {
    setShowAddModal(false);
    // Refresh full list (for filters) and reload page 1
    (async () => {
      setLoading(true);
      try {
        const all = await coursesApi.getAll();
        setCourses(all);
        setCurrentPage(1);
      } catch (e) {
        console.error('Error refreshing after add:', e);
      } finally {
        setLoading(false);
      }
    })();
  }

  function handleEditSuccess(updated?: Course) {
    setShowEditModal(false);
    setEditTarget(null);
    if (!updated) return;
    // update local lists
    setCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
    setPageCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
  }

  // Fetch page data (server-side) or compute client-side when filters/search active
  useEffect(() => {
    let mounted = true;
    async function loadPage() {
      setLoading(true);
      try {
        const hasFilters = !!(searchTerm || selectedDepartment);
        if (hasFilters) {
          const filtered = filterCourses(courses, searchTerm, selectedDepartment);
          const paged = paginate(filtered, currentPage, pageSize);
          if (!mounted) return;
          setPageCourses(paged);
          setTotalCourses(filtered.length);
          setTotalPagesServer(Math.max(1, Math.ceil(filtered.length / pageSize)));
        } else {
          const payload = await coursesApi.getPage(currentPage, pageSize);
          if (!mounted) return;
          setPageCourses(payload.data || []);
          setTotalCourses(payload.total || 0);
          setTotalPagesServer(payload.totalPages || 1);
        }
      } catch (error) {
        console.error('Error loading courses page:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadPage();
    return () => {
      mounted = false;
    };
  }, [currentPage, searchTerm, selectedDepartment]);

  const filteredCourses = filterCourses(courses, searchTerm, selectedDepartment);
  const uniqueDepartments = getUniqueDepartments(courses);
  const paginatedCourses = pageCourses;
  const totalPages = totalPagesServer;
 

  function getFacultyNames(facultyIds: string[]): string {
    return facultyIds
      .map(id => faculty.find(f => f.id === id)?.name || 'Unknown')
      .join(', ');
  }

  // Helper to produce a compact page list like: [1, '...', cur-1, cur, cur+1, '...', total]
  function getPageList(total: number, current: number) {
    const delta = 1;
    const range: Array<number | string> = [];
    const left = Math.max(1, current - delta);
    const right = Math.min(total, current + delta);

    if (left > 1) {
      range.push(1);
      if (left > 2) range.push('...');
    }

    for (let i = left; i <= right; i++) range.push(i);

    if (right < total) {
      if (right < total - 1) range.push('...');
      range.push(total);
    }

    return range;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedSection animation="fadeIn">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Courses</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage courses and faculty assignments</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            + Add Course
          </button>
        </div>
      </AnimatedSection>

      {/* Search and Filters */}
      <AnimatedCard delay={0.1} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by course name or code..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {paginatedCourses.length} of {filteredCourses.length} courses
        </div>
      </AnimatedCard>

      {/* Courses Table */}
      <AnimatedSection animation="slideUp" delay={0.2}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Course Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Course Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Faculty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Enrollments
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700 ">
                {paginatedCourses.map((course) => (
                  <tr onClick={()=>{
                router.push(`/courses/${course.id}`)
              }}  key={course.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer">
                    <td className="px-6 py-4">
                      <span className="font-mono font-medium text-blue-600 dark:text-blue-400">{course.code}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{course.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{course.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{course.credits}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {getFacultyNames(course.facultyIds)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                        {course.enrollmentCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <Link
                        href={`/courses/${course.id}`}
                        className="text-blue-600 dark:text-blue-400"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => { setEditTarget(course); setShowEditModal(true); }}
                        className="text-green-600 dark:text-green-400"
                      >
                        Edit
                      </button>
                
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>

          {/* Pagination */}
            {totalPages > 1 && (
              <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
            )}
        </div>
      </AnimatedSection>

      {/* Add Course Modal */}
      <CommonModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Course"
        size="lg"
      >
        <CourseForm mode="create" onSuccess={handleAddSuccess} />
      </CommonModal>
      {/* Edit Course Modal */}
      <CourseEditModal
        isOpen={showEditModal}
        course={editTarget}
        onClose={() => { setShowEditModal(false); setEditTarget(null); }}
        onSuccess={handleEditSuccess}
      />
      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        size="sm"
        onConfirm={handleConfirmDelete}
        onCancel={() => { setShowConfirm(false); setConfirmTargetId(null); }}
      />
    </div>
  );
}
