const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Employee email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  skills: {
    type: [String],
    required: [true, 'Skills list is required'],
    default: []
  },
  performanceScore: {
    type: Number,
    required: [true, 'Performance score is required'],
    min: [0, 'Performance score cannot be below 0'],
    max: [100, 'Performance score cannot exceed 100']
  },
  experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Years of experience cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to automatically trim whitespace and filter out empty items in the skills list before saving
EmployeeSchema.pre('save', function(next) {
  if (this.skills && Array.isArray(this.skills)) {
    this.skills = this.skills
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
  }
  next();
});

module.exports = mongoose.model('Employee', EmployeeSchema);
