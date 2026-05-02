import { z } from "zod";

/** hPanel / GitHub env values sometimes include accidental leading or trailing whitespace. */
const trimEnvStrings = (env: NodeJS.ProcessEnv): Record<string, string | undefined> => {
  const out: Record<string, string | undefined> = {};
  for (const key of Object.keys(env)) {
    const v = env[key];
    out[key] = typeof v === "string" ? v.trim() : v;
  }
  return out;
};

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
  MONGODB_URI: z.string().url(),
  CLOUDINARY_URL: z.string().optional(),
  CORS_ORIGINS: z.string().default("http://localhost:8080,http://localhost:8081"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars."),
  JWT_EXPIRES_IN: z.string().default("12h"),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(20),
});

const parsed = envSchema.safeParse(trimEnvStrings(process.env));

if (!parsed.success) {
  const detail = parsed.error.flatten().fieldErrors;
  throw new Error(`Invalid environment variables: ${JSON.stringify(detail)}`);
}

export const env = parsed.data;

export const corsOrigins = env.CORS_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
