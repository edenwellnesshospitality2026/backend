import bcrypt from "bcrypt";
import { pool } from "./pool.js";

const adminEmail = "info@edenwellnesshospitality.com";
const adminPassword = "12345";

const run = async () => {
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await pool.query(
    `
      INSERT INTO users (email, password_hash, must_change_password, role)
      VALUES ($1, $2, false, 'admin')
      ON CONFLICT (email)
      DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        must_change_password = EXCLUDED.must_change_password,
        updated_at = NOW();
    `,
    [adminEmail, passwordHash]
  );
  // eslint-disable-next-line no-console
  console.log(`Seeded admin user: ${adminEmail}`);
};

run()
  .then(async () => {
    await pool.end();
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    await pool.end();
    process.exit(1);
  });
