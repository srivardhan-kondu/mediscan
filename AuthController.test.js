const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const AuthController = require('./AuthController');
const User = require('./UserModel');
const app = express();

app.use(express.json());
app.use('/api/auth', AuthController);

jest.mock('mongoose');
jest.mock('./UserModel');

let mockUser;

beforeEach(() => {
  mockUser = {
    _id: '507f191e810c19729de860ea',
    email: 'test@example.com',
    password: '$2b$10$somesecrethashedpassword' // bcrypt-hashed
  };

  User.findOne.mockResolvedValue(mockUser);
  User.findOne.mockImplementation(({ email }) => {
    if (email === mockUser.email) return Promise.resolve(mockUser);
    return Promise.resolve(null);
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('POST /login', () => {
  it('returns a JWT token for valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'correctpassword' });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('token');
  });

  it('fails authentication for nonexistent user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'password' });
    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Authentication failed. User not found.');
  });

  it('fails authentication for wrong password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });
    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Authentication failed. Wrong password.');
  });
});