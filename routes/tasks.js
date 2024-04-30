// routes/tasks.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const { verifyToken } = require('../auth');

const db = new sqlite3.Database('./db.sqlite');

// Middleware to verify JWT token
router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = verifyToken(token.replace('Bearer ', '')); // Remove 'Bearer ' prefix
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
});

// Create a task
router.post('/', (req, res) => {
    const { title, description, assignee_id } = req.body;
    const sql = `INSERT INTO tasks (title, description, assignee_id) VALUES (?, ?, ?)`;
    db.run(sql, [title, description, assignee_id], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Internal server error', error: err.message });
        }
        res.status(201).json({ message: 'Task created successfully', taskId: this.lastID });
    });
});

// Retrieve all tasks
router.get('/', (req, res) => {
    db.all('SELECT * FROM tasks', (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error', error: err.message });
        }
        res.json(rows);
    });
});

// Retrieve a task by ID
router.get('/:id', (req, res) => {
    const taskId = req.params.id;
    db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error', error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(row);
    });
});

// Update a task by ID
router.put('/:id', (req, res) => {
    const taskId = req.params.id;
    const { title, description, status } = req.body;
    const sql = `UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?`;
    db.run(sql, [title, description, status, taskId], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Internal server error', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task updated successfully' });
    });
});

// Delete a task by ID
router.delete('/:id', (req, res) => {
    const taskId = req.params.id;
    db.run('DELETE FROM tasks WHERE id = ?', [taskId], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Internal server error', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    });
});

module.exports = router;
