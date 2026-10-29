// Optional: loads sample departments and employees. Run: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Department = require('./models/Department');
const Employee = require('./models/Employee');

const people = [
  ['Aarav Sharma', 'Engineering', 'Senior Developer', 95000],
  ['Priya Nair', 'Engineering', 'Frontend Developer', 72000],
  ['Rohan Mehta', 'Human Resources', 'HR Manager', 68000],
  ['Sneha Iyer', 'Finance', 'Accountant', 60000],
  ['Karthik Raj', 'Marketing', 'Marketing Lead', 70000],
  ['Divya Menon', 'Engineering', 'QA Engineer', 58000],
];

(async () => {
  await connectDB();
  await Employee.deleteMany();
  await Department.deleteMany();
  const depts = await Department.insertMany(
    ['Engineering', 'Human Resources', 'Finance', 'Marketing'].map((name) => ({ name, description: `${name} team` }))
  );
  const byName = Object.fromEntries(depts.map((d) => [d.name, d._id]));
  await Employee.insertMany(
    people.map(([fullName, dept, designation, salary], i) => ({
      employeeId: `EMP${String(i + 1).padStart(3, '0')}`,
      fullName,
      email: `${fullName.split(' ')[0].toLowerCase()}@example.com`,
      phone: `98765432${String(10 + i)}`,
      department: byName[dept],
      designation,
      salary,
      joiningDate: new Date(2023, i, 10),
      status: i === 5 ? 'On Leave' : 'Active',
    }))
  );
  console.log('Seeded sample data');
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
