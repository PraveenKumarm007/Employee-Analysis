const Employee = require('../models/Employee');
const { calculateEmployeePerformance } = require('../services/performanceService');

exports.getDashboardStats = async (req, res) => {
  try {
    const employees = await Employee.find();
    const performances = await Promise.all(
      employees.map(emp => calculateEmployeePerformance(emp._id))
    );

    const totalEmployees = employees.length;
    let totalScore = 0;
    
    let excellent = 0;
    let good = 0;
    let average = 0;
    let needsImprovement = 0;

    let departmentStats = {};
    let totalKpi = 0, kpiCount = 0;
    let totalAttendance = 0, attendanceCount = 0;
    let totalTraining = 0, trainingCount = 0;

    performances.forEach(perf => {
      totalScore += perf.overallScore;

      if (perf.category === 'Excellent') excellent++;
      else if (perf.category === 'Good') good++;
      else if (perf.category === 'Average') average++;
      else needsImprovement++;

      const dept = perf.employeeDetails.department;
      if (!departmentStats[dept]) {
        departmentStats[dept] = { totalScore: 0, count: 0 };
      }
      departmentStats[dept].totalScore += perf.overallScore;
      departmentStats[dept].count += 1;

      if (perf.hasKpi) {
        totalKpi += perf.kpiPerformance;
        kpiCount++;
      }
      if (perf.hasAttendance) {
        totalAttendance += perf.attendancePerformance;
        attendanceCount++;
      }
      if (perf.hasTraining) {
        totalTraining += perf.trainingPerformance;
        trainingCount++;
      }
    });

    const averagePerformance = totalEmployees > 0 ? (totalScore / totalEmployees).toFixed(2) : 0;
    
    const departmentAverages = Object.keys(departmentStats).map(dept => ({
      name: dept,
      average: (departmentStats[dept].totalScore / departmentStats[dept].count).toFixed(2)
    }));

    res.json({
      totalEmployees,
      averagePerformance: Number(averagePerformance),
      performanceDistribution: [
        { name: 'Excellent', value: excellent },
        { name: 'Good', value: good },
        { name: 'Average', value: average },
        { name: 'Needs Improvement', value: needsImprovement }
      ],
      departmentAverages,
      averages: {
        kpi: kpiCount > 0 ? (totalKpi / kpiCount).toFixed(2) : 0,
        attendance: attendanceCount > 0 ? (totalAttendance / attendanceCount).toFixed(2) : 0,
        training: trainingCount > 0 ? (totalTraining / trainingCount).toFixed(2) : 0
      },
      topPerformers: performances.sort((a, b) => b.overallScore - a.overallScore).slice(0, 5),
      needsImprovementList: performances.filter(p => p.category === 'Needs Improvement')
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
