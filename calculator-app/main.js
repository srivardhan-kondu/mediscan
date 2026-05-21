'use strict';

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

/**
 * Initialize server and listen on the specified port.
 */
function initServer() {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

/**
 * Basic arithmetic operations: add, subtract, multiply, divide.
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @param {string} operation - The operation to perform.
 * @returns {number} - The result of the operation.
 */
function calculate(a, b, operation) {
  switch (operation) {
    case 'add':
      return a + b;
    case 'subtract':
      return a - b;
    case 'multiply':
      return a * b;
    case 'divide':
      if (b === 0) throw new Error('Cannot divide by zero.');
      return a / b;
    default:
      throw new Error('Invalid operation.');
  }
}

/**
 * Handle user authentication.
 */
function authenticateUser(req, res, next) {
  const users = req.users; // Correctly get users from req object
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).send('Authentication failed.');
  }
  bcrypt.compare(password, user.password, (err, match) => {
    if (err) return next(err);
    if (match) {
      const token = jwt.sign({ username }, 'your-secret-key', { expiresIn: '1h' });
      req.session.token = token;
      return res.status(200).send('Authentication successful.');
    }
    return res.status(401).send('Authentication failed.');
  });
}

/**
 * Middleware for checking authentication status.
 */
function isAuthenticated(req, res, next) {
  const token = req.session.token;
  if (!token) {
    return res.status(401).send('You are not authenticated.');
  }
  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) return res.status(401).send('Invalid token.');
    req.user = decoded;
    next();
  });
}

/**
 * Handles API routes for calculator operations and history.
 */
function handleRoutes() {
  app.use((req, res, next) => { // Proper middleware to initialize users
    req.users = [{ username: 'testuser', password: bcrypt.hashSync('password', 10) }];
    next();
  });
  app.post('/login', authenticateUser);

  app.post('/calculate', isAuthenticated, (req, res) => {
    try {
      const { a, b, operation } = req.body;
      const result = calculate(a, b, operation);
      req.session.history = req.session.history || [];
      req.session.history.push({ a, b, operation, result });
      res.json({ result });
    } catch (error) {
      res.status(400).send(error.message);
    }
  });

  app.get('/history', isAuthenticated, (req, res) => {
    res.json(req.session.history || []);
  });
}

module.exports = { initServer, handleRoutes, authenticateUser, calculate };