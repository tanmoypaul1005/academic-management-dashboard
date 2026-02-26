import { getGradeById, updateGrade, deleteGrade } from '../../data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const grade = await getGradeById(id);
  if (!grade) {
    return Response.json({ error: 'Grade not found' }, { status: 404 });
  }
  return Response.json(grade);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();
  const updated = await updateGrade(id, data);
  if (!updated) {
    return Response.json({ error: 'Grade not found' }, { status: 404 });
  }
  return Response.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = await deleteGrade(id);
  if (!ok) {
    return Response.json({ error: 'Grade not found' }, { status: 404 });
  }
  return Response.json({ success: true });
}
