const mongoose = require('mongoose');

const kpiSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  kpiName: {
    type: String,
    required: true
  },
  targetValue: {
    type: Number,
    required: true
  },
  achievedValue: {
    type: Number,
    required: true
  },
  kpiScore: {
    type: Number
  }
}, { timestamps: true });

kpiSchema.pre('save', function() {
  if (this.targetValue > 0) {
    let score = (this.achievedValue / this.targetValue) * 100;
    this.kpiScore = Math.min(score, 100);
  } else {
    this.kpiScore = 0;
  }
});

module.exports = mongoose.model('KPI', kpiSchema);
