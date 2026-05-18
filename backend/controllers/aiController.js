const Employee = require('../models/Employee');
const { getAIRecommendations } = require('../services/aiService');

/**
 * @desc    Generate AI-powered employee performance recommendations & analytics
 * @route   POST /api/ai/recommend
 * @access  Private
 */
const recommendEmployee = async (req, res, next) => {
  try {
    const { employeeId, department } = req.body;

    let targetEmployees = [];

    // 1. Resolve target cohort
    if (employeeId) {
      // Single employee evaluation
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(404).json({ error: `Employee not found with ID: ${employeeId}` });
      }
      targetEmployees = [employee];
    } else if (department && department.trim() !== '') {
      // Department-level evaluation
      targetEmployees = await Employee.find({ 
        department: { $regex: new RegExp(`^${department.trim()}$`, 'i') } 
      }).sort({ performanceScore: -1 });
    } else {
      // Complete company-wide evaluation
      targetEmployees = await Employee.find().sort({ performanceScore: -1 });
    }

    // 2. Safeguard against empty databases
    if (targetEmployees.length === 0) {
      return res.json({
        summary: 'No employees found to analyze. Please insert employees first.',
        recommendations: [],
        rankedList: []
      });
    }

    // 3. Request insights from the AI Service (supports OpenRouter and robust offline logic)
    const analysisScope = employeeId ? 'single' : 'cohort';
    const aiResponse = await getAIRecommendations(targetEmployees, { scope: analysisScope });

    res.json(aiResponse);
  } catch (error) {
    next(error);
  }
};

module.exports = { recommendEmployee };
