const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const CalculatorIntegration = require('./CalculatorIntegration');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/', CalculatorIntegration);

jest.mock('jsonwebtoken');

const mockToken = 'testtoken';

beforeEach(() => {
  jwt.verify.mockImplementation((token, secret, cb) => {
    if (token === mockToken) cb(null, { id: 'testuserid' });
    else cb(new Error('Invalid token'));
  });
});

describe('POST /integrate', () => {
  it('successfully integrates with valid token', async () => {
    const response = await request(app)
      .post('/integrate')
      .set('Authorization', mockToken);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Integration successful!');
  });

  it('fails integration with missing token', async () => {
    const response = await request(app)
      .post('/integrate');
    expect(response.statusCode).toBe(403);
    expect(response.text).toBe('Token is missing');
  });

  it('fails integration with invalid token', async () => {
    const response = await request(app)
      .post('/integrate')
      .set('Authorization', 'invalidtoken');
    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Failed to authenticate token.');
  });
});