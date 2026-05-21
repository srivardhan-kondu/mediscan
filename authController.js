'use strict';

/**
 * Function handling the login process.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
function loginHandler(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Mock authentication logic
  if (email === 'user@example.com' && password === 'password123') {
    req.session.user = email;
    return res.status(200).json({ message: 'Login successful!' });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
}

/**
 * Function handling the password recovery process.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
function passwordRecoveryHandler(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  // Mock password recovery logic
  return res.status(200).json({ message: 'Recovery email sent!' });
}

module.exports = {
  loginHandler,
  passwordRecoveryHandler
};
