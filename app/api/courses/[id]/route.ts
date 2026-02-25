import { courses, saveData } from '../../data';
import { Course } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const course = courses.find((c: Course) => c.id === id);
  if (!course) {
    return Response.json({ error: 'Course not found' }, { status: 404 });
  }
  return Response.json(course);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();
  const index = courses.findIndex((c: Course) => c.id === id);
  
  if (index === -1) {
    return Response.json({ error: 'Course not found' }, { status: 404 });
  }
  
  courses[index] = { ...courses[index], ...data };
  saveData();
  return Response.json(courses[index]);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = courses.findIndex((c: Course) => c.id === id);
  
  if (index === -1) {
    return Response.json({ error: 'Course not found' }, { status: 404 });
  }
  
  courses.splice(index, 1);
  saveData();
  return Response.json({ success: true });
}
