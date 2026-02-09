# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lasting Impressions is a jewelry and beading e-commerce site with class booking functionality. It uses a React/TypeScript frontend with Vercel Serverless Functions for the API — deployed as a single project on Vercel.

## Commands

- `npm run dev` — Start Vite dev server (port 8080). Use `vercel dev` for full-stack local dev (frontend + API).
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run setup-db` — Initialize Neon PostgreSQL tables and default admin user

## Architecture

### Frontend
- **Vite + React 18 + TypeScript** with SWC for fast compilation
- **Path alias**: `@/` maps to `src/`
- **UI**: shadcn/ui (default style, CSS variables, slate base) + Tailwind CSS + Radix UI primitives
- **Routing**: react-router-dom v6 with `<BrowserRouter>`. All routes defined in `src/App.tsx`. The `/admin` route is protected via `<ProtectedRoute>` which checks `AuthContext`
- **State management** via three React contexts (provider order matters — see `App.tsx`):
  - `AuthContext` — JWT-based admin auth, stores token in localStorage (`admin-token`), talks to `/api/auth`
  - `AdminContext` — All admin CRUD operations for products, categories, orders, classes, bookings, custom requests, contact messages. `API_URL = "/api"` (relative). Uses `fetch()` directly (not react-query)
  - `CartContext` — Client-side cart persisted in localStorage (`lasting-impressions-cart`)
- **TypeScript config**: `strictNullChecks` is OFF, `noImplicitAny` is OFF

### Backend (`api/`)
- **Vercel Serverless Functions** — each file in `api/` is an endpoint
- **Database**: Neon PostgreSQL via `@neondatabase/serverless`. Connection string from `DATABASE_URL` env var
- **Auth**: JWT (secret from `JWT_SECRET` env var), bcryptjs for password hashing. Helper in `api/_lib/auth.js`
- **File uploads**: `@vercel/blob` — images uploaded to Vercel Blob storage, stored as full CDN URLs
- **Shared code**: `api/_lib/db.js` (SQL client) and `api/_lib/auth.js` (JWT auth helper) — `_lib/` prefix prevents Vercel from exposing them as endpoints
- **API routes** all prefixed `/api/`: auth, categories, products, orders, classes, bookings, contact-messages, custom-requests, upload, health
- Dynamic routes use `[id].js` bracket syntax — params via `req.query.id`
- Each handler uses `switch (req.method)` for multiple HTTP methods

### Database Schema
Tables (all use UUID primary keys): `users`, `categories`, `products`, `orders`, `classes`, `bookings`, `contact_messages`, `custom_requests`. Schema defined in `scripts/setup-db.js`. Key patterns:
- `orders.items` and `orders.shipping_address` are JSONB
- `products.images` is `TEXT[]` (PostgreSQL array) — stores full Vercel Blob CDN URLs
- `custom_requests.specifications` and `custom_requests.quote` are JSONB

### Key Conventions
- Backend uses snake_case column names; frontend contexts map them to camelCase (e.g., `created_at` → `createdAt`, `in_stock` → `inStock`)
- Product images are uploaded to Vercel Blob first (`/api/upload`), then image URLs are sent as JSON in the product create/update request
- Admin-protected endpoints require `Authorization: Bearer <token>` header
- Public endpoints (products list, categories, classes) don't require auth

### Environment Variables
Set in Vercel dashboard (or `.env.local` for local dev):
- `DATABASE_URL` — Neon PostgreSQL connection string
- `JWT_SECRET` — Secret for JWT signing
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob store token (for image uploads)
