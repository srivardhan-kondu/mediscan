// authController.js - Controller for handling user authentication requests
const { User } = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/**
 * Logs in a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.login = async function(req, res) {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Authentication failed: User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Authentication failed: Incorrect password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        return res.status(200).json({ token });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

/**
 * Validates a user session via token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.validateSession = function(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Authentication failed: No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Authentication failed: Invalid token' });
        }
        req.user = decoded;
        next();
    });
};
