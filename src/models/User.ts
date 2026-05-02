import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "admin" },
    mustChangePassword: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User ?? mongoose.model("User", userSchema);
