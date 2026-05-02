import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const changeEmailMock = vi.fn();

vi.mock("../middlewares/auth.js", () => ({
  requireAuth: (req: { auth?: { userId: string; email: string; role: string } }, _res: unknown, next: () => void) => {
    req.auth = { userId: "u1", email: "admin@test.com", role: "admin" };
    next();
  },
}));

vi.mock("../modules/auth/service.js", () => ({
  authenticateUser: vi.fn(),
  changePassword: vi.fn(),
  changeEmail: changeEmailMock,
  fetchAuthUser: vi.fn(),
  verifyAccessToken: vi.fn(),
}));

describe("POST /api/auth/change-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns new token and user on success", async () => {
    changeEmailMock.mockResolvedValue({
      ok: true,
      token: "new.jwt",
      user: { id: "u1", email: "new@test.com", role: "admin", mustChangePassword: false },
    });
    const { createApp } = await import("../app.js");
    const app = createApp();

    const res = await request(app).post("/api/auth/change-email").send({
      newEmail: "new@test.com",
      currentPassword: "secret",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBe("new.jwt");
    expect(res.body.data.user.email).toBe("new@test.com");
    expect(changeEmailMock).toHaveBeenCalledWith("u1", "secret", "new@test.com");
  });

  it("returns 400 when email is taken", async () => {
    changeEmailMock.mockResolvedValue({ ok: false, code: "email_taken" });
    const { createApp } = await import("../app.js");
    const app = createApp();

    const res = await request(app).post("/api/auth/change-email").send({
      newEmail: "taken@test.com",
      currentPassword: "secret",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("That email is already in use");
  });
});
