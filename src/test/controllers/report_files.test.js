const reportFilesController = require('../../controllers/report_files');
const supabase = require('../../config/supabase');

// Mock dependencies
jest.mock('../../config/supabase');

describe('Report Files Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should get all report files successfully', async () => {
      const mockData = [{ rfid: 1, filename: 'report1.pdf' }];
      supabase.from.mockResolvedValue({
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await reportFilesController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });

  describe('getById', () => {
    it('should get report file by id successfully', async () => {
      req.params.id = '1';
      const mockData = { rfid: 1, filename: 'report1.pdf' };
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await reportFilesController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });
});
