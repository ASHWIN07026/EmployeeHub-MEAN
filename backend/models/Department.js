const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      unique: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    description: { type: String, trim: true, maxlength: 300, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', departmentSchema);
