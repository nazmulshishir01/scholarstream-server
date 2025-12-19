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

export default verifyToken;