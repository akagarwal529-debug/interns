const express    = require('express');
const router     = express.Router();
const { body, validationResult } = require('express-validator');
const Internship = require('../models/Internship');
const Application= require('../models/Application');
const { protect, authorize } = require('../middleware/auth');

// ── GET /api/internships ─────────────────────────────────
// Public. Supports: ?keyword=&city=&type=&minPay=&category=&page=&limit=
router.get('/', async (req, res, next) => {
  try {
    const { keyword, city, type, minPay, maxPay, category, featured, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };

    if (keyword) filter.$text = { $search: keyword };
    if (city && city !== 'Select City') filter.city = { $regex: city, $options: 'i' };
    if (type && type !== 'All') filter.type = type.toLowerCase();
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    if (minPay || maxPay) {
      filter.stipend = {};
      if (minPay) filter.stipend.$gte = Number(minPay);
      if (maxPay) filter.stipend.$lte = Number(maxPay);
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Internship.countDocuments(filter);
    const internships = await Internship.find(filter)
      .populate('postedBy', 'firstName lastName companyName')
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), internships });
  } catch (err) { next(err); }
});

// ── GET /api/internships/featured ───────────────────────
router.get('/featured', async (req, res, next) => {
  try {
    const internships = await Internship.find({ isFeatured: true, isActive: true })
      .populate('postedBy', 'firstName lastName companyName')
      .sort({ createdAt: -1 })
      .limit(6);
    res.json({ success: true, internships });
  } catch (err) { next(err); }
});

// ── GET /api/internships/:id ─────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id).populate('postedBy', 'firstName lastName companyName companyWebsite');
    if (!internship || !internship.isActive) return res.status(404).json({ success: false, message: 'Internship not found.' });
    res.json({ success: true, internship });
  } catch (err) { next(err); }
});

// ── POST /api/internships ────────────────────────────────
router.post('/', protect, authorize('recruiter', 'college'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('company').notEmpty().withMessage('Company is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('duration').notEmpty().withMessage('Duration is required'),
  body('description').isLength({ min: 50 }).withMessage('Description must be at least 50 characters'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const internship = await Internship.create({ ...req.body, postedBy: req.user._id });
    res.status(201).json({ success: true, message: 'Internship posted successfully!', internship });
  } catch (err) { next(err); }
});

// ── PUT /api/internships/:id ─────────────────────────────
router.put('/:id', protect, authorize('recruiter', 'college'), async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found.' });
    if (internship.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this listing.' });
    }
    const updated = await Internship.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, message: 'Internship updated.', internship: updated });
  } catch (err) { next(err); }
});

// ── DELETE /api/internships/:id ──────────────────────────
router.delete('/:id', protect, authorize('recruiter', 'college'), async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found.' });
    if (internship.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    await Internship.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Internship removed successfully.' });
  } catch (err) { next(err); }
});

module.exports = router;
