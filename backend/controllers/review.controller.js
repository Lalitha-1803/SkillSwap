const Review = require('../models/Review.model');
const Session = require('../models/Session.model');
const User = require('../models/User.model');

// Add a review
const addReview = async (req, res) => {
  try {
    const { sessionId, rating, comment } = req.body;
    
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    
    if (session.status !== 'Completed') {
      return res.status(400).json({ message: 'Can only review completed sessions' });
    }

    // Determine target user (if reviewer is learner, target is teacher, and vice versa)
    let targetUserId;
    if (session.learnerId.toString() === req.user.id) {
        targetUserId = session.teacherId;
    } else if (session.teacherId.toString() === req.user.id) {
        targetUserId = session.learnerId;
    } else {
        return res.status(403).json({ message: 'You were not part of this session' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ sessionId, reviewerId: req.user.id });
    if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this session' });
    }

    const review = await Review.create({
      sessionId,
      reviewerId: req.user.id,
      targetUserId,
      rating,
      comment
    });

    // Update target user's average rating
    const allReviews = await Review.find({ targetUserId });
    const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;
    await User.findByIdAndUpdate(targetUserId, { rating: Number(avgRating.toFixed(1)) });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reviews for a user
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ targetUserId: req.params.userId })
      .populate('reviewerId', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addReview, getUserReviews };
