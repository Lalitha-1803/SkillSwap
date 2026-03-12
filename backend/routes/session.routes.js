const express = require('express');
const router = express.Router();
const { requestSession, acceptSession, completeSession, rejectSession, getMySessions, startSession, deleteSession } = require('../controllers/session.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/request', protect, requestSession);
router.put('/accept/:id', protect, acceptSession);
router.put('/reject/:id', protect, rejectSession);
router.put('/start/:id', protect, startSession);
router.put('/complete/:id', protect, completeSession);
router.get('/my', protect, getMySessions);
router.delete('/:id', protect, deleteSession);

module.exports = router;
