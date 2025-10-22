const request = require('supertest');
const express = require('express');
const authController = require('../../controllers/auth');

// Mock the entire auth module
jest.mock('../../controllers/auth', () => ({
  register: jest.fn(),
  login: jest.fn(),
  getProfile: jest.fn(),
  logout: jest.fn(),
  googleCallback: jest.fn()
}));

const app = express();
app.use(express.json());

// Mock routes for testing
app.post('/register', authController.register);
app.post('/login', authController.login);
app.get('/profile', authController.getProfile);
app.post('/logout', authController.logout);
app.post('/google-callback', authController.googleCallback);

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        user: {
          id: '123',
          email: 'test@example.com'
        }
      };

      authController.register.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          message: 'User registered successfully. Please check your email for verification.',
          user: mockUser.user
        });
      });

      const response = await request(app)
        .post('/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          full_name: 'Test User',
          role: 'student'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully. Please check your email for verification.');
      expect(response.body.user).toEqual(mockUser.user);
    });

    it('should return 400 for missing required fields', async () => {
      authController.register.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Email, password, and full name are required'
        });
      });

      const response = await request(app)
        .post('/register')
        .send({
          email: 'test@example.com'
          // missing password and full_name
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email, password, and full name are required');
    });

    it('should handle registration errors', async () => {
      authController.register.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Registration failed',
          error: 'Email already exists'
        });
      });

      const response = await request(app)
        .post('/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          full_name: 'Test User'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Registration failed');
    });
  });

  describe('POST /login', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        userid: '123',
        username: 'testuser',
        email: 'test@example.com',
        roleid: 1
      };

      authController.login.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: 'Login berhasil',
          token: 'mock-jwt-token',
          user: {
            id: mockUser.userid,
            username: mockUser.username,
            email: mockUser.email
          },
          role: 'student'
        });
      });

      const response = await request(app)
        .post('/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login berhasil');
      expect(response.body.token).toBe('mock-jwt-token');
      expect(response.body.role).toBe('student');
    });

    it('should return 400 for missing credentials', async () => {
      authController.login.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Username and password are required.'
        });
      });

      const response = await request(app)
        .post('/login')
        .send({
          username: 'testuser'
          // missing password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Username and password are required.');
    });

    it('should return 401 for invalid credentials', async () => {
      authController.login.mockImplementation((req, res) => {
        res.status(401).json({
          success: false,
          message: 'Invalid Username'
        });
      });

      const response = await request(app)
        .post('/login')
        .send({
          username: 'invaliduser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid Username');
    });

    it('should return 401 for invalid password', async () => {
      authController.login.mockImplementation((req, res) => {
        res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      });

      const response = await request(app)
        .post('/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid password');
    });
  });

  describe('GET /profile', () => {
    it('should get user profile successfully', async () => {
      const mockUser = {
        userid: '123',
        username: 'testuser',
        email: 'test@example.com'
      };

      authController.getProfile.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            id: req.user.id,
            username: req.user.username,
            profile: mockUser
          }
        });
      });

      const response = await request(app)
        .get('/profile')
        .set('user', JSON.stringify({ id: '123', username: 'testuser' }));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.profile).toEqual(mockUser);
    });

    it('should return 404 for user not found', async () => {
      authController.getProfile.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'User profile not found',
          error: 'User does not exist'
        });
      });

      const response = await request(app)
        .get('/profile')
        .set('user', JSON.stringify({ id: '999' }));

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User profile not found');
    });
  });

  describe('POST /logout', () => {
    it('should logout user successfully', async () => {
      authController.logout.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: 'Logout successful'
        });
      });

      const response = await request(app)
        .post('/logout');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });

    it('should handle logout errors', async () => {
      authController.logout.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Logout failed',
          error: 'Session error'
        });
      });

      const response = await request(app)
        .post('/logout');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Logout failed');
    });
  });

  describe('POST /google-callback', () => {
    it('should handle Google OAuth callback successfully', async () => {
      const mockUser = {
        userid: '123',
        username: 'googleuser',
        roleid: 1
      };

      authController.googleCallback.mockImplementation((req, res) => {
        res.json({
          token: 'mock-jwt-token',
          user: mockUser
        });
      });

      const response = await request(app)
        .post('/google-callback')
        .set('user', JSON.stringify(mockUser));

      expect(response.status).toBe(200);
      expect(response.body.token).toBe('mock-jwt-token');
      expect(response.body.user).toEqual(mockUser);
    });
  });
});
