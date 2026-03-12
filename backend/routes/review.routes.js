const express = require('express');
const router = express.Router();
const { addReview, getUserReviews } = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, addReview);
router.get('/user/:userId', getUserReviews);

module.exports = router;
