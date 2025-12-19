import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/', (req, res) => {
  res.send('🎓 ScholarStream Server is Running!');
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 ScholarStream Server is running on port ${port}`);
});