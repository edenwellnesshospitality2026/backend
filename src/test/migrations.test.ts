import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("database artifacts", () => {
  it("seed script seeds admin account via Prisma", async () => {
    const seedPath = path.resolve("src/db/seed.ts");
    const seedSource = await fs.readFile(seedPath, "utf-8");
    expect(seedSource).toContain("info@edenwellnesshospitality.com");
    expect(seedSource).toContain("prisma.user.upsert");
  });

  it("migrate stub documents Prisma migrate deploy", async () => {
    const migratePath = path.resolve("src/db/migrate.ts");
    const migrateSource = await fs.readFile(migratePath, "utf-8");
    expect(migrateSource).toContain("prisma migrate deploy");
  });

  it("Prisma schema defines MySQL datasource", async () => {
    const schemaPath = path.resolve("prisma/schema.prisma");
    const schemaSource = await fs.readFile(schemaPath, "utf-8");
    expect(schemaSource).toContain('provider = "mysql"');
    expect(schemaSource).toContain("DATABASE_URL");
  });
});
