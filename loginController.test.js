const { login, validateInput } = require('./loginController');
const bcrypt = require('bcrypt');

const dummyUser = { username: 'user', password: 'pass' };
const hashedPassword = bcrypt.hashSync(dummyUser.password, 10);

jest.mock('bcrypt', () => ({
  compare: jest.fn(async (plain, hash) => {
    return plain === 'pass' && hash === hashedPassword;
  }),
  hash: jest.fn(async (password) => {
    return hashedPassword;
  }),
}));

describe('validateInput', () => {
  it('should return true for valid input', () => {
    const isValid = validateInput(dummyUser);
    expect(isValid).toBe(true);
  });

  it('should return false for invalid input', () => {
    const isValid = validateInput({ username: '', password: '' });
    expect(isValid).toBe(false);
  });
});

describe('login', () => {
  it('should return user object for valid credentials', async () => {
    const user = await login({ username: 'user', password: 'pass' });
    expect(user).not.toBeNull();
    expect(user.username).toBe('user');
  });

  it('should return null for invalid credentials', async () => {
    const user = await login({ username: 'invalid', password: 'invalid' });
    expect(user).toBeNull();
  });

  it('should throw error for invalid input', async () => {
    await expect(login({ username: '', password: '' })).rejects.toThrow('Invalid input');
  });
});