import axios from 'axios';
import {
  Student,
  Course,
  Faculty,
  Grade,
  StudentFormData,
  CourseFormData,
  GradeFormData,
} from '@/types';

// Use environment variable or default to /api for production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Students API
export const studentsApi = {
  getAll: async (): Promise<Student[]> => {
    const response = await api.get('/students');
    const payload = response.data;
    // Handle paginated or plain responses
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
  },
  getById: async (id: string): Promise<Student> => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },
  create: async (data: StudentFormData): Promise<Student> => {
    const response = await api.post('/students', {
      ...data,
      id: Date.now().toString(),
    });
    return response.data;
  },
  update: async (id: string, data: Partial<StudentFormData>): Promise<Student> => {
    const response = await api.patch(`/students/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/students/${id}`);
  },
  // Fetch a paginated page (returns full payload with metadata)
  getPage: async (page = 1, limit = 10): Promise<{ data: Student[]; total: number; page: number; limit: number; totalPages: number }> => {
    const response = await api.get(`/students?page=${page}&limit=${limit}`);
    return response.data;
  },
};

// Courses API
export const coursesApi = {
  getAll: async (): Promise<Course[]> => {
    const response = await api.get('/courses');
    const payload = response.data;
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
  },
  getById: async (id: string): Promise<Course> => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },
  create: async (data: CourseFormData): Promise<Course> => {
    const response = await api.post('/courses', {
      ...data,
      id: Date.now().toString(),
      enrollmentCount: 0,
    });
    return response.data;
  },
  update: async (id: string, data: Partial<CourseFormData>): Promise<Course> => {
    const response = await api.patch(`/courses/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/courses/${id}`);
  },
  // Fetch paginated courses with metadata
  getPage: async (page = 1, limit = 10): Promise<{ data: Course[]; total: number; page: number; limit: number; totalPages: number }> => {
    const response = await api.get(`/courses?page=${page}&limit=${limit}`);
    return response.data;
  },
};

// Faculty API
export const facultyApi = {
  getAll: async (): Promise<Faculty[]> => {
    const response = await api.get('/faculty');
    return response.data;
  },
  getById: async (id: string): Promise<Faculty> => {
    const response = await api.get(`/faculty/${id}`);
    return response.data;
  },
  create: async (data: Omit<Faculty, 'id'>): Promise<Faculty> => {
    const response = await api.post('/faculty', {
      ...data,
      id: Date.now().toString(),
    });
    return response.data;
  },
  update: async (id: string, data: Partial<Faculty>): Promise<Faculty> => {
    const response = await api.patch(`/faculty/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/faculty/${id}`);
  },
};

// Grades API
export const gradesApi = {
  getAll: async (): Promise<Grade[]> => {
    const response = await api.get('/grades');
    return response.data;
  },
  getByStudentId: async (studentId: string): Promise<Grade[]> => {
    const response = await api.get(`/grades?studentId=${studentId}`);
    return response.data;
  },
  getByCourseId: async (courseId: string): Promise<Grade[]> => {
    const response = await api.get(`/grades?courseId=${courseId}`);
    return response.data;
  },
  create: async (data: GradeFormData): Promise<Grade> => {
    const response = await api.post('/grades', {
      ...data,
      id: Date.now().toString(),
    });
    return response.data;
  },
  update: async (id: string, data: Partial<GradeFormData>): Promise<Grade> => {
    const response = await api.patch(`/grades/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/grades/${id}`);
  },
};

export default api;
