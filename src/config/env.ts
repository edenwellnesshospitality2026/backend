import { z } from "zod";

/** PORT must match what the hosting reverse-proxy forwards to (Hostinger often injects PORT; if not, set it in the panel). */
const portSchema = z.preprocess((v) => {
  if (v == null || v === "") return 8090;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 8090;
}, z.number().int().positive());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: portSchema,
  /** MySQL connection string, e.g. mysql://user:pass@host:3306/dbname */
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  /** Directory for uploaded files (created on startup if missing). Relative to process cwd. */
  UPLOAD_DIR: z.string().default("uploads"),
  /** URL path where `UPLOAD_DIR` is served (see app static middleware). */
  FILES_PUBLIC_PREFIX: z.string().default("/files"),
  /**
   * If set, upload API returns absolute URLs: `${PUBLIC_SITE_URL}${FILES_PUBLIC_PREFIX}/...`.
   * If unset, returns a root-relative path starting with FILES_PUBLIC_PREFIX.
   */
  PUBLIC_SITE_URL: z.string().optional(),
  CORS_ORIGINS: z.string().default("http://localhost:8080,http://localhost:8081"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars."),
  JWT_EXPIRES_IN: z.string().default("12h"),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(20),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

export const env = parsed.data;

export const corsOrigins = env.CORS_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
