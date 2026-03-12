const express = require('express');
const router = express.Router();
const { createSwapRequest, getMySwapRequests, acceptSwapRequest, rejectSwapRequest } = require('../controllers/swapRequest.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, createSwapRequest);
router.get('/my', protect, getMySwapRequests);
router.put('/accept/:id', protect, acceptSwapRequest);
router.put('/reject/:id', protect, rejectSwapRequest);

module.exports = router;
