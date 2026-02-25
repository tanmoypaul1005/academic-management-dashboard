import { Faculty } from '@/types';
import { faculty } from '../data';

export async function GET() {
  return Response.json(faculty);
}

export async function POST(request: Request) {
  const data = await request.json();
  const newFaculty: Faculty = {
    ...data,
    id: Date.now().toString(),
  };
  faculty.push(newFaculty);
  return Response.json(newFaculty, { status: 201 });
}
