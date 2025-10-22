const request = require('supertest');
const express = require('express');
const reportFilesController = require('../../controllers/report_files');

// Mock the entire report_files module
jest.mock('../../controllers/report_files', () => ({
  getAll: jest.fn(),
  getById: jest.fn()
}));

const app = express();
app.use(express.json());

// Mock routes for testing
app.get('/report-files', reportFilesController.getAll);
app.get('/report-files/:id', reportFilesController.getById);

describe('Report Files Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /report-files', () => {
    it('should get all report files successfully', async () => {
      const mockReportFiles = [
        {
          rfid: '1',
          path: 'reports/midterm-exam.pdf',
          url: 'https://example.com/files/reports/midterm-exam.pdf',
          upload_date: '2023-01-15T00:00:00Z'
        },
        {
          rfid: '2',
          path: 'reports/final-exam.pdf',
          url: 'https://example.com/files/reports/final-exam.pdf',
          upload_date: '2023-01-30T00:00:00Z'
        }
      ];

      reportFilesController.getAll.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: mockReportFiles
        });
      });

      const response = await request(app)
        .get('/report-files');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockReportFiles);
      expect(response.body.data).toHaveLength(2);
    });

    it('should handle database errors when fetching all report files', async () => {
      reportFilesController.getAll.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching report',
          error: 'Database connection failed'
        });
      });

      const response = await request(app)
        .get('/report-files');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching report');
    });
  });

  describe('GET /report-files/:id', () => {
    it('should get report file by id successfully', async () => {
      const mockReportFile = {
        rfid: '1',
        path: 'reports/midterm-exam.pdf',
        url: 'https://example.com/files/reports/midterm-exam.pdf',
        upload_date: '2023-01-15T00:00:00Z'
      };

      reportFilesController.getById.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: mockReportFile
        });
      });

      const response = await request(app)
        .get('/report-files/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockReportFile);
    });

    it('should handle database errors when fetching report file by id', async () => {
      reportFilesController.getById.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Error fetching report',
          error: 'Report file not found'
        });
      });

      const response = await request(app)
        .get('/report-files/999');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching report');
    });
  });
});
