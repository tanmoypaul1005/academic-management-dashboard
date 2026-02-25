import { grades } from '../../data';
import { Grade } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const grade = grades.find((g: Grade) => g.id === params.id);
  if (!grade) {
    return Response.json({ error: 'Grade not found' }, { status: 404 });
  }
  return Response.json(grade);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await request.json();
  const index = grades.findIndex((g: Grade) => g.id === params.id);
  
  if (index === -1) {
    return Response.json({ error: 'Grade not found' }, { status: 404 });
  }
  
  grades[index] = { ...grades[index], ...data };
  return Response.json(grades[index]);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const index = grades.findIndex((g: Grade) => g.id === params.id);
  
  if (index === -1) {
    return Response.json({ error: 'Grade not found' }, { status: 404 });
  }
  
  grades.splice(index, 1);
  return Response.json({ success: true });
}
