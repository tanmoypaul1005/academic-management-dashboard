import { Student, Course, Faculty, Grade } from '@/types';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// â”€â”€â”€ Load from db.json (falls back to empty arrays if file missing) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function loadDB(): { students: Student[]; courses: Course[]; faculty: Faculty[]; grades: Grade[] } {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { students: [], courses: [], faculty: [], grades: [] };
  }
}

const _db = loadDB();

// â”€â”€â”€ Persist current state back to db.json â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function saveData(): void {
  try {
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify({ students, courses, faculty, grades }, null, 2),
      'utf-8'
    );
  } catch (err) {
    console.error('[saveData] Failed to write db.json:', err);
  }
}

// Exported mutable arrays â€” route handlers mutate these in-place, then call saveData()
export const students: Student[] = _db.students;
export const courses: Course[]   = _db.courses;
export const faculty: Faculty[]  = _db.faculty;
export const grades: Grade[]     = _db.grades;

// â”€â”€â”€ Legacy default data (kept for reference / first-run seeding) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
