import { getCourseById, updateCourse, deleteCourse } from '../../data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const course = await getCourseById(id);
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
  const updated = await updateCourse(id, data);
  if (!updated) {
    return Response.json({ error: 'Course not found' }, { status: 404 });
  }
  return Response.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = await deleteCourse(id);
  if (!ok) {
    return Response.json({ error: 'Course not found' }, { status: 404 });
  }
  return Response.json({ success: true });
}
