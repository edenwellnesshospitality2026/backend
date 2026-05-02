import mongoose from "mongoose";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { mongoUriHasExplicitDatabase } from "./config/mongodb-uri.js";
import { logger } from "./config/logger.js";
import { connectMongo, disconnectMongo } from "./db/mongo.js";

/** Keeps HTTP alive if Atlas is slow or unreachable — exiting on Mongo failure caused Hostinger 503s. */
const runMongoConnectionLoop = async () => {
  while (mongoose.connection.readyState !== 1) {
    try {
      await connectMongo(env.MONGODB_URI);
      logger.info("MongoDB ready — API routes can use the database");
      return;
    } catch (err) {
      logger.error({ err }, "MongoDB connection failed; retrying in 15s (HTTP stays up)");
      await new Promise((r) => setTimeout(r, 15_000));
    }
  }
};

const start = async () => {
  if (!mongoUriHasExplicitDatabase(env.MONGODB_URI)) {
    logger.warn(
      "MONGODB_URI has no database name in the path (e.g. use ...mongodb.net/eden?retryWrites=...); Mongoose may use the default database."
    );
  }

  const app = createApp();

  const server = app.listen(env.PORT, env.HOST, () => {
    logger.info(`eden-backend-service listening on http://${env.HOST}:${env.PORT}`);
  });

  void runMongoConnectionLoop();

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
