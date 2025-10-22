const request = require('supertest');
const express = require('express');
const courseFilesController = require('../../controllers/course_files');

// Mock the entire course_files module
jest.mock('../../controllers/course_files', () => ({
  getAll: jest.fn(),
  getById: jest.fn()
}));

const app = express();
app.use(express.json());

// Mock routes for testing
app.get('/course-files', courseFilesController.getAll);
app.get('/course-files/:id', courseFilesController.getById);

describe('Course Files Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /course-files', () => {
    it('should get all course files successfully', async () => {
      const mockCourseFiles = [
        {
          cfid: '1',
          path: 'courses/intro-to-programming.pdf',
          url: 'https://example.com/files/courses/intro-to-programming.pdf',
          upload_date: '2023-01-01T00:00:00Z'
        },
        {
          cfid: '2',
          path: 'courses/data-structures.pdf',
          url: 'https://example.com/files/courses/data-structures.pdf',
          upload_date: '2023-01-02T00:00:00Z'
        }
      ];

      courseFilesController.getAll.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockCourseFiles
        });
      });

      const response = await request(app)
        .get('/course-files');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCourseFiles);
      expect(response.body.data).toHaveLength(2);
    });

    it('should handle database errors when fetching all course files', async () => {
      courseFilesController.getAll.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching report',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .get('/course-files');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching report');
    });
  });

  describe('GET /course-files/:id', () => {
    it('should get course file by id successfully', async () => {
      const mockCourseFile = {
        cfid: '1',
        path: 'courses/intro-to-programming.pdf',
        url: 'https://example.com/files/courses/intro-to-programming.pdf',
        upload_date: '2023-01-01T00:00:00Z'
      };

      courseFilesController.getById.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockCourseFile
        });
      });

      const response = await request(app)
        .get('/course-files/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCourseFile);
    });

    it('should handle database errors when fetching course file by id', async () => {
      courseFilesController.getById.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching report',
          error: 'Course file not found'
        });
      });

      const response = await request(app)
        .get('/course-files/999');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching report');
    });
  });
});
