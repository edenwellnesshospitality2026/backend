import mongoose from "mongoose";
import { logger } from "../config/logger.js";

export const connectMongo = async (uri: string): Promise<void> => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  logger.info("MongoDB connected");
};

export const disconnectMongo = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
};
