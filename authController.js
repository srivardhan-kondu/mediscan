"use strict";

const bcrypt = require('bcrypt');

const users = new Map(); // Temporary in-memory user store

/**
 * Registers a new user
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (users.has(username)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.set(username, hashedPassword);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Logs in a user
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const storedPassword = users.get(username);

    if (!storedPassword || !(await bcrypt.compare(password, storedPassword))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    req.session.user = { username };
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Logs out a user
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
const logoutUser = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out user' });
    }
    res.status(200).json({ message: 'Logout successful' });
  });
};

module.exports = { loginUser, logoutUser, registerUser };