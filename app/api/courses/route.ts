import { Course } from '@/types';
import { courses } from '../data';

export async function GET() {
  return Response.json(courses);
}

export async function POST(request: Request) {
  const data = await request.json();
  const newCourse: Course = {
    ...data,
    id: Date.now().toString(),
    enrollmentCount: 0,
  };
  courses.push(newCourse);
  return Response.json(newCourse, { status: 201 });
}
