import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectMongo, disconnectMongo } from "./db/mongo.js";

const start = async () => {
  const app = createApp();

  const server = app.listen(env.PORT, env.HOST, () => {
    logger.info(
      `eden-backend-service listening on http://${env.HOST}:${env.PORT} (MongoDB connecting…)`,
    );
  });

  try {
    await connectMongo(env.MONGODB_URI);
    logger.info("MongoDB ready — API routes can use the database");
  } catch (err) {
    logger.error(err);
    await new Promise<void>((resolve) => server.close(() => resolve()));
    process.exit(1);
  }

  const shutdown = async () => {
    server.close(() => logger.info("HTTP server closed"));
    await disconnectMongo().catch(() => undefined);
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());
};

start().catch((err) => {
  logger.error(err);
  process.exit(1);
});
