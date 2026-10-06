const { calculateEmployeePerformance } = require('../services/performanceService');

exports.getPerformanceByEmployeeId = async (req, res) => {
  try {
    const performance = await calculateEmployeePerformance(req.params.employeeId);
    if (!performance) {
      return res.status(404).json({ message: 'Employee not found or no performance data available.' });
    }
    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

