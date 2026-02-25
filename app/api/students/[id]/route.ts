import { students, saveData } from '../../data';
import { Student } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const student = students.find((s: Student) => s.id === id);
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
  const index = students.findIndex((s: Student) => s.id === id);
  
  if (index === -1) {
    return Response.json({ error: 'Student not found' }, { status: 404 });
  }
  
  students[index] = { ...students[index], ...data };
  saveData();
  return Response.json(students[index]);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = students.findIndex((s: Student) => s.id === id);
  
  if (index === -1) {
    return Response.json({ error: 'Student not found' }, { status: 404 });
  }
  
  students.splice(index, 1);
  saveData();
  return Response.json({ success: true });
}
