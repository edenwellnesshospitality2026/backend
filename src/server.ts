import fs from "node:fs";
import path from "node:path";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { prisma } from "./db/prisma.js";

const ensureUploadDir = () => {
  const dir = path.resolve(process.cwd(), env.UPLOAD_DIR);
  fs.mkdirSync(dir, { recursive: true });
};

/** Keeps HTTP alive if MySQL is slow or unreachable — same strategy as former Mongo loop. */
const runDbConnectionLoop = async () => {
  while (true) {
    try {
      await prisma.$connect();
      logger.info("MySQL ready — API routes can use the database");
      return;
    } catch (err) {
      logger.error({ err }, "MySQL connection failed; retrying in 15s (HTTP stays up)");
      await new Promise((r) => setTimeout(r, 15_000));
    }
  }
};

const start = async () => {
  ensureUploadDir();
  const app = createApp();

  const server = app.listen(env.PORT, env.HOST, () => {
    logger.info(`eden-backend-service listening on http://${env.HOST}:${env.PORT}`);
  });

  void runDbConnectionLoop();

  const shutdown = async () => {
    server.close(() => logger.info("HTTP server closed"));
    await prisma.$disconnect().catch(() => undefined);
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());
};

start().catch((err) => {
  logger.error(err);
  process.exit(1);
});
