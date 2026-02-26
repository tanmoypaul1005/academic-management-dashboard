import { Student, Course, Faculty, Grade } from '@/types';
import clientPromise from '@/lib/mongodb';

const DB_NAME = process.env.MONGODB_DB || 'academic-management-dashboard';

async function getDB() {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

// ─── Students ─────────────────────────────────────────────────────────────────

export async function getStudents(): Promise<Student[]> {
  const db = await getDB();
  const all = (
    await db
      .collection<Student>('students')
      .find({}, { projection: { _id: 0 } })
      .toArray()
  ).reverse();
  // Deduplicate by custom id in case of duplicate MongoDB documents
  const seen = new Set<string>();
  return all.filter(s => { if (seen.has(s.id)) return false; seen.add(s.id); return true; });
}

export async function getStudentById(id: string): Promise<Student | null> {
  const db = await getDB();
  return db.collection<Student>('students').findOne({ id }, { projection: { _id: 0 } });
}

export async function createStudent(student: Student): Promise<Student> {
  const db = await getDB();
  await db.collection('students').insertOne({ ...student });
  return student;
}

export async function updateStudent(id: string, data: Partial<Student>): Promise<Student | null> {
  const db = await getDB();
  // Deduplicate enrolledCourses before persisting
  if (Array.isArray(data.enrolledCourses)) {
    data = { ...data, enrolledCourses: [...new Set(data.enrolledCourses)] };
  }
  const result = await db.collection<Student>('students').findOneAndUpdate(
    { id },
    { $set: data },
    { returnDocument: 'after', projection: { _id: 0 } }
  );
  return result ?? null;
}

export async function deleteStudent(id: string): Promise<boolean> {
  const db = await getDB();
  const result = await db.collection('students').deleteOne({ id });
  return result.deletedCount === 1;
}

// ─── Courses ──────────────────────────────────────────────────────────────────

export async function getCourses(): Promise<Course[]> {
  const db = await getDB();
  const all = await db.collection<Course>('courses').find({}, { projection: { _id: 0 } }).toArray();
  // Deduplicate by custom id in case of duplicate MongoDB documents
  const seen = new Set<string>();
  return all.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });
}

export async function getCourseById(id: string): Promise<Course | null> {
  const db = await getDB();
  return db.collection<Course>('courses').findOne({ id }, { projection: { _id: 0 } });
}

export async function createCourse(course: Course): Promise<Course> {
  const db = await getDB();
  await db.collection('courses').insertOne({ ...course });
  return course;
}

export async function updateCourse(id: string, data: Partial<Course>): Promise<Course | null> {
  const db = await getDB();
  const result = await db.collection<Course>('courses').findOneAndUpdate(
    { id },
    { $set: data },
    { returnDocument: 'after', projection: { _id: 0 } }
  );
  return result ?? null;
}

export async function deleteCourse(id: string): Promise<boolean> {
  const db = await getDB();
  const result = await db.collection('courses').deleteOne({ id });
  return result.deletedCount === 1;
}

// ─── Faculty ──────────────────────────────────────────────────────────────────

export async function getFaculty(): Promise<Faculty[]> {
  const db = await getDB();
  return db.collection<Faculty>('faculty').find({}, { projection: { _id: 0 } }).toArray();
}

export async function getFacultyById(id: string): Promise<Faculty | null> {
  const db = await getDB();
  return db.collection<Faculty>('faculty').findOne({ id }, { projection: { _id: 0 } });
}

export async function createFaculty(member: Faculty): Promise<Faculty> {
  const db = await getDB();
  await db.collection('faculty').insertOne({ ...member });
  return member;
}

export async function updateFaculty(id: string, data: Partial<Faculty>): Promise<Faculty | null> {
  const db = await getDB();
  const result = await db.collection<Faculty>('faculty').findOneAndUpdate(
    { id },
    { $set: data },
    { returnDocument: 'after', projection: { _id: 0 } }
  );
  return result ?? null;
}

export async function deleteFaculty(id: string): Promise<boolean> {
  const db = await getDB();
  const result = await db.collection('faculty').deleteOne({ id });
  return result.deletedCount === 1;
}

// ─── Grades ───────────────────────────────────────────────────────────────────

export async function getGrades(filter?: { studentId?: string; courseId?: string }): Promise<Grade[]> {
  const db = await getDB();
  const query: Record<string, string> = {};
  if (filter?.studentId) query.studentId = filter.studentId;
  if (filter?.courseId) query.courseId = filter.courseId;
  return db.collection<Grade>('grades').find(query, { projection: { _id: 0 } }).toArray();
}

export async function getGradeById(id: string): Promise<Grade | null> {
  const db = await getDB();
  return db.collection<Grade>('grades').findOne({ id }, { projection: { _id: 0 } });
}

export async function createGrade(grade: Grade): Promise<Grade> {
  const db = await getDB();
  await db.collection('grades').insertOne({ ...grade });
  return grade;
}

export async function updateGrade(id: string, data: Partial<Grade>): Promise<Grade | null> {
  const db = await getDB();
  const result = await db.collection<Grade>('grades').findOneAndUpdate(
    { id },
    { $set: data },
    { returnDocument: 'after', projection: { _id: 0 } }
  );
  return result ?? null;
}

export async function deleteGrade(id: string): Promise<boolean> {
  const db = await getDB();
  const result = await db.collection('grades').deleteOne({ id });
  return result.deletedCount === 1;
}


// â”€â”€â”€ Load from db.json (falls back to empty arrays if file missing) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€


// â”€â”€â”€ Persist current state back to db.json â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Exported mutable arrays â€” route handlers mutate these in-place, then call saveData()
// â”€â”€â”€ Legacy default data (kept for reference / first-run seeding) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
