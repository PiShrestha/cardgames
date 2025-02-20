const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors()); // Enable CORS if your front end is on a different domain/port

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust this to your front-end's URL in production
    methods: ['GET', 'POST'],
  },
});

// Simple route to test server
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Listen for socket connections
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Example event: user joining a room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    // broadcast to others in the room that a new player joined
    socket.to(roomId).emit('playerJoined', { playerId: socket.id });
  });

  // Example event: user places a bet
  socket.on('bet', (data) => {
    // data might include { roomId, amount }
    // TODO: update game state
    io.to(data.roomId).emit('betPlaced', { playerId: socket.id, amount: data.amount });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(4000, () => {
  console.log('Server listening on port 4000');
});
