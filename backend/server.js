const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Allows any frontend URL to connect (update for production)
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Attach io to the request object so controllers can emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('Connected to MongoDB');
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});
