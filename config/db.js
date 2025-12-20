import { MongoClient, ServerApiVersion } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

const connectDB = async () => {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    // TLS options added for Vercel compatibility
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
      },
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 60000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    const db = client.db("scholarstream");
    
    cachedClient = client;
    cachedDb = db;
    
    console.log("✅ Connected to MongoDB!");
    return { client, db };
    
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
};

export const getDB = async () => {
  if (!cachedDb) {
    await connectDB();
  }
  return cachedDb;
};

export const getCollections = async () => {
  const db = await getDB();
  return {
    users: db.collection("users"),
    scholarships: db.collection("scholarships"),
    applications: db.collection("applications"),
    reviews: db.collection("reviews"),
    payments: db.collection("payments")
  };
};

export default connectDB;
