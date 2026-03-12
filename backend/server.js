require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Health Check
app.get('/', (req, res) => {
  res.send('SkillSwap API is running...');
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/skills', require('./routes/skill.routes'));
app.use('/api/sessions', require('./routes/session.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/admin', require('./routes/admin.routes')); // Added Admin Routes
app.use('/api/swap-requests', require('./routes/swapRequest.routes')); // Added Swap Request Routes
app.use('/api/notifications', require('./routes/notification.routes')); // Added Notification Routes
app.use('/api/reviews', require('./routes/review.routes')); // Added Review Routes

const User = require('./models/User.model');
const Admin = require('./models/Admin.model'); // Added Admin Model
const bcrypt = require('bcryptjs');

const seedUsers = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log('Seeding database with sample Admin...');
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash('admin123', salt);
      await Admin.create({
        name: 'Super Admin',
        email: 'admin@example.com',
        password
      });
    }

    // Explicitly removed the default User seeding snippet to keep system clean!
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.io logic
io.on('connection', (socket) => {
  console.log(`User connected to socket: ${socket.id}`);

  // Join a room for a specific session
  socket.on('join_session', (sessionId) => {
    socket.join(sessionId);
    console.log(`User joined session room: ${sessionId}`);
  });

  // Handle incoming chat messages
  socket.on('send_message', (data) => {
    // data should contain { sessionId, senderId, receiverId, message, senderName(optional) }
    // Broadcast the message to all users in the session room (including sender to update UI)
    io.to(data.sessionId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Database Connection & Server Start
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedUsers();
    const PORT = process.env.PORT || 5001;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
