const Message = require('../models/Message.model');
const Session = require('../models/Session.model');

// Send Message
const sendMessage = async (req, res) => {
  try {
    const { sessionId, receiverId, message } = req.body;
    
    // Verify session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Only accepted/in-progress/completed sessions can chat (Wait, requirement says "only work after a session request is accepted")
    if (session.status === 'Pending' || session.status === 'Rejected') {
      return res.status(400).json({ message: 'Chat is only available for accepted sessions' });
    }
    
    // Verify users belong to the session
    const currentUserId = req.user.id;
    if (session.teacherId.toString() !== currentUserId && session.learnerId.toString() !== currentUserId) {
      return res.status(401).json({ message: 'You are not part of this session' });
    }

    const newMessage = await Message.create({
      sessionId,
      senderId: currentUserId,
      receiverId,
      message
    });
    
    // Populate sender info so frontend can display names
    await newMessage.populate('senderId', 'name');
    
    // Create Notification
    const { createNotification } = require('./notification.controller');
    await createNotification(
      receiverId,
      `New message from ${newMessage.senderId.name}: ${message.substring(0, 30)}...`,
      'message'
    );
    
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Session Messages
const getMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const currentUserId = req.user.id;

    // Verify session
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.teacherId.toString() !== currentUserId && session.learnerId.toString() !== currentUserId) {
      return res.status(401).json({ message: 'You are not part of this session' });
    }

    const messages = await Message.find({ sessionId })
                                  .sort({ createdAt: 1 })
                                  .populate('senderId', 'name');
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, getMessages };
