const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to sign JWT tokens
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Simple validation checks
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide a name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: `A user account with email ${email} already exists.` });
    }

    // 3. Create and save new user (pre-save middleware handles hashing)
    const user = await User.create({
      name,
      email,
      password
    });

    // 4. Respond with signed token and details
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate credentials inputs
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    // 2. Find the user including their password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Authentication failed. User not found.' });
    }

    // 3. Verify user password (using bcrypt compare model helper)
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Authentication failed. Invalid password.' });
    }

    // 4. Return user info and signed token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login };
