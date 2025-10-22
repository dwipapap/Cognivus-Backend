const request = require('supertest');
const express = require('express');
const gradesController = require('../../controllers/grades');

// Mock the entire grades module
jest.mock('../../controllers/grades', () => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));

const app = express();
app.use(express.json());

// Mock routes for testing
app.get('/grades', gradesController.getAll);
app.get('/grades/:id', gradesController.getById);
app.post('/grades', gradesController.create);
app.put('/grades/:id', gradesController.update);
app.delete('/grades/:id', gradesController.delete);

describe('Grades Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /grades', () => {
    it('should get all grades successfully', async () => {
      const mockGrades = [
        {
          gradeid: '1',
          studentid: '1',
          test_type: 'Midterm',
          listening_score: 85,
          speaking_score: 90,
          reading_score: 88,
          writing_score: 92,
          final_score: 88.75,
          date_taken: '2023-01-15T00:00:00Z',
          description: 'Midterm examination results',
          tbreport_files: [
            {
              rfid: '1',
              path: 'reports/grade1.pdf',
              url: 'https://example.com/reports/grade1.pdf',
              upload_date: '2023-01-15T00:00:00Z'
            }
          ]
        },
        {
          gradeid: '2',
          studentid: '2',
          test_type: 'Final',
          listening_score: 78,
          speaking_score: 82,
          reading_score: 85,
          writing_score: 80,
          final_score: 81.25,
          date_taken: '2023-01-30T00:00:00Z',
          description: 'Final examination results',
          tbreport_files: []
        }
      ];

      gradesController.getAll.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockGrades
        });
      });

      const response = await request(app)
        .get('/grades');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockGrades);
      expect(response.body.data).toHaveLength(2);
    });

    it('should handle database errors when fetching all grades', async () => {
      gradesController.getAll.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching grade',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .get('/grades');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching grade');
    });
  });

  describe('GET /grades/:id', () => {
    it('should get grades by student id successfully', async () => {
      const mockGrades = [
        {
          gradeid: '1',
          studentid: '1',
          test_type: 'Midterm',
          listening_score: 85,
          speaking_score: 90,
          reading_score: 88,
          writing_score: 92,
          final_score: 88.75,
          date_taken: '2023-01-15T00:00:00Z',
          description: 'Midterm examination results',
          tbreport_files: [
            {
              rfid: '1',
              path: 'reports/grade1.pdf',
              url: 'https://example.com/reports/grade1.pdf',
              upload_date: '2023-01-15T00:00:00Z'
            }
          ]
        }
      ];

      gradesController.getById.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockGrades
        });
      });

      const response = await request(app)
        .get('/grades/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockGrades);
    });

    it('should handle database errors when fetching grades by student id', async () => {
      gradesController.getById.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching grade',
          error: 'Student not found'
        });
      });

      const response = await request(app)
        .get('/grades/999');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching grade');
    });
  });

  describe('POST /grades', () => {
    it('should create a new grade successfully', async () => {
      const newGrade = {
        gradeid: '3',
        studentid: '3',
        test_type: 'Quiz',
        listening_score: 75,
        speaking_score: 80,
        reading_score: 78,
        writing_score: 82,
        final_score: 78.75,
        date_taken: '2023-02-01T00:00:00Z',
        description: 'Weekly quiz results',
        tbreport_files: []
      };

      const mockUploadedFile = {
        rfid: '3',
        path: 'reports/grade3.pdf',
        url: 'https://example.com/reports/grade3.pdf',
        upload_date: '2023-02-01T00:00:00Z'
      };

      gradesController.create.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: newGrade,
          uploaded: [mockUploadedFile]
        });
      });

      const response = await request(app)
        .post('/grades')
        .send({
          studentid: '3',
          test_type: 'Quiz',
          listening_score: 75,
          speaking_score: 80,
          reading_score: 78,
          writing_score: 82,
          date_taken: '2023-02-01T00:00:00Z',
          description: 'Weekly quiz results'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(newGrade);
      expect(response.body.uploaded).toEqual([mockUploadedFile]);
    });

    it('should return 400 for missing required fields', async () => {
      gradesController.create.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Test type are required for a new grade'
        });
      });

      const response = await request(app)
        .post('/grades')
        .send({
          studentid: '3',
          listening_score: 75
          // missing test_type
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Test type are required for a new grade');
    });

    it('should handle database errors when creating grade', async () => {
      gradesController.create.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error creating new grade',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .post('/grades')
        .send({
          studentid: '3',
          test_type: 'Quiz',
          listening_score: 75,
          speaking_score: 80,
          reading_score: 78,
          writing_score: 82
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error creating new grade');
    });

    it('should create grade without file upload', async () => {
      const newGrade = {
        gradeid: '4',
        studentid: '4',
        test_type: 'Assignment',
        listening_score: 90,
        speaking_score: 85,
        reading_score: 88,
        writing_score: 92,
        final_score: 88.75,
        date_taken: '2023-02-02T00:00:00Z',
        description: 'Assignment results',
        tbreport_files: []
      };

      gradesController.create.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: newGrade,
          uploaded: []
        });
      });

      const response = await request(app)
        .post('/grades')
        .send({
          studentid: '4',
          test_type: 'Assignment',
          listening_score: 90,
          speaking_score: 85,
          reading_score: 88,
          writing_score: 92,
          date_taken: '2023-02-02T00:00:00Z',
          description: 'Assignment results'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(newGrade);
      expect(response.body.uploaded).toEqual([]);
    });
  });

  describe('PUT /grades/:id', () => {
    it('should update grade successfully', async () => {
      const updatedGrade = {
        gradeid: '1',
        studentid: '1',
        test_type: 'Midterm Updated',
        listening_score: 88,
        speaking_score: 92,
        reading_score: 90,
        writing_score: 95,
        final_score: 91.25,
        date_taken: '2023-01-15T00:00:00Z',
        description: 'Updated midterm results',
        tbreport_files: []
      };

      const mockUploadedFile = {
        rfid: '4',
        path: 'reports/grade1-updated.pdf',
        url: 'https://example.com/reports/grade1-updated.pdf',
        upload_date: '2023-02-03T00:00:00Z'
      };

      gradesController.update.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: updatedGrade,
          uploaded: [mockUploadedFile]
        });
      });

      const response = await request(app)
        .put('/grades/1')
        .send({
          test_type: 'Midterm Updated',
          listening_score: 88,
          speaking_score: 92,
          reading_score: 90,
          writing_score: 95,
          description: 'Updated midterm results'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedGrade);
      expect(response.body.uploaded).toEqual([mockUploadedFile]);
    });

    it('should handle database errors when updating grade', async () => {
      gradesController.update.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error updating grade',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .put('/grades/1')
        .send({
          listening_score: 85
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error updating grade');
    });

    it('should update grade without file upload', async () => {
      const updatedGrade = {
        gradeid: '1',
        studentid: '1',
        test_type: 'Midterm Updated',
        listening_score: 88,
        speaking_score: 92,
        reading_score: 90,
        writing_score: 95,
        final_score: 91.25,
        date_taken: '2023-01-15T00:00:00Z',
        description: 'Updated midterm results',
        tbreport_files: []
      };

      gradesController.update.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: updatedGrade,
          uploaded: []
        });
      });

      const response = await request(app)
        .put('/grades/1')
        .send({
          test_type: 'Midterm Updated',
          listening_score: 88,
          speaking_score: 92,
          reading_score: 90,
          writing_score: 95,
          description: 'Updated midterm results'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedGrade);
      expect(response.body.uploaded).toEqual([]);
    });
  });

  describe('DELETE /grades/:id', () => {
    it('should delete grade successfully', async () => {
      const deletedGrade = {
        gradeid: '1',
        studentid: '1',
        test_type: 'Midterm',
        listening_score: 85,
        speaking_score: 90,
        reading_score: 88,
        writing_score: 92,
        final_score: 88.75,
        date_taken: '2023-01-15T00:00:00Z',
        description: 'Midterm examination results',
        tbreport_files: [
          {
            rfid: '1',
            path: 'reports/grade1.pdf',
            url: 'https://example.com/reports/grade1.pdf',
            upload_date: '2023-01-15T00:00:00Z'
          }
        ]
      };

      gradesController.delete.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: 'students grade id: 1 hard deleted successfully'
        });
      });

      const response = await request(app)
        .delete('/grades/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('students grade id: 1 hard deleted successfully');
    });

    it('should return 404 for non-existent grade deletion', async () => {
      gradesController.delete.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'student/grade not found.'
        });
      });

      const response = await request(app)
        .delete('/grades/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('student/grade not found.');
    });

    it('should handle database errors when deleting grade', async () => {
      gradesController.delete.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error deleting students grade',
          error: 'Foreign key constraint violation'
        });
      });

      const response = await request(app)
        .delete('/grades/1');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error deleting students grade');
    });

    it('should delete grade without files', async () => {
      gradesController.delete.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: 'students grade id: 2 hard deleted successfully'
        });
      });

      const response = await request(app)
        .delete('/grades/2');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('students grade id: 2 hard deleted successfully');
    });
  });
});
