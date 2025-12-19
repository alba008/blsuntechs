// api/db.mjs
import { MongoClient } from "mongodb";

// Read URI once at module load
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI not set");
}

// Derive DB name: either explicit or from URI path
const dbName =
  process.env.MONGODB_DB ||
  (new URL(uri).pathname.replace("/", "") || "test");

let client;
let clientPromise;

/**
 * Get a connected MongoDB database instance.
 * This is safe for Vercel serverless because the module
 * is cached between invocations.
 */
export async function getDb() {
  // Lazily create and connect the client once
  if (!clientPromise) {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    clientPromise = client.connect();
  }

  // Wait for the client to be ready
  await clientPromise;
  return client.db(dbName);
}

// Optional default export if you prefer: import getDb from "./db.mjs";
export default getDb;
