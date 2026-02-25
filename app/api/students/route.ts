import { Student } from '@/types';
import { students, saveData } from '../data';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.max(1, parseInt(url.searchParams.get('limit') || '10'));

  const start = (page - 1) * limit;
  const end = start + limit;
  const paged = students.slice(start, end);
  const total = students.length;
  const totalPages = Math.ceil(total / limit);

  return Response.json({ data: paged, total, page, limit, totalPages });
}

export async function POST(request: Request) {
  const data = await request.json();
  const newStudent: Student = {
    ...data,
    id: Date.now().toString(),
  };
  students.push(newStudent);
  saveData();
  return Response.json(newStudent, { status: 201 });
}
