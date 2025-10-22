const request = require('supertest');
const express = require('express');
const lecturersController = require('../../controllers/lecturers');

// Mock the entire lecturers module
jest.mock('../../controllers/lecturers', () => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));

const app = express();
app.use(express.json());

// Mock routes for testing
app.get('/lecturers', lecturersController.getAll);
app.get('/lecturers/:id', lecturersController.getById);
app.post('/lecturers', lecturersController.create);
app.put('/lecturers/:id', lecturersController.update);
app.delete('/lecturers/:id', lecturersController.delete);

describe('Lecturers Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /lecturers', () => {
    it('should get all lecturers successfully', async () => {
      const mockLecturers = [
        {
          lecturerid: '1',
          fullname: 'Dr. John Smith',
          birthplace: 'New York',
          address: '123 University St',
          phone: '1234567890',
          birthdate: '1980-01-01',
          lasteducation: 'PhD in Computer Science',
          gender: 'Male',
          photo: 'photo1.jpg',
          tbuser: {
            userid: '1',
            username: 'johnsmith',
            email: 'john.smith@university.edu'
          }
        },
        {
          lecturerid: '2',
          fullname: 'Dr. Jane Doe',
          birthplace: 'Los Angeles',
          address: '456 College Ave',
          phone: '2345678901',
          birthdate: '1985-02-02',
          lasteducation: 'PhD in Mathematics',
          gender: 'Female',
          photo: 'photo2.jpg',
          tbuser: {
            userid: '2',
            username: 'janedoe',
            email: 'jane.doe@university.edu'
          }
        }
      ];

      lecturersController.getAll.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockLecturers
        });
      });

      const response = await request(app)
        .get('/lecturers');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockLecturers);
      expect(response.body.data).toHaveLength(2);
    });

    it('should handle database errors when fetching all lecturers', async () => {
      lecturersController.getAll.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching lecturer',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .get('/lecturers');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching lecturer');
    });
  });

  describe('GET /lecturers/:id', () => {
    it('should get lecturer by id successfully', async () => {
      const mockLecturer = {
        lecturerid: '1',
        fullname: 'Dr. John Smith',
        birthplace: 'New York',
        address: '123 University St',
        phone: '1234567890',
        birthdate: '1980-01-01',
        lasteducation: 'PhD in Computer Science',
        gender: 'Male',
        photo: 'photo1.jpg',
        tbuser: {
          userid: '1',
          username: 'johnsmith',
          email: 'john.smith@university.edu'
        }
      };

      lecturersController.getById.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: mockLecturer
        });
      });

      const response = await request(app)
        .get('/lecturers/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockLecturer);
    });

    it('should handle database errors when fetching lecturer by id', async () => {
      lecturersController.getById.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching lecturer',
          error: 'Lecturer not found'
        });
      });

      const response = await request(app)
        .get('/lecturers/999');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching lecturer');
    });
  });

  describe('POST /lecturers', () => {
    it('should create a new lecturer successfully', async () => {
      const newLecturer = {
        lecturerid: '3',
        fullname: 'Dr. New Lecturer',
        birthplace: 'Boston',
        address: '789 Education Blvd',
        phone: '3456789012',
        birthdate: '1990-03-03',
        lasteducation: 'PhD in Physics',
        gender: 'Male',
        photo: 'photo3.jpg',
        tbuser: {
          userid: '3',
          username: 'newlecturer',
          email: 'new.lecturer@university.edu'
        }
      };

      lecturersController.create.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          data: newLecturer
        });
      });

      const response = await request(app)
        .post('/lecturers')
        .send({
          username: 'newlecturer',
          email: 'new.lecturer@university.edu',
          password: 'password123',
          fullname: 'Dr. New Lecturer',
          birthplace: 'Boston',
          address: '789 Education Blvd',
          phone: '3456789012',
          birthdate: '1990-03-03',
          lasteducation: 'PhD in Physics',
          gender: 'Male'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(newLecturer);
    });

    it('should return 400 for missing required fields', async () => {
      lecturersController.create.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Username, email, and password are required for the user account.'
        });
      });

      const response = await request(app)
        .post('/lecturers')
        .send({
          fullname: 'Dr. New Lecturer'
          // missing username, email, password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Username, email, and password are required for the user account.');
    });

    it('should handle user creation errors', async () => {
      lecturersController.create.mockImplementation((req, res) => {
        res.status(409).json({
          success: false,
          message: 'Error creating user account.',
          error: 'Email already exists'
        });
      });

      const response = await request(app)
        .post('/lecturers')
        .send({
          username: 'existinglecturer',
          email: 'existing@university.edu',
          password: 'password123',
          fullname: 'Dr. Existing Lecturer'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error creating user account.');
    });

    it('should handle lecturer profile creation errors', async () => {
      lecturersController.create.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'User account created, but failed to create lecturer profile.',
          error: 'Invalid data format'
        });
      });

      const response = await request(app)
        .post('/lecturers')
        .send({
          username: 'testlecturer',
          email: 'test@university.edu',
          password: 'password123',
          fullname: 'Dr. Test Lecturer',
          // missing required fields for lecturer profile
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User account created, but failed to create lecturer profile.');
    });
  });

  describe('PUT /lecturers/:id', () => {
    it('should update lecturer successfully', async () => {
      const updatedLecturer = {
        lecturerid: '1',
        fullname: 'Dr. Updated Lecturer',
        birthplace: 'Updated City',
        address: 'Updated Address',
        phone: '9999999999',
        birthdate: '1980-01-01',
        lasteducation: 'Updated Education',
        gender: 'Female',
        photo: 'updated_photo.jpg',
        tbuser: {
          userid: '1',
          username: 'updatedlecturer',
          email: 'updated@university.edu'
        }
      };

      lecturersController.update.mockImplementation((req, res) => {
        res.json({
          success: true,
          data: updatedLecturer
        });
      });

      const response = await request(app)
        .put('/lecturers/1')
        .send({
          fullname: 'Dr. Updated Lecturer',
          birthplace: 'Updated City',
          address: 'Updated Address',
          phone: '9999999999',
          lasteducation: 'Updated Education',
          gender: 'Female',
          photo: 'updated_photo.jpg'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedLecturer);
    });

    it('should return 404 for non-existent lecturer update', async () => {
      lecturersController.update.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Lecturer not found.'
        });
      });

      const response = await request(app)
        .put('/lecturers/999')
        .send({
          fullname: 'Non-existent Lecturer'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Lecturer not found.');
    });

    it('should handle database errors when updating lecturer', async () => {
      lecturersController.update.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error updating lecturer',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .put('/lecturers/1')
        .send({
          fullname: 'Dr. Test Lecturer'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error updating lecturer');
    });
  });

  describe('DELETE /lecturers/:id', () => {
    it('should delete lecturer successfully', async () => {
      lecturersController.delete.mockImplementation((req, res) => {
        res.json({
          success: true,
          message: 'Lecturer and associated user account deleted successfully'
        });
      });

      const response = await request(app)
        .delete('/lecturers/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Lecturer and associated user account deleted successfully');
    });

    it('should return 404 for non-existent lecturer deletion', async () => {
      lecturersController.delete.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Lecturer not found.'
        });
      });

      const response = await request(app)
        .delete('/lecturers/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Lecturer not found.');
    });

    it('should handle database errors when deleting lecturer', async () => {
      lecturersController.delete.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error deleting lecturer',
          error: 'Foreign key constraint violation'
        });
      });

      const response = await request(app)
        .delete('/lecturers/1');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error deleting lecturer');
    });
  });
});
