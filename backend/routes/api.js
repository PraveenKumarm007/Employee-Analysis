const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const kpiController = require('../controllers/kpiController');
const projectController = require('../controllers/projectController');
const attendanceController = require('../controllers/attendanceController');
const trainingController = require('../controllers/trainingController');
const appraisalController = require('../controllers/appraisalController');
const performanceController = require('../controllers/performanceController');
const dashboardController = require('../controllers/dashboardController');
const authController = require('../controllers/authController');

// Auth Route
router.post('/login', authController.login);

// Employee Routes
router.get('/employees', employeeController.getAllEmployees);
router.get('/employees/:id', employeeController.getEmployeeById);
router.post('/employees', employeeController.createEmployee);
router.put('/employees/:id', employeeController.updateEmployee);
router.delete('/employees/:id', employeeController.deleteEmployee);

// KPI Routes
router.get('/kpis', kpiController.getAllKPIs);
router.get('/kpis/employee/:employeeId', kpiController.getKPIsByEmployeeId);
router.post('/kpis', kpiController.createKPI);
router.put('/kpis/:id', kpiController.updateKPI);
router.delete('/kpis/:id', kpiController.deleteKPI);

// Project Routes
router.get('/projects', projectController.getAllProjects);
router.get('/projects/employee/:employeeId', projectController.getProjectsByEmployeeId);
router.post('/projects', projectController.createProject);
router.put('/projects/:id', projectController.updateProject);
router.delete('/projects/:id', projectController.deleteProject);

// Attendance Routes
router.get('/attendance', attendanceController.getAllAttendance);
router.get('/attendance/employee/:employeeId', attendanceController.getAttendanceByEmployeeId);
router.post('/attendance', attendanceController.createAttendance);
router.put('/attendance/:id', attendanceController.updateAttendance);
router.delete('/attendance/:id', attendanceController.deleteAttendance);

// Training Routes
router.get('/training', trainingController.getAllTraining);
router.get('/training/employee/:employeeId', trainingController.getTrainingByEmployeeId);
router.post('/training', trainingController.createTraining);
router.put('/training/:id', trainingController.updateTraining);
router.delete('/training/:id', trainingController.deleteTraining);

// Appraisal Routes
router.get('/appraisals', appraisalController.getAllAppraisals);
router.get('/appraisals/employee/:employeeId', appraisalController.getAppraisalsByEmployeeId);
router.post('/appraisals', appraisalController.createAppraisal);
router.put('/appraisals/:id', appraisalController.updateAppraisal);
router.delete('/appraisals/:id', appraisalController.deleteAppraisal);

// Performance Routes
router.get('/performance/:employeeId', performanceController.getPerformanceByEmployeeId);

// Dashboard Routes
router.get('/dashboard', dashboardController.getDashboardStats);

module.exports = router;
