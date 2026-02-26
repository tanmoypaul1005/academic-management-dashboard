import { Course } from '@/types';
import { getCourses, createCourse } from '../data';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.max(1, parseInt(url.searchParams.get('limit') || '10'));

  const all = (await getCourses()).reverse();
  const start = (page - 1) * limit;
  const end = start + limit;
  const paged = all.slice(start, end);
  const total = all.length;
  const totalPages = Math.ceil(total / limit);

  return Response.json({ data: paged, total, page, limit, totalPages });
}

export async function POST(request: Request) {
  const data = await request.json();
  const newCourse: Course = {
    ...data,
    id: Date.now().toString(),
    enrollmentCount: 0,
  };
  const saved = await createCourse(newCourse);
  return Response.json(saved, { status: 201 });
}
