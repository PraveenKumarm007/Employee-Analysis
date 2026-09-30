const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  totalWorkingDays: {
    type: Number,
    required: true,
    min: 1
  },
  presentDays: {
    type: Number,
    required: true,
    min: 0
  },
  absentDays: {
    type: Number
  },
  attendancePercentage: {
    type: Number
  }
}, { timestamps: true });

attendanceSchema.pre('save', function() {
  if (this.presentDays > this.totalWorkingDays) {
    this.presentDays = this.totalWorkingDays;
  }
  this.absentDays = this.totalWorkingDays - this.presentDays;
  this.attendancePercentage = (this.presentDays / this.totalWorkingDays) * 100;
});

module.exports = mongoose.model('Attendance', attendanceSchema);
