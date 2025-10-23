// src/test/controllers/prices.test.js

// 1) Mock Supabase DULU (wajib sebelum require controller)
jest.mock('../../config/supabase', () => {
  const q = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn(),
    single: jest.fn(),
  };
  const from = jest.fn(() => q);
  return { from, __q: q };
});

// 2) Baru require modul lain
const supabase = require('../../config/supabase');
const q = supabase.__q;
const pricesController = require('../../controllers/prices');

describe('Prices Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    // Reset seluruh mock builder
    Object.values(q).forEach(fn => fn.mockReset());
    supabase.from.mockClear();

    // Default agar aman untuk chaining saat tidak dioverride
    q.eq.mockReturnValue(q);
    q.select.mockReturnValue(q);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // -------- getAll --------
  describe('getAll', () => {
    it('berhasil mengambil semua price', async () => {
      const mockData = [{ priceid: 1, amount: 100 }];

      supabase.from.mockReturnValueOnce(q);
      q.select.mockResolvedValueOnce({ data: mockData, error: null });

      await pricesController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
      });
    });
  });

  // -------- getById --------
  describe('getById', () => {
    it('berhasil mengambil price berdasarkan id', async () => {
      req.params.id = '1';
      const row = { priceid: 1, amount: 100 };

      supabase.from.mockReturnValueOnce(q);
      q.select.mockReturnValueOnce(q);
      q.eq.mockReturnValueOnce(q);
      q.single.mockResolvedValueOnce({ data: row, error: null });

      await pricesController.getById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: row,
      });
    });
  });

  // -------- create --------
  describe('create', () => {
    it('berhasil membuat price', async () => {
      req.body = { amount: 100 };
      const rows = [{ priceid: 1, amount: 100 }];

      supabase.from.mockReturnValueOnce(q);
      // insert(...) -> object dengan .select() yang resolve {data, error}
      q.insert.mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ data: rows, error: null }),
      });

      await pricesController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: rows[0],
      });
    });
  });

  // -------- update --------
  describe('update', () => {
    it('berhasil mengubah price', async () => {
      req.params.id = '1';
      req.body = { amount: 150 };
      const rows = [{ priceid: 1, amount: 150 }];

      supabase.from.mockReturnValueOnce(q);
      // update(...).eq(...).select() -> resolve sukses
      q.update.mockReturnValueOnce({
        eq: () => ({
          select: () => Promise.resolve({ data: rows, error: null }),
        }),
      });

      await pricesController.update(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: rows[0],
      });
    });

    it('mengembalikan 404 jika price tidak ditemukan', async () => {
      req.params.id = '1';

      supabase.from.mockReturnValueOnce(q);
      q.update.mockReturnValueOnce({
        eq: () => ({
          select: () => Promise.resolve({ data: [], error: null }),
        }),
      });

      await pricesController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Price not found.',
      });
    });
  });

  // -------- delete --------
  describe('delete', () => {
    it('berhasil menghapus price', async () => {
      req.params.id = '1';

      supabase.from.mockReturnValueOnce(q);
      // delete(...).eq(...).select() -> resolve { data: [...] }
      q.delete.mockReturnValueOnce({
        eq: () => ({
          select: () =>
            Promise.resolve({ data: [{ priceid: 1 }], error: null }),
        }),
      });

      await pricesController.delete(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'price deleted successfully',
      });
    });

    it('mengembalikan 404 jika price tidak ditemukan saat delete', async () => {
      req.params.id = '999';

      supabase.from.mockReturnValueOnce(q);
      q.delete.mockReturnValueOnce({
        eq: () => ({
          select: () => Promise.resolve({ data: [], error: null }),
        }),
      });

      await pricesController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Price not found.',
      });
    });
  });
});
