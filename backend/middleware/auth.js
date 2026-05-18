const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Check if token exists in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user details to the request object (excluding password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ error: 'Not authorized, user not found' });
      }

      return next();
    } catch (error) {
      console.error('JWT Token Verification Error:', error.message);
      return res.status(401).json({ error: 'Not authorized, invalid token' });
    }
  }

  // 2. Return unauthorized if no token was supplied
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }
};

module.exports = { protect };
