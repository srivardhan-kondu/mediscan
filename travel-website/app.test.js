const request = require('supertest');
const express = require('express');
const { configureMiddlewares } = require('./app');
const { setupRoutes } = require('./routes');

let server;
let app;
beforeAll(() => {
  app = express();
  configureMiddlewares(app);
  setupRoutes(app);
  server = app.listen(3000);
});

afterAll(done => {
  server.close(done);
});

describe('Test the root path', () => {
  test('It should respond to the GET method', async () => {
    const response = await request(app).get('/api/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Welcome to the Travel Website API');
  });
});

describe('Test authentication routes', () => {
  test('It should respond to the POST login method', async () => {
    const response = await request(app).post('/api/login').send({ username: 'test', password: '1234' });
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Login successful');
  });

  test('It should respond to the POST register method', async () => {
    const response = await request(app).post('/api/register').send({ username: 'test', password: '1234' });
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Registration successful');
  });
});

describe('Test travel destination routes', () => {
  test('It should respond to the GET destinations method', async () => {
    const response = await request(app).get('/api/destinations');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('List of travel destinations');
  });
});

describe('Test booking routes', () => {
  test('It should respond to the POST bookings method', async () => {
    const response = await request(app).post('/api/bookings').send({ destinationId: 1, userId: 1 });
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Booking completed');
  });
});

describe('Test reviews routes', () => {
  test('It should respond to the POST reviews method', async () => {
    const response = await request(app).post('/api/reviews').send({ review: 'Great place!', rating: 5 });
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Review submitted');
  });
});

describe('Test payment routes', () => {
  test('It should respond to the POST payments method', async () => {
    const response = await request(app).post('/api/payments').send({ amount: 100, method: 'credit card' });
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Payment processed');
  });
});
