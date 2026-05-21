'use strict';

const request = require('supertest');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { authenticateUser } = require('./main');

const app = express();
app.use(express.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Middleware to pass users array to authenticateUser
app.use((req, res, next) => {
  req.users = [{ username: 'testuser', password: bcrypt.hashSync('password', 10) }];
  next();
});
app.post('/login', (req, res, next) => authenticateUser(req, res, next));

describe('POST /login', () => {
  test('should authenticate user with valid credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'password' });

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Authentication successful.');
  });

  test('should fail to authenticate with invalid credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'wrongpassword' });

    expect(response.statusCode).toBe(401);
    expect(response.text).toBe('Authentication failed.');
  });
});