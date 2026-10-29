const Department = require('../models/Department');
const Employee = require('../models/Employee');
const asyncHandler = require('../middleware/asyncHandler');

exports.getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().sort('name').lean();
  const counts = await Employee.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]);
  const map = new Map(counts.map((c) => [String(c._id), c.count]));
  res.json(departments.map((d) => ({ ...d, employeeCount: map.get(String(d._id)) || 0 })));
});

exports.getDepartment = asyncHandler(async (req, res) => {
  const dept = await Department.findById(req.params.id);
  if (!dept) return res.status(404).json({ message: 'Department not found' });
  res.json(dept);
});

exports.createDepartment = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const dept = await Department.create({ name, description });
  res.status(201).json(dept);
});

exports.updateDepartment = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const dept = await Department.findByIdAndUpdate(
    req.params.id,
    { name, description },
    { new: true, runValidators: true }
  );
  if (!dept) return res.status(404).json({ message: 'Department not found' });
  res.json(dept);
});

exports.deleteDepartment = asyncHandler(async (req, res) => {
  const inUse = await Employee.countDocuments({ department: req.params.id });
  if (inUse > 0) {
    return res.status(409).json({ message: `Cannot delete: ${inUse} employee(s) belong to this department` });
  }
  const dept = await Department.findByIdAndDelete(req.params.id);
  if (!dept) return res.status(404).json({ message: 'Department not found' });
  res.json({ message: 'Department deleted' });
});
