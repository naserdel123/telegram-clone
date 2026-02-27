const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telegram-clone', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Models
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  status: { type: String, default: 'offline' },
  lastSeen: { type: Date, default: Date.now }
}));

const Message = mongoose.model('Message', new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, default: 'text' },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
}));

// Auth Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await require('bcryptjs').hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.json({ success: true, message: 'User created' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !await require('bcryptjs').compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = require('jsonwebtoken').sign({ username }, process.env.JWT_SECRET || 'secret');
    res.json({ token, username, avatar: user.avatar });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get users
app.get('/api/users', async (req, res) => {
  const users = await User.find({}, 'username avatar status lastSeen');
  res.json(users);
});

// Get messages between two users
app.get('/api/messages/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  const messages = await Message.find({
    $or: [
      { sender: user1, receiver: user2 },
      { sender: user2, receiver: user1 }
    ]
  }).sort({ timestamp: 1 });
  res.json(messages);
});

// Socket.io
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', async (username) => {
    onlineUsers.set(username, socket.id);
    socket.username = username;
    
    // Update user status
    await User.findOneAndUpdate(
      { username },
      { status: 'online', lastSeen: new Date() }
    );
    
    // Notify others
    io.emit('user_status', { username, status: 'online' });
    
    // Send online users list
    const onlineUsernames = Array.from(onlineUsers.keys());
    socket.emit('online_users', onlineUsernames);
  });

  socket.on('send_message', async (data) => {
    const { receiver, content, type = 'text' } = data;
    
    // Save message
    const message = new Message({
      sender: socket.username,
      receiver,
      content,
      type,
      timestamp: new Date()
    });
    await message.save();

    // Send to receiver if online
    const receiverSocketId = onlineUsers.get(receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('new_message', message);
    }
    
    // Confirm to sender
    socket.emit('message_sent', message);
  });

  socket.on('typing', (data) => {
    const receiverSocketId = onlineUsers.get(data.receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing', { sender: socket.username });
    }
  });

  socket.on('disconnect', async () => {
    if (socket.username) {
      onlineUsers.delete(socket.username);
      await User.findOneAndUpdate(
        { username: socket.username },
        { status: 'offline', lastSeen: new Date() }
      );
      io.emit('user_status', { username: socket.username, status: 'offline' });
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
