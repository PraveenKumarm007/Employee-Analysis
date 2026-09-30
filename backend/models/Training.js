const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  trainingName: {
    type: String,
    required: true
  },
  trainingStatus: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started'
  },
  completionPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
}, { timestamps: true });

module.exports = mongoose.model('Training', trainingSchema);
