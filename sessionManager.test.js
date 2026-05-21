const { createSession, destroySession } = require('./sessionManager');

const mockReq = () => {
  const req = {};
  req.session = {};
  return req;
};

describe('createSession', () => {
  it('should set the session user object', () => {
    const req = mockReq();
    const user = { username: 'testuser' };
    createSession(req, user);
    expect(req.session.user).toEqual({ username: 'testuser' });
  });
});

describe('destroySession', () => {
  it('should destroy the session', (done) => {
    const req = mockReq();
    req.session.destroy = jest.fn((callback) => { callback(null); });
    destroySession(req);
    expect(req.session.destroy).toHaveBeenCalled();
    done();
  });

  it('should handle error if session destruction fails', () => {
    const req = mockReq();
    req.session.destroy = jest.fn((callback) => { callback(new Error('Session destruction error')); });
    expect(() => destroySession(req)).toThrow('Failed to destroy session');
  });
});