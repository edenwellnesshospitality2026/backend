# Eden Backend Service

Production-ready backend service for:
- Authenticated operations panel APIs (custom JWT login with email/password)
- Listings + rate plans + inventory management (MongoDB)
- Bookings, contact/booking enquiries, CMS (memberships, guest stories, gallery), optional Cloudinary uploads

## Stack
- Node.js + Express + TypeScript
- MongoDB (Mongoose)
- JWT auth (`jsonwebtoken`) + hashed passwords (`bcrypt`)
- Validation (`zod`)
- Security middleware (`helmet`, `express-rate-limit`)
- Logging (`pino`, `pino-http`)
- Testing (`vitest`, `supertest`)

## Quick Start (Local)

```bash
cp .env.example .env
# Set MONGODB_URI (with database name). Optionally CLOUDINARY_URL for image uploads.
npm install
npm run db:seed
npm run dev
```

Service runs on `http://localhost:8090`.

## Seeded Admin Login

- Email: `info@edenwellnesshospitality.com`
- Initial password: `12345`

Password is stored only as a bcrypt hash in MongoDB. Change it immediately from dashboard/API after first login.

**Production:** See [DEPLOY.md](./DEPLOY.md) for secret rotation, Atlas + Cloudinary env, smoke tests, and post-deploy steps (seed DB, change admin password).

## Environment Variables

- `NODE_ENV` (`development` | `test` | `production`)
- `PORT` (default `8090`)
- `MONGODB_URI` (MongoDB connection string; **include database name** in the path, e.g. `...mongodb.net/eden?...` — the server warns at startup if the path has no DB segment)
- `CLOUDINARY_URL` (optional; required for `POST /api/uploads/image`)
- `JWT_SECRET` (min 16 chars, strong random secret)
- `JWT_EXPIRES_IN` (default `12h`)
- `CORS_ORIGINS` (comma-separated allowed origins)
- `AUTH_RATE_LIMIT_WINDOW_MS` (auth limiter window)
- `AUTH_RATE_LIMIT_MAX` (auth limiter max requests)

## Database Commands

- `npm run db:migrate`: informational only (MongoDB uses Mongoose models; no SQL migrations)
- `npm run db:seed`: upserts default admin user and seeds membership tiers if empty

## API Endpoints

### Health
- `GET /health`

### Auth
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token required)
- `POST /api/auth/change-password` (Bearer token required)

### Listings
- `GET /api/listings` (public read)
- `POST /api/listings` (auth required)
- `PUT /api/listings/:id` (auth required)
- `PATCH /api/listings/:id/inventory` (auth required)
- `PUT /api/listings/:id/rate-plans` (auth required)
- `DELETE /api/listings/:id` (auth required)

### Bookings
- `POST /api/bookings` (public submission)
- `GET /api/bookings` (Bearer — dashboard list)

### Enquiries
- `POST /api/contact-enquiries` (rate-limited)
- `GET /api/contact-enquiries` (Bearer)
- `PATCH /api/contact-enquiries/:id` (Bearer — status)
- `POST /api/booking-enquiries` (rate-limited)
- `GET /api/booking-enquiries` (Bearer)
- `PATCH /api/booking-enquiries/:id` (Bearer — status)

### CMS (public read where noted)
- `GET /api/cms/membership-tiers` — published tiers
- `GET /api/cms/membership-tiers/manage` (Bearer) — all tiers
- `POST|PUT|DELETE /api/cms/membership-tiers` (+ `:id` for update/delete) — Bearer
- `GET /api/cms/guest-stories` — published stories
- `GET /api/cms/guest-stories/manage` (Bearer)
- `POST|PUT|DELETE /api/cms/guest-stories` (+ `:id`) — Bearer
- `GET /api/cms/gallery` — categories with images (published images only)
- Category/image CRUD under `/api/cms/gallery/categories` and `/api/cms/gallery/images` — Bearer (see `app.ts`)

### Uploads
- `POST /api/uploads/image` (Bearer, multipart field `file`; requires `CLOUDINARY_URL`)

## Quality Commands

- `npm run typecheck`
- `npm run test`
- `npm run build`

## Hostinger Deployment Blueprint

1. Provision Hostinger VPS (Ubuntu LTS).
2. Install Docker + Docker Compose + Nginx.
3. Set production `.env` on server only (never commit secrets).
4. Build and run service:
   - `docker compose up -d --build`
5. Configure reverse proxy using `deploy/nginx.conf`.
6. Install TLS cert with Let’s Encrypt (`certbot --nginx`).
7. Configure automated MongoDB Atlas backups (or self-hosted backups).

## GitHub Auto-Deploy Pipeline (Hostinger)

This repository now has:
- `.github/workflows/ci.yml` for CI checks
- `.github/workflows/deploy.yml` for automatic deploy on every push to `main`

### 1) Required GitHub Secrets

Set these in GitHub repo settings -> Secrets and variables -> Actions:

- `SSH_HOST`: Hostinger VPS public IP or hostname
- `SSH_USER`: SSH user (for example, `root` or a deploy user)
- `SSH_PORT`: SSH port (usually `22`)
- `SSH_PRIVATE_KEY`: private key content used by GitHub Actions
- `APP_DIR`: absolute deploy directory on server (for example, `/opt/eden-backend-service`)
- `APP_ENV_FILE`: full `.env` content for production

### 2) First-time server prep

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin git
sudo systemctl enable docker
sudo systemctl start docker
```

### 3) Deployment behavior

On every push to `main`, GitHub Actions will:
1. Run `typecheck`, `test`, and `build`
2. SSH into Hostinger VPS
3. Clone or update repo in `APP_DIR`
4. Write `.env` from `APP_ENV_FILE` secret
5. Run `docker compose up -d --build`

### 4) Recommended next hardening

- Run `npm run db:seed` once after deploy if a fresh database needs the admin user.
- Add health-check and rollback script if `docker compose up` fails.
- Use a least-privilege deploy user instead of root.
