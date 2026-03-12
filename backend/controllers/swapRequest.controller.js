const SwapRequest = require('../models/SwapRequest.model');
const Session = require('../models/Session.model');

// Send Swap Request
const createSwapRequest = async (req, res) => {
  try {
    const { receiverId, skillOffered, skillWanted, message } = req.body;
    
    if (req.user.id === receiverId) {
      return res.status(400).json({ message: "You cannot send a swap request to yourself" });
    }

    const newRequest = await SwapRequest.create({
      senderId: req.user.id,
      receiverId,
      skillOffered,
      skillWanted,
      message
    });
    
    // Create Notification
    const { createNotification } = require('./notification.controller');
    await createNotification(
      receiverId,
      `You have a new swap request for ${skillWanted}`,
      'swap'
    );
    
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Swap Requests (Both sent and received)
const getMySwapRequests = async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      $or: [{ senderId: req.user.id }, { receiverId: req.user.id }]
    })
    .populate('senderId', 'name email')
    .populate('receiverId', 'name email')
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept Swap Request
const acceptSwapRequest = async (req, res) => {
  try {
    const swapReq = await SwapRequest.findById(req.params.id);
    if (!swapReq) return res.status(404).json({ message: 'Swap request not found' });
    
    if (swapReq.receiverId.toString() !== req.user.id) {
       return res.status(401).json({ message: 'Not authorized, only the receiver can accept' });
    }
    
    if (swapReq.status !== 'Pending') {
      return res.status(400).json({ message: 'This request is already processed' });
    }

    swapReq.status = 'Accepted';
    await swapReq.save();

    // Auto-generate two Session entries
    // Session 1: Sender teaches Receiver
    const session1 = await Session.create({
      teacherId: swapReq.senderId,
      learnerId: swapReq.receiverId,
      skill: swapReq.skillOffered,
      date: 'TBD',
      time: 'TBD',
      message: 'Auto-generated session from accepted swap request',
      status: 'Pending'
    });

    // Session 2: Receiver teaches Sender
    const session2 = await Session.create({
      teacherId: swapReq.receiverId,
      learnerId: swapReq.senderId,
      skill: swapReq.skillWanted,
      date: 'TBD',
      time: 'TBD',
      message: 'Auto-generated session from accepted swap request',
      status: 'Pending'
    });

    // Create Notification
    const { createNotification } = require('./notification.controller');
    await createNotification(
      swapReq.senderId,
      `Your swap request for ${swapReq.skillWanted} has been accepted!`,
      'swap'
    );

    res.json({ message: 'Swap request accepted, two sessions automatically created.', swapReq, sessions: [session1, session2] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject Swap Request
const rejectSwapRequest = async (req, res) => {
  try {
    const swapReq = await SwapRequest.findById(req.params.id);
    if (!swapReq) return res.status(404).json({ message: 'Swap request not found' });
    
    if (swapReq.receiverId.toString() !== req.user.id) {
       return res.status(401).json({ message: 'Not authorized' });
    }
    
    swapReq.status = 'Rejected';
    await swapReq.save();
    
    res.json(swapReq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSwapRequest,
  getMySwapRequests,
  acceptSwapRequest,
  rejectSwapRequest
};
