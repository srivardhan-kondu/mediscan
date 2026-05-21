"use strict";

const request = require('supertest');
const { app } = require('./server');

jest.mock('bcrypt');

const { registerUser, loginUser, logoutUser } = require('./authController');

const mockRequest = (body = {}) => ({
  body,
  session: {}
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('AuthController Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      require('bcrypt').hash.mockResolvedValue('hashedPassword');
      const req = mockRequest({ username: 'testUser', password: 'password' });
      const res = mockResponse();

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully' });
    });

    it('should not register an existing user', async () => {
      require('bcrypt').hash.mockResolvedValue('hashedPassword');
      const req = mockRequest({ username: 'testUser', password: 'password' });
      const res = mockResponse();

      await registerUser(req, res);
      req.session = {};  // Clear mock session
      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'User already exists' });
    });
  });

  describe('loginUser', () => {
    it('should login with correct credentials', async () => {
      require('bcrypt').compare.mockResolvedValue(true);
      const req = mockRequest({ username: 'testUser', password: 'password' });
      const res = mockResponse();

      await registerUser(req, res);
      req.session = {};  // Clear mock session
      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(20