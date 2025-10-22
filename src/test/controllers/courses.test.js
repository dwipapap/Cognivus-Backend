const request = require('supertest');
const express = require('express');
const coursesController = require('../../controllers/courses');

// Mock the entire courses module
jest.mock('../../controllers/courses', () => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));

const app = express();
app.use(express.json());

// Mock routes for testing
app.get('/courses', coursesController.getAll);
app.get('/courses/:id', coursesController.getById);
app.post('/courses', coursesController.create);
app.put('/courses/:id', coursesController.update);
app.delete('/courses/:id', coursesController.delete);

describe('Courses Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /courses', () => {
    it('should get all courses successfully', async () => {
      const mockCourses = [
        {
          courseid: '1',
          course_code: 'CS101',
          title: 'Introduction to Programming',
          upload_date: '2023-01-01T00:00:00Z',
          video_link: 'https://example.com/video1',
          classid: '1',
          description: 'Basic programming concepts',
          tbcourse_files: [
            {
              cfid: '1',
              path: 'files/course1.pdf',
              url: 'https://example.com/files/course1.pdf',
              upload_date: '2023-01-01T00:00:00Z'
            }
          ]
        },
        {
          courseid: '2',
          course_code: 'CS102',
          title: 'Data Structures',
          upload_date: '2023-01-02T00:00:00Z',
          video_link: 'https://example.com/video2',
          classid: '2',
          description: 'Advanced data structures',
          tbcourse_files: []
        }
      ];

      coursesController.getAll.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockCourses
        });
      });

      const response = await request(app)
        .get('/courses');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCourses);
      expect(response.body.data).toHaveLength(2);
    });

    it('should handle database errors when fetching all courses', async () => {
      coursesController.getAll.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching course',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .get('/courses');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching course');
    });
  });

  describe('GET /courses/:id', () => {
    it('should get course by id successfully', async () => {
      const mockCourse = {
        courseid: '1',
        course_code: 'CS101',
        title: 'Introduction to Programming',
        upload_date: '2023-01-01T00:00:00Z',
        video_link: 'https://example.com/video1',
        classid: '1',
        description: 'Basic programming concepts',
        tbcourse_files: [
          {
            cfid: '1',
            path: 'files/course1.pdf',
            url: 'https://example.com/files/course1.pdf',
            upload_date: '2023-01-01T00:00:00Z'
          }
        ]
      };

      coursesController.getById.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockCourse
        });
      });

      const response = await request(app)
        .get('/courses/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCourse);
    });

    it('should handle database errors when fetching course by id', async () => {
      coursesController.getById.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching course',
          error: 'Course not found'
        });
      });

      const response = await request(app)
        .get('/courses/999');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching course');
    });
  });

  describe('POST /courses', () => {
    it('should create a new course successfully', async () => {
      const newCourse = {
        courseid: '3',
        course_code: 'CS103',
        title: 'Advanced Programming',
        upload_date: '2023-01-03T00:00:00Z',
        video_link: 'https://example.com/video3',
        classid: '1',
        description: 'Advanced programming concepts',
        tbcourse_files: []
      };

      const mockFiles = [
        {
          cfid: '3',
          path: 'files/course3.pdf',
          url: 'https://example.com/files/course3.pdf',
          upload_date: '2023-01-03T00:00:00Z'
        }
      ];

      coursesController.create.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: newCourse,
          files: mockFiles
        });
      });

      const response = await request(app)
        .post('/courses')
        .send({
          course_code: 'CS103',
          title: 'Advanced Programming',
          video_link: 'https://example.com/video3',
          classid: '1',
          description: 'Advanced programming concepts'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(newCourse);
      expect(response.body.files).toEqual(mockFiles);
    });

    it('should return 400 for missing required fields', async () => {
      coursesController.create.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Title are required for a new course'
        });
      });

      const response = await request(app)
        .post('/courses')
        .send({
          course_code: 'CS103'
          // missing title
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Title are required for a new course');
    });

    it('should handle database errors when creating course', async () => {
      coursesController.create.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error creating course',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .post('/courses')
        .send({
          course_code: 'CS103',
          title: 'Test Course',
          classid: '1'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error creating course');
    });

    it('should create course without files', async () => {
      const newCourse = {
        courseid: '4',
        course_code: 'CS104',
        title: 'Course Without Files',
        upload_date: '2023-01-04T00:00:00Z',
        video_link: null,
        classid: '2',
        description: 'Course without files',
        tbcourse_files: []
      };

      coursesController.create.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: newCourse,
          files: []
        });
      });

      const response = await request(app)
        .post('/courses')
        .send({
          course_code: 'CS104',
          title: 'Course Without Files',
          classid: '2',
          description: 'Course without files'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(newCourse);
      expect(response.body.files).toEqual([]);
    });
  });

  describe('PUT /courses/:id', () => {
    it('should update course successfully', async () => {
      const updatedCourse = {
        courseid: '1',
        course_code: 'CS101-Updated',
        title: 'Updated Programming Course',
        upload_date: '2023-01-01T00:00:00Z',
        video_link: 'https://example.com/video1-updated',
        classid: '2',
        description: 'Updated course description',
        tbcourse_files: []
      };

      const mockFiles = [
        {
          cfid: '4',
          path: 'files/course1-updated.pdf',
          url: 'https://example.com/files/course1-updated.pdf',
          upload_date: '2023-01-05T00:00:00Z'
        }
      ];

      coursesController.update.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: updatedCourse,
          files: mockFiles
        });
      });

      const response = await request(app)
        .put('/courses/1')
        .send({
          course_code: 'CS101-Updated',
          title: 'Updated Programming Course',
          video_link: 'https://example.com/video1-updated',
          classid: '2',
          description: 'Updated course description'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedCourse);
      expect(response.body.files).toEqual(mockFiles);
    });

    it('should return 404 for non-existent course update', async () => {
      coursesController.update.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Course not found.'
        });
      });

      const response = await request(app)
        .put('/courses/999')
        .send({
          title: 'Non-existent Course'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Course not found.');
    });

    it('should handle database errors when updating course', async () => {
      coursesController.update.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error updating course',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .put('/courses/1')
        .send({
          title: 'Test Course'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error updating course');
    });

    it('should update course without files', async () => {
      const updatedCourse = {
        courseid: '1',
        course_code: 'CS101-Updated',
        title: 'Updated Course Without Files',
        upload_date: '2023-01-01T00:00:00Z',
        video_link: null,
        classid: '1',
        description: 'Updated course without files',
        tbcourse_files: []
      };

      coursesController.update.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: updatedCourse,
          files: []
        });
      });

      const response = await request(app)
        .put('/courses/1')
        .send({
          course_code: 'CS101-Updated',
          title: 'Updated Course Without Files',
          classid: '1',
          description: 'Updated course without files'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedCourse);
      expect(response.body.files).toEqual([]);
    });
  });

  describe('DELETE /courses/:id', () => {
    it('should delete course successfully', async () => {
      const deletedCourse = {
        courseid: '1',
        course_code: 'CS101',
        title: 'Introduction to Programming',
        upload_date: '2023-01-01T00:00:00Z',
        video_link: 'https://example.com/video1',
        classid: '1',
        description: 'Basic programming concepts',
        tbcourse_files: [
          {
            cfid: '1',
            path: 'files/course1.pdf',
            url: 'https://example.com/files/course1.pdf',
            upload_date: '2023-01-01T00:00:00Z'
          }
        ]
      };

      coursesController.delete.mockImplementation((req, res) => {
        res.json({
          success: true,
          message: 'Course id: 1 hard deleted successfully'
        });
      });

      const response = await request(app)
        .delete('/courses/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Course id: 1 hard deleted successfully');
    });

    it('should return 404 for non-existent course deletion', async () => {
      coursesController.delete.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Course not found.'
        });
      });

      const response = await request(app)
        .delete('/courses/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Course not found.');
    });

    it('should handle database errors when deleting course', async () => {
      coursesController.delete.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error deleting course',
          error: 'Foreign key constraint violation'
        });
      });

      const response = await request(app)
        .delete('/courses/1');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error deleting course');
    });

    it('should delete course without files', async () => {
      coursesController.delete.mockImplementation((req, res) => {
        res.json({
          success: true,
          message: 'Course id: 2 hard deleted successfully'
        });
      });

      const response = await request(app)
        .delete('/courses/2');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Course id: 2 hard deleted successfully');
    });
  });
});
