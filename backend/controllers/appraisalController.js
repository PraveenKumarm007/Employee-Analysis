const Appraisal = require('../models/Appraisal');

exports.getAllAppraisals = async (req, res) => {
  try {
    const appraisals = await Appraisal.find().populate('employeeId', 'name employeeId');
    res.json(appraisals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAppraisalsByEmployeeId = async (req, res) => {
  try {
    const appraisals = await Appraisal.find({ employeeId: req.params.employeeId });
    res.json(appraisals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAppraisal = async (req, res) => {
  try {
    const appraisal = new Appraisal(req.body);
    const savedAppraisal = await appraisal.save();
    if (req.io) req.io.emit('dataChanged', { action: 'refresh' });
    res.status(201).json(savedAppraisal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateAppraisal = async (req, res) => {
  try {
    const appraisal = await Appraisal.findById(req.params.id);
    if (!appraisal) return res.status(404).json({ message: 'Appraisal not found' });
    
    Object.assign(appraisal, req.body);
    const updatedAppraisal = await appraisal.save();
    if (req.io) req.io.emit('dataChanged', { action: 'refresh' });
    res.json(updatedAppraisal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteAppraisal = async (req, res) => {
  try {
    const appraisal = await Appraisal.findByIdAndDelete(req.params.id);
    if (!appraisal) return res.status(404).json({ message: 'Appraisal not found' });
    if (req.io) req.io.emit('dataChanged', { action: 'refresh' });
    res.json({ message: 'Appraisal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
