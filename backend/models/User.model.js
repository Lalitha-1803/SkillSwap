const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  skillsTeach: [{ type: String }],
  skillsLearn: [{ type: String }],
  rating: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false } // Added for Admin
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
