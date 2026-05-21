"use strict";

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const authController = require('./authController');
const authMiddleware = require('./authMiddleware');

const app = express();

app.use(bodyParser.json());

// Set up session management
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Note: set to true if HTTPS is used
}));

// Routes
app.post('/login', authController.loginUser);
app.post('/logout', authMiddleware.isAuthenticated, authController.logoutUser);
app.post('/register', authController.registerUser);

// Sample protected route
app.get('/protected', authMiddleware.isAuthenticated, (req, res) => {
  res.send('This is a protected route');
});

/**
 * Starts the Express server
 * @param {number} port The port number on which the server will listen
 */
const startServer = (port) => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

module.exports = { app, startServer };