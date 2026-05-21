/**
 * Creates a session for the authenticated user.
 * @param {Object} req The request object.
 * @param {Object} user The authenticated user object.
 */
function createSession(req, user) {
  req.session.user = { username: user.username };
}

/**
 * Destroys the current user session.
 * @param {Object} req The request object.
 */
function destroySession(req) {
  req.session.destroy(err => {
    if (err) {
      throw new Error('Failed to destroy session');
    }
  });
}

module.exports = { createSession, destroySession };