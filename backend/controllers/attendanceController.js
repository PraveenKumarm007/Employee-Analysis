const Attendance = require('../models/Attendance');

exports.getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find().populate('employeeId', 'name employeeId');
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAttendanceByEmployeeId = async (req, res) => {
  try {
    const attendance = await Attendance.find({ employeeId: req.params.employeeId });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAttendance = async (req, res) => {
  try {
    const attendance = new Attendance(req.body);
    const savedAttendance = await attendance.save();
    if (req.io) req.io.emit('dataChanged', { action: 'refresh' });
    res.status(201).json(savedAttendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) return res.status(404).json({ message: 'Attendance not found' });
    
    Object.assign(attendance, req.body);
    const updatedAttendance = await attendance.save();
    if (req.io) req.io.emit('dataChanged', { action: 'refresh' });
    res.json(updatedAttendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) return res.status(404).json({ message: 'Attendance not found' });
    if (req.io) req.io.emit('dataChanged', { action: 'refresh' });
    res.json({ message: 'Attendance deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
