import { Student, Course, Faculty, Grade } from '@/types';

// CSV Export utility
export function exportToCSV(data: any[], filename: string) {
  if (!Array.isArray(data) || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Handle arrays and objects
        if (Array.isArray(value)) {
          return `"${value.join('; ')}"`;
        }
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value)}"`;
        }
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Calculate student progress
export function calculateStudentProgress(grades: Grade[]): {
  totalCourses: number;
  averageGrade: number;
  letterGrade: string;
} {
  if (!Array.isArray(grades) || grades.length === 0) {
    return { totalCourses: 0, averageGrade: 0, letterGrade: 'N/A' };
  }

  const totalCourses = grades.length;
  const averageGrade = grades.reduce((sum, g) => sum + g.numericGrade, 0) / totalCourses;
  const letterGrade = getLetterGrade(averageGrade);

  return { totalCourses, averageGrade, letterGrade };
}

// Convert numeric grade to letter grade
export function getLetterGrade(numericGrade: number): string {
  if (numericGrade >= 93) return 'A';
  if (numericGrade >= 90) return 'A-';
  if (numericGrade >= 87) return 'B+';
  if (numericGrade >= 83) return 'B';
  if (numericGrade >= 80) return 'B-';
  if (numericGrade >= 77) return 'C+';
  if (numericGrade >= 73) return 'C';
  if (numericGrade >= 70) return 'C-';
  if (numericGrade >= 60) return 'D';
  return 'F';
}

// Search and filter utilities
export function filterStudents(
  students: Student[],
  searchTerm: string,
  filters: {
    course?: string;
    year?: number;
    major?: string;
  }
): Student[] {
  if (!Array.isArray(students)) {
    return [];
  }
  return students.filter(student => {
    // Search term
    const matchesSearch =
      !searchTerm ||
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.major.toLowerCase().includes(searchTerm.toLowerCase());

    // Filters
    const matchesCourse = !filters.course || student.enrolledCourses.includes(filters.course);
    const matchesYear = !filters.year || student.year === filters.year;
    const matchesMajor = !filters.major || student.major === filters.major;

    return matchesSearch && matchesCourse && matchesYear && matchesMajor;
  });
}

export function filterCourses(
  courses: Course[],
  searchTerm: string,
  department?: string
): Course[] {
  if (!Array.isArray(courses)) {
    return [];
  }
  return courses.filter(course => {
    const matchesSearch =
      !searchTerm ||
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = !department || course.department === department;

    return matchesSearch && matchesDepartment;
  });
}

// Pagination utility
export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  if (!Array.isArray(items)) {
    return [];
  }
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return items.slice(startIndex, endIndex);
}

// Sort students by GPA
export function sortByGPA(students: Student[], descending = true): Student[] {
  if (!Array.isArray(students)) {
    return [];
  }
  return [...students].sort((a, b) =>
    descending ? b.gpa - a.gpa : a.gpa - b.gpa
  );
}

// Sort courses by enrollment
export function sortByEnrollment(courses: Course[], descending = true): Course[] {
  if (!Array.isArray(courses)) {
    return [];
  }
  return [...courses].sort((a, b) =>
    descending ? b.enrollmentCount - a.enrollmentCount : a.enrollmentCount - b.enrollmentCount
  );
}

// Get top N students
export function getTopStudents(students: Student[], count: number): Student[] {
  return sortByGPA(students, true).slice(0, count);
}

// Get most popular courses
export function getMostPopularCourses(courses: Course[], count: number): Course[] {
  return sortByEnrollment(courses, true).slice(0, count);
}

// Get unique values for filters
export function getUniqueMajors(students: Student[]): string[] {
  if (!Array.isArray(students)) {
    return [];
  }
  return Array.from(new Set(students.map(s => s.major))).sort();
}

export function getUniqueDepartments(courses: Course[]): string[] {
  if (!Array.isArray(courses)) {
    return [];
  }
  return Array.from(new Set(courses.map(c => c.department))).sort();
}

export function getUniqueYears(students: Student[]): number[] {
  if (!Array.isArray(students)) {
    return [];
  }
  return Array.from(new Set(students.map(s => s.year))).sort();
}
