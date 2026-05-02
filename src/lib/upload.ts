import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import multer from "multer";
import { env } from "../config/env.js";

const uploadRoot = () => path.resolve(process.cwd(), env.UPLOAD_DIR);

const extensionFromMime = (mime: string): string => {
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  return "";
};

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const now = new Date();
    const y = String(now.getUTCFullYear());
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    const dest = path.join(uploadRoot(), y, m);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const ext = extensionFromMime(file.mimetype) || path.extname(file.originalname) || ".bin";
    cb(null, `${randomUUID()}${ext}`);
  },
});

/** Multipart upload for dashboard images; files land under `UPLOAD_DIR`. */
export const uploadImageDisk = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});
