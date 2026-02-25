'use client';

import { useEffect, useState } from 'react';
import { studentsApi, coursesApi, gradesApi } from '@/lib/api';
import { Student, Course, GradeFormData } from '@/types';

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

  // Bulk operations
  const [bulkAction, setBulkAction] = useState<'enroll' | 'unenroll'>('enroll');
  const [bulkCourse, setBulkCourse] = useState<string>('');
  const [bulkStudents, setBulkStudents] = useState<string[]>([]);

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
      // Update each student's enrolled courses
      for (const studentId of selectedStudents) {
        const student = students.find(s => s.id === studentId);
        if (student && !student.enrolledCourses.includes(selectedCourse)) {
          await studentsApi.update(studentId, {
            enrolledCourses: [...student.enrolledCourses, selectedCourse],
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

      alert('Students assigned successfully!');
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
      await gradesApi.create(gradeForm as GradeFormData);
      alert('Grade added successfully!');
      setGradeForm({
        studentId: '',
        courseId: '',
        grade: '',
        numericGrade: 0,
        semester: 'Fall 2025',
      });
    } catch (error) {
      console.error('Error adding grade:', error);
      alert('Failed to add grade');
    }
  }

  async function handleBulkOperation() {
    if (!bulkCourse || bulkStudents.length === 0) {
      alert('Please select a course and at least one student');
      return;
    }

    try {
      for (const studentId of bulkStudents) {
        const student = students.find(s => s.id === studentId);
        if (!student) continue;

        if (bulkAction === 'enroll') {
          if (!student.enrolledCourses.includes(bulkCourse)) {
            await studentsApi.update(studentId, {
              enrolledCourses: [...student.enrolledCourses, bulkCourse],
            });
          }
        } else {
          await studentsApi.update(studentId, {
            enrolledCourses: student.enrolledCourses.filter(id => id !== bulkCourse),
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

      alert(`Bulk ${bulkAction === 'enroll' ? 'enrollment' : 'unenrollment'} successful!`);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Faculty Panel</h1>
        <p className="text-gray-600">Manage student assignments and grades</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab('assign')}
              className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'assign'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Assign Students
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'grades'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Add/Update Grades
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'bulk'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bulk Actions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Assign Students Tab */}
          {activeTab === 'assign' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Assign Students to Course</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Course
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Students
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-80 overflow-y-auto">
                  {students.map(student => (
                    <label key={student.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
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
                        className="mr-3 h-4 w-4 text-blue-600 rounded"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{student.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({student.major})</span>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500">{selectedStudents.length} student(s) selected</p>
              </div>

              <button
                onClick={handleAssignStudent}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Assign Students
              </button>
            </div>
          )}

          {/* Add/Update Grades Tab */}
          {activeTab === 'grades' && (
            <form onSubmit={handleAddGrade} className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Add/Update Student Grade</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={gradeForm.studentId}
                    onChange={(e) => setGradeForm({ ...gradeForm, studentId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={gradeForm.courseId}
                    onChange={(e) => setGradeForm({ ...gradeForm, courseId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Letter Grade <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={gradeForm.grade}
                    onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numeric Grade (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gradeForm.numericGrade}
                    onChange={(e) => setGradeForm({ ...gradeForm, numericGrade: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={gradeForm.semester}
                    onChange={(e) => setGradeForm({ ...gradeForm, semester: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Fall 2025"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Grade
              </button>
            </form>
          )}

          {/* Bulk Actions Tab */}
          {activeTab === 'bulk' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Bulk Student Operations</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Type
                </label>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value as 'enroll' | 'unenroll')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="enroll">Enroll Students</option>
                  <option value="unenroll">Unenroll Students</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Course
                </label>
                <select
                  value={bulkCourse}
                  onChange={(e) => setBulkCourse(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Students (Multiple)
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-80 overflow-y-auto">
                  {students.map(student => (
                    <label key={student.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
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
                        className="mr-3 h-4 w-4 text-blue-600 rounded"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{student.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({student.enrolledCourses.length} courses enrolled)
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500">{bulkStudents.length} student(s) selected</p>
              </div>

              <button
                onClick={handleBulkOperation}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Execute Bulk {bulkAction === 'enroll' ? 'Enrollment' : 'Unenrollment'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
