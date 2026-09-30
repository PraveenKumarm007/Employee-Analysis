const Employee = require('../models/Employee');
const { calculateEmployeePerformance } = require('../services/performanceService');

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    // Also calculate performance for each
    const employeesWithPerformance = await Promise.all(
      employees.map(async (emp) => {
        const perf = await calculateEmployeePerformance(emp._id);
        return {
          ...emp.toObject(),
          performance: perf
        };
      })
    );
    res.json(employeesWithPerformance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    const performance = await calculateEmployeePerformance(employee._id);
    res.json({ ...employee.toObject(), performance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const employeeData = { ...req.body, password: req.body.password || 'password123' };
    const employee = new Employee(employeeData);
    const savedEmployee = await employee.save();
    if (req.io) req.io.emit('dataChanged', { type: 'employee', action: 'create' });
    res.status(201).json(savedEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    if (req.io) req.io.emit('dataChanged', { type: 'employee', action: 'update' });
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    // Should also delete associated records ideally
    if (req.io) req.io.emit('dataChanged', { type: 'employee', action: 'delete' });
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
