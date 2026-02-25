export interface Student {
  id: string;
  name: string;
  email: string;
  gpa: number;
  year: number;
  major: string;
  enrolledCourses: string[];
}

export interface Course {
  id: string;
  name: string;
  code: string;
  department: string;
  credits: number;
  facultyIds: string[];
  enrollmentCount: number;
  semester: string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  title: string;
  coursesTeaching: string[];
}

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  grade: string;
  numericGrade: number;
  semester: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalFaculty: number;
}

export interface StudentFormData {
  name: string;
  email: string;
  gpa: number;
  year: number;
  major: string;
  enrolledCourses: string[];
}

export interface CourseFormData {
  name: string;
  code: string;
  department: string;
  credits: number;
  facultyIds: string[];
  semester: string;
  enrollmentCount?: number;
}

export interface GradeFormData {
  studentId: string;
  courseId: string;
  grade: string;
  numericGrade: number;
  semester: string;
}
