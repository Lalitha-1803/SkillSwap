const User = require('../models/User.model');

// Search skills/users teaching that skill
const searchSkills = async (req, res) => {
  try {
    const { skill } = req.query;
    if (!skill) {
      const users = await User.find({ skillsTeach: { $exists: true, $not: { $size: 0 } } }).select('-password');
      return res.json(users);
    }

    // Case-insensitive search using Regex
    const regex = new RegExp(skill, 'i');
    const users = await User.find({
      $or: [
        { skillsTeach: { $in: [regex] } },
        { bio: { $regex: regex } }
      ]
    }).select('-password');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all unique skills taught by users
const getUniqueSkills = async (req, res) => {
  try {
    const skills = await User.distinct('skillsTeach');
    const filteredSkills = skills.filter(skill => skill && skill.trim() !== '');
    res.json(filteredSkills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { searchSkills, getUniqueSkills };
