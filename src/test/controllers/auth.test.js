// __tests__/controllers/auth.test.js
const authController = require('../../controllers/auth');

jest.mock('../../config/supabase', () => ({
  auth: {
    signUp: jest.fn(),
    signOut: jest.fn(),
  },
  from: jest.fn(),
}));

jest.mock('../../utils/auth', () => ({
  comparePassword: jest.fn(),
  hashPassword: jest.fn(),
  generateToken: jest.fn(),
}));

const supabase = require('../../config/supabase');
const { comparePassword, hashPassword, generateToken } = require('../../utils/auth');

function makeFromChain(singleResult) {
  const chain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(singleResult),
  };
  supabase.from.mockReturnValue(chain);
  return chain;
}

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, user: undefined };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('registers user via supabase.auth.signUp', async () => {
      req.body = { email: 'a@b.com', username: 'alice', password: 'secret', roleId: 1 };
      hashPassword.mockResolvedValue('hashed');
      supabase.auth.signUp.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.com' } }, error: null });

      await authController.register(req, res);

      expect(hashPassword).toHaveBeenCalledWith('secret');
      expect(supabase.auth.signUp).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, user: { id: 'u1', email: 'a@b.com' } });
    });

    it('handles signUp error', async () => {
      req.body = { email: 'a@b.com', username: 'alice', password: 'secret' };
      hashPassword.mockResolvedValue('hashed');
      supabase.auth.signUp.mockResolvedValue({ data: null, error: { message: 'exists' } });

      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'exists' });
    });
  });

  describe('login', () => {
    it('issues token on valid credentials', async () => {
      req.body = { username: 'bob', password: 'pwd' };
      makeFromChain({ data: { userid: 7, username: 'bob', roleid: 1, password: 'hashed' }, error: null });
      comparePassword.mockResolvedValue(true);
      generateToken.mockResolvedValue('token-abc');

      await authController.login(req, res);

      expect(comparePassword).toHaveBeenCalledWith('pwd', 'hashed');
      expect(generateToken).toHaveBeenCalledWith({ id: 7, username: 'bob', role: 'student' });
      expect(res.json).toHaveBeenCalledWith({ token: 'token-abc', user: { id: 7, username: 'bob', role: 'student' } });
    });

    it('rejects invalid username', async () => {
      req.body = { username: 'x', password: 'y' };
      makeFromChain({ data: null, error: { message: 'not found' } });

      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('rejects invalid password', async () => {
      req.body = { username: 'bob', password: 'pwd' };
      makeFromChain({ data: { userid: 7, username: 'bob', roleid: 1, password: 'hashed' }, error: null });
      comparePassword.mockResolvedValue(false);

      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('getProfile', () => {
    it('returns req.user when available', async () => {
      req.user = { id: 9, username: 'nine' };
      await authController.getProfile(req, res);
      expect(res.json).toHaveBeenCalledWith({ success: true, user: { id: 9, username: 'nine' } });
    });

    it('fetches profile by id when req.user missing', async () => {
      req.params = { id: 5 };
      makeFromChain({ data: { userid: 5, username: 'eve' }, error: null });

      await authController.getProfile(req, res);
      expect(res.json).toHaveBeenCalledWith({ success: true, user: { userid: 5, username: 'eve' } });
    });
  });

  describe('logout', () => {
    it('calls supabase.auth.signOut', async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null });
      await authController.logout(req, res);
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('googleCallback', () => {
    it('generates token from req.user and returns it', async () => {
      req.user = { id: 42, username: 'g-user', roleId: 1 };
      generateToken.mockResolvedValue('g-token');

      await authController.googleCallback(req, res);

      expect(generateToken).toHaveBeenCalledWith({
        id: 42,
        username: 'g-user',
        role: 'student',
      });
      expect(res.json).toHaveBeenCalledWith({
        token: 'g-token',
        user: req.user,
      });
    });
  });
});
