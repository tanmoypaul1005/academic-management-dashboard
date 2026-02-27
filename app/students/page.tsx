'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { studentsApi, coursesApi } from '@/lib/api';
import { Student, Course } from '@/types';
import { filterStudents, paginate, getUniqueMajors, getUniqueYears } from '@/lib/utils';
import AnimatedSection from '@/components/AnimatedSection';
import AnimatedCard from '@/components/AnimatedCard';
import CommonModal from '@/components/CommonModal';
import StudentForm from '@/components/StudentForm';
import ConfirmModal from '@/components/ConfirmModal';
import { useRouter } from 'next/navigation';
import { EditIcon, Eye, Trash2 } from 'lucide-react';
import CommonButton from '@/components/CommonButton';
import CommonTable, { TableColumn } from '@/components/CommonTable';

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [ready, setReady] = useState(false);  // true only after first full page load
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
    const [successToast, setSuccessToast] = useState<string | null>(null);
    const addingRef = useRef(false);
    const [highlightId, setHighlightId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

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
            if (!addingRef.current) setLoading(true);
            addingRef.current = false;
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
                if (mounted) {
                    setLoading(false);
                    setReady(true); // page now has real data — safe to start animations
                }
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
        // animate the row out first
        setDeletingId(id);
        await new Promise(r => setTimeout(r, 350));
        try {
            await studentsApi.delete(id);
            setDeletingId(null);
            setSuccessToast('Student deleted successfully!');
            setTimeout(() => setSuccessToast(null), 3000);
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
        setSuccessToast('Student added successfully!');
        setTimeout(() => setSuccessToast(null), 3000);
        if (created) {
            addingRef.current = true;
            const newTotal = totalStudents + 1;
            setStudents(prev => [created, ...prev]);
            setPageStudents(prev => [created, ...prev].slice(0, pageSize));
            setTotalStudents(newTotal);
            setTotalPagesServer(Math.max(1, Math.ceil(newTotal / pageSize)));
            setCurrentPage(1);
        } else {
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
            // flash green highlight
            setHighlightId(updated.id);
            setTimeout(() => setHighlightId(null), 1500);
            setSuccessToast('Student updated successfully!');
            setTimeout(() => setSuccessToast(null), 3000);
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

    // Keep spinner until the first loadPage completes — prevents empty-table animation jump
    if (!ready) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Success Toast */}
            {successToast && (
                <div className="fixed z-50 flex items-center gap-3 px-5 py-3 text-white bg-green-600 rounded-lg shadow-xl top-6 right-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">{successToast}</span>
                    <button onClick={() => setSuccessToast(null)} className="ml-2 text-lg leading-none opacity-80 hover:opacity-100 focus:outline-none">&times;</button>
                </div>
            )}
            <AnimatedSection animation="fadeIn">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">Students</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage student information and enrollments</p>
                    </div>
             
                    <CommonButton
                        onClick={() => setShowAddModal(true)}
                        title="Add Student"
                    />
                </div>
            </AnimatedSection>

            {/* Search and Filters */}
            <AnimatedCard delay={0.1} className="p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-slate-800 dark:border-slate-700">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Search */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                            className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        />
                    </div>

                    {/* Year Filter */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Year
                        </label>
                        <select
                            value={selectedYear || ''}
                            onChange={(e) => {
                                setSelectedYear(e.target.value ? parseInt(e.target.value) : undefined);
                                setCurrentPage(1);
                            }}
                            className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        >
                            <option value="">All Years</option>
                            {uniqueYears.map(year => (
                                <option key={year} value={year}>Year {year}</option>
                            ))}
                        </select>
                    </div>

                    {/* Major Filter */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Major
                        </label>
                        <select
                            value={selectedMajor}
                            onChange={(e) => {
                                setSelectedMajor(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        >
                            <option value="">All Majors</option>
                            {uniqueMajors.map(major => (
                                <option key={major} value={major}>{major}</option>
                            ))}
                        </select>
                    </div>

                    {/* Course Filter */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Course
                        </label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => {
                                setSelectedCourse(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
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
                <CommonTable
                    columns={[
                        { label: 'Student' },
                        { label: 'Major' },
                        { label: 'Year' },
                        { label: 'GPA' },
                        { label: 'Courses' },
                        { label: 'Actions', className: 'text-right' },
                    ] satisfies TableColumn[]}
                    rows={paginatedStudents}
                    onRowClick={(student) => router.push(`/students/${student.id}`)}
                    getRowClassName={(student) =>
                        deletingId === student.id
                            ? 'opacity-0 scale-95 bg-red-50 dark:bg-red-900/20'
                            : highlightId === student.id
                                ? 'bg-green-50 dark:bg-green-900/20'
                                : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                    }
                    renderRow={(student) => (
                        <>
                            <td className="px-6 py-4">
                                <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
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
                            <td className="px-3 py-4 space-x-2 text-sm font-medium text-right">
                                <button>
                                    <Link
                                        href={`/students/${student.id}`}
                                        className="text-blue-600 transition-colors dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                                    >
                                        <Eye className="w-6 h-6" />
                                    </Link>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setEditTarget(student); setShowEditModal(true); }}
                                    className="text-green-600 transition-colors cursor-pointer dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                                >
                                    <EditIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setConfirmTargetId(student.id); setShowConfirm(true); }}
                                    className="text-red-600 transition-colors cursor-pointer dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </td>
                        </>
                    )}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    emptyMessage="No students found."
                />
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
