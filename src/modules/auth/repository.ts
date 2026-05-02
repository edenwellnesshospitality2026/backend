import type { UserRow } from "./repository.types.js";
import { UserModel } from "../../models/User.js";

export type { UserRow } from "./repository.types.js";

export const findUserByEmail = async (email: string): Promise<UserRow | null> => {
  const doc = await UserModel.findOne({ email: email.toLowerCase() }).lean();
  if (!doc) return null;
  return {
    id: String(doc._id),
    email: doc.email,
    password_hash: doc.passwordHash,
    role: doc.role,
    must_change_password: doc.mustChangePassword,
  };
};

export const findUserById = async (id: string): Promise<UserRow | null> => {
  const doc = await UserModel.findById(id).lean();
  if (!doc) return null;
  return {
    id: String(doc._id),
    email: doc.email,
    password_hash: doc.passwordHash,
    role: doc.role,
    must_change_password: doc.mustChangePassword,
  };
};

export const updatePasswordByUserId = async (id: string, nextHash: string) => {
  await UserModel.findByIdAndUpdate(id, {
    passwordHash: nextHash,
    mustChangePassword: false,
  });
};
