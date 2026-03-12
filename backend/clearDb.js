require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.model');
const Session = require('./models/Session.model');
const Review = require('./models/Review.model');
const SwapRequest = require('./models/SwapRequest.model');
const Message = require('./models/Message.model');
const Notification = require('./models/Notification.model');

const wipeDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Delete all users
    await User.deleteMany({});
    console.log('All Users deleted.');
    
    // Cleaning lingering associated documents for a brand new system start
    await Session.deleteMany({});
    await Review.deleteMany({});
    await SwapRequest.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    console.log('All associated records deleted.');

    console.log('Database wiped successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error wiping database:', error);
    process.exit(1);
  }
};

wipeDatabase();
