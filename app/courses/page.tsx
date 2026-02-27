'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { coursesApi, facultyApi } from '@/lib/api';
import { Course, Faculty } from '@/types';
import { filterCourses, paginate, getUniqueDepartments } from '@/lib/utils';
import AnimatedSection from '@/components/AnimatedSection';
import AnimatedCard from '@/components/AnimatedCard';
import CommonModal from '@/components/CommonModal';
import CourseForm from '@/components/CourseForm';
import CourseEditModal from '@/components/CourseEditModal';
import ConfirmModal from '@/components/ConfirmModal';
import { useRouter } from 'next/navigation';
import { EditIcon, Eye, Trash2 } from 'lucide-react';
import CommonButton from '@/components/CommonButton';
import CommonTable, { TableColumn } from '@/components/CommonTable';

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [faculty, setFaculty] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [ready, setReady] = useState(false);  // true only after first full page load
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
    const [successToast, setSuccessToast] = useState<string | null>(null);
    const addingRef = useRef(false);
    const [highlightId, setHighlightId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

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
        // animate the row out first
        setDeletingId(id);
        await new Promise(r => setTimeout(r, 350));
        try {
            await coursesApi.delete(id);
            setDeletingId(null);
            setSuccessToast('Course deleted successfully!');
            setTimeout(() => setSuccessToast(null), 3000);
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

    function handleAddSuccess(created?: Course) {
        setShowAddModal(false);
        setSuccessToast('Course added successfully!');
        setTimeout(() => setSuccessToast(null), 3000);
        if (created) {
            addingRef.current = true;
            const newTotal = totalCourses + 1;
            setCourses(prev => [created, ...prev]);
            setPageCourses(prev => [created, ...prev].slice(0, pageSize));
            setTotalCourses(newTotal);
            setTotalPagesServer(Math.max(1, Math.ceil(newTotal / pageSize)));
            setCurrentPage(1);
        } else {
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
    }

    function handleEditSuccess(updated?: Course) {
        setShowEditModal(false);
        setEditTarget(null);
        if (!updated) return;
        // update local lists
        setCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
        setPageCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
        // flash green highlight
        setHighlightId(updated.id);
        setTimeout(() => setHighlightId(null), 1500);
        setSuccessToast('Course updated successfully!');
        setTimeout(() => setSuccessToast(null), 3000);
    }

    // Fetch page data (server-side) or compute client-side when filters/search active
    useEffect(() => {
        let mounted = true;
        async function loadPage() {
            if (!addingRef.current) setLoading(true);
            addingRef.current = false;
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
    }, [currentPage, searchTerm, selectedDepartment, courses]);

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
                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">Courses</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage courses and faculty assignments</p>
                    </div>
              
                    <CommonButton
                        onClick={() => setShowAddModal(true)}
                        title="Add Course"
                    />
                </div>
            </AnimatedSection>

            {/* Search and Filters */}
            <AnimatedCard delay={0.1} className="p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-slate-800 dark:border-slate-700">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Search */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
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
                            className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        />
                    </div>

                    {/* Department Filter */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Department
                        </label>
                        <select
                            value={selectedDepartment}
                            onChange={(e) => {
                                setSelectedDepartment(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
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
                <CommonTable
                    columns={[
                        { label: 'Course Code' },
                        { label: 'Course Name' },
                        { label: 'Department' },
                        { label: 'Credits' },
                        { label: 'Faculty' },
                        { label: 'Enrollments' },
                        { label: 'Actions', className: 'text-right' },
                    ] satisfies TableColumn[]}
                    rows={paginatedCourses}
                    onRowClick={(course) => router.push(`/courses/${course.id}`)}
                    getRowClassName={(course) =>
                        deletingId === course.id
                            ? 'opacity-0 scale-95 bg-red-50 dark:bg-red-900/20'
                            : highlightId === course.id
                                ? 'bg-green-50 dark:bg-green-900/20'
                                : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                    }
                    renderRow={(course) => (
                        <>
                            <td className="px-6 py-4">
                                <span className="font-mono font-medium text-blue-600 dark:text-blue-400">{course.code}</span>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{course.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{course.department}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{course.credits}</td>
                            <td className="max-w-xs px-6 py-4 text-sm text-gray-600 truncate dark:text-gray-400">
                                {getFacultyNames(course.facultyIds)}
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                                    {course.enrollmentCount}
                                </span>
                            </td>
                            <td className="px-2 py-4 space-x-2 text-sm font-medium text-right">
                                <button className="cursor-pointer">
                                    <Link href={`/courses/${course.id}`} className="text-blue-600 dark:text-blue-400">
                                        <Eye className="w-6 h-6" />
                                    </Link>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setEditTarget(course); setShowEditModal(true); }}
                                    className="text-green-600 cursor-pointer dark:text-green-400"
                                >
                                    <EditIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setConfirmTargetId(course.id); setShowConfirm(true); }}
                                    className="text-red-600 cursor-pointer dark:text-red-400"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </td>
                        </>
                    )}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    emptyMessage="No courses found."
                />
            </AnimatedSection>

            {/* Add Course Modal */}
            <CommonModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Course"
                size="lg"
            >
                <CourseForm mode="create" facultyList={faculty} onSuccess={handleAddSuccess} />
            </CommonModal>
            {/* Edit Course Modal */}
            <CourseEditModal
                isOpen={showEditModal}
                course={editTarget}
                facultyList={faculty}
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
