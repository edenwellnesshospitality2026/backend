import type { UserRow } from "./repository.types.js";
import { prisma } from "../../db/prisma.js";

export type { UserRow } from "./repository.types.js";

export const findUserByEmail = async (email: string): Promise<UserRow | null> => {
  const doc = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!doc) return null;
  return {
    id: doc.id,
    email: doc.email,
    password_hash: doc.passwordHash,
    role: doc.role,
    must_change_password: doc.mustChangePassword,
  };
};

export const findUserById = async (id: string): Promise<UserRow | null> => {
  const doc = await prisma.user.findUnique({ where: { id } });
  if (!doc) return null;
  return {
    id: doc.id,
    email: doc.email,
    password_hash: doc.passwordHash,
    role: doc.role,
    must_change_password: doc.mustChangePassword,
  };
};

export const updatePasswordByUserId = async (id: string, nextHash: string) => {
  await prisma.user.update({
    where: { id },
    data: { passwordHash: nextHash, mustChangePassword: false },
  });
};
