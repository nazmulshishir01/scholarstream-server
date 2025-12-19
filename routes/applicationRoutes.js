import express from 'express';
import { ObjectId } from 'mongodb';
import { getCollections } from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const email = req.decoded.email;
    const { users, applications } = getCollections();

    const user = await users.findOne({ email });

    let query = {};

    if (user?.role !== 'admin' && user?.role !== 'moderator') {
      query.userEmail = email;
    }

    const result = await applications
      .find(query)
      .sort({ applicationDate: -1 })
      .toArray();

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

router.get('/user/:email', verifyToken, async (req, res) => {
  try {
    const { email } = req.params;
    const { applications } = getCollections();

    const result = await applications
      .find({ userEmail: email })
      .sort({ applicationDate: -1 })
      .toArray();

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { applications } = getCollections();

    const application = await applications.findOne({ _id: new ObjectId(id) });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching application' });
  }
});

export default router;
