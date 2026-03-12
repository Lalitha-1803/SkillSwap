const Notification = require('../models/Notification.model');

// Get all notifications for user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    
    if (notification.userId.toString() !== req.user.id) {
       return res.status(401).json({ message: 'Not authorized' });
    }
    
    notification.readStatus = true;
    await notification.save();
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, readStatus: false },
      { $set: { readStatus: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to create notification (not a route handler)
const createNotification = async (userId, message, type) => {
  try {
    await Notification.create({ userId, message, type });
  } catch (error) {
    console.error('Error creating notification', error);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, createNotification };
