import { pool } from "../../db/pool.js";

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  must_change_password: boolean;
}

export const findUserByEmail = async (email: string): Promise<UserRow | null> => {
  const result = await pool.query<UserRow>(
    `SELECT id, email, password_hash, role, must_change_password
     FROM users
     WHERE email = $1`,
    [email]
  );
  return result.rows[0] ?? null;
};

export const findUserById = async (id: string): Promise<UserRow | null> => {
  const result = await pool.query<UserRow>(
    `SELECT id, email, password_hash, role, must_change_password
     FROM users
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
};

export const updatePasswordByUserId = async (id: string, nextHash: string) => {
  await pool.query(
    `UPDATE users
     SET password_hash = $2, must_change_password = false, updated_at = NOW()
     WHERE id = $1`,
    [id, nextHash]
  );
};
