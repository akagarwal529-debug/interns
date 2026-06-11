const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

// ── GET /api/users/profile ───────────────────────────────
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('savedInternships', 'title company stipend location type duration');
    res.json({ success: true, user });
  } catch (err) { next(err); }
});

// ── PUT /api/users/profile ───────────────────────────────
router.put('/profile', protect, async (req, res, next) => {
  try {
    const allowed = ['firstName','lastName','phone','bio','college','degree','graduationYear','skills','companyName','designation','companyWebsite','city'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated successfully.', user });
  } catch (err) { next(err); }
});

// ── POST /api/users/save/:internshipId ───────────────────
router.post('/save/:internshipId', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const id   = req.params.internshipId;
    const saved = user.savedInternships.map(i => i.toString());

    if (saved.includes(id)) {
      // Unsave
      await User.findByIdAndUpdate(req.user._id, { $pull: { savedInternships: id } });
      return res.json({ success: true, message: 'Internship removed from saved.', saved: false });
    } else {
      // Save
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { savedInternships: id } });
      return res.json({ success: true, message: 'Internship saved!', saved: true });
    }
  } catch (err) { next(err); }
});

// ── GET /api/users/saved ─────────────────────────────────
router.get('/saved', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('savedInternships', 'title company stipend location type duration companyColor');
    res.json({ success: true, saved: user.savedInternships });
  } catch (err) { next(err); }
});

// ── GET /api/users/stats ──────────────────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    const User        = require('../models/User');
    const Internship  = require('../models/Internship');
    const Application = require('../models/Application');

    const [students, internships, applications, companies] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Internship.countDocuments({ isActive: true }),
      Application.countDocuments(),
      User.countDocuments({ role: 'recruiter' })
    ]);

    res.json({ success: true, stats: { students, internships, applications, companies } });
  } catch (err) { next(err); }
});

module.exports = router;
