import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

// Load environment variables
config();

export default (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check for guest user header
  const guestMode = req.header('X-Guest-Mode');
  
  // Allow guest mode access with appropriate restrictions
  if (guestMode === 'true') {
    req.user = { isGuest: true };
    return next();
  }

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};