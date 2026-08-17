# Wayfarer

A full-stack stay/holiday booking platform (booking.com-style search, listings, and checkout) styled with the [Airbnb design system](docs/design.md).

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**, themed directly from `docs/design.md` tokens (`src/app/globals.css`)
- **PostgreSQL + Prisma 7** (driver adapter: `@prisma/adapter-pg`)
- **Auth.js (NextAuth v5)** — email/password credentials auth
- Server Actions for sign up, log in, and booking creation (no client-side API layer needed)

## Getting started

1. Start a local Postgres instance:

   ```bash
   docker compose up -d
   ```

   (If Docker isn't available, point `DATABASE_URL` in `.env` at any reachable Postgres instance instead.)

2. Copy the env template and adjust if needed:

   ```bash
   cp .env.example .env
   ```

3. Install dependencies, run migrations, and seed demo data:

   ```bash
   npm install
   npm run db:migrate
   npm run db:seed
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Visit http://localhost:3000. A demo account is seeded: `demo@wayfarer.test` / `password123`.

## What's implemented

- Homepage: hero search bar, trending destinations, property type filters, seeded property grid
- Search results: destination/date/guest filtering, property-type filter, sorting
- Property detail: gallery, amenities, reviews, sticky reservation card
- Booking flow: date/guest selection → price breakdown → confirm (creates a real `Booking` row; no real payment processor is wired up) → confirmation page
- Auth: sign up / log in (credentials), session-aware nav, "My bookings"

## Notes

- Airbnb Cereal VF is a proprietary font and isn't bundled; `Inter` is loaded via `next/font` as the open-source substitute the design doc recommends.
- Checkout is a mocked confirmation — no Stripe/payment integration.
- Prisma's generated client lives at `src/generated/prisma` and is regenerated on `npm install` via the `postinstall` script; it isn't committed.
