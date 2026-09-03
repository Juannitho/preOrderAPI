# preOrder System

API for managing restaurant pre-orders (restaurants, staff logins, menus, bookings, and food orders).

## Quick Start - Docker Compose (recommended)

This spins up the API, database, and RabbitMQ together with no local setup beyond Docker.

### 1. Start Docker Desktop

Make sure Docker is running.

### 2. Copy the environment file

```bash
cp .env.example .env
```

The `docker-compose.yml` provides sensible defaults for the database, ports, and JWT secret. The `.env` file is only needed so the file exists (and so `prisma` commands work if you run them from your own machine).

### 3. Build and start everything

```bash
docker compose up --build
```

This starts:
- **PostgreSQL** database on port `5431` (host) → `5432` (container)
- **RabbitMQ** message broker on ports `5672` and `15672`
- **Express API** on port `3000`
- **Prisma Studio** on port `5555`

The API container will automatically install dependencies, generate the Prisma client, and apply database migrations before starting the server. The first run takes a bit longer while the image builds.

### 4. Wait for the server to be ready

Look for this message in the logs:

```
Server running in development mode on port 3000
```

Once you see it, the API is live at <http://localhost:3000>.

### 5. Load sample data (optional but recommended)

In a **new terminal** window, run:

```bash
docker compose exec express-api npm run db:seed
```

This prints a login you can use right away:

```
manager login : manager@trattoria.test / Manager123!
```

### 6. Test the API

**Health check:**

```bash
curl http://localhost:3000/health
```

**Login to get a JWT token:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@trattoria.test","password":"Manager123!"}'
```

The login response includes a JWT token — send it as `Authorization: Bearer <token>` on requests that need auth (e.g. `GET /api/auth/me`).

### 7. Stop everything when you're done

```bash
docker compose down
```

Your data stays in Docker volumes for next time. To totally clean the database, add `-v`:

```bash
docker compose down -v
```

---

## Useful Services

| Service | Port (host) | Description |
| --- | --- | --- |
| API | `3000` | Express API |
| Prisma Studio | `5555` | Visual database browser |
| PostgreSQL | `5431` | Database (host port) |
| RabbitMQ | `5672` / `15672` | Message broker (management UI at `http://localhost:15672`) |

Default RabbitMQ credentials: `user: preordersystem`, `password: posrabbitmq`

---

## Commands Reference

| Command | What it does |
| --- | --- |
| `docker compose up --build` | Build and start all services |
| `docker compose down` | Stop and remove services (keeps volumes) |
| `docker compose down -v` | Stop and remove services + delete volumes |
| `docker compose exec express-api npm run db:seed` | Load sample data |
| `docker compose exec express-api npm run db:studio` | Open Prisma Studio |

## Notes

- The Prisma schema lives in `prisma/schema.prisma`
- Never commit your real `.env` file — it's already excluded via `.gitignore`. Only `.env.example` (with blank values) is tracked.
- The `.env` file at the project root contains additional config (Stripe, DeepL, CORS) for full functionality.