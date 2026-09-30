const ProjectContribution = require('../models/ProjectContribution');

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await ProjectContribution.find().populate('employeeId', 'name employeeId');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectsByEmployeeId = async (req, res) => {
  try {
    const projects = await ProjectContribution.find({ employeeId: req.params.employeeId });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const project = new ProjectContribution(req.body);
    const savedProject = await project.save();
    if (req.io) req.io.emit('dataChanged', { action: 'refresh' });
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await ProjectContribution.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    Object.assign(project, req.body);
    const updatedProject = await project.save();
    if (req.io) req.io.emit('dataChanged', { action: 'refresh' });
    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await ProjectContribution.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (req.io) req.io.emit('dataChanged', { action: 'refresh' });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
