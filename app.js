'use strict';

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const authController = require('./authController');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

/**
 * Function to configure routes of the application.
 */
function configureRoutes() {
  app.post('/login', authController.loginHandler);
  app.post('/recover-password', authController.passwordRecoveryHandler);
}

/**
 * Function to start the server.
 */
function startServer() {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

configureRoutes();

module.exports = {
  startServer,
  configureRoutes
};
