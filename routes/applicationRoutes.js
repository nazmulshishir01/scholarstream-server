import express from 'express';
import { ObjectId } from 'mongodb';
import { getCollections } from '../config/db.js';
import { verifyToken, verifyModerator } from '../middleware/auth.js';

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
    console.error('Get Applications Error:', error);
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
    console.error('Get User Applications Error:', error);
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
    console.error('Get Application Error:', error);
    res.status(500).json({ message: 'Error fetching application' });
  }
});


router.post('/', verifyToken, async (req, res) => {
  try {
    const application = req.body;
    const { applications } = getCollections();

    const newApplication = {
      ...application,
      applicationStatus: 'pending',
      paymentStatus: application.paymentStatus || 'unpaid',
      applicationDate: new Date().toISOString(),
      createdAt: new Date()
    };

    const result = await applications.insertOne(newApplication);
    res.json(result);
  } catch (error) {
    console.error('Create Application Error:', error);
    res.status(500).json({ message: 'Error creating application' });
  }
});


router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { applications } = getCollections();

    
    delete updates._id;

    const result = await applications.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );

    res.json(result);
  } catch (error) {
    console.error('Update Application Error:', error);
    res.status(500).json({ message: 'Error updating application' });
  }
});


router.patch('/:id/status', verifyToken, verifyModerator, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { applications } = getCollections();

    
    const validStatuses = ['pending', 'processing', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const result = await applications.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          applicationStatus: status,
          statusUpdatedAt: new Date()
        } 
      }
    );

    res.json(result);
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ message: 'Error updating status' });
  }
});


router.patch('/:id/feedback', verifyToken, verifyModerator, async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const { applications } = getCollections();

    const result = await applications.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          feedback,
          feedbackDate: new Date()
        } 
      }
    );

    res.json(result);
  } catch (error) {
    console.error('Add Feedback Error:', error);
    res.status(500).json({ message: 'Error adding feedback' });
  }
});


router.patch('/:id/cancel', verifyToken, verifyModerator, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const { applications } = getCollections();

    const result = await applications.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          applicationStatus: 'rejected',
          rejectionReason: reason,
          rejectedAt: new Date()
        } 
      }
    );

    res.json(result);
  } catch (error) {
    console.error('Cancel Application Error:', error);
    res.status(500).json({ message: 'Error canceling application' });
  }
});


router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { applications } = getCollections();

  
    const application = await applications.findOne({ _id: new ObjectId(id) });
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.applicationStatus !== 'pending') {
      return res.status(400).json({ 
        message: 'Can only delete applications with pending status' 
      });
    }

    const result = await applications.deleteOne({ _id: new ObjectId(id) });
    res.json(result);
  } catch (error) {
    console.error('Delete Application Error:', error);
    res.status(500).json({ message: 'Error deleting application' });
  }
});

export default router;
