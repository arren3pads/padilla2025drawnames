const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public')); // serve HTML from public folder

const FILE_PATH = path.join(__dirname, 'assignments.json');

// Helper: load assignments
function loadAssignments() {
    if (!fs.existsSync(FILE_PATH)) return [];
    return JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
}

// Helper: save assignments
function saveAssignments(data) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

// Get current assignments
app.get('/api/assignments', (req, res) => {
    const assignments = loadAssignments();
    res.json(assignments);
});

// Pick a random name
app.post('/api/pick', (req, res) => {
    const { picker, names } = req.body;
    if (!picker || !names) return res.status(400).json({ error: 'Missing picker or names' });

    const assignments = loadAssignments();
    const pickedNames = assignments.map(a => a.picked);
    const available = names.filter(n => n !== picker && !pickedNames.includes(n));

    if (available.length === 0) return res.status(400).json({ error: 'No names left to pick!' });

    const randomIndex = Math.floor(Math.random() * available.length);
    const picked = available[randomIndex];

    assignments.push({ picker, picked });
    saveAssignments(assignments);

    res.json({ picked });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
