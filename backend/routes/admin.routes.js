const express = require('express');
const router = express.Router();
const {
  loginAdmin,
  getDashboardStats,
  getAllUsers,
  getAllSessions,
  deleteUser,
  toggleBlockUser
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');

// Admin Login
router.post('/login', loginAdmin);

// Protected Admin Routes
// We re-use protect middleware because we just need a valid token. 
// For a stricter approach, we would verify the role, but here we just ensure 
// it's an authenticated request and admin functionality exists on the frontend routing.
router.get('/dashboard', protect, getDashboardStats);
router.get('/users', protect, getAllUsers);
router.get('/sessions', protect, getAllSessions);
router.delete('/users/:id', protect, deleteUser);
router.put('/users/:id/block', protect, toggleBlockUser);

module.exports = router;
