const express     = require('express');
const router      = express.Router();
const Application = require('../models/Application');
const Internship  = require('../models/Internship');
const { protect, authorize } = require('../middleware/auth');

// ── POST /api/applications ─── Submit application (student)
router.post('/', protect, authorize('student'), async (req, res, next) => {
  try {
    const { internshipId, coverLetter, resumeUrl } = req.body;

    const internship = await Internship.findById(internshipId);
    if (!internship || !internship.isActive) {
      return res.status(404).json({ success: false, message: 'Internship not found or no longer active.' });
    }

    const existing = await Application.findOne({ internship: internshipId, applicant: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already applied to this internship.' });
    }

    const application = await Application.create({
      internship: internshipId,
      applicant: req.user._id,
      coverLetter,
      resumeUrl: resumeUrl || req.user.resumeUrl
    });

    // Increment applicant count
    await Internship.findByIdAndUpdate(internshipId, { $inc: { applicantCount: 1 } });

    await application.populate('internship', 'title company location stipend');
    res.status(201).json({ success: true, message: `Successfully applied to ${internship.title} at ${internship.company}!`, application });
  } catch (err) { next(err); }
});

// ── GET /api/applications/mine ─── My applications (student)
router.get('/mine', protect, authorize('student'), async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('internship', 'title company location stipend type duration companyColor')
      .sort({ appliedAt: -1 });
    res.json({ success: true, count: applications.length, applications });
  } catch (err) { next(err); }
});

// ── GET /api/applications/internship/:id ─── Applicants for a listing (recruiter)
router.get('/internship/:id', protect, authorize('recruiter', 'college'), async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found.' });
    if (internship.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const applications = await Application.find({ internship: req.params.id })
      .populate('applicant', 'firstName lastName email phone college degree skills resumeUrl profilePhoto')
      .sort({ appliedAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (err) { next(err); }
});

// ── PUT /api/applications/:id/status ─── Update status (recruiter)
router.put('/:id/status', protect, authorize('recruiter', 'college'), async (req, res, next) => {
  try {
    const { status, recruiterNote } = req.body;
    const validStatuses = ['applied', 'reviewing', 'shortlisted', 'rejected', 'selected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id, { status, recruiterNote }, { new: true }
    ).populate('applicant', 'firstName lastName email');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });
    res.json({ success: true, message: `Application status updated to "${status}".`, application });
  } catch (err) { next(err); }
});

// ── DELETE /api/applications/:id ─── Withdraw application (student)
router.delete('/:id', protect, authorize('student'), async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });
    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    await Application.findByIdAndDelete(req.params.id);
    await Internship.findByIdAndUpdate(application.internship, { $inc: { applicantCount: -1 } });
    res.json({ success: true, message: 'Application withdrawn successfully.' });
  } catch (err) { next(err); }
});

module.exports = router;
