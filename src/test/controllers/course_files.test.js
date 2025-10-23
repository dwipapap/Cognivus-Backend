// src/test/controllers/course_files.test.js

// NOTE: sesuaikan path ini dengan struktur proyekmu.
// Dari folder ini (src/test/controllers) ke controller: ../../controllers/course_files
const courseFilesController = require('../../controllers/course_files');

// Mock Supabase client yang dipakai di controller
jest.mock('../../config/supabase', () => ({
  from: jest.fn(),
}));

const supabase = require('../../config/supabase');

describe('Course Files Controller (disamakan dengan implementasi saat ini)', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all course files', async () => {
      const mockData = [{ cfid: 1 }, { cfid: 2 }];
      supabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      await courseFilesController.getAll(req, res);

      expect(supabase.from).toHaveBeenCalledWith('tbcourse_files');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
      });
    });

    it('should handle errors when fetching all course files (message harus "Error fetching report")', async () => {
      const mockError = { message: 'fetch error' };
      supabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      });

      await courseFilesController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching report',
        error: mockError.message,
      });
    });
  });

  describe('getById', () => {
    it('should get course file by id successfully', async () => {
      req.params.cfid = undefined; // controller pakai req.params.id
      req.params.id = 123;
      const mockData = { cfid: 123 };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      await courseFilesController.getById(req, res);

      expect(supabase.from).toHaveBeenCalledWith('tbcourse_files');
      // select tanpa argumen
      // filter kolom sesuai controller: 'cfid'
      // status OK
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
      });
    });

    it('should handle not found or any error in getById (status 500, message "Error fetching report")', async () => {
      req.params.id = 321;
      const mockError = { message: 'not found' };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      });

      await courseFilesController.getById(req, res);

      // Sesuai controller: error selalu 500 + pesan "Error fetching report"
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching report',
        error: mockError.message,
      });
    });
  });
});
