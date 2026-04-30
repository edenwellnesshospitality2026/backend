import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authServiceMocks = vi.hoisted(() => ({
  authenticateUser: vi.fn(),
  changePassword: vi.fn(),
  fetchAuthUser: vi.fn(),
  verifyAccessToken: vi.fn(),
}));

vi.mock("../modules/auth/service.js", () => authServiceMocks);
vi.mock("../modules/listings/repository.js", () => ({
  listListings: vi.fn(async () => []),
  getListingById: vi.fn(async () => null),
  upsertListing: vi.fn(async (payload: unknown) => payload),
  updateInventory: vi.fn(async () => undefined),
  deleteListing: vi.fn(async () => undefined),
}));
vi.mock("../modules/bookings/repository.js", () => ({
  createBooking: vi.fn(async (payload: unknown) => payload),
}));

describe("app", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("logs in with valid credentials", async () => {
    authServiceMocks.authenticateUser.mockResolvedValue({
      token: "token",
      user: { id: "1", email: "info@edenwellnesshospitality.com", role: "admin" },
    });
    const { createApp } = await import("../app.js");
    const app = createApp();

    const res = await request(app).post("/api/auth/login").send({
      email: "info@edenwellnesshospitality.com",
      password: "12345",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBe("token");
  });

  it("blocks protected listings create without bearer token", async () => {
    const { createApp } = await import("../app.js");
    const app = createApp();
    const res = await request(app).post("/api/listings").send({});

    expect(res.status).toBe(401);
  });

  it("rejects invalid booking payloads", async () => {
    const { createApp } = await import("../app.js");
    const app = createApp();
    const res = await request(app).post("/api/bookings").send({
      guestName: "",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });
});
