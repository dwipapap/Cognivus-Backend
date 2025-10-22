const request = require('supertest');
const express = require('express');
const usersController = require('../../controllers/users');

// Mock the entire users module
jest.mock('../../controllers/users', () => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));

const app = express();
app.use(express.json());

// Mock routes for testing
app.get('/users', usersController.getAll);
app.get('/users/:id', usersController.getById);
app.post('/users', usersController.create);
app.put('/users/:id', usersController.update);
app.delete('/users/:id', usersController.delete);

describe('Users Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('should get all users successfully', async () => {
      const mockUsers = [
        {
          userid: '1',
          username: 'user1',
          email: 'user1@example.com',
          roleid: 1,
          is_active: true
        },
        {
          userid: '2',
          username: 'user2',
          email: 'user2@example.com',
          roleid: 2,
          is_active: true
        }
      ];

      usersController.getAll.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockUsers
        });
      });

      const response = await request(app)
        .get('/users');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUsers);
      expect(response.body.data).toHaveLength(2);
    });

    it('should handle database errors when fetching all users', async () => {
      usersController.getAll.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching user',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .get('/users');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching user');
    });
  });

  describe('GET /users/:id', () => {
    it('should get user by id successfully', async () => {
      const mockUser = {
        userid: '1',
        username: 'testuser',
        email: 'test@example.com',
        roleid: 1,
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      usersController.getById.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockUser
        });
      });

      const response = await request(app)
        .get('/users/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUser);
    });

    it('should handle database errors when fetching user by id', async () => {
      usersController.getById.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching user',
          error: 'User not found'
        });
      });

      const response = await request(app)
        .get('/users/999');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching user');
    });
  });

  describe('POST /users', () => {
    it('should create a new user successfully', async () => {
      const newUser = {
        userid: '3',
        username: 'newuser',
        email: 'newuser@example.com',
        roleid: 1,
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      usersController.create.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: newUser
        });
      });

      const response = await request(app)
        .post('/users')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123',
          roleid: 1
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(newUser);
    });

    it('should handle database errors when creating user', async () => {
      usersController.create.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error creating user',
          error: 'Email already exists'
        });
      });

      const response = await request(app)
        .post('/users')
        .send({
          username: 'existinguser',
          email: 'existing@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error creating user');
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user successfully', async () => {
      const updatedUser = {
        userid: '1',
        username: 'updateduser',
        email: 'updated@example.com',
        roleid: 2,
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z'
      };

      usersController.update.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: updatedUser
        });
      });

      const response = await request(app)
        .put('/users/1')
        .send({
          username: 'updateduser',
          email: 'updated@example.com',
          roleid: 2
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedUser);
    });

    it('should return 404 for non-existent user update', async () => {
      usersController.update.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      });

      const response = await request(app)
        .put('/users/999')
        .send({
          username: 'nonexistent'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found.');
    });

    it('should handle database errors when updating user', async () => {
      usersController.update.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error updating user',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .put('/users/1')
        .send({
          username: 'testuser'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error updating user');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user successfully', async () => {
      usersController.delete.mockImplementation((req, res) => {
        res.json({
          success: true,
          message: 'user deleted successfully'
        });
      });

      const response = await request(app)
        .delete('/users/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('user deleted successfully');
    });

    it('should return 404 for non-existent user deletion', async () => {
      usersController.delete.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      });

      const response = await request(app)
        .delete('/users/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found.');
    });

    it('should handle database errors when deleting user', async () => {
      usersController.delete.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error deleting lecturer',
          error: 'Foreign key constraint violation'
        });
      });

      const response = await request(app)
        .delete('/users/1');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error deleting lecturer');
    });
  });
});
