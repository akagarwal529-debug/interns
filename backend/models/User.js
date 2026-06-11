const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: [true, 'First name is required'], trim: true },
  lastName:  { type: String, required: [true, 'Last name is required'],  trim: true },
  email:     { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  password:  { type: String, required: [true, 'Password is required'], minlength: 8, select: false },
  phone:     { type: String, trim: true },
  role:      { type: String, enum: ['student', 'recruiter', 'college'], default: 'student' },

  // Student fields
  college:        { type: String, trim: true },
  degree:         { type: String, trim: true },
  graduationYear: { type: Number },
  skills:         [{ type: String }],
  resumeUrl:      { type: String },

  // Recruiter fields
  companyName:  { type: String, trim: true },
  designation:  { type: String, trim: true },
  companyWebsite: { type: String },

  // College fields
  collegeName:  { type: String, trim: true },
  city:         { type: String },

  // Common
  profilePhoto:       { type: String },
  bio:                { type: String, maxlength: 500 },
  savedInternships:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Internship' }],
  isVerified:         { type: Boolean, default: false },
  isActive:           { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual: full name
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', UserSchema);
