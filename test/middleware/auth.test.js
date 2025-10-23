const { authenticateToken } = require('../../src/middleware/auth');
const { mockReq, mockRes } = require('../testUtils');

jest.mock('../../src/utils/auth.js', () => ({
  verifyToken: jest.fn()
}));

const { verifyToken } = require('../../src/utils/auth.js');

describe('Auth Middleware', () => {
  beforeEach(() => jest.resetModules());

  test('development bypass sets mock user and calls next', async () => {
    process.env.NODE_ENV = 'development';
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    await authenticateToken(req, res, next);

    expect(req.user).toBeDefined();
    expect(next).toHaveBeenCalled();
  });

  test('missing token returns 401', async () => {
    process.env.NODE_ENV = 'test';
    const req = mockReq({ headers: {} });
    const res = mockRes();
    const next = jest.fn();

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('invalid token returns 403', async () => {
    process.env.NODE_ENV = 'test';
    const req = mockReq({ headers: { authorization: 'Bearer bad' } });
    const res = mockRes();
    const next = jest.fn();

    verifyToken.mockReturnValue(null);

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('valid token sets req.user and calls next', async () => {
    process.env.NODE_ENV = 'test';
    const req = mockReq({ headers: { authorization: 'Bearer good' } });
    const res = mockRes();
    const next = jest.fn();

    verifyToken.mockReturnValue({ id: 'u1', email: 'a@b.com' });

    await authenticateToken(req, res, next);

    expect(req.user).toEqual(expect.objectContaining({ id: 'u1' }));
    expect(next).toHaveBeenCalled();
  });
});
