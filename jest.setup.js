// Provide a global mock for Supabase used in tests. Tests expect both
// `require('.../config/supabase').from` (a jest.fn) and
// `require('.../config/supabase').storage.from` to exist and be mockable.
jest.mock('./src/config/supabase', () => {
  const fromMock = jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null })
  }));

  const storageFromMock = jest.fn(() => ({
    upload: jest.fn().mockResolvedValue({ error: null }),
    remove: jest.fn().mockResolvedValue({ error: null }),
    getPublicUrl: jest.fn().mockResolvedValue({ data: { publicUrl: '' }, error: null }),
    createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: '' }, error: null })
  }));

  return {
    from: fromMock,
    storage: {
      from: storageFromMock
    },
    auth: {
      signUp: jest.fn(),
      signOut: jest.fn()
    }
  };
});

// Make Date.now deterministic in tests so generated paths match expected fixtures.
// Use an incrementing counter so consecutive calls produce unique but predictable values.
let _now = 1234567890;
jest.spyOn(Date, 'now').mockImplementation(() => {
  _now += 1;
  return _now;
});

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn()
}));