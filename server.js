const bcrypt = require('bcrypt');

async function login(input, hashedPassword) {
    if (!input || !hashedPassword) {
        throw new Error('Invalid input');
    }

    if (input.username === 'user' && await bcrypt.compare(input.password, hashedPassword)) {
        return { username: 'user' };
    }
    return null;
}

module.exports = { login };