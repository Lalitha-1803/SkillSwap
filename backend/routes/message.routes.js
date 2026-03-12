const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/send', protect, sendMessage);
router.get('/:sessionId', protect, getMessages);

module.exports = router;
