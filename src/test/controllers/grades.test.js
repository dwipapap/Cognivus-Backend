// src/test/controllers/grades.test.js
const controller = require('../../controllers/grades');

jest.mock('../../config/supabase', () => ({ from: jest.fn() }));
jest.mock('../../helper/fields.js', () => ({
  grade: 'id,studentid,courseid,score,tbreport_files',
}));
jest.mock('../../helper/payload.js', () => ({ grade: (b) => b }));

jest.mock(
  '../../models/reports',
  () => ({
    create: jest.fn(async (_row, file) => ({ uploaded: file?.originalname || 'ok' })),
    createOrReplace: jest.fn(async (_row, file) => ({ replaced: file?.[0]?.originalname || 'ok' })),
    delete: jest.fn(async () => true),
  }),
  { virtual: true }
);

const supabase = require('../../config/supabase');
const reports = require('../../models/reports');

function makeFromChain() {
  // mock chaining supabase.from().select().eq()
  const chain = {
    select: jest.fn().mockImplementation(() => chain),
    eq: jest.fn().mockReturnValue(Promise.resolve({ data: [], error: null })),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  };
  supabase.from.mockResolvedValue(chain); // karena controller pakai await supabase.from()
  return chain;
}

describe('Grades Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, query: {}, body: {}, file: undefined };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  // ---------- getAll ----------
  describe('getAll', () => {
    it('OK', async () => {
      const c = makeFromChain();
      c.select.mockResolvedValue({ data: [{ id: 1 }], error: null });

      await controller.getAll(req, res);

      expect(supabase.from).toHaveBeenCalledWith('tbgrade');
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: 1 }] });
    });

    it('500 on error', async () => {
      const c = makeFromChain();
      c.select.mockResolvedValue({ data: null, error: { message: 'boom' } });

      await controller.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching grade',
        error: 'boom',
      });
    });
  });

  // ---------- getById ----------
  describe('getById', () => {
    it('OK', async () => {
      req.params.id = 4;
      const c = makeFromChain();
      // eq dipanggil setelah select()
      c.eq.mockResolvedValue({ data: [{ id: 9 }], error: null });

      await controller.getById(req, res);

      expect(supabase.from).toHaveBeenCalledWith('tbgrade');
      expect(c.eq).toHaveBeenCalledWith('studentid', 4);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: 9 }] });
    });

    it('500 on error', async () => {
      req.params.id = 4;
      const c = makeFromChain();
      // simulate error di eq()
      c.eq.mockResolvedValue({ data: null, error: { message: 'x' } });

      await controller.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching grade',
        error: 'x',
      });
    });
  });

  // ---------- create ----------
  describe('create', () => {
    it('400 if test_type missing', async () => {
      req.body = { score: 90 };

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Test type are required for a new grade',
      });
    });

    it('201 OK (insert + single file upload)', async () => {
      req.body = { test_type: 'mid', score: 95, studentid: 1, courseid: 2 };
      req.file = { originalname: 'report.pdf' };

      const c = makeFromChain();
      c.insert.mockReturnThis();
      c.select.mockResolvedValue({
        data: [{ id: 7, studentid: 1, courseid: 2, score: 95 }],
        error: null,
      });

      await controller.create(req, res);

      expect(c.insert).toHaveBeenCalledWith(expect.objectContaining({ test_type: 'mid' }));
      expect(reports.create).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [{ id: 7, studentid: 1, courseid: 2, score: 95 }],
        uploaded: [{ uploaded: 'report.pdf' }],
      });
    });

    it('500 on insert error', async () => {
      req.body = { test_type: 'mid', score: 95, studentid: 1, courseid: 2 };
      const c = makeFromChain();
      c.insert.mockReturnThis();
      c.select.mockResolvedValue({ data: null, error: { message: 'insert fail' } });

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error creating new grade',
        error: 'insert fail',
      });
    });
  });

  // ---------- update ----------
  describe('update', () => {
    it('201 OK tanpa upload', async () => {
      req.params.id = 5;
      req.body = { score: 88 };
      const c = makeFromChain();
      c.update.mockReturnThis();
      c.eq.mockReturnThis();
      c.select.mockResolvedValue({
        data: [{ id: 5, studentid: 1, courseid: 2, score: 88 }],
        error: null,
      });

      await controller.update(req, res);

      expect(c.update).toHaveBeenCalled();
      expect(c.eq).toHaveBeenCalledWith('gradeid', 5);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [{ id: 5, studentid: 1, courseid: 2, score: 88 }],
        uploaded: [],
      });
    });

    it('201 OK dengan file array', async () => {
      req.params.id = 6;
      req.body = { score: 77 };
      req.file = [{ originalname: 'new.pdf' }];

      const c = makeFromChain();
      c.update.mockReturnThis();
      c.eq.mockReturnThis();
      c.select.mockResolvedValue({
        data: [{ id: 6, studentid: 1, courseid: 3, score: 77 }],
        error: null,
      });

      await controller.update(req, res);

      expect(c.eq).toHaveBeenCalledWith('gradeid', 6);
      expect(reports.createOrReplace).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [{ id: 6, studentid: 1, courseid: 3, score: 77 }],
        uploaded: [{ replaced: 'new.pdf' }],
      });
    });

    it('500 on error', async () => {
      req.params.id = 5;
      const c = makeFromChain();
      c.update.mockReturnThis();
      c.eq.mockReturnThis();
      c.select.mockResolvedValue({ data: null, error: { message: 'upd err' } });

      await controller.update(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error updating grade',
        error: 'upd err',
      });
    });
  });

  // ---------- delete ----------
  describe('delete', () => {
    it('200 OK and deletes file', async () => {
      req.params.id = 9;
      const c = makeFromChain();
      c.delete.mockReturnThis();
      c.eq.mockReturnThis();
      c.select.mockResolvedValue({
        data: [{ id: 9, tbreport_files: [{ id: 1 }] }],
        error: null,
      });

      await controller.delete(req, res);

      expect(c.delete).toHaveBeenCalled();
      expect(c.eq).toHaveBeenCalledWith('gradeid', 9);
      expect(reports.delete).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'students grade id: 9 hard deleted successfully',
      });
    });

    it('404 when nothing deleted', async () => {
      req.params.id = 9;
      const c = makeFromChain();
      c.delete.mockReturnThis();
      c.eq.mockReturnThis();
      c.select.mockResolvedValue({ data: [], error: null });

      await controller.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'student/grade not found.',
      });
    });

    it('500 on error', async () => {
      req.params.id = 9;
      const c = makeFromChain();
      c.delete.mockReturnThis();
      c.eq.mockReturnThis();
      c.select.mockResolvedValue({ data: null, error: { message: 'del err' } });

      await controller.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error deleting students grade',
        error: 'del err',
      });
    });
  });
});
