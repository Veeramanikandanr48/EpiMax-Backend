// userRoutes.js
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

// Get user profile
router.get('/profile', (req, res) => {
    const userId = req.user.id;
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userProfile = { id: row.id, username: row.username, role: row.role };
        
        // Check if the requested user is the same as the authenticated user
        if (userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden. You can only view your own profile.' });
        }
        
        res.json(userProfile);
    });
});

// Update user profile
router.put('/profile', (req, res) => {
    const userId = req.user.id;
    const { username, role } = req.body;
    
    // Check if the requested user is the same as the authenticated user
    if (userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden. You can only update your own profile.' });
    }

    db.run('UPDATE users SET username = ?, role = ? WHERE id = ?', [username, role, userId], function(err) {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.json({ message: 'Profile updated successfully' });
    });
});

// Delete user account
router.delete('/profile', (req, res) => {
    const userId = req.user.id;

    // Check if the requested user is the same as the authenticated user
    if (userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden. You can only delete your own account.' });
    }

    db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.json({ message: 'Account deleted successfully' });
    });
});

module.exports = router;
