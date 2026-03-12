const Session = require('../models/Session.model');

// Request a session (learner requests a teacher)
const requestSession = async (req, res) => {
  try {
    const { teacherId, skill, date, time, message } = req.body;
    
    // Prevent double booking
    const existingSession = await Session.findOne({
      teacherId,
      date,
      time,
      status: { $in: ['Pending', 'Accepted', 'In Progress'] }
    });
    
    if (existingSession) {
      return res.status(400).json({ message: 'Teacher is already booked or has a pending request for this time slot.' });
    }

    const session = await Session.create({
      teacherId,
      learnerId: req.user.id,
      skill,
      date,
      time,
      message
    });

    // Create Notification
    const { createNotification } = require('./notification.controller');
    await createNotification(
      teacherId,
      `You have a new session request for ${skill} on ${date} at ${time}`,
      'session'
    );

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept a session
const acceptSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    
    if (session.teacherId.toString() !== req.user.id) {
       return res.status(401).json({ message: 'Not authorized, only teacher can accept' });
    }
    
    session.status = 'Accepted';
    // Generate a random dummy Google Meet link
    const randomString = Math.random().toString(36).substring(2, 12);
    session.googleMeetLink = `https://meet.google.com/${randomString.substring(0,3)}-${randomString.substring(3,7)}-${randomString.substring(7,10)}`;
    
    const updatedSession = await session.save();
    res.json(updatedSession);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Start a session
const startSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    
    if (session.teacherId.toString() !== req.user.id && session.learnerId.toString() !== req.user.id) {
       return res.status(401).json({ message: 'Not authorized' });
    }
    
    if (session.status !== 'Accepted') {
       return res.status(400).json({ message: 'Only accepted sessions can be started' });
    }

    session.status = 'In Progress';
    const updatedSession = await session.save();
    res.json(updatedSession);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Complete a session
const completeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    
    // Either teacher or learner can complete
    if (session.teacherId.toString() !== req.user.id && session.learnerId.toString() !== req.user.id) {
       return res.status(401).json({ message: 'Not authorized' });
    }
    
    session.status = 'Completed';
    const updatedSession = await session.save();
    res.json(updatedSession);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject a session
const rejectSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    
    if (session.teacherId.toString() !== req.user.id) {
       return res.status(401).json({ message: 'Not authorized, only teacher can reject' });
    }
    
    session.status = 'Rejected';
    const updatedSession = await session.save();
    res.json(updatedSession);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get My Sessions
const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ teacherId: req.user.id }, { learnerId: req.user.id }]
    }).populate('teacherId', 'name email').populate('learnerId', 'name email');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a session
const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    
    // Only the teacher or learner of this session can delete it
    if (session.teacherId.toString() !== req.user.id && session.learnerId.toString() !== req.user.id) {
       return res.status(401).json({ message: 'Not authorized to delete this session' });
    }
    
    // Perform deletion using deleteOne
    await Session.deleteOne({ _id: req.params.id });
    
    // Optionally delete associated messages
    const Message = require('../models/Message.model');
    await Message.deleteMany({ sessionId: req.params.id });

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { requestSession, acceptSession, completeSession, rejectSession, getMySessions, startSession, deleteSession };
