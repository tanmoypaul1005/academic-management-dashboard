import { courses } from '../../data';
import { Course } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const course = courses.find((c: Course) => c.id === params.id);
  if (!course) {
    return Response.json({ error: 'Course not found' }, { status: 404 });
  }
  return Response.json(course);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await request.json();
  const index = courses.findIndex((c: Course) => c.id === params.id);
  
  if (index === -1) {
    return Response.json({ error: 'Course not found' }, { status: 404 });
  }
  
  courses[index] = { ...courses[index], ...data };
  return Response.json(courses[index]);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const index = courses.findIndex((c: Course) => c.id === params.id);
  
  if (index === -1) {
    return Response.json({ error: 'Course not found' }, { status: 404 });
  }
  
  courses.splice(index, 1);
  return Response.json({ success: true });
}
