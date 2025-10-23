const controller = require("../../controllers/lecturers");

jest.mock("../../config/supabase", () => ({ from: jest.fn() }));
jest.mock("../../helper/fields", () => ({ lecturer: "userid,name" }));
jest.mock("../../helper/payload", () => ({ lecturer: (b) => b }));
jest.mock("../../utils/auth", () => ({
  hashPassword: jest.fn(async () => "hashed"),
}));

const supabase = require("../../config/supabase");
const { hashPassword } = require("../../utils/auth");

function makeFromChain() {
  const chain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  };
  // Penting: kembalikan chain hanya untuk SATU panggilan berikutnya
  supabase.from.mockReturnValueOnce(chain);
  return chain;
}

describe("Lecturers Controller", () => {
  let req, res;
  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  describe("getAll", () => {
    it("OK", async () => {
      const c = makeFromChain();
      c.select.mockResolvedValue({ data: [{ userid: 1 }], error: null });
      await controller.getAll(req, res);
      expect(supabase.from).toHaveBeenCalledWith("tblecturer");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [{ userid: 1 }],
      });
    });

    it("500", async () => {
      const c = makeFromChain();
      c.select.mockResolvedValue({ data: null, error: { message: "x" } });
      await controller.getAll(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error fetching lecturer",
        error: "x",
      });
    });
  });

  describe("getById", () => {
    it("OK", async () => {
      req.params.id = 2;
      const c = makeFromChain();
      c.single.mockResolvedValue({ data: { userid: 2 }, error: null });
      await controller.getById(req, res);
      expect(c.eq).toHaveBeenCalledWith("userid", 2);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { userid: 2 },
      });
    });

    it("500 on error", async () => {
      req.params.id = 2;
      const c = makeFromChain();
      c.single.mockResolvedValue({ data: null, error: { message: "oops" } });
      await controller.getById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error fetching lecturer",
        error: "oops",
      });
    });
  });

  describe("create", () => {
    it("400 validation", async () => {
      req.body = { username: "a", email: "b" };
      await controller.create(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message:
          "Username, email, and password are required for the user account.",
      });
    });

    it("201 full flow", async () => {
      req.body = { username: "a", email: "b@c", password: "p", name: "lect" };
      const userChain = makeFromChain();
      userChain.single.mockResolvedValue({ data: { userid: 99 }, error: null });
      const lectChain = makeFromChain();
      lectChain.single.mockResolvedValue({
        data: { userid: 99, name: "lect" },
        error: null,
      });

      await controller.create(req, res);

      expect(hashPassword).toHaveBeenCalledWith("p");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { userid: 99, name: "lect" },
      });
    });

    it("409 when user insert fails", async () => {
      req.body = { username: "u", email: "e", password: "p" };
      const userChain = makeFromChain();
      userChain.single.mockResolvedValue({
        data: null,
        error: { message: "dup" },
      });
      await controller.create(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error creating user account.",
        error: "dup",
      });
    });

    it("500 when lecturer insert fails", async () => {
      req.body = { username: "u", email: "e", password: "p" };
      const userChain = makeFromChain();
      userChain.single.mockResolvedValue({ data: { userid: 50 }, error: null });
      const lectChain = makeFromChain();
      lectChain.single.mockResolvedValue({
        data: null,
        error: { message: "lect err" },
      });

      await controller.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User account created, but failed to create lecturer profile.",
        error: "lect err",
      });
    });
  });

  describe("update", () => {
    it("OK", async () => {
      req.params.id = 7;
      req.body = { name: "upd" };
      const c = makeFromChain();
      c.select.mockResolvedValue({
        data: [{ userid: 7, name: "upd" }],
        error: null,
      });
      await controller.update(req, res);
      expect(c.eq).toHaveBeenCalledWith("userid", 7);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { userid: 7, name: "upd" },
      });
    });

    it("404 when empty", async () => {
      req.params.id = 7;
      const c = makeFromChain();
      c.select.mockResolvedValue({ data: [], error: null });
      await controller.update(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Lecturer not found.",
      });
    });

    it("500 on error", async () => {
      req.params.id = 7;
      const c = makeFromChain();
      c.select.mockResolvedValue({ data: null, error: { message: "err" } });
      await controller.update(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error updating lecturer",
        error: "err",
      });
    });
  });

  describe("delete", () => {
    it("OK", async () => {
      req.params.id = 12;
      const delLect = makeFromChain();
      delLect.eq.mockResolvedValue({ data: [{}], error: null });
      const delUser = makeFromChain();
      delUser.eq.mockResolvedValue({ data: [{}], error: null });

      await controller.delete(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Lecturer and associated user account deleted successfully",
      });
    });

    it("404 when not found", async () => {
      req.params.id = 12;
      const delLect = makeFromChain();
      delLect.eq.mockResolvedValue({ data: [], error: null });
      await controller.delete(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Lecturer not found.",
      });
    });

    it("500 on error", async () => {
      req.params.id = 12;
      const delLect = makeFromChain();
      delLect.eq.mockResolvedValue({ data: null, error: { message: "err" } });
      await controller.delete(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error deleting lecturer",
        error: "err",
      });
    });
  });
});
