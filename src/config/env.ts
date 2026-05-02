import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(8090),
  MONGODB_URI: z.string().url(),
  CLOUDINARY_URL: z.string().optional(),
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
