import { Faculty } from '@/types';
import { getFaculty, createFaculty } from '../data';

export async function GET() {
  const all = await getFaculty();
  return Response.json(all);
}

export async function POST(request: Request) {
  const data = await request.json();
  const newFaculty: Faculty = {
    ...data,
    id: Date.now().toString(),
  };
  const saved = await createFaculty(newFaculty);
  return Response.json(saved, { status: 201 });
}
