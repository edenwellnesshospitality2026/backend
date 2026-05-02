import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import type { AuthUser } from "../../types.js";
import {
  findUserByEmail,
  findUserById,
  isEmailTakenByOtherUser,
  updateEmailByUserId,
  updatePasswordByUserId,
} from "./repository.js";

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export const createAccessToken = (payload: TokenPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });

export const verifyAccessToken = (token: string): TokenPayload =>
  jwt.verify(token, env.JWT_SECRET) as TokenPayload;

export const authenticateUser = async (email: string, password: string) => {
  const user = await findUserByEmail(email.toLowerCase());
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    mustChangePassword: user.must_change_password,
  };
  const token = createAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  return { user: authUser, token };
};

export const fetchAuthUser = async (userId: string): Promise<AuthUser | null> => {
  const user = await findUserById(userId);
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    mustChangePassword: user.must_change_password,
  };
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await findUserById(userId);
  if (!user) return false;
  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) return false;
  const nextHash = await bcrypt.hash(newPassword, 12);
  await updatePasswordByUserId(userId, nextHash);
  return true;
};

export type ChangeEmailResult =
  | { ok: true; token: string; user: AuthUser }
  | { ok: false; code: "invalid_password" | "email_taken" | "not_found" };

export const changeEmail = async (
  userId: string,
  currentPassword: string,
  newEmail: string
): Promise<ChangeEmailResult> => {
  const user = await findUserById(userId);
  if (!user) return { ok: false, code: "not_found" };
  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) return { ok: false, code: "invalid_password" };

  const emailLower = newEmail.trim().toLowerCase();
  if (emailLower !== user.email.toLowerCase()) {
    const taken = await isEmailTakenByOtherUser(emailLower, userId);
    if (taken) return { ok: false, code: "email_taken" };
    await updateEmailByUserId(userId, emailLower);
  }

  const nextEmail = emailLower !== user.email.toLowerCase() ? emailLower : user.email;
  const authUser: AuthUser = {
    id: user.id,
    email: nextEmail,
    role: user.role,
    mustChangePassword: user.must_change_password,
  };
  const token = createAccessToken({
    sub: user.id,
    email: nextEmail,
    role: user.role,
  });
  return { ok: true, token, user: authUser };
};
