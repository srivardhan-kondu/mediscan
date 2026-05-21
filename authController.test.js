const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Mock setup
jest.mock('bcrypt', () => ({
    compare: jest.fn()
}));

const authController = require('./authController');

// Create an Express app
const app = express();
app.use(express.json());
app.post('/login', authController.login);

// Example test
describe('POST /login', () => {
    it('should respond with a token when credentials are correct', async () => {
        bcrypt.compare.mockResolvedValue(true);  // Mock bcrypt to simulate password match
        const user = { _id: '12345', email: 'user@example.com', password: 'password123' };

        // Mock User model
        jest.mock('../models/User', () => ({
            User: {
                findOne: jest.fn().mockResolvedValue(user)
            }
        }));

        const res = await request(app)
            .post('/login')
            .send({ email: 'user@example.com', password: 'password123' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });
});