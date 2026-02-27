'use client';

import { useEffect, useState } from 'react';
import { studentsApi, coursesApi, gradesApi } from '@/lib/api';
import { Student, Course, GradeFormData } from '@/types';
import AnimatedSection from '@/components/AnimatedSection';
import CommonLabel from '@/components/CommonLabel';
import CommonSelect from '@/components/CommonSelect';
import GradeSuccessModal from '@/components/GradeSuccessModal';
import SuccessModal from '@/components/SuccessModal';
import BulkSuccessModal from '@/components/BulkSuccessModal';

export default function FacultyPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assign' | 'grades' | 'bulk'>('assign');

  // Assign students to courses
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Add/Update grades
  const [gradeForm, setGradeForm] = useState({
    studentId: '',
    courseId: '',
    grade: '',
    numericGrade: 0,
    semester: 'Fall 2025',
  });
  const [gradeSuccessOpen, setGradeSuccessOpen] = useState(false);
  const [gradeSuccessMessage, setGradeSuccessMessage] = useState('');

  // Assign success modal
  const [assignSuccessOpen, setAssignSuccessOpen] = useState(false);
  const [assignSuccessMessage, setAssignSuccessMessage] = useState('');

  const SEMESTER_OPTIONS = [
    'Fall 2026',
    'Summer 2026',
    'Spring 2026',
    'Fall 2025',
    'Summer 2025',
    'Spring 2025',
    'Fall 2024',
    'Summer 2024',
    'Spring 2024',
    'Fall 2023',
    'Summer 2023',
    'Spring 2023',
    'Fall 2022',
    'Summer 2022',
    'Spring 2022',
  ];

  // Bulk operations
  const [bulkAction, setBulkAction] = useState<'enroll' | 'unenroll'>('enroll');
  const [bulkCourse, setBulkCourse] = useState<string>('');
  const [bulkStudents, setBulkStudents] = useState<string[]>([]);
  const [bulkSuccessOpen, setBulkSuccessOpen] = useState(false);
  const [bulkSuccessCount, setBulkSuccessCount] = useState(0);
  const [bulkSuccessAction, setBulkSuccessAction] = useState<'enroll' | 'unenroll'>('enroll');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [studentsData, coursesData] = await Promise.all([
        studentsApi.getAll(),
        coursesApi.getAll(),
      ]);
      setStudents(studentsData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignStudent() {
    if (!selectedCourse || selectedStudents.length === 0) {
      alert('Please select a course and at least one student');
      return;
    }

    try {
      // Fetch fresh student data from DB before updating to avoid stale-state duplicates
      for (const studentId of selectedStudents) {
        const freshStudent = await studentsApi.getById(studentId);
        if (freshStudent && !freshStudent.enrolledCourses.includes(selectedCourse)) {
          await studentsApi.update(studentId, {
            enrolledCourses: [...new Set([...freshStudent.enrolledCourses, selectedCourse])],
          });
        }
      }

      // Update course enrollment count
      const course = courses.find(c => c.id === selectedCourse);
      if (course) {
        const newEnrollmentCount = students.filter(s => 
          s.enrolledCourses.includes(selectedCourse) || selectedStudents.includes(s.id)
        ).length;
        await coursesApi.update(selectedCourse, {
          enrollmentCount: newEnrollmentCount,
        });
      }

      setAssignSuccessMessage(`${selectedStudents.length} student(s) successfully assigned to the course!`);
      setAssignSuccessOpen(true);
      setSelectedStudents([]);
      fetchData();
    } catch (error) {
      console.error('Error assigning students:', error);
      alert('Failed to assign students');
    }
  }

  async function handleAddGrade(e: React.FormEvent) {
    e.preventDefault();

    if (!gradeForm.studentId || !gradeForm.courseId || !gradeForm.grade) {
      alert('Please fill all required fields');
      return;
    }

    try {
      // Check if a grade already exists for this student + course
      const existing = await gradesApi.getByStudentId(gradeForm.studentId);
      const duplicate = existing.find(g => g.courseId === gradeForm.courseId);

      if (duplicate) {
        // Update existing grade instead of creating a duplicate
        await gradesApi.update(duplicate.id, gradeForm as GradeFormData);
        setGradeSuccessMessage('Grade updated successfully!');
      } else {
        await gradesApi.create(gradeForm as GradeFormData);
        setGradeSuccessMessage('Grade added successfully!');
      }
      setGradeSuccessOpen(true);

      setGradeForm({
        studentId: '',
        courseId: '',
        grade: '',
        numericGrade: 0,
        semester: 'Fall 2025',
      });
    } catch (error) {
      console.error('Error saving grade:', error);
      alert('Failed to save grade');
    }
  }

  async function handleBulkOperation() {
    if (!bulkCourse || bulkStudents.length === 0) {
      alert('Please select a course and at least one student');
      return;
    }

    try {
      for (const studentId of bulkStudents) {
        // Fetch fresh student from DB to avoid stale-state duplicates
        const freshStudent = await studentsApi.getById(studentId);
        if (!freshStudent) continue;

        if (bulkAction === 'enroll') {
          if (!freshStudent.enrolledCourses.includes(bulkCourse)) {
            await studentsApi.update(studentId, {
              enrolledCourses: [...new Set([...freshStudent.enrolledCourses, bulkCourse])],
            });
          }
        } else {
          await studentsApi.update(studentId, {
            enrolledCourses: freshStudent.enrolledCourses.filter(id => id !== bulkCourse),
          });
        }
      }

      // Update course enrollment count
      const updatedStudents = await studentsApi.getAll();
      const newEnrollmentCount = updatedStudents.filter(s => 
        s.enrolledCourses.includes(bulkCourse)
      ).length;
      await coursesApi.update(bulkCourse, {
        enrollmentCount: newEnrollmentCount,
      });

      setBulkSuccessCount(bulkStudents.length);
      setBulkSuccessAction(bulkAction);
      setBulkSuccessOpen(true);
      // Reset form
      setBulkAction('enroll');
      setBulkCourse('');
      setBulkStudents([]);
      fetchData();
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      alert('Failed to perform bulk operation');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedSection animation="fadeIn">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">Faculty Panel</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage student assignments and grades</p>
      </AnimatedSection>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-md dark:bg-slate-800 dark:border-slate-700">
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="flex -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab('assign')}
              className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'assign'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              Assign Students
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'grades'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              Add/Update Grades
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'bulk'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              Bulk Actions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Assign Students Tab */}
          {activeTab === 'assign' && (
            <AnimatedSection animation="slideUp" delay={0.2}>
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Assign Students to Course</h2>
                
                <div>
                  <CommonLabel spacing="mb-2">
                    Select Course
                  </CommonLabel>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a course...</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <CommonLabel spacing="mb-2">
                    Select Students
                  </CommonLabel>
                  <div className="p-4 overflow-y-auto bg-white border border-gray-300 rounded-lg dark:border-slate-600 max-h-80 dark:bg-slate-700">
                    {students.map(student => (
                      <label key={student.id} className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents([...selectedStudents, student.id]);
                            } else {
                              setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                            }
                          }}
                          className="w-4 h-4 mr-3 text-blue-600 rounded dark:text-blue-400"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900 dark:text-white">{student.name}</span>
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({student.major})</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{selectedStudents.length} student(s) selected</p>
                </div>

                <button
                  onClick={handleAssignStudent}
                  className="px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600"
                >
                  Assign Students
                </button>
              </div>
            </AnimatedSection>
          )}

          {/* Add/Update Grades Tab */}
          {activeTab === 'grades' && (
            <AnimatedSection animation="slideUp" delay={0.2}>
              <form onSubmit={handleAddGrade} className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add/Update Student Grade</h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <CommonLabel spacing="mb-2" required>
                      Student
                    </CommonLabel>
                    <select
                      value={gradeForm.studentId}
                      onChange={(e) => setGradeForm({ ...gradeForm, studentId: e.target.value, courseId: '' })}
                      className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Choose a student...</option>
                      {students.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.name} - {student.major}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <CommonLabel spacing="mb-2" required>
                      Course
                    </CommonLabel>
                    {(() => {
                      const selectedStudent = students.find(s => s.id === gradeForm.studentId);
                      const enrolledCourses = selectedStudent
                        ? courses.filter(c => selectedStudent.enrolledCourses.includes(c.id))
                        : [];
                      return (
                        <select
                          value={gradeForm.courseId}
                          onChange={(e) => setGradeForm({ ...gradeForm, courseId: e.target.value })}
                          className={`w-full px-4 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            !gradeForm.studentId ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          disabled={!gradeForm.studentId}
                          required
                        >
                          <option value="">
                            {gradeForm.studentId ? 'Choose a course...' : 'Select a student first'}
                          </option>
                          {enrolledCourses.map(course => (
                            <option key={course.id} value={course.id}>
                              {course.code} - {course.name}
                            </option>
                          ))}
                        </select>
                      );
                    })()}
                    {gradeForm.studentId && (() => {
                      const selectedStudent = students.find(s => s.id === gradeForm.studentId);
                      const count = selectedStudent
                        ? courses.filter(c => selectedStudent.enrolledCourses.includes(c.id)).length
                        : 0;
                      return (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {count} enrolled course{count !== 1 ? 's' : ''}
                        </p>
                      );
                    })()}
                  </div>

                  <div>
                    <CommonLabel spacing="mb-2" required>
                      Letter Grade
                    </CommonLabel>
                    <select
                      value={gradeForm.grade}
                      onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                      className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select grade...</option>
                      <option value="A">A</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B">B</option>
                      <option value="B-">B-</option>
                      <option value="C+">C+</option>
                      <option value="C">C</option>
                      <option value="C-">C-</option>
                      <option value="D">D</option>
                      <option value="F">F</option>
                    </select>
                  </div>

                  <div>
                    <CommonLabel spacing="mb-2" required>
                      Numeric Grade (%)
                    </CommonLabel>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={gradeForm.numericGrade}
                      onChange={(e) => setGradeForm({ ...gradeForm, numericGrade: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <CommonSelect
                      label="Semester"
                      required
                      value={gradeForm.semester}
                      onChange={(e) => setGradeForm({ ...gradeForm, semester: e.target.value })}
                    >
                      <option value="">Select Semester</option>
                      {SEMESTER_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </CommonSelect>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600"
                >
                  Add Grade
                </button>
              </form>
            </AnimatedSection>
          )}

          {/* Bulk Actions Tab */}
          {activeTab === 'bulk' && (
            <AnimatedSection animation="slideUp" delay={0.2}>
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bulk Student Operations</h2>

                <div>
                  <CommonLabel spacing="mb-2">
                    Action Type
                  </CommonLabel>
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value as 'enroll' | 'unenroll')}
                    className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="enroll">Enroll Students</option>
                    <option value="unenroll">Unenroll Students</option>
                  </select>
                </div>

                <div>
                  <CommonLabel spacing="mb-2">
                    Select Course
                  </CommonLabel>
                  <select
                    value={bulkCourse}
                    onChange={(e) => setBulkCourse(e.target.value)}
                    className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a course...</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <CommonLabel spacing="mb-2">
                    Select Students (Multiple)
                  </CommonLabel>
                  <div className="p-4 overflow-y-auto bg-white border border-gray-300 rounded-lg dark:border-slate-600 max-h-80 dark:bg-slate-700">
                    {students.map(student => (
                      <label key={student.id} className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50">
                        <input
                          type="checkbox"
                          checked={bulkStudents.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBulkStudents([...bulkStudents, student.id]);
                            } else {
                              setBulkStudents(bulkStudents.filter(id => id !== student.id));
                            }
                          }}
                          className="w-4 h-4 mr-3 text-blue-600 rounded dark:text-blue-400"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900 dark:text-white">{student.name}</span>
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                            ({student.enrolledCourses.length} courses enrolled)
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{bulkStudents.length} student(s) selected</p>
                </div>

                <button
                  onClick={handleBulkOperation}
                  className="px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600"
                >
                  Execute Bulk {bulkAction === 'enroll' ? 'Enrollment' : 'Unenrollment'}
                </button>
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>
        <GradeSuccessModal
          isOpen={gradeSuccessOpen}
          message={gradeSuccessMessage}
          onClose={() => setGradeSuccessOpen(false)}
        />
        <SuccessModal
          isOpen={assignSuccessOpen}
          title="Students Assigned"
          message={assignSuccessMessage}
          onClose={() => setAssignSuccessOpen(false)}
        />
        <BulkSuccessModal
          isOpen={bulkSuccessOpen}
          action={bulkSuccessAction}
          studentCount={bulkSuccessCount}
          onClose={() => setBulkSuccessOpen(false)}
        />
    </div>
  );
}
