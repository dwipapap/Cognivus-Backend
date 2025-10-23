const userModel = require('../../src/models/user');
const supabase = require('../../src/config/supabase');

jest.mock('../../src/config/supabase');

describe('User model - findOrCreate', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns existing user when found', async () => {
    const profile = { id: 'g1' };

    supabase.from.mockReturnValueOnce({ select: () => ({ eq: () => ({ single: async () => ({ data: { userid: 'u1' } }) }) }) });

    const result = await userModel.findOrCreate(profile);

    expect(result).toEqual(expect.objectContaining({ userid: 'u1' }));
  });

  test('creates and returns new user when not found', async () => {
    const profile = { id: 'g2', given_name: 'A', family_name: 'B', emails: [{ value: 'a@b.com' }] };

    // first call: not found
    supabase.from.mockReturnValueOnce({ select: () => ({ eq: () => ({ single: async () => ({ data: null }) }) }) });

    // second call: insert -> returns new user
    supabase.from.mockReturnValueOnce({ insert: () => ({ single: async () => ({ data: { userid: 'u2' } }) }) });

    const result = await userModel.findOrCreate(profile);

    expect(result).toEqual(expect.objectContaining({ userid: 'u2' }));
  });
});
