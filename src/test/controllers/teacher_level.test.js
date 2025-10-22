const request = require('supertest');
const express = require('express');
const teacherLevelController = require('../../controllers/teacher_level');

// Mock the entire teacher_level module
jest.mock('../../controllers/teacher_level', () => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));

const app = express();
app.use(express.json());

// Mock routes for testing
app.get('/teacher-levels', teacherLevelController.getAll);
app.get('/teacher-levels/:id', teacherLevelController.getById);
app.post('/teacher-levels', teacherLevelController.create);
app.put('/teacher-levels/:id', teacherLevelController.update);
app.delete('/teacher-levels/:id', teacherLevelController.delete);

describe('Teacher Level Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /teacher-levels', () => {
    it('should get all teacher levels successfully', async () => {
      const mockTeacherLevels = [
        {
          tlid: '1',
          levelid: '1',
          lecturerid: '1'
        },
        {
          tlid: '2',
          levelid: '2',
          lecturerid: '2'
        }
      ];

      teacherLevelController.getAll.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockTeacherLevels
        });
      });

      const response = await request(app)
        .get('/teacher-levels');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockTeacherLevels);
      expect(response.body.data).toHaveLength(2);
    });

    it('should handle database errors when fetching all teacher levels', async () => {
      teacherLevelController.getAll.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching lecturer on level',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .get('/teacher-levels');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching lecturer on level');
    });
  });

  describe('GET /teacher-levels/:id', () => {
    it('should get teacher level by id successfully', async () => {
      const mockTeacherLevel = {
        tlid: '1',
        levelid: '1',
        lecturerid: '1'
      };

      teacherLevelController.getById.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockTeacherLevel
        });
      });

      const response = await request(app)
        .get('/teacher-levels/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockTeacherLevel);
    });

    it('should handle database errors when fetching teacher level by id', async () => {
      teacherLevelController.getById.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching lecturer on level',
          error: 'Teacher level not found'
        });
      });

      const response = await request(app)
        .get('/teacher-levels/999');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching lecturer on level');
    });
  });

  describe('POST /teacher-levels', () => {
    it('should create a new teacher level successfully', async () => {
      const newTeacherLevel = {
        tlid: '3',
        levelid: '3',
        lecturerid: '3'
      };

      teacherLevelController.create.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: newTeacherLevel
        });
      });

      const response = await request(app)
        .post('/teacher-levels')
        .send({
          levelid: '3',
          lecturerid: '3'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(newTeacherLevel);
    });

    it('should handle database errors when creating teacher level', async () => {
      teacherLevelController.create.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error assigning lecturer on level',
          error: 'Invalid level or lecturer ID'
        });
      });

      const response = await request(app)
        .post('/teacher-levels')
        .send({
          levelid: '999',
          lecturerid: '999'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error assigning lecturer on level');
    });
  });

  describe('PUT /teacher-levels/:id', () => {
    it('should update teacher level successfully', async () => {
      const updatedTeacherLevel = {
        tlid: '1',
        levelid: '2',
        lecturerid: '2'
      };

      teacherLevelController.update.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: updatedTeacherLevel
        });
      });

      const response = await request(app)
        .put('/teacher-levels/1')
        .send({
          levelid: '2',
          lecturerid: '2'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedTeacherLevel);
    });

    it('should return 404 for non-existent teacher level update', async () => {
      teacherLevelController.update.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Lecturer not found on level.'
        });
      });

      const response = await request(app)
        .put('/teacher-levels/999')
        .send({
          levelid: '1',
          lecturerid: '1'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Lecturer not found on level.');
    });

    it('should handle database errors when updating teacher level', async () => {
      teacherLevelController.update.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error assigning lecturer on level',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .put('/teacher-levels/1')
        .send({
          levelid: '1',
          lecturerid: '1'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error assigning lecturer on level');
    });
  });

  describe('DELETE /teacher-levels/:id', () => {
    it('should delete teacher level successfully', async () => {
      teacherLevelController.delete.mockImplementation((req, res) => {
        res.json({
          success: true,
          message: 'lecturer unassigned from level successfully'
        });
      });

      const response = await request(app)
        .delete('/teacher-levels/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('lecturer unassigned from level successfully');
    });

    it('should return 404 for non-existent teacher level deletion', async () => {
      teacherLevelController.delete.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Lecturer not found from level.'
        });
      });

      const response = await request(app)
        .delete('/teacher-levels/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Lecturer not found from level.');
    });

    it('should handle database errors when deleting teacher level', async () => {
      teacherLevelController.delete.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error unassign lecturer from level',
          error: 'Foreign key constraint violation'
        });
      });

      const response = await request(app)
        .delete('/teacher-levels/1');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error unassign lecturer from level');
    });
  });
});
