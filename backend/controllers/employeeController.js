const Employee = require('../models/Employee');
const asyncHandler = require('../middleware/asyncHandler');

const FIELDS = ['employeeId', 'fullName', 'email', 'phone', 'department', 'designation', 'salary', 'joiningDate', 'status'];
const pick = (body) => Object.fromEntries(FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.getEmployees = asyncHandler(async (req, res) => {
  const { search, department, status } = req.query;
  const filter = {};
  if (department) filter.department = department;
  if (status) filter.status = status;
  if (search) {
    const rx = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ fullName: rx }, { email: rx }, { employeeId: rx }, { designation: rx }];
  }
  const employees = await Employee.find(filter).populate('department', 'name').sort('-createdAt');
  res.json(employees);
});

exports.getEmployee = asyncHandler(async (req, res) => {
  const emp = await Employee.findById(req.params.id).populate('department', 'name');
  if (!emp) return res.status(404).json({ message: 'Employee not found' });
  res.json(emp);
});

exports.createEmployee = asyncHandler(async (req, res) => {
  const emp = await Employee.create(pick(req.body));
  res.status(201).json(await emp.populate('department', 'name'));
});

exports.updateEmployee = asyncHandler(async (req, res) => {
  const emp = await Employee.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true }).populate(
    'department',
    'name'
  );
  if (!emp) return res.status(404).json({ message: 'Employee not found' });
  res.json(emp);
});

exports.deleteEmployee = asyncHandler(async (req, res) => {
  const emp = await Employee.findByIdAndDelete(req.params.id);
  if (!emp) return res.status(404).json({ message: 'Employee not found' });
  res.json({ message: 'Employee deleted' });
});
