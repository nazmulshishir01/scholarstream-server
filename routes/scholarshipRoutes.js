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


router.get('/related/:category/:id', async (req, res) => {
  try {
    const { category, id } = req.params;
    const { scholarships } = getCollections();

    const result = await scholarships
      .find({
        scholarshipCategory: category,
        _id: { $ne: new ObjectId(id) }
      })
      .limit(3)
      .toArray();

    res.json(result);
  } catch (error) {
    console.error('Get Related Scholarships Error:', error);
    res.status(500).json({ message: 'Error fetching related scholarships' });
  }
});


router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const scholarship = req.body;
    const { scholarships } = getCollections();

    const newScholarship = {
      ...scholarship,
      postedUserEmail: req.decoded.email,
      scholarshipPostDate: new Date().toISOString(),
      createdAt: new Date()
    };

    const result = await scholarships.insertOne(newScholarship);
    res.json(result);
  } catch (error) {
    console.error('Create Scholarship Error:', error);
    res.status(500).json({ message: 'Error creating scholarship' });
  }
});


router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const scholarship = req.body;
    const { scholarships } = getCollections();

    
    delete scholarship._id;

    const result = await scholarships.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...scholarship, updatedAt: new Date() } }
    );

    res.json(result);
  } catch (error) {
    console.error('Update Scholarship Error:', error);
    res.status(500).json({ message: 'Error updating scholarship' });
  }
});


router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { scholarships } = getCollections();

    const result = await scholarships.deleteOne({ _id: new ObjectId(id) });
    res.json(result);
  } catch (error) {
    console.error('Delete Scholarship Error:', error);
    res.status(500).json({ message: 'Error deleting scholarship' });
  }
});

export default router;
