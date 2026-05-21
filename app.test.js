const request = require('supertest');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { loginHandler, passwordRecoveryHandler } = require('./authController');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.post('/login', loginHandler);
app.post('/recover-password', passwordRecoveryHandler);

describe('POST /login', () => {
  it('should return 200 and set session for valid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'user@example.com', password: 'password123' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Login successful!');
  });

  it('should return 400 for missing email or password', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: '', password: '' });
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Email and password are required.');
  });

  it('should return 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'wrong@example.com', password: 'wrongpassword' });
    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toEqual('Invalid credentials');
  });
});

describe('POST /recover-password', () => {
  it('should return 200 on valid email', async () => {
    const res = await request(app)
      .post('/recover-password')
      .send({ email: 'user@example.com' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Recovery email sent!');
  });

  it('should return 400 if email is missing', async () => {
    const res = await request(app)
      .post('/recover-password')
      .send({ email: '' });
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Email is required.');
  });
});