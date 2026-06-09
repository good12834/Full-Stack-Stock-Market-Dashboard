const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Forgot password — sends a reset token (stub: logs token to console if no email service)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Please provide an email' });
  }
  
  try {
    const User = require('../models/User');
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }
    const jwt = require('jsonwebtoken');
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    // In production: send email. For now, log it.
    console.log(`[Forgot Password] Reset token for ${email}: ${resetToken}`);
    res.json({ success: true, message: 'If that email exists, a reset link has been sent.', dev_token: process.env.NODE_ENV === 'development' ? resetToken : undefined });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;