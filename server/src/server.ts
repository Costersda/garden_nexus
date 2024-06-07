import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);



app.get('/', (req, res) => {
  res.send('API is up');
});

io.on('connection', () => {
    console.log('connect');
});

mongoose.connect('mongodb://localhost:27017/garden_nexus').then(() => {
    console.log('Connected to MongoDB');

    httpServer.listen(4001, () => {
        console.log('Server is running on port 4001');
      });
});

