import { Student } from '@/types';
import { students } from '../data';

export async function GET() {
  return Response.json(students);
}

export async function POST(request: Request) {
  const data = await request.json();
  const newStudent: Student = {
    ...data,
    id: Date.now().toString(),
  };
  students.push(newStudent);
  return Response.json(newStudent, { status: 201 });
}
