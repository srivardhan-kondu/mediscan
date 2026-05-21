"use strict";

const { isAuthenticated } = require('./authMiddleware');

const mockRequest = (sessionData) => ({
  session: sessionData || {}
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('AuthMiddleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = jest.fn();
  });

  it('should call next if user is authenticated', () => {
    req = mockRequest({ user: { username: 'testUser' } });

    isAuthenticated(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if user is not authenticated', () => {
    isAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized access' });
  });
});