"use strict";

const request = require('supertest');
const express = require('express');
const { configureRoutes } = require('./main');

/**
 * Initialize an express app with the routes configured.
 * @returns {Object} The express application instance.
 */
function setupApp() {
    const app = express();
    configureRoutes(app);
    return app;
}

describe('Arithmetic API', () => {
    let app;

    beforeAll(() => {
        app = setupApp();
    });

    test('should perform addition correctly', async () => {
        const response = await request(app)
            .post('/api/arithmetic/add')
            .send({ a: 5, b: 3 });

        expect(response.statusCode).toBe(200);
        expect(response.body.result).toBe(8);
    });

    test('should handle division by zero gracefully', async () => {
        const response = await request(app)
            .post('/api/arithmetic/divide')
            .send({ a: 10, b: 0 });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Cannot divide by zero');
    });
});

describe('Auth API', () => {
    let app;

    beforeAll(() => {
        app = setupApp();
    });

    test('should authenticate with valid credentials', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ username: 'correct_user', password: 'correct_pass' });

        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBeDefined();
    });

    test('should reject invalid credentials', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ username: 'wrong_user', password: 'wrong_pass' });

        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe('Authentication failed');
    });
});
