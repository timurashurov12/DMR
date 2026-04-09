# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DMR (Digital Menu Restaurant)** is a monorepo for a restaurant menu catalog system with public catalog, admin panel, and backend API.

- **Monorepo structure**: `apps/api` (NestJS backend), `apps/web` (Vite + React frontend + admin)
- **Database**: Supabase PostgreSQL via Prisma ORM
- **Key features**: Multi-language menu management (ru, en, kk), admin CRUD, JWT auth, public API, bookings, Telegram integration
- **Node.js requirement**: 20+

## High-Level Architecture

### Backend (apps/api) — NestJS + Prisma

```
apps/api/src/
├── app.module.ts          # Root module with all feature imports
├── main.ts                # Bootstrap: loads .env, configures CORS, uploads dir, Swagger
├── auth/                  # JWT auth: login, token validation, strategies
├── users/                 # User management (admin accounts)
├── restaurants/           # Restaurant entity and multi-tenancy
├── menus/                 # Menu (groups menu types: main, bar, wine, etc.)
├── menu-types/            # Menu types (e.g., "main menu") with translations
├── categories/            # Categories within menu types
├── menu-items/            # Dish/item details with translations and images
├── languages/             # Available languages (ru, en, kk)
├── public-menu/           # Public API endpoints for catalog (cached)
├── translate/             # Gemini/GROQ translation service
├── site-settings/         # Restaurant branding and config
├── bookings/              # Reservation system
├── telegram/              # Telegram bot integration
├── common/                # Shared utilities (RestaurantScope for multi-tenancy)
└── prisma/                # ORM config, schema, migrations, seed
```

**Key patterns:**
- **Restaurant scope**: `RestaurantScopeModule` injects current restaurant context via middleware (multi-tenant)
- **Data model**: Languages → MenuTypes → Categories → MenuItems (each with translations)
- **Caching**: Public menu endpoints cache by (menuTypeId, locale) key; invalidated on admin changes
- **Uploads**: Local `./uploads` on dev; `/tmp/dmr-uploads` on Vercel/Lambda (serverless read-only root)

### Frontend (apps/web) — Vite + React with Features Architecture

```
apps/web/src/
├── shared/
│   ├── components/        # Layout, LanguageSwitcher, etc. (shared UI)
│   ├── context/           # LocaleContext, CartContext (global state)
│   └── api/               # API client: menu queries, auth, admin endpoints
├── features/
│   ├── home/              # Landing page (menu type selection)
│   ├── menu/              # Public menu catalog by type
│   ├── booking/           # Reservation form
│   └── admin/             # Admin dashboard at /admin
│       ├── context/       # AuthContext (JWT token, user), RestaurantContext
│       ├── components/    # DashboardLayout (nav, sidebar), CRUD tables
│       ├── lib/           # Helpers (API calls for admin operations)
│       └── pages/         # LoginPage, MenuTypesPage, CategoriesPage, etc.
├── App.tsx                # Router: /admin/* (admin routes), /* (public routes)
└── main.tsx               # Entry: React + Router setup
```

**Tech stack**: React 19, React Router 7, TailwindCSS 4, React Query 5, Vitest

## Common Commands

### Root-Level Commands
```bash
# Install dependencies (run once after clone)
npm install

# Start all dev servers in separate terminals
npm run dev:api    # API on http://localhost:3000
npm run dev:web    # Web on http://localhost:5173

# Build for production
npm run build      # Both API and web
```

### API-Specific Commands
```bash
cd apps/api

# Development
npm run dev                 # Watch mode (hot reload)
npm start                   # One-time start (no watch)

# Building and testing
npm run build               # Compile (includes Prisma generate)
npm test                    # Run all tests (Jest)
npm run test:watch         # Watch mode for tests
npm run test:cov           # Coverage report

# Prisma (database)
npx prisma generate        # Generate Prisma client (run after schema changes)
npx prisma migrate dev     # Create and run new migration
npx prisma migrate deploy  # Run pending migrations (production)
npx prisma studio         # GUI for database (localhost:5555)
npm run prisma:seed       # Seed database (creates languages, menu types, admin user)
```

