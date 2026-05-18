const Employee = require('../models/Employee');

/**
 * @desc    Add a new employee
 * @route   POST /api/employees
 * @access  Private
 */
const addEmployee = async (req, res, next) => {
  try {
    const { name, email, department, skills, performanceScore, experience } = req.body;

    // 1. Direct validation checks before database save
    if (!name || !email || !department || performanceScore === undefined || experience === undefined) {
      return res.status(400).json({ 
        error: 'Missing required employee details. Please ensure name, email, department, performanceScore, and experience are provided.' 
      });
    }

    if (!Array.isArray(skills)) {
      return res.status(400).json({ error: 'Skills must be an array of strings.' });
    }

    // 2. Check if employee email already exists
    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: `An employee with email '${email}' already exists.` });
    }

    // 3. Save to database
    const employee = new Employee({
      name,
      email,
      department,
      skills,
      performanceScore,
      experience
    });

    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    next(error); // central error handling middleware
  }
};

/**
 * @desc    Get all employees
 * @route   GET /api/employees
 * @access  Private
 */
const getEmployees = async (req, res, next) => {
  try {
    // Sort descending by performance score as a baseline visual rank
    const employees = await Employee.find().sort({ performanceScore: -1 });
    res.json(employees);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search and filter employees by department or skill
 * @route   GET /api/employees/search
 * @access  Private
 */
const searchEmployees = async (req, res, next) => {
  try {
    const { department, skill, query } = req.query;
    let filter = {};

    // 1. Department filter (exact match, case-insensitive)
    if (department && department.trim() !== '') {
      filter.department = { $regex: new RegExp(`^${department.trim()}$`, 'i') };
    }

    // 2. Skill filter (checks if array contains skill, case-insensitive regex)
    if (skill && skill.trim() !== '') {
      filter.skills = { $regex: new RegExp(`^${skill.trim()}$`, 'i') };
    }

    // 3. Generic text search (matches name or department or email)
    if (query && query.trim() !== '') {
      const searchRegex = new RegExp(query.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { department: searchRegex }
      ];
    }

    const employees = await Employee.find(filter).sort({ performanceScore: -1 });
    res.json(employees);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update employee details
 * @route   PUT /api/employees/:id
 * @access  Private
 */
const updateEmployee = async (req, res, next) => {
  try {
    const { name, email, department, skills, performanceScore, experience } = req.body;

    // Find the employee by ID first
    let employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: `Employee not found with ID: ${req.params.id}` });
    }

    // Email update check to prevent duplicates
    if (email && email.toLowerCase() !== employee.email.toLowerCase()) {
      const existing = await Employee.findOne({ email });
      if (existing) {
        return res.status(400).json({ error: `Cannot update email. Another employee with email '${email}' already exists.` });
      }
    }

    // Update fields
    if (name) employee.name = name;
    if (email) employee.email = email;
    if (department) employee.department = department;
    if (skills) employee.skills = skills;
    if (performanceScore !== undefined) employee.performanceScore = performanceScore;
    if (experience !== undefined) employee.experience = experience;

    const updatedEmployee = await employee.save();
    res.json(updatedEmployee);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an employee
 * @route   DELETE /api/employees/:id
 * @access  Private
 */
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: `Employee not found with ID: ${req.params.id}` });
    }

    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addEmployee,
  getEmployees,
  searchEmployees,
  updateEmployee,
  deleteEmployee
};
