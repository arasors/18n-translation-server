import mongoose from 'mongoose';

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: GlobalMongoose | undefined;
}

const globalMongoose: GlobalMongoose = global.mongoose || {
  conn: null,
  promise: null,
};

global.mongoose = globalMongoose;

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('MongoDB URI is not defined in environment variables');
}

export async function connectDB() {
  if (globalMongoose.conn) {
    return globalMongoose.conn;
  }

  if (!globalMongoose.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'prop360',
    };

    globalMongoose.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    globalMongoose.conn = await globalMongoose.promise;
  } catch (e) {
    globalMongoose.promise = null;
    throw e;
  }

  return globalMongoose.conn;
} 