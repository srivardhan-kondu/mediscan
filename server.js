const express = require('express');
const session = require('express-session');
const { login } = require('./loginController');
const { createSession, destroySession } = require('./sessionManager');

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Routes
app.post('/login', async (req, res) => {
  try {
    const user = await login(req.body);
    if (user) {
      createSession(req, user);
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(400).json({ message: 'Invalid username or password' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.post('/logout', (req, res) => {
  try {
    destroySession(req);
    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * Initializes the server on the specified port.
 * @param {number} port The port on which the server will listen.
 */
function initializeServer(port) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = { app, initializeServer };