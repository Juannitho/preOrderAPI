# preOrder System

API for managing restaurant pre-orders (restaurants, staff logins, menus, bookings, and food orders).

## Quick Start - Docker Compose (recommended)

This spins up the API, database, and RabbitMQ together with no local setup beyond Docker.

### 1. Start Docker Desktop

Make sure Docker is running.

### 2. Build and start everything

```bash
docker compose up --build
```

This starts:

- **PostgreSQL** database on port `5431` (host) → `5432` (container)
- **RabbitMQ** message broker on ports `5672` and `15672`
- **Express API** on port `3000`
- Prisma Studio is available as a separate command on port `5560` (see below).

The API container will automatically install dependencies, generate the Prisma client, and apply database migrations before starting the server. The first run takes a bit longer while the image builds.

### 3. Wait for the server to be ready

Look for this message in the logs:

```
Server running in development mode on port 3000
```

Once you see it, the API is live at <http://localhost:3000>.

### 4. Load sample data (optional but recommended)

In a **new terminal** window, run:

```bash
docker compose exec express-api npm run db:seed
```

This prints a login you can use right away:

```
manager login : manager@trattoria.test / Manager123!
```

### 5. Test the API

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

### 6. Stop everything when you're done

```bash
docker compose down
```

Your data stays in Docker volumes for next time. To totally clean the database, add `-v`:

```bash
docker compose down -v
```

---

## API Documentation

Interactive Swagger documentation is available at <http://localhost:3000/api-docs> once the API is running. The OpenAPI document is also available at <http://localhost:3000/api-docs.json>.

Main route groups:

| Route             | Purpose                                                  | Authentication           |
| ----------------- | -------------------------------------------------------- | ------------------------ |
| `/api/auth`       | Login, manager-only staff registration, and current user | JWT for protected routes |
| `/api/categories` | Menu category management                                 | JWT                      |
| `/api/menu/items` | Menu item management                                     | JWT                      |
| `/api/bookings`   | Booking management and booking pre-orders                | JWT                      |
| `/api/preorders`  | Staff pre-order listing and status updates               | JWT                      |
| `/p/:code`        | Guest menu, cart, translation, and checkout flow         | Access code              |
| `/webhooks`       | Stripe webhook receiver                                  | Stripe signature         |

Public system endpoints are `GET /` and `GET /health`.

---

## Useful Services

| Service       | Port (host)      | Description                                                |
| ------------- | ---------------- | ---------------------------------------------------------- |
| API           | `3000`           | Express API                                                |
| Prisma Studio | `5555`           | Visual database browser                                    |
| PostgreSQL    | `5431`           | Database (host port)                                       |
| RabbitMQ      | `5672` / `15672` | Message broker (management UI at `http://localhost:15672`) |

Default RabbitMQ credentials: `user: preordersystem`, `password: posrabbitmq`

---

## Commands Reference

| Command                                           | What it does                                  |
| ------------------------------------------------- | --------------------------------------------- |
| `docker compose up --build`                       | Build and start all services                  |
| `docker compose down`                             | Stop and remove services (keeps volumes)      |
| `docker compose down -v`                          | Stop and remove services + delete volumes     |
| `docker compose exec express-api npm run db:seed` | Load sample data                              |
| `npm test`                                        | Run integration and unit tests                |
| `npm run test:integration`                        | Run integration tests                         |
| `npm run test:unit`                               | Run unit tests                                |
| `npm run db:studio`                               | Open Prisma Studio on `http://localhost:5560` |

## Notes

- The Prisma schema lives in `prisma/schema.prisma`
- Never commit your real `.env` file — it's already excluded via `.gitignore`. Only `.env.example` (with blank values) is tracked.
- Stripe payment processing requires `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
- Menu translation requires `DEEPL_API_KEY`; translation is disabled when it is empty.
- The Docker worker consumes payment jobs from RabbitMQ and requires the same database and broker configuration as the API.
