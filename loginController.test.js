const bcrypt = require('bcrypt');

const hashedPassword = 'hashedPass';

jest.mock('bcrypt', () => ({
  compare: jest.fn(async (plain, hash) => {
    return plain === 'pass' && hash === hashedPassword;
  }),
  hash: jest.fn(async (password) => {
    return hashedPassword;
  })
}));

describe('bcrypt', () => {
  it('should correctly compare passwords', async () => {
    const isMatch = await bcrypt.compare('pass', hashedPassword);
    expect(isMatch).toBe(true);
  });
});