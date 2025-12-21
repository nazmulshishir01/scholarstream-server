import { MongoClient, ServerApiVersion } from 'mongodb';

let client = null;
let db = null;

// Serverless-compatible MongoDB connection
const connectDB = async () => {
  // If already connected, return existing connection
  if (db) {
    return db;
  }

  try {
    // Check if MONGODB_URI exists
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    client = new MongoClient(process.env.MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
      }
    });

    await client.connect();
    db = client.db("scholarstream");
    console.log("✅ Connected to MongoDB!");
    return db;
    
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error; // Don't exit, throw error for serverless
  }
};

// Get database instance (ensures connection)
export const getDB = async () => {
  if (!db) {
    await connectDB();
  }
  return db;
};

// Get all collections (async for serverless)
export const getCollections = async () => {
  const database = await getDB();
  return {
    users: database.collection("users"),
    scholarships: database.collection("scholarships"),
    applications: database.collection("applications"),
    reviews: database.collection("reviews"),
    payments: database.collection("payments")
  };
};

export default connectDB;