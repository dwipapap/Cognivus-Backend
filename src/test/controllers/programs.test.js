const programsController = require('../../controllers/programs');
const supabase = require('../../config/supabase');

// Mock dependencies
jest.mock('../../config/supabase');

describe('Programs Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // pastikan supabase.from tersedia setiap test
    supabase.from.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should get all programs successfully', async () => {
      const mockData = [{ programid: 1, program_name: 'Program1' }];

      supabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      await programsController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
      });
    });

    it('should handle error from supabase', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: null, error: new Error('db err') }),
      });

      await programsController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Error fetching programs' })
      );
    });
  });

  describe('getById', () => {
    it('should get program by id successfully', async () => {
      req.params.id = '1';
      const mockData = { programid: 1, program_name: 'Program1' };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      await programsController.getById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
      });
    });

    it('should return 404 when not found', async () => {
      req.params.id = '999';

      const notFoundError = new Error('No rows found');
      // PostgREST code untuk not found
      notFoundError.code = 'PGRST116';

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: notFoundError }),
      });

      await programsController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Program not found',
        error: notFoundError.message,
      });
    });
  });

  describe('create', () => {
    it('should create program successfully', async () => {
      req.body = { program_name: 'New Program' };
      const mockObj = { programid: 1, program_name: 'New Program' };

      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockObj, error: null }),
      });

      await programsController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockObj,
      });
    });

    it('should handle error on create', async () => {
      req.body = { program_name: 'New Program' };

      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('insert fail') }),
      });

      await programsController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Error creating program' })
      );
    });
  });

  describe('update', () => {
    it('should update program successfully', async () => {
      req.params.id = '1';
      req.body = { program_name: 'Updated Program' };
      const mockObj = { programid: 1, program_name: 'Updated Program' };

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: mockObj, error: null }),
      });

      await programsController.update(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockObj,
      });
    });

    it('should return 404 if program not found', async () => {
      req.params.id = '1';

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      await programsController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Program not found',
      });
    });

    it('should handle error on update', async () => {
      req.params.id = '1';
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: new Error('update fail') }),
      });

      await programsController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Error updating program' })
      );
    });
  });

  describe('delete', () => {
    it('should delete program successfully', async () => {
      req.params.id = '1';

      supabase.from.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: { programid: 1 }, error: null }),
      });

      await programsController.delete(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Program deleted successfully',
      });
    });

    it('should return 404 when program not found', async () => {
      req.params.id = '999';

      supabase.from.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      await programsController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Program not found',
      });
    });

    it('should handle error on delete', async () => {
      req.params.id = '1';

      supabase.from.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: new Error('delete fail') }),
      });

      await programsController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Error deleting program' })
      );
    });
  });
});
