# Nuée — Maison de Parfum

A perfume store with a 360° 3D product viewer, customer accounts and an admin dashboard.

- **Customers** browse, turn every bottle in 3D, save a wishlist, create an account and place orders.
- **The admin** photographs a product (camera or upload), fills in its details, sees a live 3D preview and publishes it. Orders are managed from the same dashboard.

## Getting started

Requires Node.js 24 or newer.

```bash
npm install
cp .env.example .env   # then set ADMIN_EMAIL and ADMIN_PASSWORD
npm run dev            # storefront on http://localhost:5173, API on :8787
```

The admin account is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` the first time the server starts. Sign in at `/login`; admins land on `/admin`. Anyone who registers on the site is a customer — there is no way to become an admin from the browser.

| Command | What it does |
| --- | --- |
| `npm run dev` | API + storefront with live reload |
| `npm test` | API tests (roles, uploads, orders, pricing) |
| `npm run build` | Type-check and build the storefront into `dist/` |
| `npm start` | Production server: API, uploads and the built storefront on one port |

## How products get their 3D view

Every product gets a 360° view automatically: the bottle is generated in 3D from the shape and colours chosen in the admin form, and the colours are matched to the first photo. For a true 3D copy of the real bottle, scan it with a phone app (Polycam, Luma AI, Reality Composer), export a `.glb` file and upload it in the product form — it replaces the generated bottle.

## Project layout

```
src/
  domain/      Types and validation shared by the browser and the server
  services/    API clients and the read-only ProductRepository
  features/    Feature modules (auth, cart, checkout, admin, product…)
  components/  Reusable UI and the three.js scene
  pages/       One component per route
server/
  routes/        HTTP endpoints (auth, products, uploads, orders)
  repositories/  SQLite access, one class per table
  storage/       Where uploaded files go (local disk; swap for S3/R2 here)
  data/          Database and uploaded files (git-ignored)
```

## Before going live

- **Payments:** orders are saved but nothing is charged. Connect a provider (e.g. Stripe) in `server/routes/orderRoutes.ts`.
- **HTTPS:** set `NODE_ENV=production` so session cookies are HTTPS-only, and set `APP_ORIGIN` to your domain.
- **Backups:** everything lives in `server/data/` — back it up, or point `DATABASE_FILE` / `UPLOADS_DIR` at persistent storage.
- **Login rate limiting** is not implemented yet; add it (or a reverse-proxy rule) before launch.
