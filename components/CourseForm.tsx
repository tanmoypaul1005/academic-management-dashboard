'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
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

const DEPARTMENT_OPTIONS = [
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

interface MetaEntry {
  key: string;
  value: string;
}

function metaToEntries(meta?: Record<string, string>): MetaEntry[] {
  if (!meta || Object.keys(meta).length === 0) return [{ key: '', value: '' }];
  return Object.entries(meta).map(([key, value]) => ({ key, value }));
}

function entriesToMeta(entries: MetaEntry[]): Record<string, string> {
  const result: Record<string, string> = {};
  entries.forEach(({ key, value }) => {
    if (key.trim()) result[key.trim()] = value;
  });
  return result;
}

export default function CourseForm({ course, mode, onSuccess }: CourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [faculty, setFaculty] = useState<Faculty[]>([]);

  const [formData, setFormData] = useState<CourseFormData>({
    name: course?.name || '',
    code: course?.code || '',
    department: course?.department || '',
    credits: course?.credits ?? 3,
    facultyIds: course?.facultyIds || [],
    semester: course?.semester || '',
    description: course?.description || '',
    prerequisites: course?.prerequisites || [],
    metadata: course?.metadata || {},
  });

  const [prereqInput, setPrereqInput] = useState('');
  const prerequisites = formData.prerequisites ?? [];

  const [metaEntries, setMetaEntries] = useState<MetaEntry[]>(
    metaToEntries(course?.metadata)
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    facultyApi.getAll()
      .then(setFaculty)
      .catch((e) => console.error('Error fetching faculty:', e));
  }, []);

  //  Validation 
  function validate(): boolean {
    const e: Record<string, string> = {};

    if (!formData.name.trim())
      e.name = 'Course name is required';

    if (!formData.code.trim())
      e.code = 'Course code is required';
    else if (!/^[A-Z]{2,6}\d{2,4}$/i.test(formData.code.trim()))
      e.code = 'Course code must be like CS301 or MATH101';

    if (!formData.department)
      e.department = 'Department is required';

    if (!formData.semester.trim())
      e.semester = 'Semester is required';

    if (formData.credits < 1 || formData.credits > 6)
      e.credits = 'Credits must be between 1 and 6';

    if (formData.facultyIds.length === 0)
      e.facultyIds = 'At least one instructor must be assigned';

    const keys = metaEntries.map((m) => m.key.trim()).filter(Boolean);
    const uniqueKeys = new Set(keys);
    if (keys.length !== uniqueKeys.size)
      e.metadata = 'Metadata keys must be unique';

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  //  Submit 
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload: CourseFormData = {
      ...formData,
      metadata: entriesToMeta(metaEntries),
    };

    setLoading(true);
    try {
      if (mode === 'create') {
        const created = await coursesApi.create(payload);
        if (onSuccess) onSuccess(created);
        else router.push('/courses');
      } else if (course) {
        const updated = await coursesApi.update(course.id, payload);
        if (onSuccess) onSuccess(updated);
        else router.push('/courses');
      }
    } catch (err) {
      console.error('Error saving course:', err);
    } finally {
      setLoading(false);
    }
  }

  //  Faculty toggle 
  function toggleFaculty(id: string) {
    setFormData((prev) => ({
      ...prev,
      facultyIds: prev.facultyIds.includes(id)
        ? prev.facultyIds.filter((f) => f !== id)
        : [...prev.facultyIds, id],
    }));
  }

  //  Prerequisites helpers 
  function addPrerequisite() {
    const trimmed = prereqInput.trim();
    if (!trimmed) return;
    if (prerequisites.includes(trimmed)) { setPrereqInput(''); return; }
    setFormData((prev) => ({
      ...prev,
      prerequisites: [...(prev.prerequisites ?? []), trimmed],
    }));
    setPrereqInput('');
  }

  function removePrerequisite(index: number) {
    setFormData((prev) => ({
      ...prev,
      prerequisites: (prev.prerequisites ?? []).filter((_, i) => i !== index),
    }));
  }

  function handlePrereqKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); addPrerequisite(); }
  }

  //  Metadata helpers 
  function addMetaEntry() {
    setMetaEntries((prev) => [...prev, { key: '', value: '' }]);
  }

  function updateMetaEntry(index: number, field: 'key' | 'value', val: string) {
    setMetaEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: val } : entry))
    );
  }

  function removeMetaEntry(index: number) {
    setMetaEntries((prev) => prev.filter((_, i) => i !== index));
  }

  //  Render 
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">

      {/*  Basic Information  */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

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

          <CommonInput
            label="Course Code"
            required
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="e.g., CS301"
            error={errors.code}
          />

          <CommonSelect
            label="Department"
            required
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            error={errors.department}
          >
            <option value="">Select Department</option>
            {DEPARTMENT_OPTIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </CommonSelect>

          <CommonSelect
            label="Credits"
            required
            value={formData.credits}
            onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
            error={errors.credits}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{n} Credit{n > 1 ? 's' : ''}</option>
            ))}
          </CommonSelect>

          <CommonInput
            label="Semester"
            required
            type="text"
            value={formData.semester}
            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            placeholder="e.g., Fall 2025"
            error={errors.semester}
          />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Short overview of this course..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>

      {/*  Assigned Instructors  */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
          Assigned Instructors <span className="text-red-500">*</span>
        </h3>
        <div
          className={`border rounded-lg p-4 max-h-56 overflow-y-auto bg-white dark:bg-slate-700 ${
            errors.facultyIds
              ? 'border-red-500 dark:border-red-400'
              : 'border-gray-300 dark:border-slate-600'
          }`}
        >
          {faculty.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No faculty members available</p>
          ) : (
            <div className="space-y-1">
              {faculty.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-slate-600/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.facultyIds.includes(member.id)}
                    onChange={() => toggleFaculty(member.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{member.name}</span>
                    <span className="text-gray-500 dark:text-gray-400">  {member.title}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{member.department}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
        {errors.facultyIds && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.facultyIds}</p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {formData.facultyIds.length} instructor{formData.facultyIds.length !== 1 ? 's' : ''} selected
        </p>
      </div>

      {/*  Prerequisites  */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
          Prerequisites
        </h3>

        {prerequisites.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {prerequisites.map((prereq, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-sm font-medium"
              >
                {prereq}
                <button
                  type="button"
                  onClick={() => removePrerequisite(idx)}
                  className="ml-1 text-blue-500 dark:text-blue-400 hover:text-red-500 dark:hover:text-red-400 leading-none focus:outline-none"
                  aria-label={`Remove ${prereq}`}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={prereqInput}
            onChange={(e) => setPrereqInput(e.target.value)}
            onKeyDown={handlePrereqKeyDown}
            placeholder="e.g., CS101 — press Enter or click Add"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={addPrerequisite}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm transition-colors"
          >
            Add
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Course codes or names students must complete first.
        </p>
      </div>

      {/*  Metadata  */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
          Metadata
        </h3>

        {errors.metadata && (
          <p className="mb-2 text-sm text-red-500 dark:text-red-400">{errors.metadata}</p>
        )}

        <div className="space-y-2">
          {metaEntries.map((entry, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                value={entry.key}
                onChange={(e) => updateMetaEntry(idx, 'key', e.target.value)}
                placeholder="Key (e.g., room)"
                className="w-36 shrink-0 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-400 dark:text-gray-500 text-sm select-none">:</span>
              <input
                type="text"
                value={entry.value}
                onChange={(e) => updateMetaEntry(idx, 'value', e.target.value)}
                placeholder="Value (e.g., Hall 4B)"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => removeMetaEntry(idx)}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors focus:outline-none"
                aria-label="Remove entry"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addMetaEntry}
          className="mt-3 flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add metadata field
        </button>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Free-form key-value pairs (e.g., room, schedule, max_capacity).
        </p>
      </div>

      {/*  Actions  */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Saving' : mode === 'create' ? 'Create Course' : 'Update Course'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
