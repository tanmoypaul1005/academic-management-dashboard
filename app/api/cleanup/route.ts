import clientPromise from '@/lib/mongodb';

const DB_NAME = process.env.MONGODB_DB || 'academic-management-dashboard';

// One-time endpoint to remove duplicate documents (same custom `id` field, different MongoDB _id).
// Call once: GET /api/cleanup
export async function GET() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const collections = ['students', 'courses', 'faculty', 'grades'] as const;
  const report: Record<string, number> = {};

  for (const col of collections) {
    const all = await db.collection(col).find({}).toArray();
    const seen = new Map<string, string>(); // id → _id (keep first)
    let removed = 0;

    for (const doc of all) {
      const customId = doc.id as string;
      if (!customId) continue;
      if (seen.has(customId)) {
        // Duplicate — delete this one (keep the first occurrence)
        await db.collection(col).deleteOne({ _id: doc._id });
        removed++;
      } else {
        seen.set(customId, String(doc._id));
      }
    }

    report[col] = removed;
  }

  return Response.json({ success: true, duplicatesRemoved: report });
}
