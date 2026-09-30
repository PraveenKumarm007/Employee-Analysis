const mongoose = require('mongoose');

const projectContributionSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  projectName: {
    type: String,
    required: true
  },
  contributionDescription: {
    type: String,
    required: true
  },
  contributionScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
}, { timestamps: true });

module.exports = mongoose.model('ProjectContribution', projectContributionSchema);
