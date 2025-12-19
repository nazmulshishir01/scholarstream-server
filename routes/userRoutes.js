import express from 'express';
import { ObjectId } from 'mongodb';
import { getCollections } from '../config/db.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();


router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { role, search } = req.query;
    const { users } = getCollections();
    
    let query = {};
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const result = await users.find(query).toArray();
    res.json(result);
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});


router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { users } = getCollections();
    
    const user = await users.findOne({ email });
    res.json(user || {});
  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});


router.get('/role/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { users } = getCollections();
    
    const user = await users.findOne({ email });
    res.json({ role: user?.role || 'student' });
  } catch (error) {
    console.error('Get Role Error:', error);
    res.status(500).json({ message: 'Error fetching role' });
  }
});


router.post('/', async (req, res) => {
  try {
    const user = req.body;
    const { users } = getCollections();

    const existingUser = await users.findOne({ email: user.email });
    if (existingUser) {
      return res.json({ message: 'User already exists', insertedId: null });
    }

    const newUser = {
      ...user,
      role: 'student',
      createdAt: new Date()
    };

    const result = await users.insertOne(newUser);
    res.json(result);
  } catch (error) {
    console.error('Create User Error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

export default router;