import mongoose from "mongoose";

// Register all schemas before populate/ref lookups (order: User before CustodyEntry).
import "@/models/User";
import "@/models/CustodyEntry";
import "@/models/TrackingYear";
import "@/models/ExpenseCategory";
import "@/models/Expense";
import "@/models/MonthlyBudget";
import "@/models/NotificationSettings";
import "@/models/PushSubscription";

function resolveMongoUri(): string {
  const uri = process.env.MONGODB_URI?.trim();
  if (uri) return uri;
  // On Vercel, never fall back to localhost — that hides a missing env var.
  if (process.env.VERCEL) {
    throw new Error(
      "MONGODB_URI is not set. In Vercel: Project → Settings → Environment Variables, add MONGODB_URI for Production (and Preview if you use it), then redeploy.",
    );
  }
  return "mongodb://localhost:27017/nido";
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectMongo(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(resolveMongoUri());
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
