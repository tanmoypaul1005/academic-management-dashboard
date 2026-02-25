import { Student, Course, Faculty, Grade } from '@/types';

// In-memory database (resets on server restart)
export let students: Student[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice.johnson@university.edu",
    gpa: 3.95,
    year: 3,
    major: "Computer Science",
    enrolledCourses: ["1", "2", "5"]
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob.smith@university.edu",
    gpa: 3.87,
    year: 2,
    major: "Mathematics",
    enrolledCourses: ["2", "3"]
  },
  {
    id: "3",
    name: "Charlie Davis",
    email: "charlie.davis@university.edu",
    gpa: 3.92,
    year: 4,
    major: "Computer Science",
    enrolledCourses: ["1", "4", "5"]
  },
  {
    id: "4",
    name: "Diana Martinez",
    email: "diana.martinez@university.edu",
    gpa: 3.78,
    year: 1,
    major: "Physics",
    enrolledCourses: ["3", "4"]
  },
  {
    id: "5",
    name: "Ethan Brown",
    email: "ethan.brown@university.edu",
    gpa: 3.65,
    year: 2,
    major: "Engineering",
    enrolledCourses: ["1", "2"]
  },
  {
    id: "6",
    name: "Fiona Wilson",
    email: "fiona.wilson@university.edu",
    gpa: 3.88,
    year: 3,
    major: "Computer Science",
    enrolledCourses: ["1", "5"]
  },
  {
    id: "7",
    name: "George Taylor",
    email: "george.taylor@university.edu",
    gpa: 3.71,
    year: 2,
    major: "Mathematics",
    enrolledCourses: ["2", "3"]
  },
  {
    id: "8",
    name: "Hannah Lee",
    email: "hannah.lee@university.edu",
    gpa: 3.84,
    year: 4,
    major: "Physics",
    enrolledCourses: ["3", "4"]
  }
  ,
  {
    id: "9",
    name: "Ian Parker",
    email: "ian.parker@university.edu",
    gpa: 3.58,
    year: 1,
    major: "Engineering",
    enrolledCourses: ["1", "4"]
  },
  {
    id: "10",
    name: "Julia Roberts",
    email: "julia.roberts@university.edu",
    gpa: 3.76,
    year: 2,
    major: "Mathematics",
    enrolledCourses: ["2"]
  },
  {
    id: "11",
    name: "Kevin Nguyen",
    email: "kevin.nguyen@university.edu",
    gpa: 3.69,
    year: 3,
    major: "Computer Science",
    enrolledCourses: ["1", "5"]
  },
  {
    id: "12",
    name: "Lina Gomez",
    email: "lina.gomez@university.edu",
    gpa: 3.82,
    year: 4,
    major: "Physics",
    enrolledCourses: ["3"]
  },
  {
    id: "13",
    name: "Mohammed Ali",
    email: "mohammed.ali@university.edu",
    gpa: 3.61,
    year: 2,
    major: "Engineering",
    enrolledCourses: ["1", "2"]
  },
  {
    id: "14",
    name: "Nora Svensson",
    email: "nora.svensson@university.edu",
    gpa: 3.90,
    year: 3,
    major: "Computer Science",
    enrolledCourses: ["5"]
  },
  {
    id: "15",
    name: "Omar Haddad",
    email: "omar.haddad@university.edu",
    gpa: 3.55,
    year: 1,
    major: "Mathematics",
    enrolledCourses: ["2", "3"]
  },
  {
    id: "16",
    name: "Priya Singh",
    email: "priya.singh@university.edu",
    gpa: 3.97,
    year: 4,
    major: "Computer Science",
    enrolledCourses: ["1", "5"]
  },
  {
    id: "17",
    name: "Quentin Blake",
    email: "quentin.blake@university.edu",
    gpa: 3.48,
    year: 2,
    major: "Engineering",
    enrolledCourses: ["4"]
  },
  {
    id: "18",
    name: "Rita Patel",
    email: "rita.patel@university.edu",
    gpa: 3.73,
    year: 3,
    major: "Mathematics",
    enrolledCourses: ["2", "5"]
  },
  {
    id: "19",
    name: "Samir Khan",
    email: "samir.khan@university.edu",
    gpa: 3.66,
    year: 1,
    major: "Physics",
    enrolledCourses: ["3"]
  },
  {
    id: "20",
    name: "Tara O'Neill",
    email: "tara.oneill@university.edu",
    gpa: 3.81,
    year: 2,
    major: "Computer Science",
    enrolledCourses: ["1", "5"]
  }
];

