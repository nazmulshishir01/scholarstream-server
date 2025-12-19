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

    
    if (category && category !== 'all') {
      query.scholarshipCategory = category;
    }

    
    if (country && country !== 'all') {
      query.universityCountry = country;
    }

    
    if (degree && degree !== 'all') {
      query.degree = degree;
    }

    
    let sortOption = {};
    switch (sort) {
      case 'fees-asc':
        sortOption = { applicationFees: 1 };
        break;
      case 'fees-desc':
        sortOption = { applicationFees: -1 };
        break;
      case 'date-asc':
        sortOption = { scholarshipPostDate: 1 };
        break;
      case 'date-desc':
      default:
        sortOption = { scholarshipPostDate: -1 };
    }

    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await scholarships.countDocuments(query);
    const result = await scholarships
      .find(query)
      .sort(sortOption)
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