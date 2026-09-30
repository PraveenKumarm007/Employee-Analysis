const KPI = require('../models/KPI');

exports.getAllKPIs = async (req, res) => {
  try {
    const kpis = await KPI.find().populate('employeeId', 'name employeeId');
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getKPIsByEmployeeId = async (req, res) => {
  try {
    const kpis = await KPI.find({ employeeId: req.params.employeeId });
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createKPI = async (req, res) => {
  try {
    const kpi = new KPI(req.body);
    const savedKPI = await kpi.save();
    if (req.io) req.io.emit('dataChanged', { action: 'refresh' });
    res.status(201).json(savedKPI);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateKPI = async (req, res) => {
  try {
    const kpi = await KPI.findById(req.params.id);
    if (!kpi) return res.status(404).json({ message: 'KPI not found' });
    
    Object.assign(kpi, req.body);
    const updatedKPI = await kpi.save();
    if (req.io) req.io.emit('dataChanged', { action: 'refresh' });
    res.json(updatedKPI);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteKPI = async (req, res) => {
  try {
    const kpi = await KPI.findByIdAndDelete(req.params.id);
    if (!kpi) return res.status(404).json({ message: 'KPI not found' });
    if (req.io) req.io.emit('dataChanged', { action: 'refresh' });
    res.json({ message: 'KPI deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
