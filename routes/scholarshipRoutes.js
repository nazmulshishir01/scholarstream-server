import express from 'express';
import { ObjectId } from 'mongodb';
import { getCollections } from '../config/db.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /scholarships - Get All with Search, Filter, Sort, Pagination
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      category, 
      country, 
      degree, 
      sort, 
      page = 1, 
      limit = 9 
    } = req.query;
    
    const { scholarships } = getCollections();
    let query = {};

    // Server-side Search by scholarship name, university name, or degree
    if (search) {
      query.$or = [
        { scholarshipName: { $regex: search, $options: 'i' } },
        { universityName: { $regex: search, $options: 'i' } },
        { degree: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await scholarships.countDocuments(query);
    const result = await scholarships
      .find(query)
      .skip(skip)
      .limit(limitNum)
      .toArray();

    res.json({
      scholarships: result,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total
    });
  } catch (error) {
    console.error('Get Scholarships Error:', error);
    res.status(500).json({ message: 'Error fetching scholarships' });
  }
});

// GET /scholarships/top - Get Top 6 Scholarships
router.get('/top', async (req, res) => {
  try {
    const { scholarships } = getCollections();
    
    const result = await scholarships
      .find({})
      .sort({ applicationFees: 1 })
      .limit(6)
      .toArray();

    res.json(result);
  } catch (error) {
    console.error('Get Top Scholarships Error:', error);
    res.status(500).json({ message: 'Error fetching top scholarships' });
  }
});

// GET /scholarships/categories - Get Filter Categories
router.get('/categories', async (req, res) => {
  try {
    const { scholarships } = getCollections();

    const categories = await scholarships.distinct('scholarshipCategory');
    const countries = await scholarships.distinct('universityCountry');
    const degrees = await scholarships.distinct('degree');
    const subjects = await scholarships.distinct('subjectCategory');

    res.json({ categories, countries, degrees, subjects });
  } catch (error) {
    console.error('Get Categories Error:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// GET /scholarships/:id - Get Single Scholarship
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { scholarships } = getCollections();

    const scholarship = await scholarships.findOne({ _id: new ObjectId(id) });
    
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    res.json(scholarship);
  } catch (error) {
    console.error('Get Scholarship Error:', error);
    res.status(500).json({ message: 'Error fetching scholarship' });
  }
});

export default router;