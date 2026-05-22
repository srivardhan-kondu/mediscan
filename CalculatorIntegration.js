const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Token is missing');
  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to authenticate token.' });
    }
    req.userId = decoded.id;
    next();
  });
};

/**
 * Handles dummy integration for calculator - This is for illustrative purposes only
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.post('/integrate', verifyToken, (req, res) => {
  res.json({ success: true, message: 'Integration successful!' });
});

module.exports = router;