export let courses: Course[] = [
  {
    id: "1",
    name: "Data Structures & Algorithms",
    code: "CS301",
    department: "Computer Science",
    credits: 4,
    facultyIds: ["1", "2"],
    enrollmentCount: 5,
    semester: "Fall 2025"
  },
  {
    id: "2",
    name: "Linear Algebra",
    code: "MATH201",
    department: "Mathematics",
    credits: 3,
    facultyIds: ["3"],
    enrollmentCount: 4,
    semester: "Fall 2025"
  },
  {
    id: "3",
    name: "Quantum Mechanics",
    code: "PHY401",
    department: "Physics",
    credits: 4,
    facultyIds: ["4"],
    enrollmentCount: 4,
    semester: "Fall 2025"
  },
  {
    id: "4",
    name: "Thermodynamics",
    code: "PHY301",
    department: "Physics",
    credits: 3,
    facultyIds: ["4", "5"],
    enrollmentCount: 3,
    semester: "Fall 2025"
  },
  {
    id: "5",
    name: "Machine Learning",
    code: "CS401",
    department: "Computer Science",
    credits: 4,
    facultyIds: ["1"],
    enrollmentCount: 3,
    semester: "Fall 2025"
  }
  ,
  {
    id: "6",
    name: "Operating Systems",
    code: "CS302",
    department: "Computer Science",
    credits: 4,
    facultyIds: ["2"],
    enrollmentCount: 4,
    semester: "Spring 2026"
  },
  {
    id: "7",
    name: "Probability & Statistics",
    code: "MATH301",
    department: "Mathematics",
    credits: 3,
    facultyIds: ["3"],
    enrollmentCount: 6,
    semester: "Spring 2026"
  },
  {
    id: "8",
    name: "Electromagnetism",
    code: "PHY302",
    department: "Physics",
    credits: 3,
    facultyIds: ["4"],
    enrollmentCount: 2,
    semester: "Spring 2026"
  },
  {
    id: "9",
    name: "Database Systems",
    code: "CS350",
    department: "Computer Science",
    credits: 3,
    facultyIds: ["1"],
    enrollmentCount: 5,
    semester: "Spring 2026"
  },
  {
    id: "10",
    name: "Numerical Methods",
    code: "MATH320",
    department: "Mathematics",
    credits: 3,
    facultyIds: ["3"],
    enrollmentCount: 2,
    semester: "Spring 2026"
  }
  ,
  {
    id: "11",
    name: "Computer Networks",
    code: "CS303",
    department: "Computer Science",
    credits: 3,
    facultyIds: ["2"],
    enrollmentCount: 4,
    semester: "Fall 2026"
  },
  {
    id: "12",
    name: "Compiler Design",
    code: "CS405",
    department: "Computer Science",
    credits: 4,
    facultyIds: ["1"],
    enrollmentCount: 3,
    semester: "Fall 2026"
  },
  {
    id: "13",
    name: "Abstract Algebra",
    code: "MATH401",
    department: "Mathematics",
    credits: 3,
    facultyIds: ["3"],
    enrollmentCount: 2,
    semester: "Fall 2026"
  },
  {
    id: "14",
    name: "Complex Analysis",
    code: "MATH402",
    department: "Mathematics",
    credits: 3,
    facultyIds: ["3"],
    enrollmentCount: 3,
    semester: "Spring 2027"
  },
  {
    id: "15",
    name: "Astrophysics",
    code: "PHY401",
    department: "Physics",
    credits: 4,
    facultyIds: ["4"],
    enrollmentCount: 2,
    semester: "Fall 2026"
  },
  {
    id: "16",
    name: "Solid State Physics",
    code: "PHY403",
    department: "Physics",
    credits: 3,
    facultyIds: ["5"],
    enrollmentCount: 1,
    semester: "Spring 2027"
  },
  {
    id: "17",
    name: "Software Engineering",
    code: "CS310",
    department: "Computer Science",
    credits: 3,
    facultyIds: ["1","2"],
    enrollmentCount: 6,
    semester: "Spring 2026"
  },
  {
    id: "18",
    name: "Numerical Linear Algebra",
    code: "MATH330",
    department: "Mathematics",
    credits: 3,
    facultyIds: ["3"],
    enrollmentCount: 2,
    semester: "Spring 2027"
  }
];

