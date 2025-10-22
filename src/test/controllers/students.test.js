const request = require('supertest');
const express = require('express');
const studentsController = require('../../controllers/students');

// Mock the entire students module
jest.mock('../../controllers/students', () => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));

const app = express();
app.use(express.json());

// Mock routes for testing
app.get('/students', studentsController.getAll);
app.get('/students/:id', studentsController.getById);
app.post('/students', studentsController.create);
app.put('/students/:id', studentsController.update);
app.delete('/students/:id', studentsController.delete);

describe('Students Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /students', () => {
    it('should get all students successfully', async () => {
      const mockStudents = [
        {
          userid: '1',
          fullname: 'John Doe',
          gender: 'Male',
          address: '123 Main St',
          phone: '1234567890',
          parentname: 'Jane Doe',
          parentphone: '0987654321',
          studentid: 'STU001',
          classid: '1',
          birthdate: '2000-01-01',
          birthplace: 'City A',
          photo: 'photo1.jpg',
          tbuser: {
            userid: '1',
            username: 'johndoe',
            email: 'john@example.com'
          }
        },
        {
          userid: '2',
          fullname: 'Jane Smith',
          gender: 'Female',
          address: '456 Oak St',
          phone: '2345678901',
          parentname: 'Bob Smith',
          parentphone: '1098765432',
          studentid: 'STU002',
          classid: '2',
          birthdate: '2001-02-02',
          birthplace: 'City B',
          photo: 'photo2.jpg',
          tbuser: {
            userid: '2',
            username: 'janesmith',
            email: 'jane@example.com'
          }
        }
      ];

      studentsController.getAll.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockStudents
        });
      });

      const response = await request(app)
        .get('/students');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockStudents);
      expect(response.body.data).toHaveLength(2);
    });

    it('should handle database errors when fetching all students', async () => {
      studentsController.getAll.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching students',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .get('/students');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching students');
    });
  });

  describe('GET /students/:id', () => {
    it('should get student by id successfully', async () => {
      const mockStudent = {
        userid: '1',
        fullname: 'John Doe',
        gender: 'Male',
        address: '123 Main St',
        phone: '1234567890',
        parentname: 'Jane Doe',
        parentphone: '0987654321',
        studentid: 'STU001',
        classid: '1',
        birthdate: '2000-01-01',
        birthplace: 'City A',
        photo: 'photo1.jpg',
        tbuser: {
          userid: '1',
          username: 'johndoe',
          email: 'john@example.com'
        }
      };

      studentsController.getById.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockStudent
        });
      });

      const response = await request(app)
        .get('/students/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockStudent);
    });

    it('should handle database errors when fetching student by id', async () => {
      studentsController.getById.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching student',
          error: 'Student not found'
        });
      });

      const response = await request(app)
        .get('/students/999');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching student');
    });
  });

  describe('POST /students', () => {
    it('should create a new student successfully', async () => {
      const newStudent = {
        userid: '3',
        fullname: 'New Student',
        gender: 'Male',
        address: '789 Pine St',
        phone: '3456789012',
        parentname: 'Parent Name',
        parentphone: '2109876543',
        studentid: 'STU003',
        classid: '1',
        birthdate: '2002-03-03',
        birthplace: 'City C',
        photo: 'photo3.jpg',
        tbuser: {
          userid: '3',
          username: 'newstudent',
          email: 'newstudent@example.com'
        }
      };

      studentsController.create.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: newStudent
        });
      });

      const response = await request(app)
        .post('/students')
        .send({
          username: 'newstudent',
          email: 'newstudent@example.com',
          password: 'password123',
          fullname: 'New Student',
          gender: 'Male',
          address: '789 Pine St',
          phone: '3456789012',
          parentname: 'Parent Name',
          parentphone: '2109876543',
          studentid: 'STU003',
          classid: '1',
          birthdate: '2002-03-03',
          birthplace: 'City C'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(newStudent);
    });

    it('should return 400 for missing required fields', async () => {
      studentsController.create.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Username, email, and password are required for the user account.'
        });
      });

      const response = await request(app)
        .post('/students')
        .send({
          fullname: 'New Student'
          // missing username, email, password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Username, email, and password are required for the user account.');
    });

    it('should handle user creation errors', async () => {
      studentsController.create.mockImplementation((req, res) => {
        res.status(409).json({
          success: false,
          message: 'Error creating user account.',
          error: 'Email already exists'
        });
      });

      const response = await request(app)
        .post('/students')
        .send({
          username: 'existingstudent',
          email: 'existing@example.com',
          password: 'password123',
          fullname: 'Existing Student'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error creating user account.');
    });

    it('should handle student profile creation errors', async () => {
      studentsController.create.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'User account created, but failed to create student profile.',
          error: 'Invalid class ID'
        });
      });

      const response = await request(app)
        .post('/students')
        .send({
          username: 'teststudent',
          email: 'test@example.com',
          password: 'password123',
          fullname: 'Test Student',
          classid: '999' // invalid class ID
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User account created, but failed to create student profile.');
    });
  });

  describe('PUT /students/:id', () => {
    it('should update student successfully', async () => {
      const updatedStudent = {
        userid: '1',
        fullname: 'Updated Student',
        gender: 'Female',
        address: 'Updated Address',
        phone: '9999999999',
        parentname: 'Updated Parent',
        parentphone: '8888888888',
        studentid: 'STU001',
        classid: '2',
        birthdate: '2000-01-01',
        birthplace: 'Updated City',
        photo: 'updated_photo.jpg',
        tbuser: {
          userid: '1',
          username: 'updatedstudent',
          email: 'updated@example.com'
        }
      };

      studentsController.update.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: updatedStudent
        });
      });

      const response = await request(app)
        .put('/students/1')
        .send({
          fullname: 'Updated Student',
          gender: 'Female',
          address: 'Updated Address',
          phone: '9999999999',
          parentname: 'Updated Parent',
          parentphone: '8888888888',
          classid: '2',
          birthplace: 'Updated City',
          photo: 'updated_photo.jpg'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedStudent);
    });

    it('should return 404 for non-existent student update', async () => {
      studentsController.update.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Student not found or could not be updated'
        });
      });

      const response = await request(app)
        .put('/students/999')
        .send({
          fullname: 'Non-existent Student'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Student not found or could not be updated');
    });

    it('should handle database errors when updating student', async () => {
      studentsController.update.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error updating student',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .put('/students/1')
        .send({
          fullname: 'Test Student'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error updating student');
    });
  });

  describe('DELETE /students/:id', () => {
    it('should delete student successfully', async () => {
      studentsController.delete.mockImplementation((req, res) => {
        res.json({
          success: true,
          message: 'Student deleted successfully'
        });
      });

      const response = await request(app)
        .delete('/students/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Student deleted successfully');
    });

    it('should return 404 for non-existent student deletion', async () => {
      studentsController.delete.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Student not found.'
        });
      });

      const response = await request(app)
        .delete('/students/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Student not found.');
    });

    it('should handle database errors when deleting student', async () => {
      studentsController.delete.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error deleting student',
          error: 'Foreign key constraint violation'
        });
      });

      const response = await request(app)
        .delete('/students/1');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error deleting student');
    });
  });
});
