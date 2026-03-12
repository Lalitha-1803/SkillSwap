const Admin = require('../models/Admin.model');
const User = require('../models/User.model');
const Session = require('../models/Session.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Base Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (admin && (await bcrypt.compare(password, admin.password))) {
      res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid admin credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSessions = await Session.countDocuments();
    const ongoingSessions = await Session.countDocuments({ status: { $in: ['Accepted', 'In Progress'] } });
    const pendingSessions = await Session.countDocuments({ status: 'Pending' });
    const completedSessions = await Session.countDocuments({ status: 'Completed' });

    res.json({
      totalUsers,
      totalSessions,
      ongoingSessions,
      pendingSessions,
      completedSessions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Users
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Sessions
// @route   GET /api/admin/sessions
// @access  Private (Admin only)
const getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.find().populate('teacherId', 'name email').populate('learnerId', 'name email');
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await User.deleteOne({_id: req.params.id});
        
        // Also delete related sessions
        await Session.deleteMany({ $or: [{ teacherId: req.params.id }, { learnerId: req.params.id }] });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle Block User
// @route   PUT /api/admin/users/:id/block
// @access  Private (Admin only)
const toggleBlockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.isBlocked = !user.isBlocked;
        await user.save();
        res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, user });
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
  loginAdmin,
  getDashboardStats,
  getAllUsers,
  getAllSessions,
  deleteUser,
  toggleBlockUser
};
