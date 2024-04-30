// server.js
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { generateToken, hashPassword, verifyPassword } = require('./auth');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Create SQLite database connection
const db = new sqlite3.Database('./db.sqlite');

// Middleware
app.use(bodyParser.json());

// User registration endpoint
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = await hashPassword(password);
    const sql = `INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`;
    db.run(sql, [username, hashedPassword, role], function(err) {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        const userId = this.lastID;
        const token = generateToken({ id: userId, username, role });
        res.status(201).json({ token });
    });
});

// User login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const sql = `SELECT * FROM users WHERE username = ?`;
    db.get(sql, [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const passwordMatch = await verifyPassword(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const token = generateToken(user);
        res.json({ token });
    });
});

// Protected route example
app.get('/protected', (req, res) => {
    res.json({ message: 'This is a protected route!' });
});

// Tasks routes
const tasksRouter = require('./routes/tasks');
app.use('/tasks', tasksRouter);

// Admin routes
app.use('/admin', adminRoutes);

// User routes
app.use('/user', userRoutes);

// Start the server
if (!module.parent) {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL
        )`, () => {
            db.run(`CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'Pending',
                assignee_id INTEGER,
                FOREIGN KEY(assignee_id) REFERENCES users(id)
            )`, () => {
                app.listen(PORT, () => {
                    console.log(`Server is running on http://localhost:${PORT}`);
                });
            });
        });
    });
}

module.exports = app; // Export the app for testing
