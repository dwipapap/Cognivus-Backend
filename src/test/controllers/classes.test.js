const controller = require('../../controllers/classes');
// --- Mock Dependencies ---

// Mock the payload helper
jest.mock('../../helper/payload.js', () => ({
  class: jest.fn((body) => body),
}));
const { class: mockPayload } = require('../../helper/payload.js');

// Mock the select helper
jest.mock('../../helper/fields.js', () => ({
  class: 'classid, class_code, tbcourse(courseid, course_name), tblecturer(lecturerid, name)',
}));
const { class: mockSelect } = require('../../helper/fields.js');

// Mock the Supabase client
jest.mock('../../config/supabase', () => ({
  from: jest.fn(),
}));
const supabase = require('../../config/supabase');

function makeFromChain() {
  const chain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  };
  supabase.from.mockReturnValue(chain);
  return chain;
}

describe('Classes Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, query: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('getAll', () => {
    it('returns all classes', async () => {
      const data = [{ classid: 1 }, { classid: 2 }];
      const chain = makeFromChain();
      chain.select.mockResolvedValue({ data, error: null });

      await controller.getAll(req, res);

      expect(supabase.from).toHaveBeenCalledWith('tbclass');
      expect(chain.select).toHaveBeenCalledWith(mockSelect);
      expect(res.json).toHaveBeenCalledWith({ success: true, data });
    });

    it('filters by lecturerid when provided', async () => {
      req.query.lecturerid = 99;
      const data = [{ classid: 3 }];
      const chain = makeFromChain();
      chain.select.mockReturnThis();
      chain.eq.mockResolvedValue({ data, error: null });

      await controller.getAll(req, res);

      expect(chain.eq).toHaveBeenCalledWith('lecturerid', 99);
      expect(res.json).toHaveBeenCalledWith({ success: true, data });
    });

    it('handles fetch error', async () => {
      const chain = makeFromChain();
      const mockError = { message: 'DB error' };
      chain.select.mockResolvedValue({ data: null, error: mockError });

      await controller.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching classes',
        error: mockError.message,
      });
    });
  });

  describe('getById', () => {
    it('returns a single class', async () => {
      req.params.id = 7;
      const data = { classid: 7 };
      const chain = makeFromChain();
      chain.single.mockResolvedValue({ data, error: null });

      await controller.getById(req, res);

      expect(chain.select).toHaveBeenCalledWith(mockSelect);
      expect(chain.eq).toHaveBeenCalledWith('classid', 7);
      expect(res.json).toHaveBeenCalledWith({ success: true, data });
    });

    it('returns 404 on not found/error', async () => {
      req.params.id = 7;
      const chain = makeFromChain();
      const mockError = { message: 'not found' };
      chain.single.mockResolvedValue({ data: null, error: mockError });

      await controller.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Class not found',
        error: mockError.message,
      });
    });
  });

  describe('create', () => {
    it('inserts with payload helper and returns 201', async () => {
      req.body = { class_code: 'X' };
      const chain = makeFromChain();
      const data = { classid: 10, class_code: 'X' };
      chain.single.mockResolvedValue({ data, error: null });

      await controller.create(req, res);

      expect(mockPayload).toHaveBeenCalledWith({ class_code: 'X' });
      expect(chain.insert).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data });
    });

    it('handles insert error', async () => {
      req.body = { class_code: 'X' };
      const chain = makeFromChain();
      const mockError = { message: 'insert failed' };
      chain.single.mockResolvedValue({ data: null, error: mockError });

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error creating class',
        error: mockError.message,
      });
    });
  });

  describe('update', () => {
    it('updates and returns the updated row', async () => {
      req.params.id = 5;
      req.body = { class_code: 'Y' };
      const data = { classid: 5, class_code: 'Y' };
      const chain = makeFromChain();
      chain.single.mockResolvedValue({ data, error: null });

      await controller.update(req, res);

      expect(mockPayload).toHaveBeenCalled();
      expect(chain.update).toHaveBeenCalled();
      expect(chain.eq).toHaveBeenCalledWith('classid', 5);
      expect(res.json).toHaveBeenCalledWith({ success: true, data });
    });

    it('handles update error', async () => {
      req.params.id = 5;
      req.body = { class_code: 'Y' };
      const chain = makeFromChain();
      const mockError = { message: 'update error' };
      chain.single.mockResolvedValue({ data: null, error: mockError });

      await controller.update(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error updating class',
        error: mockError.message,
      });
    });
  });

  describe('delete', () => {
    it('deletes and returns deleted id', async () => {
      req.params.id = 3;
      const data = { classid: 3 };
      const chain = makeFromChain();
      chain.single.mockResolvedValue({ data, error: null });

      await controller.delete(req, res);

      expect(chain.delete).toHaveBeenCalled();
      expect(chain.eq).toHaveBeenCalledWith('classid', 3);
      expect(res.json).toHaveBeenCalledWith({ success: true, data });
    });

    it('handles delete error', async () => {
      req.params.id = 3;
      const chain = makeFromChain();
      const mockError = { message: 'delete error' };
      chain.single.mockResolvedValue({ data: null, error: mockError });

      await controller.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error deleting class',
        error: mockError.message,
      });
    });
  });
});
