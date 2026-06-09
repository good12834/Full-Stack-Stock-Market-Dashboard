const User = require('../models/User');

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Create user
    let user;
    try {
      user = await User.create({
        username,
        email,
        password,
      });
    } catch (dbErr) {
      console.warn(`MongoDB unavailable for registration: ${dbErr.message}`);
      return res.status(503).json({
        success: false,
        error: 'Database unavailable. Please try again later.',
      });
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password',
      });
    }

    // Check for user
    let user;
    try {
      user = await User.findOne({ email }).select('+password');
    } catch (dbErr) {
      console.warn(`MongoDB unavailable for login: ${dbErr.message}`);
      return res.status(503).json({
        success: false,
        error: 'Database unavailable. Please try again later.',
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.json({
      success: true,
      token,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    let user;
    try {
      user = await User.findById(req.user.id);
    } catch (dbErr) {
      console.warn(`MongoDB unavailable for getMe: ${dbErr.message}`);
      return res.status(503).json({
        success: false,
        error: 'Database unavailable. Please try again later.',
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
};