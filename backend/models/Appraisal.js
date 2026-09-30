const mongoose = require('mongoose');

const appraisalSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  performanceRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  appraisalScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  managerEvaluation: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Appraisal', appraisalSchema);
