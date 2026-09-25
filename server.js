const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

// Tell the server to show files from this folder
app.use(express.static(__dirname));

// Force the server to show index.html when someone visits
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', socket.id);
    });

    socket.on('signal', (data) => {
        socket.to(data.roomId).emit('signal', {
            sender: socket.id,
            type: data.type,
            target: data.target,
            payload: data.payload
        });
    });

    socket.on('user-disconnected', (roomId) => {
        socket.to(roomId).emit('user-left', socket.id);
        socket.leave(roomId);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server is running!`));