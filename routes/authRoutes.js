import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();


router.post('/', async (req, res) => {
  try {
    const user = req.body;
    
    if (!user.email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const token = jwt.sign(
      { email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (error) {
    console.error('JWT Error:', error);
    res.status(500).json({ message: 'Error generating token' });
  }
});

export default router;
