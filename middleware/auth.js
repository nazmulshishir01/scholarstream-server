import jwt from 'jsonwebtoken';
import { getCollections } from '../config/db.js';


export const verifyToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  
  if (!authorization) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authorization.split(' ')[1];
  
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    req.decoded = decoded;
    next();
  });
};


export const verifyAdmin = async (req, res, next) => {
  try {
    const email = req.decoded.email;
    const { users } = await getCollections(); 
    const user = await users.findOne({ email });
    
    if (user?.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    next();
  } catch (error) {
    console.error('Verify Admin Error:', error);
    res.status(500).json({ message: 'Error verifying admin role' });
  }
};


export const verifyModerator = async (req, res, next) => {
  try {
    const email = req.decoded.email;
    const { users } = await getCollections(); 
    const user = await users.findOne({ email });
    
    if (user?.role !== 'moderator' && user?.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Moderator access required' });
    }
    next();
  } catch (error) {
    console.error('Verify Moderator Error:', error);
    res.status(500).json({ message: 'Error verifying moderator role' });
  }
};


export const verifyOwner = (req, res, next) => {
  const tokenEmail = req.decoded.email;
  const requestEmail = req.params.email || req.body.email;
  
  if (tokenEmail !== requestEmail) {
    return res.status(403).json({ message: 'Forbidden: You can only access your own resources' });
  }
  next();
};