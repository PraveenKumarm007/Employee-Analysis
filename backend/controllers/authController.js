const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_in_production';

// In-memory store for OTPs (for production, use Redis or DB collection)
const otpStore = new Map();

// Helper to generate JWT token
const generateToken = (employee) => {
  return jwt.sign(
    { id: employee._id, role: employee.role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// LOGIN CONTROLLER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const identifier = (email || '').trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/Phone and password are required.' });
    }

    // Find user by email or phone
    const employee = await Employee.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ]
    });

    if (!employee) {
      return res.status(404).json({ message: 'User not found. Please check your credentials or create an account.' });
    }

    if (employee.status === 'Inactive') {
      return res.status(403).json({ message: 'Your account is currently deactivated. Please contact an administrator.' });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password. Please try again.' });
    }

    const token = generateToken(employee);

    res.json({
      token,
      user: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone || '',
        role: employee.role,
        department: employee.department || 'General',
        position: employee.position || 'Member'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN LOGIN CONTROLLER
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const identifier = (email || '').trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Admin email/username and password are required.' });
    }

    const employee = await Employee.findOne({
      $or: [
        { email: identifier },
        { phone: identifier }
      ]
    });

    if (!employee) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    if (employee.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Administrator privileges are required.' });
    }

    if (employee.status === 'Inactive') {
      return res.status(403).json({ message: 'Admin account is deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    const token = generateToken(employee);

    res.json({
      token,
      user: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone || '',
        role: employee.role,
        department: employee.department || 'Admin',
        position: employee.position || 'Administrator'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REGISTER CONTROLLER
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, Email, and Password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = (phone || '').trim();

    // Check existing email
    const existingEmail = await Employee.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(400).json({ message: 'An account with this email already exists. Please login instead.' });
    }

    // Check existing phone if provided
    if (cleanPhone) {
      const existingPhone = await Employee.findOne({ phone: cleanPhone });
      if (existingPhone) {
        return res.status(400).json({ message: 'An account with this phone number already exists. Please login instead.' });
      }
    }

    // Generate unique employee ID
    const employeeId = `EMP-${Date.now().toString().slice(-5)}`;

    const newEmployee = new Employee({
      employeeId,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password, // Pre-save hook hashes password
      department: 'Engineering',
      position: 'Team Member',
      role: 'Employee'
    });

    await newEmployee.save();

    const token = generateToken(newEmployee);

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: newEmployee._id,
        name: newEmployee.name,
        email: newEmployee.email,
        phone: newEmployee.phone,
        role: newEmployee.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GOOGLE AUTH CONTROLLER
exports.googleAuth = async (req, res) => {
  try {
    const { email, name, googleId } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Google account email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let employee = await Employee.findOne({ email: cleanEmail });

    if (!employee) {
      // Auto register user if not found
      const employeeId = `EMP-G-${Date.now().toString().slice(-5)}`;
      const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';

      employee = new Employee({
        employeeId,
        name: name || email.split('@')[0],
        email: cleanEmail,
        password: randomPassword,
        department: 'General',
        position: 'Member',
        role: 'Employee'
      });

      await employee.save();
    }

    const token = generateToken(employee);

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

// FORGOT PASSWORD - REQUEST OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ message: 'Please enter your registered email address or phone number.' });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const employee = await Employee.findOne({
      $or: [
        { email: cleanIdentifier },
        { phone: cleanIdentifier }
      ]
    });

    if (!employee) {
      return res.status(404).json({ message: 'No account found with this email or phone number.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes valid

    otpStore.set(cleanIdentifier, { otp, expiresAt });

    console.log(`[AUTH-OTP] Generated OTP ${otp} for ${cleanIdentifier}`);

    res.json({
      message: `Verification code (OTP) sent to ${identifier}.`,
      // For development/demo convenience, return OTP in response body
      demoOtp: otp
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FORGOT PASSWORD - VERIFY OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) {
      return res.status(400).json({ message: 'Identifier and OTP code are required.' });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const record = otpStore.get(cleanIdentifier);

    if (!record) {
      return res.status(400).json({ message: 'OTP has expired or was not requested. Please request a new code.' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanIdentifier);
      return res.status(400).json({ message: 'OTP expired. Please request a new code.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid OTP code. Please check and try again.' });
    }

    res.json({ success: true, message: 'OTP verified successfully. You may now reset your password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FORGOT PASSWORD - RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;

    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({ message: 'Missing required parameters.' });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const record = otpStore.get(cleanIdentifier);

    if (!record || record.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid or expired session. Please restart the forgot password process.' });
    }

    const employee = await Employee.findOne({
      $or: [
        { email: cleanIdentifier },
        { phone: cleanIdentifier }
      ]
    });

    if (!employee) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Set new password
    employee.password = newPassword;
    await employee.save();

    // Clear OTP
    otpStore.delete(cleanIdentifier);

    res.json({ message: 'Password reset successfully! You can now log in with your new password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
