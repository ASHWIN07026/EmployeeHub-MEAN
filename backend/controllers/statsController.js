const Employee = require('../models/Employee');
const Department = require('../models/Department');
const asyncHandler = require('../middleware/asyncHandler');

exports.getStats = asyncHandler(async (req, res) => {
  const [total, active, onLeave, inactive, departments, recent, byDept, salary] = await Promise.all([
    Employee.countDocuments(),
    Employee.countDocuments({ status: 'Active' }),
    Employee.countDocuments({ status: 'On Leave' }),
    Employee.countDocuments({ status: 'Inactive' }),
    Department.countDocuments(),
    Employee.find().sort('-createdAt').limit(5).populate('department', 'name'),
    Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: '$dept' },
      { $project: { _id: 0, name: '$dept.name', count: 1 } },
      { $sort: { count: -1 } },
    ]),
    Employee.aggregate([{ $group: { _id: null, avg: { $avg: '$salary' }, total: { $sum: '$salary' } } }]),
  ]);

  res.json({
    totalEmployees: total,
    activeEmployees: active,
    onLeaveEmployees: onLeave,
    inactiveEmployees: inactive,
    totalDepartments: departments,
    averageSalary: Math.round(salary[0]?.avg || 0),
    totalPayroll: salary[0]?.total || 0,
    employeesByDepartment: byDept,
    recentEmployees: recent,
  });
});
