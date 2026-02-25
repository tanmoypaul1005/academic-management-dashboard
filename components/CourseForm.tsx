'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Course, Faculty, CourseFormData } from '@/types';
import { coursesApi, facultyApi } from '@/lib/api';
import CommonInput from './CommonInput';
import CommonSelect from './CommonSelect';

interface CourseFormProps {
  course?: Course;
  mode: 'create' | 'edit';
  onSuccess?: (course?: Course) => void;
}

export default function 
CourseForm({ course, mode, onSuccess }: CourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [formData, setFormData] = useState<CourseFormData>({
    name: course?.name || '',
    code: course?.code || '',
    department: course?.department || '',
    credits: course?.credits || 3,
    facultyIds: course?.facultyIds || [],
    semester: course?.semester || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const departmentOptions = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'Economics',
    'Business',
    'History',
    'Psychology',
  ];

  useEffect(() => {
    async function fetchFaculty() {
      try {
        const data = await facultyApi.getAll();
        setFaculty(data);
      } catch (error) {
        console.error('Error fetching faculty:', error);
      }
    }
    fetchFaculty();
  }, []);

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Course name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Course code is required';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.semester.trim()) {
      newErrors.semester = 'Semester is required';
    }

    if (formData.credits < 1 || formData.credits > 6) {
      newErrors.credits = 'Credits must be between 1 and 6';
    }

    if (formData.facultyIds.length === 0) {
      newErrors.facultyIds = 'At least one faculty member must be assigned';
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
        const created = await coursesApi.create(formData);
        if (onSuccess) onSuccess(created);
        else router.push('/courses');
      } else if (course) {
        const updated = await coursesApi.update(course.id, formData);
        if (onSuccess) onSuccess(updated);
        else router.push('/courses');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      // Previously used alert(); prefer non-blocking console logging for errors
      console.error('Failed to save course');
    } finally {
      setLoading(false);
    }
  }

  function toggleFaculty(facultyId: string) {
    setFormData(prev => ({
      ...prev,
      facultyIds: prev.facultyIds.includes(facultyId)
        ? prev.facultyIds.filter(id => id !== facultyId)
        : [...prev.facultyIds, facultyId],
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Course Name */}
          <div className="md:col-span-2">
            <CommonInput
              label="Course Name"
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Data Structures & Algorithms"
              error={errors.name}
            />
          </div>

          {/* Course Code */}
          <div>
            <CommonInput
              label="Course Code"
              required
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g., CS301"
              error={errors.code}
            />
          </div>

          {/* Department */}
          <div>
            <CommonSelect
              label="Department"
              required
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              error={errors.department}
            >
              <option value="">Select Department</option>
              {departmentOptions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </CommonSelect>
          </div>

          {/* Credits */}
          <div>
            <CommonSelect
              label="Credits"
              required
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
              error={errors.credits}
            >
              <option value={1}>1 Credit</option>
              <option value={2}>2 Credits</option>
              <option value={3}>3 Credits</option>
              <option value={4}>4 Credits</option>
              <option value={5}>5 Credits</option>
              <option value={6}>6 Credits</option>
            </CommonSelect>
          </div>

          {/* Semester */}
          <div>
            <CommonInput
              label="Semester"
              required
              type="text"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              placeholder="e.g., Fall 2025"
              error={errors.semester}
            />
          </div>
        </div>

        {/* Assigned Faculty - Dynamic Multi-select */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Assigned Faculty <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <div className={`border rounded-lg p-4 max-h-60 overflow-y-auto bg-white dark:bg-slate-700 ${
            errors.facultyIds ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-slate-600'
          }`}>
            {faculty.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No faculty members available</p>
            ) : (
              <div className="space-y-2">
                {faculty.map((member) => (
                  <label
                    key={member.id}
                    className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-slate-600/50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.facultyIds.includes(member.id)}
                      onChange={() => toggleFaculty(member.id)}
                      className="mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 dark:text-white">{member.name}</span>
                      <span className="text-gray-600 dark:text-gray-300"> - {member.title}</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{member.department}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          {errors.facultyIds && (
            <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.facultyIds}</p>
          )}
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {formData.facultyIds.length} faculty member(s) assigned
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Create Course' : 'Update Course'}
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
