'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(session({
    secret: 'calculator_secret',
    resave: false,
    saveUninitialized: true
}));

// Utility functions
function validateNumbers(req, res, next) {
    const { num1, num2 } = req.body;
    if (typeof num1 !== 'number' || typeof num2 !== 'number') {
        return res.status(400).json({ error: 'Invalid numbers' });
    }
    next();
}

// Routes
/**
 * Route to handle arithmetic operations.
 * Expected JSON body: { "num1": number, "num2": number, "operation": string }
 * `operation` can be 'add', 'subtract', 'multiply', or 'divide'.
 */
app.post('/calculate', validateNumbers, (req, res) => {
    const { num1, num2, operation } = req.body;
    let result;
    switch (operation) {
        case 'add':
            result = num1 + num2;
            break;
        case 'subtract':
            result = num1 - num2;
            break;
        case 'multiply':
            result = num1 * num2;
            break;
        case 'divide':
            if (num2 === 0) {
                return res.status(400).json({ error: 'Division by zero' });
            }
            result = num1 / num2;
            break;
        default:
            return res.status(400).json({ error: 'Invalid operation' });
    }
    res.json({ result });
});

/**
 * User login route
 * Expected JSON body: { "username": string, "password": string }
 */
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    // Mock user authentication
    if (username === 'user' && password === 'pass') {
        req.session.user = { username };
        return res.json({ message: 'Login successful' });
    }
    res.status(401).json({ error: 'Invalid username or password' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = {
    startServer: () => app.listen(PORT, () => console.log(`Server running on ${PORT}`)),
    calculateOperation: calculateOperation,
    userLogin: userLogin
};