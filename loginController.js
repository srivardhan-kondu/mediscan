const bcrypt = require('bcrypt');

/**
 * Validates the input data for login.
 * @param {Object} input The input object containing username and password.
 * @returns {boolean} True if input is valid, otherwise false.
 */
function validateInput(input) {
  if (!input.username || !input.password) {
    return false;
  }
  return true;
}

/**
 * Handles user login logic.
 * @param {Object} input The input object containing username and password.
 * @returns {Promise<Object|null>} Returns user object if login is successful, otherwise null.
 */
async function login(input) {
  if (!validateInput(input)) {
    throw new Error('Invalid input');
  }

  const dummyUser = { username: 'user', password: await bcrypt.hash('pass', 10) }; // Example only

  const passwordMatch = await bcrypt.compare(input.password, dummyUser.password);
  if (input.username === dummyUser.username && passwordMatch) {
    return dummyUser;
  }

  return null;
}

module.exports = { login, validateInput };