import express from 'express';
import Stripe from 'stripe';
import { ObjectId } from 'mongodb';
import { getCollections } from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


router.post('/create-payment-intent', verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      payment_method_types: ['card']
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment Intent Error:', error);
    res.status(500).json({ message: 'Error creating payment intent' });
  }
});


router.post('/', verifyToken, async (req, res) => {
  try {
    const payment = req.body;
    const { payments, applications } = getCollections();

    const newPayment = {
      ...payment,
      date: new Date().toISOString(),
      createdAt: new Date()
    };

    
    const result = await payments.insertOne(newPayment);

    
    if (payment.applicationId) {
      await applications.updateOne(
        { _id: new ObjectId(payment.applicationId) },
        { 
          $set: { 
            paymentStatus: 'paid',
            transactionId: payment.transactionId,
            paidAt: new Date()
          } 
        }
      );
    }

    res.json(result);
  } catch (error) {
    console.error('Save Payment Error:', error);
    res.status(500).json({ message: 'Error saving payment' });
  }
});


router.get('/user/:email', verifyToken, async (req, res) => {
  try {
    const { email } = req.params;
    const { payments } = getCollections();

    const result = await payments
      .find({ email })
      .sort({ date: -1 })
      .toArray();

    res.json(result);
  } catch (error) {
    console.error('Get Payments Error:', error);
    res.status(500).json({ message: 'Error fetching payments' });
  }
});


router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { payments } = getCollections();

    const payment = await payments.findOne({ _id: new ObjectId(id) });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Get Payment Error:', error);
    res.status(500).json({ message: 'Error fetching payment' });
  }
});


router.get('/transaction/:transactionId', verifyToken, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { payments } = getCollections();

    const payment = await payments.findOne({ transactionId });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Get Payment by Transaction Error:', error);
    res.status(500).json({ message: 'Error fetching payment' });
  }
});

export default router;
