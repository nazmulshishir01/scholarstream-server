import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import scholarshipRoutes from './routes/scholarshipRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://scholarstream-bd.web.app',
    'https://scholarstream-bd.firebaseapp.com'
  ],
  credentials: true
}));
app.use(express.json());

// Database connection middleware - connects before handling any request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// Routes
app.use('/jwt', authRoutes);
app.use('/users', userRoutes);
app.use('/scholarships', scholarshipRoutes);
app.use('/applications', applicationRoutes);
app.use('/reviews', reviewRoutes);
app.use('/payments', paymentRoutes);
app.use('/analytics', analyticsRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('🎓 ScholarStream Server is Running!');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

// Only listen in development (not in serverless)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`🚀 ScholarStream Server is running on port ${port}`);
  });
}

// Export for Vercel serverless
export default app;