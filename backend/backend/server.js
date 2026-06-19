const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const busRoutes = require('./routes/bus');
const studentRoutes = require('./routes/student');

app.use('/api/auth', authRoutes);
app.use('/api/bus', busRoutes);
app.use('/api/student', studentRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'TrackMyBus AI Backend Running!' });
});

// Socket.io - Real time GPS
io.on('connection', (socket) => {
    console.log('Driver connected:', socket.id);

    socket.on('driver-location', (data) => {
        io.emit('bus-update', data);
        console.log('Bus location updated:', data);
    });

    socket.on('disconnect', () => {
        console.log('Driver disconnected:', socket.id);
    });
});

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected!');
        server.listen(process.env.PORT, () => {
            console.log(`✅ Server running on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log('❌ MongoDB Error:', err.message);
    });