Default admin after seed: **admin@demo.local** / **admin123**

### Web-Specific Commands
```bash
cd apps/web

# Development
npm run dev                # Vite dev server (hot reload), http://localhost:5173

# Building and testing
npm run build              # TypeScript check + Vite build to dist/
npm run preview            # Preview production build locally
npm run test               # Run Vitest in watch mode
npm run test:run          # Run tests once (CI)
```

## Environment Setup

**Root .env file** (loaded by both API and web; .env.example exists for reference):

```env
# Database connection (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# NestJS API
API_PORT=3000
JWT_SECRET="your-secret-key-min-32-chars"

# CORS and frontend URLs (used in API main.ts)
FRONTEND_URL="http://localhost:5173"
ADMIN_URL="http://localhost:5174"

# Translation providers (pick one; optional)
GEMINI_API_KEY=""         # Google Gemini for menu translations
GROQ_API_KEY=""           # Or use Groq for translations

# Optional: Telegram integration
TELEGRAM_BOT_TOKEN=""
TELEGRAM_WEBHOOK_SECRET=""
```

**Web .env** (optional, for overriding API URL):
```env
VITE_API_URL="http://localhost:3000"
VITE_TELEGRAM_BOT_USERNAME="your_bot_username"
```

### Database Setup (First Time)

1. Create a Supabase project and copy the PostgreSQL connection string.
2. Update `.env` with `DATABASE_URL`.
3. Seed the database (creates languages, menu types, admin account):
   ```bash
   cd apps/api
   npm run prisma:seed
   ```

## Architecture Decision: Features + Shared Pattern

The web app uses a clear separation:
- **`shared/`**: Reusable components, contexts, and API utilities—no dependencies on specific features
- **`features/`**: Feature-specific pages and logic—can freely import from `shared/`
- **No cross-feature imports**: Features do not import from each other

This makes it easy to add/remove features and understand data flow.

## Deployment

See **DEPLOY.md** for detailed steps.

**Quick summary:**
1. Deploy API first (Vercel or Render); note its public URL.
2. Set `DATABASE_URL` on backend and run migrations: `npx prisma migrate deploy`.
3. Deploy web app with `VITE_API_URL` = API URL (no trailing `/`).
4. Set `FRONTEND_URL` on API for CORS.

## Key Implementation Details

### Multi-Tenancy (Restaurant Scope)

- The `RestaurantScopeModule` middleware extracts the restaurant from JWT claims or domain header.
- All CRUD operations are scoped to the current restaurant (guards in place).
- Admin users can belong to multiple restaurants (via `UserRestaurant` junction table).

### Translation Flow

- Menu items, types, and categories have translation tables (`.translations` relations).
- Admin can manually edit translations or use "Translate" button (Gemini/Groq API).
- Public API returns only requested locale; cache keys include locale.

### Admin Authentication

- Login at `/admin/login` with email/password.
- JWT token stored in `AuthContext` (localStorage).
- Protected routes via `AdminPrivateRoute` wrapper.

### Public Menu API

Endpoints cached by (menuTypeId, locale):
- `GET /menu-types?locale=ru`
- `GET /menu?menuTypeId=<id>&locale=ru` (or `?type=main`)

Cache invalidated on admin changes (create/update/delete) or translation.

## Testing

- **API tests**: `npm run test` in `apps/api/` (Jest, mocked Prisma).
- **Web tests**: `npm run test` in `apps/web/` (Vitest + React Testing Library).
- Both support watch mode and coverage reports.

## Important Files and Paths

| File | Purpose |
|------|---------|
| `apps/api/prisma/schema.prisma` | Data model definition |
| `apps/api/prisma/seed.ts` | Database initialization (languages, menu types, admin) |
| `apps/api/src/main.ts` | API bootstrap (CORS, uploads dir, Swagger at `/api`) |
| `apps/web/src/App.tsx` | Router setup (public routes, `/admin/*` routes) |
| `apps/web/src/shared/api/` | HTTP client for API calls |
| `.env.example` | Environment variable template |
| `DEPLOY.md` | Deployment guide (Vercel, Render) |
