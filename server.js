import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import formatMessage from './utils/messages.js';
import { userjoin, getcurrentuser, userleave, getroomuser } from './utils/users.js';

dotenv.config();

const app = express();
const httpserver = http.createServer(app);
const io = new Server(httpserver);
const PORT = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

const botname = 'BOT';

// WebSocket logic
io.on('connection', socket => {
  socket.on('joinroom', ({ username, room }) => {
    const user = userjoin(socket.id, username, room);
    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botname, 'Welcome to the chat'));

    // Broadcast when a user connects
    socket.broadcast.to(user.room).emit(
      'message',
      formatMessage(botname, `${user.username} has joined the chat`)
    );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getroomuser(user.room),
    });
  });

  // Listen for chat messages
  socket.on('chatMessage', msg => {
    const user = getcurrentuser(socket.id);
    if (user) {
      io.to(user.room).emit('message', formatMessage(user.username, msg));
    }
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userleave(socket.id);
    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botname, `${user.username} left the chat`)
      );

      // Send updated room users
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getroomuser(user.room),
      });
    }
  });
});

httpserver.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
