import express from 'express';
import { ObjectId } from 'mongodb';
import { getCollections } from '../config/db.js';
import { verifyToken, verifyModerator } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { reviews } = await getCollections();  // ✅ await
    const result = await reviews.find({}).sort({ reviewDate: -1 }).toArray();
    res.json(result);
  } catch (error) {
    console.error('Get Reviews Error:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

router.get('/scholarship/:scholarshipId', async (req, res) => {
  try {
    const { scholarshipId } = req.params;
    const { reviews } = await getCollections();  // ✅ await
    const result = await reviews.find({ scholarshipId }).sort({ reviewDate: -1 }).toArray();
    res.json(result);
  } catch (error) {
    console.error('Get Scholarship Reviews Error:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

router.get('/user/:email', verifyToken, async (req, res) => {
  try {
    const { email } = req.params;
    const { reviews } = await getCollections();  // ✅ await
    const result = await reviews.find({ userEmail: email }).sort({ reviewDate: -1 }).toArray();
    res.json(result);
  } catch (error) {
    console.error('Get User Reviews Error:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const review = req.body;
    const { reviews } = await getCollections();  // ✅ await

    if (review.ratingPoint < 1 || review.ratingPoint > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const newReview = {
      ...review,
      reviewDate: new Date().toISOString(),
      createdAt: new Date()
    };
    const result = await reviews.insertOne(newReview);
    res.json(result);
  } catch (error) {
    console.error('Create Review Error:', error);
    res.status(500).json({ message: 'Error creating review' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { reviews } = await getCollections();  // ✅ await
    delete updates._id;

    if (updates.ratingPoint && (updates.ratingPoint < 1 || updates.ratingPoint > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const result = await reviews.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    res.json(result);
  } catch (error) {
    console.error('Update Review Error:', error);
    res.status(500).json({ message: 'Error updating review' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reviews } = await getCollections();  // ✅ await
    const result = await reviews.deleteOne({ _id: new ObjectId(id) });
    res.json(result);
  } catch (error) {
    console.error('Delete Review Error:', error);
    res.status(500).json({ message: 'Error deleting review' });
  }
});

router.delete('/:id/moderate', verifyToken, verifyModerator, async (req, res) => {
  try {
    const { id } = req.params;
    const { reviews } = await getCollections();  // ✅ await
    const result = await reviews.deleteOne({ _id: new ObjectId(id) });
    res.json(result);
  } catch (error) {
    console.error('Moderate Review Error:', error);
    res.status(500).json({ message: 'Error moderating review' });
  }
});

export default router;