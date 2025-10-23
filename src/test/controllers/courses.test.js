// src/test/controllers/courses.test.js
const controller = require('../../controllers/courses');

// --- MOCKS ---
jest.mock('../../config/supabase', () => ({ from: jest.fn() }));
jest.mock('../../helper/fields.js', () => ({ course: 'id,title' }));
jest.mock('../../helper/payload.js', () => ({ course: (b) => b }));
jest.mock('../../models/course.js', () => ({
  create: jest.fn(async (_row, file, _bucket) => ({ uploaded: file?.originalname || 'ok' })),
  delete: jest.fn(async () => true),
}));

const supabase = require('../../config/supabase');
const coursesModel = require('../../models/course.js');

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

describe('Courses Controller', () => {
  let req, res;
  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, query: {}, body: {}, files: undefined };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  describe('getAll', () => {
    it('OK', async () => {
      const chain = makeFromChain();
      chain.select.mockResolvedValue({ data: [{ id: 1 }], error: null });

      await controller.getAll(req, res);

      expect(supabase.from).toHaveBeenCalledWith('tbcourse');
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: 1 }] });
    });

    it('500 on error', async () => {
      const chain = makeFromChain();
      chain.select.mockResolvedValue({ data: null, error: { message: 'boom' } });

      await controller.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching course',
        error: 'boom',
      });
    });
  });

  describe('getById', () => {
    it('OK', async () => {
      req.params.id = 10;
      const chain = makeFromChain();
      chain.single.mockResolvedValue({ data: { id: 10 }, error: null });

      await controller.getById(req, res);

      expect(chain.eq).toHaveBeenCalledWith('courseid', 10);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 10 } });
    });

    it('500 on error', async () => {
      req.params.id = 10;
      const chain = makeFromChain();
      chain.single.mockResolvedValue({ data: null, error: { message: 'fail' } });

      await controller.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching course',
        error: 'fail',
      });
    });
  });

  describe('create', () => {
    it('400 if title missing', async () => {
      req.body = { title: '' };

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Title are required for a new course',
      });
    });

    it('201 and uploads files', async () => {
      req.body = { title: 'Math' };
      req.files = [{ originalname: 'f1.pdf' }, { originalname: 'f2.png' }];

      const chain = makeFromChain();
      chain.select.mockResolvedValue({ data: [{ id: 7, title: 'Math' }], error: null });

      await controller.create(req, res);

      expect(chain.insert).toHaveBeenCalled();
      expect(coursesModel.create).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 7, title: 'Math' },
        files: [{ uploaded: 'f1.pdf' }, { uploaded: 'f2.png' }],
      });
    });

    it('500 on insert error', async () => {
      req.body = { title: 'X' };
      const chain = makeFromChain();
      chain.select.mockResolvedValue({ data: null, error: { message: 'insert fail' } });

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error creating course',
        error: 'insert fail',
      });
    });
  });

  describe('update', () => {
    it('201 with single row + optional uploads', async () => {
      req.params.id = 5;
      req.body = { title: 'Upd' };
      req.files = [{ originalname: 'new.pdf' }];

      const chain = makeFromChain();
      chain.select.mockResolvedValue({ data: [{ id: 5, title: 'Upd' }], error: null });

      await controller.update(req, res);

      expect(chain.update).toHaveBeenCalled();
      expect(chain.eq).toHaveBeenCalledWith('courseid', 5);
      expect(coursesModel.create).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 5, title: 'Upd' },
        files: [{ uploaded: 'new.pdf' }],
      });
    });

    it('404 when no data', async () => {
      req.params.id = 5;
      const chain = makeFromChain();
      chain.select.mockResolvedValue({ data: [], error: null });

      await controller.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Course not found.' });
    });

    it('500 on error', async () => {
      req.params.id = 5;
      const chain = makeFromChain();
      chain.select.mockResolvedValue({ data: null, error: { message: 'upd err' } });

      await controller.update(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error updating course',
        error: 'upd err',
      });
    });
  });

  describe('delete', () => {
    it('OK and deletes attached files', async () => {
      req.params.id = 9;
      const chain = makeFromChain();
      chain.select.mockResolvedValue({
        data: [{ id: 9, tbcourse_files: [{ fileid: 1 }, { fileid: 2 }] }],
        error: null,
      });

      await controller.delete(req, res);

      expect(chain.delete).toHaveBeenCalled();
      expect(coursesModel.delete).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Course id: 9 hard deleted successfully',
      });
    });

    it('404 when nothing deleted', async () => {
      req.params.id = 9;
      const chain = makeFromChain();
      chain.select.mockResolvedValue({ data: [], error: null });

      await controller.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Course not found.' });
    });

    it('500 on error', async () => {
      req.params.id = 9;
      const chain = makeFromChain();
      chain.select.mockResolvedValue({ data: null, error: { message: 'del err' } });

      await controller.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error deleting course',
        error: 'del err',
      });
    });
  });
});
