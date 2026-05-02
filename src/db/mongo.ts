import mongoose from "mongoose";
import { logger } from "../config/logger.js";

export const connectMongo = async (uri: string): Promise<void> => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
    connectTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
  });
  logger.info("MongoDB connected");
};

export const disconnectMongo = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
};
