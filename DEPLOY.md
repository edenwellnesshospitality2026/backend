# Production deployment (MongoDB Atlas + Cloudinary)

Operational checklist for `eden-backend-service`. Keep secrets in GitHub Actions secrets (`APP_ENV_FILE`), Hostinger env, or server-only `.env` — never commit credentials.

## 1. Rotate exposed or stale secrets

If credentials ever appeared in chat, logs, or a leak: rotate them before production use.

1. **MongoDB Atlas** — Database Access → user → Edit → change password; update `MONGODB_URI` everywhere it is stored.
2. **JWT** — Generate a new random secret (≥16 chars); set `JWT_SECRET` on the server. Existing user sessions become invalid until they log in again.
3. **Cloudinary** — Console → settings → regenerate API secret (or rotate key); update `CLOUDINARY_URL`.

After rotation, update `APP_ENV_FILE` (or equivalent) and redeploy.

## 2. MongoDB Atlas

- **URI**: Include the database name in the path, e.g. `mongodb+srv://USER:PASS@cluster.mongodb.net/eden?retryWrites=true&w=majority`. A URI with only `...mongodb.net/?...` may use the wrong default database; the app logs a warning on startup if the path has no database segment.
- **Network Access**: Add the Hostinger VPS **public egress IP** (or follow Atlas docs for your hosting); restrict `0.0.0.0/0` only if you accept the security tradeoff.

## 3. Production environment (`APP_ENV_FILE` / `.env`)

Required shape matches [src/config/env.ts](src/config/env.ts). Example template (replace placeholders):

```bash
NODE_ENV=production
HOST=0.0.0.0
PORT=8090
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/eden?retryWrites=true&w=majority
JWT_SECRET=<long-random-string-at-least-16-chars>
JWT_EXPIRES_IN=12h
CORS_ORIGINS=https://example.com,https://www.example.com
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=20
```

`CLOUDINARY_URL` is optional for boot; without it, `POST /api/uploads/image` returns 503.

## 4. GitHub Actions deploy

Configure repository secrets (see [README.md](README.md#github-auto-deploy-pipeline-hostinger)):

- `SSH_HOST`, `SSH_USER`, `SSH_PORT`, `SSH_PRIVATE_KEY`, `APP_DIR`, `APP_ENV_FILE`

Push to `main` runs verify then SSH deploy: writes `.env` from `APP_ENV_FILE`, runs `docker compose up -d --build` ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)).

## 5. Smoke tests (local or staging)

With a valid `.env` (Atlas + optional Cloudinary):

```bash
npm ci
npm run db:seed
npm run dev
```

Then:

- `GET http://localhost:8090/health` — expect `"mongoConnected": true` after Atlas connects.
- `POST /api/auth/login` with seeded admin credentials from README.
- `POST /api/uploads/image` with `Authorization: Bearer <token>` and multipart field `file` (requires `CLOUDINARY_URL`).

CI on every PR/push: `npm run typecheck`, `npm run test`, `npm run build` (uses test Mongo URI from [src/test/setup.ts](src/test/setup.ts)).

## 6. After first production deploy

1. Check runtime logs: no `Invalid environment variables` on boot.
2. `GET /health` on the public API URL — `"mongoConnected": true`.
3. If the database is new: from the server (or any host that can reach Atlas with `MONGODB_URI`):

   ```bash
   cd /path/to/eden-backend-service
   # ensure .env or export MONGODB_URI=...
   npm run db:seed
   ```

4. Log in and **change the default admin password** via `POST /api/auth/change-password`.

## 7. Hostinger hPanel: build “Completed” but `/health` returns 503

The build log often stops right after the `tsc` line with **no extra output** — that is normal when compilation succeeds. **`503 Service Unavailable`** means the browser reached Hostinger’s edge but **no healthy Node process** answered (not “Mongo slow” by itself).

Do this in order:

1. **Runtime logs** (hPanel → **Runtime logs** for this site) — look for `Invalid environment variables`, stack traces, or `Cannot find module`. Fix env or redeploy; the process exits **before** `listen()` if validation fails.
2. **`MONGODB_URI`** — Must be a valid URL for Zod (`mongodb+srv://...`). If the Atlas password contains **`@`, `#`, `%`, `/`**, etc., it must be [**percent-encoded**](https://www.mongodb.com/docs/manual/reference/connection-string/) in the URI.
3. **`HOST` / `PORT`** — Add **`HOST=0.0.0.0`** in Environment variables if missing. Set **`PORT`** to whatever Hostinger documents for Node apps on your plan (they sometimes inject `PORT` automatically; if the app and proxy disagree, you get **503**).
4. **Fresh zip** — After fixing code on GitHub, rebuild your deploy zip from the latest `main` (or run `npm run package:hostinger` from [scripts/package-hostinger.sh](scripts/package-hostinger.sh)), upload again, and **redeploy** so the server is not still running an old failed state.
5. **Atlas network** — If the app did start, `/health` can still show `mongoConnected: false` until Atlas allows the server IP; that is **200 JSON**, not 503. **503** almost always means the Node app never bound to the port the proxy uses.
