const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_in_production';

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const employee = await Employee.findOne({ email });
    if (!employee) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = {
      id: employee._id,
      role: employee.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
