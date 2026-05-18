const express = require('express');
const router = express.Router();
const {
  addEmployee,
  getEmployees,
  searchEmployees,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { protect } = require('../middleware/auth');

// Secure all employee routes with JWT middleware
router.use(protect);

router.route('/')
  .post(addEmployee)
  .get(getEmployees);

router.route('/search')
  .get(searchEmployees);

router.route('/:id')
  .put(updateEmployee)
  .delete(deleteEmployee);

module.exports = router;
