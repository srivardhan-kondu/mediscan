"use strict";

/**
 * Middleware to protect routes, checks if user is authenticated
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {function} next Next middleware function
 */
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized access' });
};

module.exports = { isAuthenticated };