export let faculty: Faculty[] = [
  {
    id: "1",
    name: "Dr. Sarah Connor",
    email: "sarah.connor@university.edu",
    department: "Computer Science",
    title: "Professor",
    coursesTeaching: ["1", "5"]
  },
  {
    id: "2",
    name: "Dr. John McCarthy",
    email: "john.mccarthy@university.edu",
    department: "Computer Science",
    title: "Associate Professor",
    coursesTeaching: ["1"]
  },
  {
    id: "3",
    name: "Dr. Alan Turing",
    email: "alan.turing@university.edu",
    department: "Mathematics",
    title: "Professor",
    coursesTeaching: ["2"]
  },
  {
    id: "4",
    name: "Dr. Marie Curie",
    email: "marie.curie@university.edu",
    department: "Physics",
    title: "Professor",
    coursesTeaching: ["3", "4"]
  },
  {
    id: "5",
    name: "Dr. Albert Einstein",
    email: "albert.einstein@university.edu",
    department: "Physics",
    title: "Distinguished Professor",
    coursesTeaching: ["4"]
  }
];

export let grades: Grade[] = [
  {
    id: "1",
    studentId: "1",
    courseId: "1",
    grade: "A",
    numericGrade: 95,
    semester: "Fall 2025"
  },
  {
    id: "2",
    studentId: "1",
    courseId: "2",
    grade: "A",
    numericGrade: 97,
    semester: "Fall 2025"
  },
  {
    id: "3",
    studentId: "2",
    courseId: "2",
    grade: "A-",
    numericGrade: 91,
    semester: "Fall 2025"
  },
  {
    id: "4",
    studentId: "2",
    courseId: "3",
    grade: "B+",
    numericGrade: 88,
    semester: "Fall 2025"
  },
  {
    id: "5",
    studentId: "3",
    courseId: "1",
    grade: "A",
    numericGrade: 96,
    semester: "Fall 2025"
  },
  {
    id: "6",
    studentId: "3",
    courseId: "4",
    grade: "A-",
    numericGrade: 92,
    semester: "Fall 2025"
  },
  {
    id: "7",
    studentId: "4",
    courseId: "3",
    grade: "B+",
    numericGrade: 87,
    semester: "Fall 2025"
  },
  {
    id: "8",
    studentId: "5",
    courseId: "1",
    grade: "B",
    numericGrade: 85,
    semester: "Fall 2025"
  }
  ,
  {
    id: "9",
    studentId: "6",
    courseId: "5",
    grade: "A-",
    numericGrade: 92,
    semester: "Fall 2025"
  },
  {
    id: "10",
    studentId: "7",
    courseId: "2",
    grade: "B+",
    numericGrade: 88,
    semester: "Fall 2025"
  },
  {
    id: "11",
    studentId: "8",
    courseId: "3",
    grade: "A",
    numericGrade: 95,
    semester: "Fall 2025"
  },
  {
    id: "12",
    studentId: "9",
    courseId: "4",
    grade: "B",
    numericGrade: 84,
    semester: "Fall 2025"
  },
  {
    id: "13",
    studentId: "10",
    courseId: "2",
    grade: "A-",
    numericGrade: 93,
    semester: "Fall 2025"
  }
];
