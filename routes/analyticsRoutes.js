import express from 'express';
import { getCollections } from '../config/db.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get full analytics (Admin only)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { users, scholarships, applications, payments } = await getCollections();

    // Basic counts
    const totalUsers = await users.countDocuments();
    const totalScholarships = await scholarships.countDocuments();
    const totalApplications = await applications.countDocuments();

    // Total fees collected
    const paidApplications = await applications
      .find({ paymentStatus: 'paid' })
      .toArray();
    
    const totalFeesCollected = paidApplications.reduce((sum, app) => {
      return sum + (app.applicationFees || 0) + (app.serviceCharge || 0);
    }, 0);

    // Applications by university
    const applicationsByUniversity = await applications.aggregate([
      { $group: { _id: '$universityName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]).toArray();

    // Applications by category
    const applicationsByCategory = await applications.aggregate([
      { $group: { _id: '$scholarshipCategory', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]).toArray();

    // Applications by degree
    const applicationsByDegree = await applications.aggregate([
      { $group: { _id: '$degree', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]).toArray();

    // Status counts
    const statusCounts = {
      pending: await applications.countDocuments({ applicationStatus: 'pending' }),
      processing: await applications.countDocuments({ applicationStatus: 'processing' }),
      completed: await applications.countDocuments({ applicationStatus: 'completed' }),
      rejected: await applications.countDocuments({ applicationStatus: 'rejected' })
    };

    // User roles count
    const userRoles = {
      student: await users.countDocuments({ role: 'student' }),
      moderator: await users.countDocuments({ role: 'moderator' }),
      admin: await users.countDocuments({ role: 'admin' })
    };

    // Payment status
    const paymentStatus = {
      paid: await applications.countDocuments({ paymentStatus: 'paid' }),
      unpaid: await applications.countDocuments({ paymentStatus: 'unpaid' })
    };

    // Monthly applications (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyApplications = await applications.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: '$_id.month' }
            ]
          },
          count: 1,
          _id: 0
        }
      }
    ]).toArray();

    // Recent applications
    const recentApplications = await applications
      .find({})
      .sort({ applicationDate: -1 })
      .limit(5)
      .toArray();

    res.json({
      totalUsers,
      totalScholarships,
      totalApplications,
      totalFeesCollected,
      applicationsByUniversity,
      applicationsByCategory,
      applicationsByDegree,
      statusCounts,
      userRoles,
      paymentStatus,
      monthlyApplications,
      recentApplications
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

// Get summary stats (Admin only)
router.get('/summary', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { users, scholarships, applications } = await getCollections();

    const stats = {
      totalUsers: await users.countDocuments(),
      totalScholarships: await scholarships.countDocuments(),
      totalApplications: await applications.countDocuments(),
      pendingApplications: await applications.countDocuments({ applicationStatus: 'pending' }),
      completedApplications: await applications.countDocuments({ applicationStatus: 'completed' })
    };

    res.json(stats);
  } catch (error) {
    console.error('Summary Stats Error:', error);
    res.status(500).json({ message: 'Error fetching summary stats' });
  }
});

export default router;