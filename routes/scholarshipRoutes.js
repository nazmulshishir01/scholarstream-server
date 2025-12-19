import express from 'express';
import { ObjectId } from 'mongodb';
import { getCollections } from '../config/db.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();


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

   
    if (search) {
      query.$or = [
        { scholarshipName: { $regex: search, $options: 'i' } },
        { universityName: { $regex: search, $options: 'i' } },
        { degree: { $regex: search, $options: 'i' } }
      ];
    }

   
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

    // Server-side Search
    if (search) {
      query.$or = [
        { scholarshipName: { $regex: search, $options: 'i' } },
        { universityName: { $regex: search, $options: 'i' } },
        { degree: { $regex: search, $options: 'i' } }
      ];
    }

    // Server-side Filter by category
    if (category && category !== 'all') {
      query.scholarshipCategory = category;
    }

    // Server-side Filter by country
    if (country && country !== 'all') {
      query.universityCountry = country;
    }

    // Server-side Filter by degree
    if (degree && degree !== 'all') {
      query.degree = degree;
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