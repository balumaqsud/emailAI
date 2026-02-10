import mongoose from "mongoose";

type MongooseConnectionState = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConnection: MongooseConnectionState | undefined;
}

let cached: MongooseConnectionState =
  global._mongooseConnection ?? { conn: null, promise: null };

if (!global._mongooseConnection) {
  global._mongooseConnection = cached;
}

/**
 * Establish a cached MongoDB connection using mongoose.
 * In development, this avoids creating multiple connections during hot reloads.
 */
export async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Please define it in your environment.",
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      // Add any stable connection options here as needed
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

