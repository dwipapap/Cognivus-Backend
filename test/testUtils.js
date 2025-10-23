// Small helpers for mocking Express req/res and clearing env
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockReq(overrides = {}) {
  return Object.assign({ body: {}, params: {}, headers: {}, user: null }, overrides);
}

module.exports = { mockRes, mockReq };
