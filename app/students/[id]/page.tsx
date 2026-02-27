'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { studentsApi, coursesApi, gradesApi } from '@/lib/api';
import { Student, Course, Grade, GradeFormData } from '@/types';
import { calculateStudentProgress } from '@/lib/utils';
import AnimatedSection from '@/components/AnimatedSection';
import AnimatedCard from '@/components/AnimatedCard';
import CommonInput from '@/components/CommonInput';
import CommonSelect from '@/components/CommonSelect';
import { ArrowLeft, Pencil, Trash2, Plus, X } from 'lucide-react';
import GradeSuccessModal from '@/components/GradeSuccessModal';

const GRADE_OPTIONS = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];

const SEMESTER_OPTIONS = [
    'Fall 2026', 'Summer 2026', 'Spring 2026',
    'Fall 2025', 'Summer 2025', 'Spring 2025',
    'Fall 2024', 'Summer 2024', 'Spring 2024',
    'Fall 2023', 'Summer 2023', 'Spring 2023',
    'Fall 2022', 'Summer 2022', 'Spring 2022',
];

const emptyGradeForm = (): GradeFormData => ({
  studentId: '',
  courseId: '',
  grade: 'A',
  numericGrade: 90,
  semester: '',
});

export default function StudentProfilePage() {
    const params = useParams();
    const studentId = params.id as string;

    const [student, setStudent] = useState<Student | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);

    // Grade modal state
    const [gradeModalOpen, setGradeModalOpen] = useState(false);
    const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
    const [gradeForm, setGradeForm] = useState<GradeFormData>(emptyGradeForm());
    const [gradeErrors, setGradeErrors] = useState<Record<string, string>>({});
    const [gradeSaving, setGradeSaving] = useState(false);
    const [gradeSuccessOpen, setGradeSuccessOpen] = useState(false);
    const [gradeSuccessMessage, setGradeSuccessMessage] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                const [studentData, coursesData, gradesData] = await Promise.all([
                    studentsApi.getById(studentId),
                    coursesApi.getAll(),
                    gradesApi.getByStudentId(studentId),
                ]);
                setStudent(studentData);
                setCourses(coursesData);
                setGrades(gradesData);
            } catch (error) {
                console.error('Error fetching student data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
            // Listen for cross-page data updates (e.g., grades added/updated elsewhere)
            const onDbUpdated = (ev: Event) => {
                try {
                    const detail = (ev as CustomEvent)?.detail;
                    // If no type provided or type === 'grades', re-fetch grades for this student
                    if (!detail || detail.type === 'grades') {
                        gradesApi.getByStudentId(studentId).then(setGrades).catch(console.error);
                    }
                } catch (err) {
                    console.error('onDbUpdated handler error', err);
                }
            };
            window.addEventListener('app:db-updated', onDbUpdated as EventListener);

            return () => {
                window.removeEventListener('app:db-updated', onDbUpdated as EventListener);
            };
    }, [studentId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin dark:border-blue-400"></div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="py-12 text-center">
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Student Not Found</h2>
                <Link href="/students" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                    Back to Students
                </Link>
            </div>
        );
    }

    // Deduplicate courses list (guard against duplicate DB documents)
    // and deduplicate the student's enrolledCourses array (guard against duplicate IDs)
    const uniqueCourses = courses.filter((c, idx, self) => self.findIndex(x => x.id === c.id) === idx);
    const uniqueEnrolledIds = [...new Set(student.enrolledCourses)];
    const enrolledCourses = uniqueCourses.filter(c => uniqueEnrolledIds.includes(c.id));
    const progress = calculateStudentProgress(grades);

    function openAddGrade() {
        setEditingGrade(null);
        setGradeForm({ ...emptyGradeForm(), studentId });
        setGradeErrors({});
        setGradeModalOpen(true);
    }

    function openEditGrade(grade: Grade) {
        setEditingGrade(grade);
        setGradeForm({
            studentId: grade.studentId,
            courseId: grade.courseId,
            grade: grade.grade,
            numericGrade: grade.numericGrade,
            semester: grade.semester,
        });
        setGradeErrors({});
        setGradeModalOpen(true);
    }

    function validateGradeForm() {
        const errs: Record<string, string> = {};
        if (!gradeForm.courseId) errs.courseId = 'Course is required';
        if (!gradeForm.semester.trim()) errs.semester = 'Semester is required';
        if (gradeForm.numericGrade < 0 || gradeForm.numericGrade > 100)
            errs.numericGrade = 'Percentage must be 0–100';
        setGradeErrors(errs);
        return Object.keys(errs).length === 0;
    }

    async function handleSaveGrade() {
        if (!validateGradeForm()) return;
        setGradeSaving(true);
        try {
            if (editingGrade) {
                const updated = await gradesApi.update(editingGrade.id, gradeForm);
                setGrades(prev => prev.map(g => g.id === updated.id ? updated : g));
                setGradeSuccessMessage('Grade updated successfully!');
            } else {
                const created = await gradesApi.create(gradeForm);
                setGrades(prev => [...prev, created]);
                setGradeSuccessMessage('Grade added successfully!');
            }
            setGradeModalOpen(false);
            setGradeSuccessOpen(true);
        } catch (err) {
            console.error('Failed to save grade', err);
        } finally {
            setGradeSaving(false);
        }
    }

    async function handleDeleteGrade(gradeId: string) {
        if (!confirm('Delete this grade?')) return;
        try {
            await gradesApi.delete(gradeId);
            setGrades(prev => prev.filter(g => g.id !== gradeId));
        } catch (err) {
            console.error('Failed to delete grade', err);
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <AnimatedSection>
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                    <Link className='cursor-pointer' href="/students">
                        <ArrowLeft />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">{student.name}</h1>
                        <p className="text-gray-600 dark:text-gray-400">{student.email}</p>
                    </div>
                </div>
            </AnimatedSection>

            {/* Student Info Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <AnimatedCard>
                    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-slate-800 dark:border-slate-700">
                        <p className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">Major</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.major}</p>
                    </div>
                </AnimatedCard>
                <AnimatedCard>
                    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-slate-800 dark:border-slate-700">
                        <p className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">Year</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">Year {student.year}</p>
                    </div>
                </AnimatedCard>
                <AnimatedCard>
                    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-slate-800 dark:border-slate-700">
                        <p className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">Current GPA</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{student?.gpa?.toFixed(2)}</p>
                    </div>
                </AnimatedCard>
                <AnimatedCard>
                    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-slate-800 dark:border-slate-700">
                        <p className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">Enrolled Courses</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{enrolledCourses.length}</p>
                    </div>
                </AnimatedCard>
            </div>

            {/* Progress Summary */}
            {grades.length > 0 && (
                <AnimatedSection>
                    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-slate-800 dark:border-slate-700">
                        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Academic Progress</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Courses Completed</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{progress.totalCourses}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Average Grade</p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{progress.averageGrade.toFixed(1)}%</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Letter Grade</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{progress.letterGrade}</p>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
            )}

            {/* Enrolled Courses */}
            <AnimatedSection>
                <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-slate-800 dark:border-slate-700">
                    <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Enrolled Courses</h2>
                    {enrolledCourses.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">No courses enrolled</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-200 dark:border-slate-700">
                                    <tr>
                                        <th className="pb-3 text-sm font-medium text-left text-gray-600 dark:text-gray-400">Course Code</th>
                                        <th className="pb-3 text-sm font-medium text-left text-gray-600 dark:text-gray-400">Course Name</th>
                                        <th className="pb-3 text-sm font-medium text-left text-gray-600 dark:text-gray-400">Department</th>
                                        <th className="pb-3 text-sm font-medium text-left text-gray-600 dark:text-gray-400">Credits</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                    {enrolledCourses.map((course) => (
                                        <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                            <td className="py-3 font-mono font-medium text-blue-600 dark:text-blue-400">{course.code}</td>
                                            <td className="py-3 text-gray-900 dark:text-white">{course.name}</td>
                                            <td className="py-3 text-gray-600 dark:text-gray-400">{course.department}</td>
                                            <td className="py-3 text-gray-900 dark:text-white">{course.credits}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </AnimatedSection>

            {/* Grades & Progress */}
            <AnimatedSection>
                <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-slate-800 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Grades &amp; Progress</h2>
                        <button
                            onClick={openAddGrade}
                            className="flex cursor-pointer items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={15} /> Add Grade
                        </button>
                    </div>
                    {grades.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No grades yet. Click &quot;Add Grade&quot; to record one.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-200 dark:border-slate-700">
                                    <tr>
                                        <th className="pb-3 text-sm font-medium text-left text-gray-600 dark:text-gray-400">Course</th>
                                        <th className="pb-3 text-sm font-medium text-left text-gray-600 dark:text-gray-400">Semester</th>
                                        <th className="pb-3 text-sm font-medium text-left text-gray-600 dark:text-gray-400">Grade</th>
                                        <th className="pb-3 text-sm font-medium text-left text-gray-600 dark:text-gray-400">Percentage</th>
                                        <th className="pb-3 text-sm font-medium text-left text-gray-600 dark:text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                    {grades.map((grade) => {
                                        const course = courses.find(c => c.id === grade.courseId);
                                        return (
                                            <tr key={grade.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                                <td className="py-3">
                                                    <p className="font-medium text-gray-900 dark:text-white">{course?.name ?? grade.courseId}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{course?.code}</p>
                                                </td>
                                                <td className="py-3 text-gray-600 dark:text-gray-400">{grade.semester}</td>
                                                <td className="py-3">
                                                    <span className="inline-flex items-center px-3 py-1 font-bold text-green-800 bg-green-100 rounded-full dark:bg-green-900/30 dark:text-green-400">
                                                        {grade.grade}
                                                    </span>
                                                </td>
                                                <td className="py-3 font-bold text-gray-900 dark:text-white">{grade.numericGrade}%</td>
                                                <td className="py-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => openEditGrade(grade)}
                                                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                                            title="Edit grade"
                                                        >
                                                            <Pencil size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteGrade(grade.id)}
                                                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                            title="Delete grade"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </AnimatedSection>

            {/* Grade Add/Edit Modal */}
            {gradeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setGradeModalOpen(false)} />
                    <div className="relative w-full max-w-md p-6 space-y-4 bg-white shadow-2xl dark:bg-slate-800 rounded-xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingGrade ? 'Edit Grade' : 'Add Grade'}
                            </h3>
                            <button onClick={() => setGradeModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Course select — only enrolled courses */}
                        <CommonSelect
                            label="Course"
                            required
                            value={gradeForm.courseId}
                            onChange={(e) => setGradeForm({ ...gradeForm, courseId: e.target.value })}
                            error={gradeErrors.courseId}
                        >
                            <option value="">Select Course</option>
                            {enrolledCourses.length === 0 ? (
                                <option disabled value="">No enrolled courses</option>
                            ) : (
                                enrolledCourses.map(c => (
                                    <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                                ))
                            )}
                        </CommonSelect>
                        {enrolledCourses.length === 0 && (
                            <p className="-mt-2 text-xs text-amber-500 dark:text-amber-400">
                                This student has no enrolled courses. Enroll them first to add grades.
                            </p>
                        )}

                        {/* Semester */}
                        <CommonSelect
                            label="Semester"
                            required
                            value={gradeForm.semester}
                            onChange={(e) => setGradeForm({ ...gradeForm, semester: e.target.value })}
                            error={gradeErrors.semester}
                            >
                            <option value="">Select Semester</option>
                            {SEMESTER_OPTIONS.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </CommonSelect>

                        {/* Letter Grade */}
                        <CommonSelect
                            label="Letter Grade"
                            required
                            value={gradeForm.grade}
                            onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                        >
                            {GRADE_OPTIONS.map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </CommonSelect>

                        {/* Numeric Grade */}
                        <CommonInput
                            label="Percentage (%)"
                            required
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={gradeForm.numericGrade}
                            onChange={(e) => setGradeForm({ ...gradeForm, numericGrade: Number(e.target.value) })}
                            error={gradeErrors.numericGrade}
                        />

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleSaveGrade}
                                disabled={gradeSaving}
                                className="flex-1 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {gradeSaving ? 'Saving…' : editingGrade ? 'Update Grade' : 'Add Grade'}
                            </button>
                            <button
                                onClick={() => setGradeModalOpen(false)}
                                className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <GradeSuccessModal
                isOpen={gradeSuccessOpen}
                message={gradeSuccessMessage}
                onClose={() => setGradeSuccessOpen(false)}
            />
        </div>
    );
}
