import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectMongo, disconnectMongo } from "./db/mongo.js";

const start = async () => {
  await connectMongo(env.MONGODB_URI);
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`eden-backend-service running on http://localhost:${env.PORT}`);
  });

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
