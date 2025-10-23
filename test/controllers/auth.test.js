const authController = require('../../src/controllers/auth');
const supabase = require('../../src/config/supabase');
const { mockReq, mockRes } = require('../testUtils');

jest.mock('../../src/config/supabase');
jest.mock('../../src/utils/auth.js', () => ({
  comparePassword: jest.fn().mockResolvedValue(true),
  generateToken: jest.fn().mockReturnValue('token-123'),
  hashPassword: jest.fn().mockReturnValue('hashed'),
}));

describe('Auth Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  test('login success returns token and user', async () => {
    const req = mockReq({ body: { username: 'bob', password: 'pass' } });
    const res = mockRes();

    supabase.from.mockReturnValueOnce({
      select: () => ({ eq: () => ({ single: async () => ({ data: { userid: 'u1', username: 'bob', password: 'hash', email: 'bob@example.com', roleid: 1 }, error: null }) }) })
    });

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'token-123', success: true }));
  });

  test('login missing credentials returns 400', async () => {
    const req = mockReq({ body: { username: '', password: '' } });
    const res = mockRes();

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});
