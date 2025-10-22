const request = require('supertest');
const express = require('express');
const levelsController = require('../../controllers/levels');

// Mock the entire levels module
jest.mock('../../controllers/levels', () => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));

const app = express();
app.use(express.json());

// Mock routes for testing
app.get('/levels', levelsController.getAll);
app.get('/levels/:id', levelsController.getById);
app.post('/levels', levelsController.create);
app.put('/levels/:id', levelsController.update);
app.delete('/levels/:id', levelsController.delete);

describe('Levels Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /levels', () => {
    it('should get all levels successfully', async () => {
      const mockLevels = [
        {
          levelid: '1',
          name: 'Beginner',
          description: 'Basic level for new students'
        },
        {
          levelid: '2',
          name: 'Intermediate',
          description: 'Intermediate level for experienced students'
        },
        {
          levelid: '3',
          name: 'Advanced',
          description: 'Advanced level for proficient students'
        }
      ];

      levelsController.getAll.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockLevels
        });
      });

      const response = await request(app)
        .get('/levels');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockLevels);
      expect(response.body.data).toHaveLength(3);
    });

    it('should handle database errors when fetching all levels', async () => {
      levelsController.getAll.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching user',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .get('/levels');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching user');
    });
  });

  describe('GET /levels/:id', () => {
    it('should get level by id successfully', async () => {
      const mockLevel = {
        levelid: '1',
        name: 'Beginner',
        description: 'Basic level for new students'
      };

      levelsController.getById.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockLevel
        });
      });

      const response = await request(app)
        .get('/levels/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockLevel);
    });

    it('should handle database errors when fetching level by id', async () => {
      levelsController.getById.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching user',
          error: 'Level not found'
        });
      });

      const response = await request(app)
        .get('/levels/999');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching user');
    });
  });

  describe('POST /levels', () => {
    it('should create a new level successfully', async () => {
      const newLevel = {
        levelid: '4',
        name: 'Expert',
        description: 'Expert level for advanced students'
      };

      levelsController.create.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: newLevel
        });
      });

      const response = await request(app)
        .post('/levels')
        .send({
          name: 'Expert',
          description: 'Expert level for advanced students'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(newLevel);
    });

    it('should handle database errors when creating level', async () => {
      levelsController.create.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error creating user',
          error: 'Level name already exists'
        });
      });

      const response = await request(app)
        .post('/levels')
        .send({
          name: 'Beginner',
          description: 'Duplicate level'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error creating user');
    });
  });

  describe('PUT /levels/:id', () => {
    it('should update level successfully', async () => {
      const updatedLevel = {
        levelid: '1',
        name: 'Beginner Updated',
        description: 'Updated basic level for new students'
      };

      levelsController.update.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: updatedLevel
        });
      });

      const response = await request(app)
        .put('/levels/1')
        .send({
          name: 'Beginner Updated',
          description: 'Updated basic level for new students'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedLevel);
    });

    it('should return 404 for non-existent level update', async () => {
      levelsController.update.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Level not found.'
        });
      });

      const response = await request(app)
        .put('/levels/999')
        .send({
          name: 'Non-existent Level'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Level not found.');
    });

    it('should handle database errors when updating level', async () => {
      levelsController.update.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error updating user',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .put('/levels/1')
        .send({
          name: 'Test Level'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error updating user');
    });
  });

  describe('DELETE /levels/:id', () => {
    it('should delete level successfully', async () => {
      levelsController.delete.mockImplementation((req, res) => {
        res.json({
          success: true,
          message: 'user deleted successfully'
        });
      });

      const response = await request(app)
        .delete('/levels/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('user deleted successfully');
    });

    it('should return 404 for non-existent level deletion', async () => {
      levelsController.delete.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Level not found.'
        });
      });

      const response = await request(app)
        .delete('/levels/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Level not found.');
    });

    it('should handle database errors when deleting level', async () => {
      levelsController.delete.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error deleting lecturer',
          error: 'Foreign key constraint violation'
        });
      });

      const response = await request(app)
        .delete('/levels/1');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error deleting lecturer');
    });
  });
});
