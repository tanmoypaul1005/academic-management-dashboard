import { getFacultyById, updateFaculty, deleteFaculty } from '../../data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const member = await getFacultyById(id);
  if (!member) {
    return Response.json({ error: 'Faculty not found' }, { status: 404 });
  }
  return Response.json(member);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();
  const updated = await updateFaculty(id, data);
  if (!updated) {
    return Response.json({ error: 'Faculty not found' }, { status: 404 });
  }
  return Response.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = await deleteFaculty(id);
  if (!ok) {
    return Response.json({ error: 'Faculty not found' }, { status: 404 });
  }
  return Response.json({ success: true });
}
