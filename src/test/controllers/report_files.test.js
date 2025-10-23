// __tests__/controllers/report_files.test.js
const reportFilesController = require('../../controllers/report_files');
const supabase = require('../../config/supabase');

// Mock dependencies
jest.mock('../../config/supabase', () => ({
  from: jest.fn(),
}));

describe('Report Files Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  const makeQueryBuilder = (overrides = {}) => {
    // Default chainable fns return `this` unless they should resolve a value.
    const qb = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      ...overrides,
    };
    return qb;
  };

  describe('getAll', () => {
    it('should get all report files successfully', async () => {
      const mockData = [{ rfid: 1, filename: 'report1.pdf' }];

      const qb = makeQueryBuilder({
        // In controller: await ...select('*')
        select: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      supabase.from.mockReturnValue(qb);

      await reportFilesController.getAll(req, res);

      expect(supabase.from).toHaveBeenCalledWith('tbreport_files');
      expect(qb.select).toHaveBeenCalledWith('*');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockData });
    });

    it('should return 500 on supabase error', async () => {
      const qb = makeQueryBuilder({
        select: jest.fn().mockResolvedValue({ data: null, error: new Error('boom') }),
      });
      supabase.from.mockReturnValue(qb);

      await reportFilesController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Error fetching report',
          error: expect.any(String),
        })
      );
    });
  });

  describe('getById', () => {
    it('should get report file by id successfully', async () => {
      req.params.id = '1';
      const mockData = { rfid: 1, filename: 'report1.pdf' };

      const qb = makeQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      supabase.from.mockReturnValue(qb);

      await reportFilesController.getById(req, res);

      expect(supabase.from).toHaveBeenCalledWith('tbreport_files');
      expect(qb.select).toHaveBeenCalledWith('*');
      expect(qb.eq).toHaveBeenCalledWith('rfid', '1');
      expect(qb.single).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockData });
    });

    it('should return 404 when report not found (no rows)', async () => {
      req.params.id = '999';
      const noRowsError = new Error('No rows found');
      noRowsError.code = 'PGRST116';

      const qb = makeQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: null, error: noRowsError }),
      });

      supabase.from.mockReturnValue(qb);

      await reportFilesController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Report not found',
      });
    });

    it('should return 404 when supabase reports "no rows" via message only', async () => {
      req.params.id = '999';
      const noRowsError = new Error('No rows');
      // noRowsError.code undefined, controller juga cek pesan
      const qb = makeQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: null, error: noRowsError }),
      });

      supabase.from.mockReturnValue(qb);

      await reportFilesController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Report not found',
      });
    });

    it('should return 500 on unexpected error', async () => {
      req.params.id = '2';
      const unexpected = new Error('database down');

      const qb = makeQueryBuilder({
        single: jest.fn().mockResolvedValue({ data: null, error: unexpected }),
      });

      supabase.from.mockReturnValue(qb);

      await reportFilesController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Error fetching report',
          error: 'database down',
        })
      );
    });
  });
});
