const express = require('express');
const emp = require('../controllers/employeeController');
const dept = require('../controllers/departmentController');
const stats = require('../controllers/statsController');

const router = express.Router();

router.get('/stats', stats.getStats);

router.route('/employees').get(emp.getEmployees).post(emp.createEmployee);
router.route('/employees/:id').get(emp.getEmployee).put(emp.updateEmployee).delete(emp.deleteEmployee);

router.route('/departments').get(dept.getDepartments).post(dept.createDepartment);
router.route('/departments/:id').get(dept.getDepartment).put(dept.updateDepartment).delete(dept.deleteDepartment);

module.exports = router;
