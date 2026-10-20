# Alumni Tracking System (Node.js)

The Alumni Tracking System helps a university stay connected with its graduates. It brings alumni records, community announcements and user accounts together in a single, well-organized application, so that contact details and career information remain accurate and easy to find.

The project is a lightweight Node.js REST API with a simple web interface. It follows a clear layered structure (routes, controllers, models and repositories) and relies on the built-in `http` module instead of a web framework, which keeps the code easy to read, run and extend. It was developed for the *Web Programming* course in Management Information Systems (MIS).

- **Developer:** Beyza Anaçoğlu
- **Repository:** https://github.com/beyzaanacoglu/Alumni.git
- A Laravel implementation of the same domain lives in [`../AlumniLaravel`](../AlumniLaravel/).

## Features

| Resource | Storage | API | Web pages |
|----------|---------|-----|-----------|
| Users | `data/users.json` (PBKDF2-hashed passwords) | `/api/users` | `/users` |
| Announcements | PostgreSQL (in-memory fallback) | `/api/announcements` | `/announcements` |
| Alumni | PostgreSQL (in-memory fallback) | `/api/alumni` | – |

All resources support full CRUD (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`). Interactive API docs are served at `/docs` (OpenAPI 3.0, [`docs/openapi.json`](docs/openapi.json)).

> The application has no authentication or authorization layer; every client can call every endpoint.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 (built-in `http` module, no web framework) |
| Database | PostgreSQL 16 via `pg`; JSON file for users |
| Frontend | Static HTML/CSS/JavaScript, Swagger UI |
| Docs | OpenAPI 3.0, [`ddd.md`](ddd.md), [`docs/ddd.md`](docs/ddd.md) |
| Deployment | Docker, Docker Compose |

## Project Structure

```text
Alumni/
├── server.js               # Entry point and top-level router
├── config/db.js            # PostgreSQL pool and startup schema init
├── routes/                 # URL -> controller dispatch
├── controllers/            # Validation, HTTP status mapping (API + HTML views)
├── models/                 # Entities and business rules
├── repositories/           # Persistence (userRepository, alumniRepository)
├── data/
│   ├── users.json          # User store
│   ├── migrations/         # Schema migrations
│   ├── factories/          # Fake data generators
│   ├── seeders/            # Sample data
│   └── migrate.js          # Migration / seed CLI
├── public/                 # HTML views and Swagger UI
├── docs/                   # OpenAPI spec and data design document
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

Request flow: `routes → controllers → models → repositories → storage`. See [ddd.md](ddd.md) for the Domain-Driven Design mapping.

## Getting Started

### Option A — Docker (recommended)

```bash
cp .env.example .env        # optional; built-in dev defaults are used if values are empty
docker compose up --build
```

App: http://localhost:3000/Alumni · PostgreSQL: `localhost:5432`

### Option B — Local

Requires Node.js 20+.

```bash
npm install
npm start                   # no DB_HOST set -> in-memory / JSON storage
```

To use PostgreSQL, copy `.env.example` to `.env`, fill in the `DB_*` values and start with `node --env-file=.env server.js`. The server listens on port 80 by default and falls back to 3000; set `PORT` to override.

## Database Commands

Require `DB_HOST` to be configured.

| Command | Action |
|---------|--------|
| `npm run migrate` | Create the `alumni` table |
| `npm run seed` | Insert sample alumni (3 fixed + 12 generated, idempotent) |
| `npm run db:fresh` | Drop, recreate and seed |
| `npm run migrate:down` | Drop the `alumni` table |

The server also creates the `announcements` and `alumni` tables on startup if they do not exist.

## API Overview

Base path: `/api` (an optional `/Alumni` prefix is accepted).

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET / POST | `/api/users` | List / create users |
| GET / PUT / PATCH / DELETE | `/api/users/{id}` | Read / replace / update / delete a user |
| GET / POST | `/api/announcements` | List / create announcements |
| GET / PUT / PATCH / DELETE | `/api/announcements/{id}` | Manage an announcement |
| GET / POST | `/api/alumni` | List (filters: `department`, `graduationYear`, `city`, `search`) / create |
| GET / PUT / PATCH / DELETE | `/api/alumni/{id}` | Manage an alumni record |

Status codes: `200`, `201`, `204`, `400` (validation), `404`, `409` (duplicate email), `500`.

Example:

```bash
curl -X POST http://localhost:3000/api/alumni \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Ayse","lastName":"Yilmaz","email":"ayse@example.com","graduationYear":2018,"department":"MIS"}'
```

## Configuration

See [`.env.example`](.env.example) for all variables: `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `POSTGRES_*`, `POSTGRES_HOST_PORT`, `APP_HOST_PORT`.

## License

Educational project for the MIS Web Programming course.
