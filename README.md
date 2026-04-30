# Eden Backend Service

Standalone backend service for:
- Booking form submission API
- Listings + rate plans + inventory management API

## Stack
- Node.js
- Express
- TypeScript

## Run locally

```bash
cd eden-backend-service
cp .env.example .env
npm install
npm run dev
```

Service runs on `http://localhost:8090` by default.

## Environment variables

- `PORT` (default `8090`)
- `CORS_ORIGINS` (comma-separated origins)
- `SUPABASE_URL` (optional)
- `SUPABASE_ANON_KEY` (optional)
- `SUPABASE_LEADS_TABLE` (default `Leads`)

If Supabase credentials are provided, booking submissions are also written to Supabase `Leads`.

## API Endpoints

### Health
- `GET /health`

### Listings
- `GET /api/listings`
- `POST /api/listings`
- `PUT /api/listings/:id`
- `PATCH /api/listings/:id/inventory`
- `PUT /api/listings/:id/rate-plans`
- `DELETE /api/listings/:id`

### Bookings
- `POST /api/bookings`

Bookings are persisted in local JSON storage (`data/store.json`) and optionally mirrored to Supabase `Leads`.
