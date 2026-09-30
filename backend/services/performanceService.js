const KPI = require('../models/KPI');
const ProjectContribution = require('../models/ProjectContribution');
const Attendance = require('../models/Attendance');
const Training = require('../models/Training');
const Appraisal = require('../models/Appraisal');
const Employee = require('../models/Employee');

const calculateEmployeePerformance = async (employeeId) => {
  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Fetch all records
    const kpis = await KPI.find({ employeeId });
    const projects = await ProjectContribution.find({ employeeId });
    const attendances = await Attendance.find({ employeeId });
    const trainings = await Training.find({ employeeId });
    const appraisals = await Appraisal.find({ employeeId });

    // Calculate averages
    const kpiAvg = kpis.length > 0 ? kpis.reduce((acc, curr) => acc + (curr.kpiScore || 0), 0) / kpis.length : 0;
    const projectAvg = projects.length > 0 ? projects.reduce((acc, curr) => acc + (curr.contributionScore || 0), 0) / projects.length : 0;
    const attendanceAvg = attendances.length > 0 ? attendances.reduce((acc, curr) => acc + (curr.attendancePercentage || 0), 0) / attendances.length : 0;
    const trainingAvg = trainings.length > 0 ? trainings.reduce((acc, curr) => acc + (curr.completionPercentage || 0), 0) / trainings.length : 0;
    const appraisalAvg = appraisals.length > 0 ? appraisals.reduce((acc, curr) => acc + (curr.appraisalScore || 0), 0) / appraisals.length : 0;

    // Calculate overall score (Weighted)
    // KPI Performance = 30%
    // Project Contribution = 25%
    // Attendance = 15%
    // Training Completion = 10%
    // Appraisal Metrics = 20%
    
    let totalWeight = 0;
    let weightedScore = 0;

    if (kpis.length > 0) {
      weightedScore += kpiAvg * 0.30;
      totalWeight += 0.30;
    }
    if (projects.length > 0) {
      weightedScore += projectAvg * 0.25;
      totalWeight += 0.25;
    }
    if (attendances.length > 0) {
      weightedScore += attendanceAvg * 0.15;
      totalWeight += 0.15;
    }
    if (trainings.length > 0) {
      weightedScore += trainingAvg * 0.10;
      totalWeight += 0.10;
    }
    if (appraisals.length > 0) {
      weightedScore += appraisalAvg * 0.20;
      totalWeight += 0.20;
    }

    // Normalize score if some data is missing, to not penalize
    let overallScore = totalWeight > 0 ? (weightedScore / totalWeight) : 0;
    overallScore = Math.round(overallScore * 100) / 100;

    // For the specific requirement: Overall Score = (90 * 0.30) + (80 * 0.25)...
    // If we want absolute weights regardless of missing data:
    // overallScore = (kpiAvg * 0.30) + (projectAvg * 0.25) + (attendanceAvg * 0.15) + (trainingAvg * 0.10) + (appraisalAvg * 0.20);
    // The prompt says "Handle employees who do not yet have all performance data... Use sensible defaults for missing components... Do not crash"
    // I will use the absolute formula as specified, but missing data defaults to 0. 
    // Wait, the prompt says "If there is no attendance record, display: 'Attendance data not available'".
    // Let's use the exact formula from the prompt.
    
    overallScore = (kpiAvg * 0.30) + (projectAvg * 0.25) + (attendanceAvg * 0.15) + (trainingAvg * 0.10) + (appraisalAvg * 0.20);
    overallScore = Math.round(overallScore * 100) / 100;

    let category = 'Needs Improvement';
    if (overallScore >= 90) category = 'Excellent';
    else if (overallScore >= 75) category = 'Good';
    else if (overallScore >= 60) category = 'Average';

    return {
      employeeId: employee._id,
      employeeDetails: employee,
      kpiPerformance: kpiAvg,
      projectPerformance: projectAvg,
      attendancePerformance: attendanceAvg,
      trainingPerformance: trainingAvg,
      appraisalPerformance: appraisalAvg,
      hasKpi: kpis.length > 0,
      hasProject: projects.length > 0,
      hasAttendance: attendances.length > 0,
      hasTraining: trainings.length > 0,
      hasAppraisal: appraisals.length > 0,
      overallScore,
      category
    };

  } catch (error) {
    console.error('Error calculating performance:', error);
    throw error;
  }
};

module.exports = {
  calculateEmployeePerformance
};
