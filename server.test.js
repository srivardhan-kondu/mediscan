const request = require('supertest');
const { app } = require('./server');
const { createSession, destroySession } = require('./sessionManager');
const bcrypt = require('bcrypt');

jest.mock('./sessionManager');

const dummyUser = { username: 'user', password: 'pass' };
const hashedPassword = bcrypt.hashSync(dummyUser.password, 10);

jest.mock('./loginController', () => ({
  login: jest.fn(async (input) => {
    if (!input.username || !input.password) {
      throw new Error('Invalid input');
    }

    if (input.username === 'user' && await bcrypt.compare(input.password, hashedPassword)) {
      return { username: 'user' };
    }
    return null;
  })
}));

createSession.mockImplementation((req, user) => {
  req.session.user = { username: user.username }; 
});

destroySession.mockImplementation((req) => {
  req.session = null;
});

describe('POST /login', () => {
  it('should log in successfully with valid credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send(dummyUser);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
  });

  it('should fail to log in with invalid credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'invalid', password: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid username or password');
  });

  it('should handle server errors', async () => {
    const response = await request(app)
      .post('/login')
      .send({});

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Server error');
  });
});

describe('POST /logout', () => {
  it('should log out successfully', async () => {
    const response = await request(app)
      .post('/logout')
      .send();

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Logout successful');
  });

  it('should handle errors on logout', async () => {
    destroySession.mockImplementationOnce(() => { throw new Error('Session error'); });

    const response = await request(app)
      .post('/logout')
      .send();

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Server error');
  });
});