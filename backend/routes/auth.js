const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Helper: generate JWT
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// Helper: send token response
const sendToken = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);
  user.password = undefined;
  res.status(statusCode).json({ success: true, message, token, user });
};

// ── POST /api/auth/register ──────────────────────────────
router.post('/register', [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['student','recruiter','college']).withMessage('Invalid role'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { firstName, lastName, email, password, phone, role, college, companyName, designation } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'An account with this email already exists.' });

    const user = await User.create({ firstName, lastName, email, password, phone, role, college, companyName, designation });
    sendToken(user, 201, res, 'Account created successfully! Welcome to InternSaathi.');
  } catch (err) { next(err); }
});

// ── POST /api/auth/login ─────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });

    sendToken(user, 200, res, `Welcome back, ${user.firstName}!`);
  } catch (err) { next(err); }
});

// ── POST /api/auth/google ────────────────────────────────
router.post('/google', async (req, res, next) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, given_name, family_name } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        firstName: given_name || 'User',
        lastName: family_name || '',
        email,
        password: Math.random().toString(36).slice(-10) + 'A1!',
        role: 'student'
      });
    }
    sendToken(user, 200, res, `Welcome back, ${user.firstName}!`);
  } catch (err) {
    res.status(401).json({ success: false, message: 'Google authentication failed' });
  }
});

// ── POST /api/auth/linkedin ──────────────────────────────
router.post('/linkedin', async (req, res, next) => {
  try {
    const { code, redirectUri } = req.body;
    
    // 1. Exchange auth code for access token
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const accessToken = tokenResponse.data.access_token;

    // 2. Fetch user profile
    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const { email, given_name, family_name } = profileResponse.data;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        firstName: given_name || 'User',
        lastName: family_name || '',
        email,
        password: Math.random().toString(36).slice(-10) + 'A1!',
        role: 'student'
      });
    }
    sendToken(user, 200, res, `Welcome back, ${user.firstName}!`);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(401).json({ success: false, message: 'LinkedIn authentication failed' });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('savedInternships', 'title company stipend location');
  res.json({ success: true, user });
});

// ── POST /api/auth/logout ────────────────────────────────
router.post('/logout', protect, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;
