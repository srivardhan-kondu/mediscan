"use strict";

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

/**
 * Starts the Express server on the specified port.
 * @param {number} port - Port number to listen on.
 */
function startServer(port) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

/**
 * Handler for login route.
 * Validates input and returns a relevant response.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
function loginHandler(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Invalid input. Username and password are required.' });
  }
  // Perform authentication logic here
  return res.status(200).json({ message: 'Login successful' });
}

app.post('/login', loginHandler);

module.exports = { startServer, loginHandler };