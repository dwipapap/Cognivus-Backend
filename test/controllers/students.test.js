const studentsController = require('../../src/controllers/students');
const supabase = require('../../src/config/supabase');
const { mockReq, mockRes } = require('../testUtils');

jest.mock('../../src/config/supabase');
jest.mock('../../src/utils/auth.js', () => ({ hashPassword: jest.fn().mockResolvedValue('enc-pass') }));

describe('Students Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  test('getAll returns data', async () => {
    const req = mockReq();
    const res = mockRes();

    supabase.from.mockReturnValueOnce({ select: async () => ({ data: [{ id: 1 }], error: null }) });

    await studentsController.getAll(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.any(Array) }));
  });

  test('getById returns student data', async () => {
    const req = mockReq({ params: { id: 'u1' } });
    const res = mockRes();

    supabase.from.mockReturnValueOnce({ select: () => ({ eq: () => ({ single: async () => ({ data: { userid: 'u1' }, error: null }) }) }) });

    await studentsController.getById(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.any(Object) }));
  });

  test('create returns 400 when missing fields', async () => {
    const req = mockReq({ body: { username: '', email: '' } });
    const res = mockRes();

    await studentsController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
