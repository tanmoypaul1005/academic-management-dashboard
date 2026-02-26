'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { studentsApi, coursesApi } from '@/lib/api';
import { Student, Course } from '@/types';
import { filterStudents, paginate, getUniqueMajors, getUniqueYears } from '@/lib/utils';
import AnimatedSection from '@/components/AnimatedSection';
import AnimatedCard from '@/components/AnimatedCard';
import CommonModal from '@/components/CommonModal';
import StudentForm from '@/components/StudentForm';
import Pagination from '@/components/Pagination';
import ConfirmModal from '@/components/ConfirmModal';
import { useRouter } from 'next/navigation';

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState<number | undefined>();
    const [selectedMajor, setSelectedMajor] = useState<string>('');
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageStudents, setPageStudents] = useState<Student[]>([]);
    const [totalStudents, setTotalStudents] = useState(0);
    const [totalPagesServer, setTotalPagesServer] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTarget, setEditTarget] = useState<Student | null>(null);
    const pageSize = 10;
    const router = useRouter();

    // Initial load: fetch full list once for filters and the first page
    useEffect(() => {
        let mounted = true;
        async function init() {
            setLoading(true);
            try {
                const [allStudents, coursesData] = await Promise.all([
                    studentsApi.getAll(),
                    coursesApi.getAll(),
                ]);
                if (!mounted) return;
                setStudents(allStudents);
                setCourses(coursesData);
            } catch (error) {
                console.error('Error fetching initial data:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        init();
        return () => {
            mounted = false;
        };
    }, []);

    // Fetch page data (server-side) or compute client-side when filters/search active
    useEffect(() => {
        let mounted = true;
        async function loadPage() {
            setLoading(true);
            try {
                const hasFilters = !!(searchTerm || selectedYear || selectedMajor || selectedCourse);
                if (hasFilters) {
                    // Client-side filter+paginate using the full students list
                    const filtered = filterStudents(students, searchTerm, {
                        course: selectedCourse,
                        year: selectedYear,
                        major: selectedMajor,
                    });
                    const paged = paginate(filtered, currentPage, pageSize);
                    if (!mounted) return;
                    setPageStudents(paged);
                    setTotalStudents(filtered.length);
                    setTotalPagesServer(Math.max(1, Math.ceil(filtered.length / pageSize)));
                } else {
                    // Server-side paginated fetch
                    const payload = await studentsApi.getPage(currentPage, pageSize);
                    if (!mounted) return;
                    setPageStudents(payload.data || []);
                    setTotalStudents(payload.total || 0);
                    setTotalPagesServer(payload.totalPages || 1);
                }
            } catch (error) {
                console.error('Error loading students page:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        loadPage();
        return () => {
            mounted = false;
        };
    }, [currentPage, searchTerm, selectedYear, selectedMajor, selectedCourse, students]);


    async function handleConfirmDelete() {
        if (!confirmTargetId) return;
        const id = confirmTargetId;
        setShowConfirm(false);
        setConfirmTargetId(null);
        try {
            await studentsApi.delete(id);
            // Refresh current page after delete
            const updated = students.filter(s => s.id !== id);
            setStudents(updated);
            // reload current page (respect filters)
            const hasFilters = !!(searchTerm || selectedYear || selectedMajor || selectedCourse);
            if (hasFilters) {
                const filtered = filterStudents(updated, searchTerm, { course: selectedCourse, year: selectedYear, major: selectedMajor });
                setPageStudents(paginate(filtered, currentPage, pageSize));
                setTotalStudents(filtered.length);
                setTotalPagesServer(Math.max(1, Math.ceil(filtered.length / pageSize)));
            } else {
                const payload = await studentsApi.getPage(currentPage, pageSize);
                setPageStudents(payload.data || []);
                setTotalStudents(payload.total || 0);
                setTotalPagesServer(payload.totalPages || 1);
            }
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    }

    function handleAddSuccess(created?: Student) {
        setShowAddModal(false);
        if (created) {
            // Prepend new student so it appears first
            setStudents(prev => [created, ...prev]);
            // Ensure first page is shown and update pageStudents
            setCurrentPage(1);
            setPageStudents(prev => {
                const newPage = [created, ...prev];
                return newPage.slice(0, pageSize);
            });
            setTotalStudents(prev => prev + 1);
            setTotalPagesServer(prev => Math.max(1, Math.ceil((prev + 1) / pageSize)));
        } else {
            // Fallback: refresh list
            (async () => {
                setLoading(true);
                try {
                    const all = await studentsApi.getAll();
                    setStudents(all);
                    setCurrentPage(1);
                } catch (e) {
                    console.error('Error refreshing after add:', e);
                } finally {
                    setLoading(false);
                }
            })();
        }
    }

    function handleEditSuccess(updated?: Student) {
        setShowEditModal(false);
        setEditTarget(null);
        if (updated) {
            // update in-memory list
            setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
            // update current page items
            setPageStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
        }
    }

    const filteredStudents = filterStudents(students, searchTerm, {
        course: selectedCourse,
        year: selectedYear,
        major: selectedMajor,
    });
    const uniqueMajors = getUniqueMajors(students);
    const uniqueYears = getUniqueYears(students);

    // Use server-side page when available, otherwise client-side filtered page
    const paginatedStudents = pageStudents;
    const totalPages = totalPagesServer;

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
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Students</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage student information and enrollments</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        + Add Student
                    </button>
                </div>
            </AnimatedSection>

            {/* Search and Filters */}
            <AnimatedCard delay={0.1} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search by name, email, or major..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Year Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Year
                        </label>
                        <select
                            value={selectedYear || ''}
                            onChange={(e) => {
                                setSelectedYear(e.target.value ? parseInt(e.target.value) : undefined);
                                setCurrentPage(1);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        >
                            <option value="">All Years</option>
                            {uniqueYears.map(year => (
                                <option key={year} value={year}>Year {year}</option>
                            ))}
                        </select>
                    </div>

                    {/* Major Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Major
                        </label>
                        <select
                            value={selectedMajor}
                            onChange={(e) => {
                                setSelectedMajor(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        >
                            <option value="">All Majors</option>
                            {uniqueMajors.map(major => (
                                <option key={major} value={major}>{major}</option>
                            ))}
                        </select>
                    </div>

                    {/* Course Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Course
                        </label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => {
                                setSelectedCourse(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        >
                            <option value="">All Courses</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.code} - {course.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Results count */}
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    Showing {paginatedStudents.length} of {totalStudents} students
                </div>
            </AnimatedCard>

            {/* Students Table */}
            <AnimatedSection animation="slideUp" delay={0.2}>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-slate-700">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Major
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Year
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        GPA
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Courses
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                {paginatedStudents.map((student) => (
                                    <tr 
                                    onClick={() => {
                                        router.push(`/students/${student.id}`);
                                    }} 
                                    key={student.id} className="hover:bg-gray-50 cursor-pointer dark:hover:bg-slate-700/50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{student.major}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{student.year}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-blue-600 dark:text-blue-400">{student?.gpa?.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium">
                                                {student.enrolledCourses.length} courses
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                                            <Link
                                                href={`/students/${student.id}`}
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                                            >
                                                View
                                            </Link>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); 
                                                    setEditTarget(student);
                                                    setShowEditModal(true);
                                                }}
                                                className="text-green-600 cursor-pointer dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors"
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

            {/* Add Student Modal */}
            <CommonModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Student"
                size="lg"
            >
                <StudentForm mode="create" onSuccess={handleAddSuccess} />
            </CommonModal>
            {/* Edit Student Modal */}
            <CommonModal
                isOpen={showEditModal}
                onClose={() => { setShowEditModal(false); setEditTarget(null); }}
                title="Edit Student"
                size="lg"
            >
                {editTarget && (
                    <StudentForm student={editTarget} mode="edit" onSuccess={handleEditSuccess} />
                )}
            </CommonModal>
            {/* Delete Confirm Modal */}
            <ConfirmModal
                isOpen={showConfirm}
                title="Delete Student"
                message="Are you sure you want to delete this student? This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                size="sm"
                onConfirm={handleConfirmDelete}
                onCancel={() => { setShowConfirm(false); setConfirmTargetId(null); }}
            />
        </div>
    );
}
