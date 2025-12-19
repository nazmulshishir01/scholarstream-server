import express from 'express';
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
    res.status(500).json({ message: 'Error fetching role' });
  }
});

export default router;
