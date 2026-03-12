const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getUserById, getLeaderboard } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.route('/profile').get(protect, getProfile).put(protect, updateProfile);
router.get('/leaderboard', getLeaderboard);
router.get('/:id', protect, getUserById);

module.exports = router;
