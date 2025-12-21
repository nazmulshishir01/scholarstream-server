import { MongoClient, ServerApiVersion } from 'mongodb';

let db = null;
let client = null;

const connectDB = async () => {
  try {
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
    
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};


export const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};


export const getCollections = () => {
  const database = getDB();
  return {
    users: database.collection("users"),
    scholarships: database.collection("scholarships"),
    applications: database.collection("applications"),
    reviews: database.collection("reviews"),
    payments: database.collection("payments")
  };
};

export default connectDB;
