import { Grade } from '@/types';
import { grades } from '../data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');
  const courseId = searchParams.get('courseId');
  
  let filteredGrades = grades;
  
  if (studentId) {
    filteredGrades = filteredGrades.filter(g => g.studentId === studentId);
  }
  
  if (courseId) {
    filteredGrades = filteredGrades.filter(g => g.courseId === courseId);
  }
  
  return Response.json(filteredGrades);
}

export async function POST(request: Request) {
  const data = await request.json();
  const newGrade: Grade = {
    ...data,
    id: Date.now().toString(),
  };
  grades.push(newGrade);
  return Response.json(newGrade, { status: 201 });
}
