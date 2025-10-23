const pricesController = require('../../controllers/prices');
const supabase = require('../../config/supabase');

// Mock dependencies
jest.mock('../../config/supabase');

describe('Prices Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {}
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
    it('should get all prices successfully', async () => {
      const mockData = [{ priceid: 1, amount: 100 }];
      supabase.from.mockResolvedValue({
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await pricesController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });

  describe('getById', () => {
    it('should get price by id successfully', async () => {
      req.params.id = '1';
      const mockData = { priceid: 1, amount: 100 };
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await pricesController.getById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData
      });
    });
  });

  describe('create', () => {
    it('should create price successfully', async () => {
      req.body = { amount: 100 };
      const mockData = [{ priceid: 1, amount: 100 }];
      supabase.from.mockResolvedValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await pricesController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData[0]
      });
    });
  });

  describe('update', () => {
    it('should update price successfully', async () => {
      req.params.id = '1';
      req.body = { amount: 150 };
      const mockData = [{ priceid: 1, amount: 150 }];
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      await pricesController.update(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData[0]
      });
    });

    it('should return 404 if price not found', async () => {
      req.params.id = '1';
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [], error: null })
      });

      await pricesController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Pricelist not found.'
      });
    });
  });

  describe('delete', () => {
    it('should delete price successfully', async () => {
      req.params.id = '1';
      supabase.from.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [{ priceid: 1 }], error: null })
      });

      await pricesController.delete(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'price deleted successfully'
      });
    });
  });
});
