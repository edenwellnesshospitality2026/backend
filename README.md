# Eden Backend Service

Production-ready backend service for:
- Authenticated operations panel APIs (custom JWT login with email/password)
- Listings + rate plans + inventory management
- Booking submission and storage in PostgreSQL

## Stack
- Node.js + Express + TypeScript
- PostgreSQL (`pg`)
- JWT auth (`jsonwebtoken`) + hashed passwords (`bcrypt`)
- Validation (`zod`)
- Security middleware (`helmet`, `express-rate-limit`)
- Logging (`pino`, `pino-http`)
- Testing (`vitest`, `supertest`)

## Quick Start (Local)

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Service runs on `http://localhost:8090`.

## Seeded Admin Login

- Email: `info@edenwellnesshospitality.com`
- Initial password: `12345`

Password is stored only as a bcrypt hash in the database. Change it immediately from dashboard/API after first login.

## Environment Variables

- `NODE_ENV` (`development` | `test` | `production`)
- `PORT` (default `8090`)
- `DATABASE_URL` (PostgreSQL connection string)
- `JWT_SECRET` (min 16 chars, strong random secret)
- `JWT_EXPIRES_IN` (default `12h`)
- `CORS_ORIGINS` (comma-separated allowed origins)
- `AUTH_RATE_LIMIT_WINDOW_MS` (auth limiter window)
- `AUTH_RATE_LIMIT_MAX` (auth limiter max requests)

## Database Commands

- `npm run db:migrate`: applies SQL migrations in `src/db/migrations`
- `npm run db:seed`: creates/updates default admin user

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
- `POST /api/bookings`

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
7. Configure automated PostgreSQL backups (daily, retention >= 7 days).
