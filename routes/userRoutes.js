import express from 'express';
import { ObjectId } from 'mongodb';
import { getCollections } from '../config/db.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { role, search } = req.query;
    const { users } = await getCollections();  // ✅ await
    
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
    const { users } = await getCollections();  // ✅ await
    
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
    const { users } = await getCollections();  // ✅ await
    
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
    const { users } = await getCollections();  // ✅ await

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

router.patch('/:email', verifyToken, async (req, res) => {
  try {
    const { email } = req.params;
    const updates = req.body;
    const { users } = await getCollections();  // ✅ await

    delete updates.role;
    delete updates._id;

    const result = await users.updateOne(
      { email },
      { $set: updates }
    );

    res.json(result);
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

router.patch('/:id/role', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const { users } = await getCollections();  // ✅ await

    const validRoles = ['student', 'moderator', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const result = await users.updateOne(
      { _id: new ObjectId(id) },
      { $set: { role } }
    );

    res.json(result);
  } catch (error) {
    console.error('Update Role Error:', error);
    res.status(500).json({ message: 'Error updating role' });
  }
});

router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { users } = await getCollections();  // ✅ await

    const result = await users.deleteOne({ _id: new ObjectId(id) });
    res.json(result);
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

export default router;