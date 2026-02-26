import { Grade } from '@/types';
import { getGrades, createGrade } from '../data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId') ?? undefined;
  const courseId = searchParams.get('courseId') ?? undefined;

  const result = await getGrades({ studentId, courseId });
  return Response.json(result);
}

export async function POST(request: Request) {
  const data = await request.json();
  const newGrade: Grade = {
    ...data,
    id: Date.now().toString(),
  };
  const saved = await createGrade(newGrade);
  return Response.json(saved, { status: 201 });
}
