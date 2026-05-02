import mongoose from "mongoose";

export const connectMongo = async (uri: string) => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
    connectTimeoutMS: 10_000,
  });
};

export const disconnectMongo = async () => {
  await mongoose.disconnect();
};

export const isMongoConnected = () => mongoose.connection.readyState === 1;
