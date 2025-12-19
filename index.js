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

connectDB();

app.use('/jwt', authRoutes);
app.use('/users', userRoutes);
app.use('/scholarships', scholarshipRoutes);
app.use('/applications', applicationRoutes);
app.use('/reviews', reviewRoutes);
app.use('/payments', paymentRoutes);
app.use('/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.send('🎓 ScholarStream Server is Running!');
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`🚀 ScholarStream Server is running on port ${port}`);
});