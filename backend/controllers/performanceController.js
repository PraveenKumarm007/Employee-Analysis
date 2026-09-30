const { calculateEmployeePerformance } = require('../services/performanceService');

exports.getPerformanceByEmployeeId = async (req, res) => {
  try {
    const performance = await calculateEmployeePerformance(req.params.employeeId);
    res.json(performance);
  } catch (error) {
    if (error.message === 'Employee not found') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};
