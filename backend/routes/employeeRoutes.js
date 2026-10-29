const router = require('express').Router();
const c = require('../controllers/employeeController');

router.get('/stats', c.getStats);
router.route('/').get(c.getEmployees).post(c.createEmployee);
router.route('/:id').get(c.getEmployee).put(c.updateEmployee).delete(c.deleteEmployee);

module.exports = router;
