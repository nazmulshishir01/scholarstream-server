import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

let cachedClient = null;
let cachedDb = null;

const connectDB = async () => {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }
    
    cachedDb = cachedClient.db("scholarstream");
    console.log("✅ Connected to MongoDB!");
    return cachedDb;
    
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
};

export const getDB = async () => {
  return await connectDB();
};

export const getCollections = async () => {
  const db = await connectDB();
  return {
    users: db.collection("users"),
    scholarships: db.collection("scholarships"),
    applications: db.collection("applications"),
    reviews: db.collection("reviews"),
    payments: db.collection("payments")
  };
};

export default connectDB;