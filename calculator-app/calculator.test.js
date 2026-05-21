'use strict';

const request = require('supertest');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(session({
    secret: 'calculator_secret',
    resave: false,
    saveUninitialized: true
}));

function validateNumbers(req, res, next) {
    const { num1, num2 } = req.body;
    if (typeof num1 !== 'number' || typeof num2 !== 'number') {
        return res.status(400).json({ error: 'Invalid numbers' });
    }
    next();
}

app.post('/calculate', validateNumbers, (req, res) => {
    const { num1, num2, operation } = req.body;
    let result;
    switch (operation) {
        case 'add':
            result = num1 + num2;
            break;
        case 'subtract':
            result = num1 - num2;
            break;
        case 'multiply':
            result = num1 * num2;
            break;
        case 'divide':
            if (num2 === 0) {
                return res.status(400).json({ error: 'Division by zero' });
            }
            result = num1 / num2;
            break;
        default:
            return res.status(400).json({ error: 'Invalid operation' });
    }
    res.json({ result });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    if (username === 'user' && password === 'pass') {
        req.session.user = { username };
        return res.json({ message: 'Login successful' });
    }
    res.status(401).json({ error: 'Invalid username or password' });
});

// Tests

describe('Calculator App API', () => {
    describe('POST /calculate', () => {
        it('should add two numbers', async () => {
            const res = await request(app)
                .post('/calculate')
                .send({ num1: 5, num2: 3, operation: 'add' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.result).toEqual(8);
        });

        it('should return error for division by zero', async () => {
            const res = await request(app)
                .post('/calculate')
                .send({ num1: 5, num2: 0, operation: 'divide' });

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toEqual('Division by zero');
        });

        it('should return error for invalid operation', async () => {
            const res = await request(app)
                .post('/calculate')
                .send({ num1: 5, num2: 3, operation: 'invalid' });

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toEqual('Invalid operation');
        });

        it('should return error for non-numeric inputs', async () => {
            const res = await request(app)
                .post('/calculate')
                .send({ num1: 'five', num2: 3, operation: 'add' });

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toEqual('Invalid numbers');
        });
    });

    describe('POST /login', () => {
        it('should login successfully with correct credentials', async () => {
            const res = await request(app)
                .post('/login')
                .send({ username: 'user', password: 'pass' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Login successful');
        });

        it('should fail login with incorrect credentials', async () => {
            const res = await request(app)
                .post('/login')
                .send({ username: 'user', password: 'wrong' });

            expect(res.statusCode).toEqual(401);
            expect(res.body.error).toEqual('Invalid username or password');
        });

        it('should return error when username or password is missing', async () => {
            const res1 = await request(app)
                .post('/login')
                .send({ username: 'user' });

            const res2 = await request(app)
                .post('/login')
                .send({ password: 'pass' });

            expect(res1.statusCode).toEqual(400);
            expect(res1.body.error).toEqual('Username and password are required');

            expect(res2.statusCode).toEqual(400);
            expect(res2.body.error).toEqual('Username and password are required');
        });
    });
});