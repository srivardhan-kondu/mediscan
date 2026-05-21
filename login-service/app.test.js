"use strict";

const request = require('supertest');
const express = require('express');
const { loginHandler } = require('./app');

const app = express();
app.use(express.json());
app.post('/login', loginHandler);

describe('POST /login', () => {
  it('should return 400 if username or password is missing', async () => {
    let res = await request(app)
      .post('/login')
      .send({ username: 'user' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid input. Username and password are required.');

    res = await request(app)
      .post('/login')
      .send({ password: 'pass' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid input. Username and password are required.');
  });

  it('should return 200 if login is successful', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'user', password: 'pass' });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Login successful');
  });
});