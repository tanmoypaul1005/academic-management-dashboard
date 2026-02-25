'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Student, Course, StudentFormData } from '@/types';
import { studentsApi, coursesApi } from '@/lib/api';

interface StudentFormProps {
  student?: Student;
  mode: 'create' | 'edit';
  onSuccess?: (created?: Student) => void;
}

export default function StudentForm({ student, mode, onSuccess }: StudentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState<StudentFormData>({
    name: student?.name || '',
    email: student?.email || '',
    gpa: student?.gpa || 0,
    year: student?.year || 1,
    major: student?.major || '',
    enrolledCourses: student?.enrolledCourses || [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await coursesApi.getAll();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    }
    fetchCourses();
  }, []);

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.major.trim()) {
      newErrors.major = 'Major is required';
    }

    if (formData.gpa < 0 || formData.gpa > 4) {
      newErrors.gpa = 'GPA must be between 0 and 4';
    }

    if (formData.year < 1 || formData.year > 6) {
      newErrors.year = 'Year must be between 1 and 6';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (mode === 'create') {
        const created = await studentsApi.create(formData);
        if (onSuccess) onSuccess(created);
        else router.push('/students');
      } else if (student) {
        const updated = await studentsApi.update(student.id, formData);
        if (onSuccess) onSuccess(updated);
        else router.push('/students');
      }
    } catch (error) {
      console.error('Error saving student:', error);
      // Previously used alert(); prefer non-blocking console logging for errors
      console.error('Failed to save student');
    } finally {
      setLoading(false);
    }
  }

  function toggleCourse(courseId: string) {
    setFormData(prev => ({
      ...prev,
      enrolledCourses: prev.enrolledCourses.includes(courseId)
        ? prev.enrolledCourses.filter(id => id !== courseId)
        : [...prev.enrolledCourses, courseId],
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {mode === 'create' ? 'Add New Student' : 'Edit Student'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-slate-600'
              }`}
              placeholder="Enter student name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-slate-600'
              }`}
              placeholder="student@university.edu"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Major */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Major <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.major}
              onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.major ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-slate-600'
              }`}
              placeholder="e.g., Computer Science"
            />
            {errors.major && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.major}</p>
            )}
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Year <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <select
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.year ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-slate-600'
              }`}
            >
              <option value={1}>Year 1</option>
              <option value={2}>Year 2</option>
              <option value={3}>Year 3</option>
              <option value={4}>Year 4</option>
              <option value={5}>Year 5</option>
              <option value={6}>Year 6</option>
            </select>
            {errors.year && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.year}</p>
            )}
          </div>

          {/* GPA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              GPA <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="4"
              value={formData.gpa}
              onChange={(e) => setFormData({ ...formData, gpa: parseFloat(e.target.value) })}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.gpa ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-slate-600'
              }`}
              placeholder="0.00 - 4.00"
            />
            {errors.gpa && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.gpa}</p>
            )}
          </div>
        </div>

        {/* Enrolled Courses - Dynamic Multi-select */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enrolled Courses
          </label>
          <div className="border border-gray-300 dark:border-slate-600 rounded-lg p-4 max-h-60 overflow-y-auto bg-white dark:bg-slate-700">
            {courses.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No courses available</p>
            ) : (
              <div className="space-y-2">
                {courses.map((course) => (
                  <label
                    key={course.id}
                    className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-slate-600/50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.enrolledCourses.includes(course.id)}
                      onChange={() => toggleCourse(course.id)}
                      className="mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 dark:text-white">{course.code}</span>
                      <span className="text-gray-600 dark:text-gray-300"> - {course.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {formData.enrolledCourses.length} course(s) selected
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Create Student' : 'Update Student'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
