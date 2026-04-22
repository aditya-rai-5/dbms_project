# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ShowsNow** — a full-stack movie ticket booking platform (BookMyShow clone, rebranded).

- **Frontend**: React 18 + Tailwind CSS (CRA), in `frontend/`
- **Backend**: Node.js + Express + PostgreSQL via Prisma ORM, in `backend/`

---

## Commands

### Frontend (`cd frontend`)
```bash
npm start          # Dev server at http://localhost:3000
npm run build      # Production build
npm test           # Run tests
```

### Backend (`cd backend`)
```bash
npm run dev        # Dev server with nodemon at http://localhost:5000
npm start          # Production start
npm run prisma:push      # Push schema to DB (no migration history)
npm run prisma:migrate   # Create and apply migration
npm run prisma:generate  # Regenerate Prisma client after schema changes
npm run prisma:studio    # Open Prisma Studio GUI
npm run seed       # Seed database with movies, theatres, shows
```

### Database setup (first time)
```bash
# 1. Create PostgreSQL database
createdb showsnow_db

# 2. In backend/ — copy .env.example to .env and set DATABASE_URL
cp .env.example .env

# 3. Push schema and seed
cd backend && npm install && npm run prisma:push && npm run seed
```

---

## Architecture

### Backend (`backend/src/`)

**Modular MVC pattern:**
```
config/      — environment config (config.js)
controllers/ — thin HTTP handlers, delegate to services
services/    — all business logic (auth, movie, show, booking, payment, seat, waitlist)
routes/      — Express routers, grouped by domain
middleware/  — auth (JWT), validate (express-validator), rateLimiter, errorHandler
utils/       — jwt.utils, response.utils, errors (AppError hierarchy)
prisma/      — schema.prisma, seed.js
```

**Request flow:** `routes → middleware → controller → service → Prisma → DB`

**Error handling:** All errors thrown as `AppError` subclasses (NotFoundError, ValidationError, etc.) and caught by `error.middleware.js` which formats unified JSON responses.

**API base:** `http://localhost:5000/api`

Key route groups:
- `/api/auth` — register, login, google OAuth, /me
- `/api/movie` — TMDB-compatible paths (`/top_rated`, `/popular`, `/upcoming`, `/:id/credits`, `/:id/similar`, `/:id/recommendations`)
- `/api/movies/:id` — movie detail + `/api/movies/:id/shows`
- `/api/shows/:id` — show detail, seats, lock/unlock seats, waitlist
- `/api/bookings` — CRUD for user bookings
- `/api/payments` — create Razorpay order, verify payment
- `/api/waitlist` — user's waitlist entries
- `/api/admin` — protected admin endpoints (stats, movies CRUD, theatres, screens, shows, all bookings)

### Frontend (`frontend/src/`)

**Structure:**
```
services/        — API service layer (api.service.js, auth.service.js, movie.service.js, booking.service.js)
context/         — Auth.context.jsx (JWT auth state), Movie.context.jsx (current movie + payment modal)
pages/           — Home.Page, Movie.Page, Booking.Page, BookingHistory.Page, BookingDetail.Page, Play.Page, 404
components/      — Navbar, HeroCarousel, PosterSlider, Poster, Cast, MovieHero, MovieInfo, Modal,
                   SeatSelector, Booking/ShowTimings, Footer, Loader, PaymentModel
layout/          — Default.layout.jsx (Navbar+Footer HOC), Movie.layout.jsx (Navbar-only HOC)
```

**Auth:** JWT stored in `localStorage` under key `token`. `AuthProvider` wraps the app and exposes `{ user, login, register, googleLogin, logout }`. The `api.service.js` Axios instance automatically attaches `Bearer <token>` and handles 401 globally.

**API calls:** All frontend API calls go through `src/services/api.service.js` (Axios instance pointing to `REACT_APP_API_URL`). Never import Axios directly in components — use the service files.

**Booking flow:**
1. Movie Page → "Book Tickets" → `ShowTimings.Component` (date picker + theatre/show grid)
2. Select show → `/show/:showId/book` (Booking.Page)
3. Select seats → Lock Seats (backend lock for 10 min) → Pay → verify → `/bookings/:id`
4. If show is full → Waitlist join UI

### Database Schema

Key relationships:
- `Movie` ←→ `Genre` (many-to-many)
- `Movie` → `CastMember` (one-to-many)
- `Theatre` → `Screen` → `Seat` (one-to-many chain)
- `Show` links `Movie` + `Screen`
- `Booking` → `User` + `Show` + `BookingSeat[]` + `Payment`
- `SeatLock` — unique on `(seatId, showId)`, has `expiresAt` for auto-expiry
- `WaitlistEntry` — unique on `(userId, showId)`

**Seat locking strategy:** Pessimistic locking via `SeatLock` table. Expired locks are purged on each new lock request. Booking creation validates active locks belong to the requesting user.

### Tailwind Custom Colors
- `darkBackground-{50..900}` — dark nav/background shades
- `premier-{50..900}` — blue-grey shades for premier section

### Environment Variables

Frontend (`.env`):
- `REACT_APP_API_URL` — backend base URL (default: `http://localhost:5000/api`)
- `REACT_APP_GOOGLE_CLIENT_ID`
- `REACT_APP_RAZORPAY_KEY`

Backend (`.env`):
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `SEAT_LOCK_MINUTES` (default: 10)
- `FRONTEND_URL` (for CORS)

### Payment (Razorpay)
If `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` are not set, the backend runs in **mock mode** — payment orders return `mock: true` and auto-confirm without hitting Razorpay. This allows full booking flow testing without credentials.

### Seed Data (after `npm run seed`)
- Admin: `admin@showsnow.com` / `admin123`
- User: `user@showsnow.com` / `user123`
- 8 movies, 5 theatres, 15 screens, ~240 shows (next 3 days × 2 times each)
