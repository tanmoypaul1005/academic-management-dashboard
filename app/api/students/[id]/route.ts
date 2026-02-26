import { getStudentById, updateStudent, deleteStudent } from '../../data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) {
    return Response.json({ error: 'Student not found' }, { status: 404 });
  }
  return Response.json(student);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();
  const updated = await updateStudent(id, data);
  if (!updated) {
    return Response.json({ error: 'Student not found' }, { status: 404 });
  }
  return Response.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = await deleteStudent(id);
  if (!ok) {
    return Response.json({ error: 'Student not found' }, { status: 404 });
  }
  return Response.json({ success: true });
}
