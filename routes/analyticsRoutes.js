import express from 'express';
import { getCollections } from '../config/db.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { users, scholarships, applications } = await getCollections();  // ✅ await

    const totalUsers = await users.countDocuments();
    const totalScholarships = await scholarships.countDocuments();
    const totalApplications = await applications.countDocuments();

    const paidApplications = await applications.find({ paymentStatus: 'paid' }).toArray();
    const totalFeesCollected = paidApplications.reduce((sum, app) => {
      return sum + (app.applicationFees || 0) + (app.serviceCharge || 0);
    }, 0);

    const applicationsByUniversity = await applications.aggregate([
      { $group: { _id: '$universityName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]).toArray();

    const applicationsByCategory = await applications.aggregate([
      { $group: { _id: '$scholarshipCategory', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]).toArray();

    const statusCounts = {
      pending: await applications.countDocuments({ applicationStatus: 'pending' }),
      processing: await applications.countDocuments({ applicationStatus: 'processing' }),
      completed: await applications.countDocuments({ applicationStatus: 'completed' }),
      rejected: await applications.countDocuments({ applicationStatus: 'rejected' })
    };

    const userRoles = {
      student: await users.countDocuments({ role: 'student' }),
      moderator: await users.countDocuments({ role: 'moderator' }),
      admin: await users.countDocuments({ role: 'admin' })
    };

    const paymentStatus = {
      paid: await applications.countDocuments({ paymentStatus: 'paid' }),
      unpaid: await applications.countDocuments({ paymentStatus: 'unpaid' })
    };

    res.json({
      totalUsers,
      totalScholarships,
      totalApplications,
      totalFeesCollected,
      applicationsByUniversity,
      applicationsByCategory,
      statusCounts,
      userRoles,
      paymentStatus
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

router.get('/summary', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { users, scholarships, applications } = await getCollections();  // ✅ await

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