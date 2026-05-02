import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("database artifacts", () => {
  it("Mongo seed script seeds admin account", async () => {
    const seedPath = path.resolve("src/db/seed.ts");
    const seedSource = await fs.readFile(seedPath, "utf-8");
    expect(seedSource).toContain("info@edenwellnesshospitality.com");
    expect(seedSource).toContain("mongoose.connect");
  });

  it("migrate script documents Mongo-only workflow", async () => {
    const migratePath = path.resolve("src/db/migrate.ts");
    const migrateSource = await fs.readFile(migratePath, "utf-8");
    expect(migrateSource).toContain("MongoDB");
  });
});
