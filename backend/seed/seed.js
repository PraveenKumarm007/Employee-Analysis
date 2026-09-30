const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Employee = require('../models/Employee');
const KPI = require('../models/KPI');
const ProjectContribution = require('../models/ProjectContribution');
const Attendance = require('../models/Attendance');
const Training = require('../models/Training');
const Appraisal = require('../models/Appraisal');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Clear existing data
    await Employee.deleteMany();
    await KPI.deleteMany();
    await ProjectContribution.deleteMany();
    await Attendance.deleteMany();
    await Training.deleteMany();
    await Appraisal.deleteMany();

    console.log('Existing data cleared');

    // Create Employees
    const defaultPassword = 'password123'; // They will be hashed by pre-save hook
    const employeesData = [
      { employeeId: 'EMP001', name: 'Alice Smith', email: 'alice@example.com', department: 'Engineering', position: 'Software Engineer', role: 'Employee', password: defaultPassword },
      { employeeId: 'EMP002', name: 'Bob Johnson', email: 'bob@example.com', department: 'Engineering', position: 'Senior Developer', role: 'Employee', password: defaultPassword },
      { employeeId: 'EMP003', name: 'Charlie Brown', email: 'admin@example.com', department: 'HR', position: 'HR Manager', role: 'Admin', password: defaultPassword },
      { employeeId: 'EMP004', name: 'Diana Prince', email: 'diana@example.com', department: 'Finance', position: 'Financial Analyst', role: 'Employee', password: defaultPassword },
      { employeeId: 'EMP005', name: 'Evan Davis', email: 'evan@example.com', department: 'Marketing', position: 'Marketing Specialist', role: 'Employee', password: defaultPassword },
      { employeeId: 'EMP006', name: 'Fiona Gallagher', email: 'fiona@example.com', department: 'Sales', position: 'Sales Executive', role: 'Employee', password: defaultPassword },
      { employeeId: 'EMP007', name: 'George Miller', email: 'george@example.com', department: 'Engineering', position: 'DevOps Engineer', role: 'Employee', password: defaultPassword },
      { employeeId: 'EMP008', name: 'Hannah Abbott', email: 'hannah@example.com', department: 'Marketing', position: 'SEO Expert', role: 'Employee', password: defaultPassword }
    ];

    const createdEmployees = await Employee.create(employeesData);
    console.log('Employees Created');

    // Add Performance Data
    for (let emp of createdEmployees) {
      // KPI
      await KPI.create({
        employeeId: emp._id,
        kpiName: 'Quarterly Goals',
        targetValue: 100,
        achievedValue: Math.floor(Math.random() * 40) + 60 // 60-100
      });

      // Project Contribution
      await ProjectContribution.create({
        employeeId: emp._id,
        projectName: `Project Alpha for ${emp.department}`,
        contributionDescription: 'Led the main module',
        contributionScore: Math.floor(Math.random() * 40) + 60
      });

      // Attendance
      await Attendance.create({
        employeeId: emp._id,
        totalWorkingDays: 200,
        presentDays: Math.floor(Math.random() * 20) + 180 // 180-200
      });

      // Training
      await Training.create({
        employeeId: emp._id,
        trainingName: 'Compliance Training 2024',
        trainingStatus: 'Completed',
        completionPercentage: 100
      });

      // Appraisal
      await Appraisal.create({
        employeeId: emp._id,
        performanceRating: Math.floor(Math.random() * 2) + 3, // 3-4
        appraisalScore: Math.floor(Math.random() * 30) + 70,
        managerEvaluation: 'Good performance overall.'
      });
    }

    console.log('Performance Data Created');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
