import { MongoClient } from 'mongodb';

const uri = (process.env.MONGODB_URI || 'mongodb+srv://gadget-storebd:WJqb12kP4tHYGEB2@cluster0.nswkl.mongodb.net/academic-management-dashboard?retryWrites=true&w=majority') as string;

if (!uri) {
  throw new Error('Please add MONGODB_URI to your .env.local (or Vercel environment variables)');
}

// Reuse connection across hot-reloads in dev (avoid exhausting connections)
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

function createClientPromise(): Promise<MongoClient> {
  const client = new MongoClient(uri);
  return client.connect().then((c) => {
    console.log('✅ MongoDB connected successfully');
    return c;
  });
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = createClientPromise();
}

export default clientPromise;
