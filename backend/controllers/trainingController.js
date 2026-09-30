const Training = require('../models/Training');

exports.getAllTraining = async (req, res) => {
  try {
    const training = await Training.find().populate('employeeId', 'name employeeId');
    res.json(training);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTrainingByEmployeeId = async (req, res) => {
  try {
    const training = await Training.find({ employeeId: req.params.employeeId });
    res.json(training);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTraining = async (req, res) => {
  try {
    const training = new Training(req.body);
    const savedTraining = await training.save();
    if (req.io) req.io.emit('dataChanged', { action: 'refresh' });
    res.status(201).json(savedTraining);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: 'Training not found' });
    
    Object.assign(training, req.body);
    const updatedTraining = await training.save();
    if (req.io) req.io.emit('dataChanged', { action: 'refresh' });
    res.json(updatedTraining);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTraining = async (req, res) => {
  try {
    const training = await Training.findByIdAndDelete(req.params.id);
    if (!training) return res.status(404).json({ message: 'Training not found' });
    if (req.io) req.io.emit('dataChanged', { action: 'refresh' });
    res.json({ message: 'Training deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
