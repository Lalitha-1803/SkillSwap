const User = require('../models/User.model');

// Get User Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.skillsTeach = req.body.skillsTeach || user.skillsTeach;
    user.skillsLearn = req.body.skillsLearn || user.skillsLearn;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User by ID (Optional)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    // Find users who teach skills
    const users = await User.find({ skillsTeach: { $exists: true, $not: { $size: 0 } } })
      .sort({ rating: -1 })
      .limit(20)
      .select('-password');
      
    const Session = require('../models/Session.model');
    
    const leaderboard = await Promise.all(users.map(async (user) => {
       const completedSessions = await Session.countDocuments({ teacherId: user._id, status: 'Completed' });
       return {
         ...user.toObject(),
         completedSessions
       };
    }));

    // Sort by rating desc, then completedSessions desc
    leaderboard.sort((a, b) => b.rating - a.rating || b.completedSessions - a.completedSessions);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile, getUserById, getLeaderboard };
