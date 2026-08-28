# preOrderAPI

A small Express + Prisma API for managing restaurant pre-orders: restaurants, staff logins, menus, bookings, and the food orders tied to each booking.

## What you need installed

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — this is the easy path, it runs everything for you.
- Or, if you'd rather run it without Docker: [Node.js 22+](https://nodejs.org/) and a local PostgreSQL database.

## Option A: Run it with Docker (recommended)

This spins up the API and a Postgres database together, with no local setup beyond Docker.

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

   You don't need to fill anything in for Docker — `docker-compose.yml` already provides sensible defaults for the database, port, and JWT secret. The `.env` file is only there so the file exists (and so `prisma` commands work if you also want to run them from your own machine).

2. Build and start everything:

   ```bash
   docker compose up --build
   ```

   This starts a Postgres container, then the API container, which automatically installs dependencies, generates the Prisma client, and applies any database migrations before starting the server. The first run takes a bit longer while the image builds.

3. Once you see `Server running in development mode on port 3000` in the logs, the API is live at [http://localhost:3000](http://localhost:3000).

4. Load some sample data (a restaurant, a manager login, a menu, and a sample booking with a pre-order) by running, in a new terminal:

   ```bash
   docker compose exec express-api npm run db:seed
   ```

   This prints a login you can use right away:

   ```
   manager login : manager@trattoria.test / Manager123!
   ```

5. Try it out:

   ```bash
   curl http://localhost:3000/health

   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"manager@trattoria.test","password":"Manager123!"}'
   ```

   The login response includes a JWT token — send it as `Authorization: Bearer <token>` on requests that need auth (e.g. `GET /api/auth/me`).

6. When you're done, stop everything with:

   ```bash
   docker compose down
   ```

   Your data stays around in a Docker volume for next time. If you want a totally clean database, add `-v` to that command.

## Option B: Run it locally (no Docker for the API)

Useful if you want to run the app directly on your machine, e.g. for debugging.

1. Install dependencies:

   ```bash
   npm install
   ```

   This also generates the Prisma client automatically (via the `postinstall` script).

2. Get a Postgres database running. The easiest way is to just start the database container from this project and skip the API container:

   ```bash
   docker compose up postgres -d
   ```

   This exposes Postgres on `localhost:5431`.

3. Fill in `.env` (copy it from `.env.example` first if you haven't):

   ```
   PORT=3000
   NODE_ENV=development
   DATABASE_URL=postgresql://pos_admin:mysecretpassword@localhost:5431/pos_db?schema=public
   JWT_SECRET=any-random-string-for-local-dev
   JWT_EXPIRES_IN=8h
   ```

4. Apply the database migrations:

   ```bash
   npm run db:deploy
   ```

5. Seed some sample data:

   ```bash
   npm run db:seed
   ```

6. Start the API:

   ```bash
   npm run dev
   ```

   This restarts automatically when you edit a file. Use `npm start` instead for a plain, one-off run.

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the API locally with auto-restart on file changes |
| `npm start` | Start the API locally (no auto-restart) |
| `npm run db:migrate` | Create/apply a migration during development |
| `npm run db:deploy` | Apply existing migrations (used in Docker/production) |
| `npm run db:seed` | Wipe and reload the database with sample data |
| `npm run db:studio` | Open Prisma Studio, a visual browser for your database |

## API overview

- `GET /health` — quick check that the server is up.
- `POST /api/auth/login` — log in with `email` and `password`, get back a JWT.
- `GET /api/auth/me` — returns the logged-in user (needs the `Authorization: Bearer <token>` header).
- `GET/POST /api/orders`, `GET/PUT/DELETE /api/orders/:id` — manage orders.

## Notes

- The Prisma schema lives in [`prisma/schema.prisma`](prisma/schema.prisma) and covers restaurants, users, menu categories/items, bookings, pre-orders, order items, and payments.
- Never commit your real `.env` file — it's already excluded via `.gitignore`. Only `.env.example` (with blank values) is tracked.
