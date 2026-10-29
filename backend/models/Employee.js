const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    fullName: { type: String, required: [true, 'Full name is required'], trim: true, maxlength: 100 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
      match: [/^[0-9+\-\s()]{7,15}$/, 'Please enter a valid phone number'],
    },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: [true, 'Department is required'] },
    designation: { type: String, required: [true, 'Job role is required'], trim: true, maxlength: 100 },
    salary: { type: Number, required: [true, 'Salary is required'], min: [0, 'Salary cannot be negative'] },
    joiningDate: { type: Date, required: [true, 'Joining date is required'] },
    status: { type: String, enum: ['Active', 'On Leave', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

employeeSchema.index({ fullName: 'text', email: 'text', designation: 'text' });

module.exports = mongoose.model('Employee', employeeSchema);
