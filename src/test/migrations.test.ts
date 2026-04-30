import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("database artifacts", () => {
  it("contains core schema migration for users/listings/bookings", async () => {
    const migrationPath = path.resolve("src/db/migrations/001_init.sql");
    const sql = await fs.readFile(migrationPath, "utf-8");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS users");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS listings");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS bookings");
  });

  it("seed script includes required admin account", async () => {
    const seedPath = path.resolve("src/db/seed.ts");
    const seedSource = await fs.readFile(seedPath, "utf-8");
    expect(seedSource).toContain("info@edenwellnesshospitality.com");
  });
});
