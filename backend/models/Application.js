const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
  applicant:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  coverLetter: { type: String, maxlength: 1000 },
  resumeUrl:   { type: String },

  status: {
    type: String,
    enum: ['applied', 'reviewing', 'shortlisted', 'rejected', 'selected'],
    default: 'applied'
  },

  recruiterNote: { type: String },
  appliedAt:     { type: Date, default: Date.now }
}, { timestamps: true });

// One application per user per internship
ApplicationSchema.index({ internship: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
