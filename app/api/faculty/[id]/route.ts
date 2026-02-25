import { faculty } from '../../data';
import { Faculty } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const member = faculty.find((f: Faculty) => f.id === id);
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
  const index = faculty.findIndex((f: Faculty) => f.id === id);
  
  if (index === -1) {
    return Response.json({ error: 'Faculty not found' }, { status: 404 });
  }
  
  faculty[index] = { ...faculty[index], ...data };
  return Response.json(faculty[index]);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = faculty.findIndex((f: Faculty) => f.id === id);
  
  if (index === -1) {
    return Response.json({ error: 'Faculty not found' }, { status: 404 });
  }
  
  faculty.splice(index, 1);
  return Response.json({ success: true });
}
