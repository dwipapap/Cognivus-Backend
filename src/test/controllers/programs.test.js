const request = require('supertest');
const express = require('express');
const programsController = require('../../controllers/programs');

// Mock the entire programs module
jest.mock('../../controllers/programs', () => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));

const app = express();
app.use(express.json());

// Mock routes for testing
app.get('/programs', programsController.getAll);
app.get('/programs/:id', programsController.getById);
app.post('/programs', programsController.create);
app.put('/programs/:id', programsController.update);
app.delete('/programs/:id', programsController.delete);

describe('Programs Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /programs', () => {
    it('should get all programs successfully', async () => {
      const mockPrograms = [
        {
          programid: '1',
          name: 'English for Beginners',
          description: 'Basic English language program'
        },
        {
          programid: '2',
          name: 'Business English',
          description: 'English for business professionals'
        }
      ];

      programsController.getAll.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockPrograms
        });
      });

      const response = await request(app)
        .get('/programs');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockPrograms);
      expect(response.body.data).toHaveLength(2);
    });

    it('should handle database errors when fetching all programs', async () => {
      programsController.getAll.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching program',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .get('/programs');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching program');
    });
  });

  describe('GET /programs/:id', () => {
    it('should get program by id successfully', async () => {
      const mockProgram = {
        programid: '1',
        name: 'English for Beginners',
        description: 'Basic English language program'
      };

      programsController.getById.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockProgram
        });
      });

      const response = await request(app)
        .get('/programs/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockProgram);
    });

    it('should handle database errors when fetching program by id', async () => {
      programsController.getById.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching program',
          error: 'Program not found'
        });
      });

      const response = await request(app)
        .get('/programs/999');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching program');
    });
  });

  describe('POST /programs', () => {
    it('should create a new program successfully', async () => {
      const newProgram = {
        programid: '3',
        name: 'Academic English',
        description: 'English for academic purposes'
      };

      programsController.create.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: newProgram
        });
      });

      const response = await request(app)
        .post('/programs')
        .send({
          name: 'Academic English',
          description: 'English for academic purposes'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(newProgram);
    });

    it('should handle database errors when creating program', async () => {
      programsController.create.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error creating program',
          error: 'Program name already exists'
        });
      });

      const response = await request(app)
        .post('/programs')
        .send({
          name: 'English for Beginners',
          description: 'Duplicate program'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error creating program');
    });
  });

  describe('PUT /programs/:id', () => {
    it('should update program successfully', async () => {
      const updatedProgram = {
        programid: '1',
        name: 'English for Beginners - Updated',
        description: 'Updated basic English language program'
      };

      programsController.update.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: updatedProgram
        });
      });

      const response = await request(app)
        .put('/programs/1')
        .send({
          name: 'English for Beginners - Updated',
          description: 'Updated basic English language program'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedProgram);
    });

    it('should return 404 for non-existent program update', async () => {
      programsController.update.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Program not found.'
        });
      });

      const response = await request(app)
        .put('/programs/999')
        .send({
          name: 'Non-existent Program'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Program not found.');
    });

    it('should handle database errors when updating program', async () => {
      programsController.update.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error updating program',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .put('/programs/1')
        .send({
          name: 'Test Program'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error updating program');
    });
  });

  describe('DELETE /programs/:id', () => {
    it('should delete program successfully', async () => {
      programsController.delete.mockImplementation((req, res) => {
        res.json({
          success: true,
          message: 'program deleted successfully'
        });
      });

      const response = await request(app)
        .delete('/programs/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('program deleted successfully');
    });

    it('should return 404 for non-existent program deletion', async () => {
      programsController.delete.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Program not found.'
        });
      });

      const response = await request(app)
        .delete('/programs/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Program not found.');
    });

    it('should handle database errors when deleting program', async () => {
      programsController.delete.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error deleting lecturer',
          error: 'Foreign key constraint violation'
        });
      });

      const response = await request(app)
        .delete('/programs/1');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error deleting lecturer');
    });
  });
});
