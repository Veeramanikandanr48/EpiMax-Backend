// auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const secretKey = 'veera'; // Replace with your secret key
const saltRounds = 10;

// Generate JWT token
function generateToken(user) {
    return jwt.sign({ id: user.id, username: user.username, role: user.role }, secretKey, { expiresIn: '1h' });
}

// Hash password
async function hashPassword(password) {
    try {
        if (!password) {
            throw new Error('Password is required');
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Error hashing password');
    }
}


// Verify password
async function verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

// Verify JWT token
function verifyToken(token) {
    return jwt.verify(token, secretKey);
}

module.exports = { generateToken, hashPassword, verifyPassword, verifyToken, saltRounds };
