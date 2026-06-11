const mongoose = require('mongoose');

const InternshipSchema = new mongoose.Schema({
  title:       { type: String, required: [true, 'Title is required'], trim: true },
  company:     { type: String, required: [true, 'Company is required'], trim: true },
  companyLogo: { type: String, default: '' },
  companyColor:{ type: String, default: '#0B1D3A' },

  location:    { type: String, required: true, trim: true },
  city:        { type: String, trim: true },
  type:        { type: String, enum: ['online', 'offline', 'hybrid'], default: 'online' },

  stipend:     { type: Number, default: 0 },
  stipendText: { type: String, default: 'Unpaid' },
  duration:    { type: String, required: true },

  description: { type: String, required: true, maxlength: 2000 },
  requirements:{ type: String },
  skills:      [{ type: String }],
  perks:       [{ type: String }],

  openings:      { type: Number, default: 1 },
  applicantCount:{ type: Number, default: 0 },

  postedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isFeatured:  { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
  deadline:    { type: Date },

  category: {
    type: String,
    enum: ['Technology', 'Marketing', 'Design', 'Finance', 'Content', 'Sales', 'HR', 'Operations', 'Research', 'Other'],
    default: 'Other'
  }
}, { timestamps: true });

// Text index for search
InternshipSchema.index({ title: 'text', company: 'text', description: 'text', skills: 'text' });

module.exports = mongoose.model('Internship', InternshipSchema);
