import { MongoClient, ServerApiVersion } from 'mongodb';

let client = null;
let db = null;


const connectDB = async () => {
  
  if (db) {
    return db;
  }

  try {
    
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
    throw error; 
  }
};


export const getDB = async () => {
  if (!db) {
    await connectDB();
  }
  return db;
};


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