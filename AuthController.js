const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./UserModel');

const router = express.Router();

/**
 * Controller function to handle user login.
 * @async
 * @function loginUser
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON object with success status and message or token.
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication failed. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Authentication failed. Wrong password.' });
    }

    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, message: 'An error occurred during login.' });
  }
};

/**
 * Placeholder for user registration controller function.
 * @async
 * @function registerUser
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON object with success status and message.
 */
const registerUser = async (req, res) => {
  // Implementation to be added
};

router.post('/login', loginUser);

module.exports = router;