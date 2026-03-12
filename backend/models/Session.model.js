const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  message: { type: String },
  googleMeetLink: { type: String },
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected', 'In Progress', 'Completed'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
