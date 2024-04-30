// adminRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../auth');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db.sqlite');

// Middleware to verify JWT token and check user role
router.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    try {
        const decoded = verifyToken(token.replace('Bearer ', '')); // Remove 'Bearer ' prefix
        req.user = decoded;

        // Check if user has admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Permission denied: Admin access required' });
        }
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
});

// Get all users (requires admin role)
router.get('/users', (req, res) => {
    db.all('SELECT * FROM users', (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error', error: err.message });
        }
        res.json(rows);
    });
});

// Update a user by ID (requires admin role)
router.put('/users/:id', (req, res) => {
    const userId = req.params.id;
    const { username, password, role } = req.body;
    const sql = `UPDATE users SET username = ?, password_hash = ?, role = ? WHERE id = ?`;
    db.run(sql, [username, password, role, userId], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Internal server error', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User updated successfully' });
    });
});

// Delete a user by ID (requires admin role)
router.delete('/users/:id', (req, res) => {
    const userId = req.params.id;
    db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Internal server error', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    });
});

module.exports = router;
