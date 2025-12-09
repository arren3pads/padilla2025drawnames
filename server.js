const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;
const FILE_PATH = path.join(__dirname, 'assignments.json');

app.use(express.json());
app.use(express.static('public'));

// Load assignments
function loadAssignments() {
    if (!fs.existsSync(FILE_PATH)) return [];
    return JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
}

// Save assignments
function saveAssignments(data) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

// WebSocket connection
io.on('connection', (socket) => {
    console.log('New client connected');
    const assignments = loadAssignments();
    socket.emit('updateAssignments', assignments);

    socket.on('pickName', ({ picker, names }) => {
        const assignments = loadAssignments();
        const pickedNames = assignments.map(a => a.picked);
        const available = names.filter(n => n !== picker && !pickedNames.includes(n));

        if (available.length === 0) {
            socket.emit('errorMsg', 'No names left to pick!');
            return;
        }

        const picked = available[Math.floor(Math.random() * available.length)];
        assignments.push({ picker, picked });
        saveAssignments(assignments);

        io.emit('updateAssignments', assignments);
        socket.emit('picked', picked);
    });

    socket.on('disconnect', () => console.log('Client disconnected'));
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
