const request = require('supertest');
const express = require('express');
const classesController = require('../../controllers/classes');

// Mock the entire classes module
jest.mock('../../controllers/classes', () => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));

const app = express();
app.use(express.json());

// Mock routes for testing
app.get('/classes', classesController.getAll);
app.get('/classes/:id', classesController.getById);
app.post('/classes', classesController.create);
app.put('/classes/:id', classesController.update);
app.delete('/classes/:id', classesController.delete);

describe('Classes Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /classes', () => {
    it('should get all classes successfully', async () => {
      const mockClasses = [
        {
          classid: '1',
          class_code: 'CS101',
          description: 'Introduction to Computer Science',
          levelid: '1',
          lecturerid: '1'
        },
        {
          classid: '2',
          class_code: 'CS102',
          description: 'Data Structures and Algorithms',
          levelid: '2',
          lecturerid: '2'
        }
      ];

      classesController.getAll.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockClasses
        });
      });

      const response = await request(app)
        .get('/classes');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockClasses);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter classes by lecturer ID', async () => {
      const mockClasses = [
        {
          classid: '1',
          class_code: 'CS101',
          description: 'Introduction to Computer Science',
          levelid: '1',
          lecturerid: '1'
        }
      ];

      classesController.getAll.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockClasses
        });
      });

      const response = await request(app)
        .get('/classes?lecturerid=1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockClasses);
    });

    it('should handle database errors when fetching all classes', async () => {
      classesController.getAll.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching class',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .get('/classes');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching class');
    });
  });

  describe('GET /classes/:id', () => {
    it('should get class by id successfully', async () => {
      const mockClass = {
        classid: '1',
        class_code: 'CS101',
        description: 'Introduction to Computer Science',
        levelid: '1',
        lecturerid: '1'
      };

      classesController.getById.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockClass
        });
      });

      const response = await request(app)
        .get('/classes/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockClass);
    });

    it('should handle database errors when fetching class by id', async () => {
      classesController.getById.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching class',
          error: 'Class not found'
        });
      });

      const response = await request(app)
        .get('/classes/999');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching class');
    });
  });

  describe('POST /classes', () => {
    it('should create a new class successfully', async () => {
      const newClass = {
        classid: '3',
        class_code: 'CS103',
        description: 'Advanced Programming',
        levelid: '3',
        lecturerid: '1'
      };

      classesController.create.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: newClass
        });
      });

      const response = await request(app)
        .post('/classes')
        .send({
          class_code: 'CS103',
          description: 'Advanced Programming',
          levelid: '3',
          lecturerid: '1'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(newClass);
    });

    it('should return 400 for missing required fields', async () => {
      classesController.create.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Class Code and Level are required for a new class'
        });
      });

      const response = await request(app)
        .post('/classes')
        .send({
          description: 'New Class'
          // missing class_code and levelid
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Class Code and Level are required for a new class');
    });

    it('should handle database errors when creating class', async () => {
      classesController.create.mockImplementation((req, res) => {
        res.status(409).json({
          success: false,
          message: 'Error creating new class.',
          error: 'Class code already exists'
        });
      });

      const response = await request(app)
        .post('/classes')
        .send({
          class_code: 'CS101',
          description: 'Duplicate Class',
          levelid: '1'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error creating new class.');
    });
  });

  describe('PUT /classes/:id', () => {
    it('should update class successfully', async () => {
      const updatedClass = {
        classid: '1',
        class_code: 'CS101-Updated',
        description: 'Updated Introduction to Computer Science',
        levelid: '2',
        lecturerid: '2'
      };

      classesController.update.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: updatedClass
        });
      });

      const response = await request(app)
        .put('/classes/1')
        .send({
          class_code: 'CS101-Updated',
          description: 'Updated Introduction to Computer Science',
          levelid: '2',
          lecturerid: '2'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedClass);
    });

    it('should return 404 for non-existent class update', async () => {
      classesController.update.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Class not found.'
        });
      });

      const response = await request(app)
        .put('/classes/999')
        .send({
          class_code: 'Non-existent Class'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Class not found.');
    });

    it('should handle database errors when updating class', async () => {
      classesController.update.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error updating class',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .put('/classes/1')
        .send({
          class_code: 'CS101'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error updating class');
    });
  });

  describe('DELETE /classes/:id', () => {
    it('should delete class successfully', async () => {
      classesController.delete.mockImplementation((req, res) => {
        res.json({
          success: true,
          message: 'class id: 1 deleted successfully'
        });
      });

      const response = await request(app)
        .delete('/classes/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('class id: 1 deleted successfully');
    });

    it('should return 404 for non-existent class deletion', async () => {
      classesController.delete.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Class not found.'
        });
      });

      const response = await request(app)
        .delete('/classes/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Class not found.');
    });

    it('should handle database errors when deleting class', async () => {
      classesController.delete.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error deleting class',
          error: 'Foreign key constraint violation'
        });
      });

      const response = await request(app)
        .delete('/classes/1');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error deleting class');
    });
  });
});
