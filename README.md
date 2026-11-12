<div align="center">

# 🎓 Alumni Tracking System (Node.js)

**The Alumni Tracking System helps a university stay connected with its graduates.**
It brings alumni records, community announcements and user accounts together in a single, well-organized application, so that contact details and career information remain accurate and easy to find.

<br/>

<img src="https://img.shields.io/badge/Runtime-Node.js_20-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Database-PostgreSQL_16-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/API-OpenAPI_3.0-6BA539?style=flat-square&logo=openapiinitiative&logoColor=white" />
<img src="https://img.shields.io/badge/Deploy-Docker-2496ED?style=flat-square&logo=docker&logoColor=white" />
<img src="https://img.shields.io/badge/Frontend-HTML%2FCSS%2FJS-E34F26?style=flat-square&logo=html5&logoColor=white" />

<br/><br/>

The project is a lightweight Node.js REST API with a simple web interface. It follows a clear layered structure (routes, controllers, models and repositories) and relies on the built-in `http` module instead of a web framework, which keeps the code easy to read, run and extend. It was developed for the *Web Programming* course in Management Information Systems (MIS).

</div>

<br/>

---

<br/>
---

## 🛡️ Middleware Architecture & Centralized Logging System

Projemiz; kod tekrarlarını önlemek, istek doğrulamasını controller katmanından ayırmak ve merkezi hata yönetimini sağlamak amacıyla **Clean Architecture Middleware** yapısına geçirilmiştir.

`mermaid
flowchart LR
    Client([HTTP Request]) --> Logger[1. Request Logger]
    Logger --> JSON[2. JSON Body Parser]
    JSON --> Val[3. Body Validator]
    Val --> Ctrl[4. Controller / Use-Case]
    Ctrl --> Res([HTTP Response])
    Ctrl -. "next(err)" .-> ErrH[6. Central Error Handler]
    Val -. "400 Bad Request" .-> Res
    Ctrl -. "No Route Matched" .-> NF[5. Generic 404 Handler]
    NF --> ErrH
    ErrH --> FileLog[("logs/error.logs")]
    ErrH --> ErrRes([Structured Error Response])
`

### 1. Express Pipeline Sıralaması
Ana uygulama (pp.js / server.js) üzerinde ara yazılımlar şu sıralamayla çalıştırılır:
1. **equestLogger**: Gelen her isteğin HTTP metodunu, yolunu (path), istemci IP'sini ve yanıt süresini (ms) hesaplayıp konsola renkli basar.
2. **express.json()**: İstek gövdesini JSON formatında ayrıştırır.
3. **alidate(rules)**: Controller öncesinde zorunlu parametreleri denetler. Eksik varsa controller'a girmeden anında 400 Bad Request döner.
4. **Routes / Controllers**: İş mantığını çalıştırır, beklenmeyen durumlarda 
ext(err) fırlatır.
5. **
otFoundHandler**: Eşleşmeyen tüm geçersiz istekleri yakalar ve NotFoundError fırlatır.
6. **errorHandler**: Uygulamanın en sonunda tüm hataları yakalar, HTTP statüsünü belirler, logs/error.logs dosyasına kaydeder ve istemciye JSON/HTML döner.

---

### 2. Bileşenler ve Modüler Klasör Yapısı

`	ext
Alumni/
├── logs/
│   └── error.logs                  # Otomatik yazılan merkezi hata ve sistem kayıtları
├── middlewares/
│   ├── requestLogger.js            # İstek metodu, path ve süre loglayıcı
│   ├── bodyValidator.js            # Jenerik req.body doğrulama ara yazılımı
│   ├── notFoundHandler.js          # Geçersiz rotaları yakalayan 404 yöneticisi
│   └── errorHandler.js             # Merkezi hata yakalayıcı (Central Error Handler)
├── utils/
│   ├── errors.js                   # Custom HTTP Error sınıfları (NotFoundError, DuplicateError vb.)
│   └── fileLogger.js               # logs/error.logs dosyasına zaman damgalı yazıcı
├── app.js                          # Express pipeline sıralama yapılandırması
└── server.js                       # Sunucu başlatıcı ve veritabanı bağlantısı
`

---

### 3. Kullanım Örnekleri

#### A. Body Validation Middleware Kullanımı:
`javascript
const validate = require('./middlewares/bodyValidator');

// Zorunlu alanlar eksikse controller'a girmeden anında 400 döner
router.post('/api/users', validate({
  name: { required: true, type: 'string', min: 2 },
  email: { required: true, type: 'string' },
  role: { required: true, enum: ['student', 'alumni', 'admin'] }
}), userController.createUser);
`

#### B. Özel Hata Fırlatma (Central Error Handler):
`javascript
const { NotFoundError, DuplicateError } = require('./utils/errors');

if (!user) {
  return next(new NotFoundError('Kullanıcı bulunamadı.'));
}
if (emailExists) {
  return next(new DuplicateError('Bu e-posta adresi zaten kullanımda.'));
}
`

#### C. logs/error.logs Dosyasına Kaydedilen Örnek Format:
`	ext
--------------------------------------------------------------------------------
TIMESTAMP  : [2026-11-12T03:49:10.123Z]
STATUS     : 404
METHOD/URL : GET /api/bilinmeyen-rota
CLIENT IP  : 127.0.0.1
MESSAGE    : İstenen 'GET /api/bilinmeyen-rota' uç noktası veya kaynağı bu sunucuda tanımlı değildir.
STACKTRACE : NotFoundError: İstenen 'GET /api/bilinmeyen-rota' uç noktası...
--------------------------------------------------------------------------------
`


## ✨ Features

| Resource | Storage | API | Web pages |
|----------|---------|-----|-----------|
| Users | `data/users.json` (PBKDF2-hashed passwords) | `/api/users` | `/users` |
| Announcements | PostgreSQL (in-memory fallback) | `/api/announcements` | `/announcements` |
| Alumni | PostgreSQL (in-memory fallback) | `/api/alumni` | — |
| Job Postings | PostgreSQL (in-memory fallback) | `/api/job-postings` | — |

All resources support full CRUD (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`). Interactive API docs are served at `/docs` (OpenAPI 3.0, [`docs/openapi.json`](docs/openapi.json)).

> [!NOTE]
> The application has no authentication or authorization layer; every client can call every endpoint.

<br/>

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 20 (built-in `http` module, no web framework) |
| Database | PostgreSQL 16 via `pg`; JSON file for users |
| Frontend | Static HTML/CSS/JavaScript, Swagger UI |
| Docs | OpenAPI 3.0, [`ddd.md`](ddd.md), [`docs/ddd.md`](docs/ddd.md) |
| Deployment | Docker, Docker Compose |

<br/>

## 📁 Project Structure

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

<br/>

## 🚀 Getting Started

### Option A — Docker (recommended)

```bash
cp .env.example .env        # optional; built-in dev defaults are used if values are empty
docker compose up --build
```

> **App:** http://localhost:3000/Alumni · **PostgreSQL:** `localhost:5432`

### Option B — Local

Requires Node.js 20+.

```bash
npm install
npm start                   # no DB_HOST set -> in-memory / JSON storage
```

To use PostgreSQL, copy `.env.example` to `.env`, fill in the `DB_*` values and start with `node --env-file=.env server.js`. The server listens on port 80 by default and falls back to 3000; set `PORT` to override.

<br/>

## 🗄️ Database Commands

Require `DB_HOST` to be configured.

| Command | Action |
|---------|--------|
| `npm run migrate` | Create the `alumni` table |
| `npm run seed` | Insert sample alumni (3 fixed + 12 generated, idempotent) |
| `npm run db:fresh` | Drop, recreate and seed |
| `npm run migrate:down` | Drop the `alumni` table |

The server also creates the `announcements` and `alumni` tables on startup if they do not exist.

<br/>

## 📡 API Overview

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
| GET / POST | `/api/job-postings` | List (filters: `status`, `employmentType`, `workMode`, `city`, `search`) / create |
| GET / PUT / PATCH / DELETE | `/api/job-postings/{id}` | Read / replace / update / delete job posting |
| GET / POST | `/api/job-postings/{id}/applications` | List internal applications / apply |
| PATCH / DELETE | `/api/job-postings/{id}/applications/{appId}` | Update status (`submitted`, `reviewing`, `accepted`, `rejected`) / remove |

Status codes: `200`, `201`, `204`, `400` (validation), `404`, `409` (duplicate email), `500`.

**Example:**

```bash
curl -X POST http://localhost:3000/api/alumni \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Ayse","lastName":"Yilmaz","email":"ayse@example.com","graduationYear":2018,"department":"MIS"}'
```

<br/>

## ⚙️ Configuration

See [`.env.example`](.env.example) for all variables: `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `POSTGRES_*`, `POSTGRES_HOST_PORT`, `APP_HOST_PORT`.

<br/>

## 📄 License

Educational project for the MIS Web Programming course.

<br/>

---

<br/>

## 👤 Author

<div align="center">

Developed with ❤️ as a **Course Project** for the **Web Programming** course.

**Fall 2026 · 3rd Year · Management Information Systems (MIS)**

</div>

<br/>

---

<br/>
---

## 🛡️ Middleware Architecture & Centralized Logging System

Projemiz; kod tekrarlarını önlemek, istek doğrulamasını controller katmanından ayırmak ve merkezi hata yönetimini sağlamak amacıyla **Clean Architecture Middleware** yapısına geçirilmiştir.

`mermaid
flowchart LR
    Client([HTTP Request]) --> Logger[1. Request Logger]
    Logger --> JSON[2. JSON Body Parser]
    JSON --> Val[3. Body Validator]
    Val --> Ctrl[4. Controller / Use-Case]
    Ctrl --> Res([HTTP Response])
    Ctrl -. "next(err)" .-> ErrH[6. Central Error Handler]
    Val -. "400 Bad Request" .-> Res
    Ctrl -. "No Route Matched" .-> NF[5. Generic 404 Handler]
    NF --> ErrH
    ErrH --> FileLog[("logs/error.logs")]
    ErrH --> ErrRes([Structured Error Response])
`

### 1. Express Pipeline Sıralaması
Ana uygulama (pp.js / server.js) üzerinde ara yazılımlar şu sıralamayla çalıştırılır:
1. **equestLogger**: Gelen her isteğin HTTP metodunu, yolunu (path), istemci IP'sini ve yanıt süresini (ms) hesaplayıp konsola renkli basar.
2. **express.json()**: İstek gövdesini JSON formatında ayrıştırır.
3. **alidate(rules)**: Controller öncesinde zorunlu parametreleri denetler. Eksik varsa controller'a girmeden anında 400 Bad Request döner.
4. **Routes / Controllers**: İş mantığını çalıştırır, beklenmeyen durumlarda 
ext(err) fırlatır.
5. **
otFoundHandler**: Eşleşmeyen tüm geçersiz istekleri yakalar ve NotFoundError fırlatır.
6. **errorHandler**: Uygulamanın en sonunda tüm hataları yakalar, HTTP statüsünü belirler, logs/error.logs dosyasına kaydeder ve istemciye JSON/HTML döner.

---

### 2. Bileşenler ve Modüler Klasör Yapısı

`	ext
Alumni/
├── logs/
│   └── error.logs                  # Otomatik yazılan merkezi hata ve sistem kayıtları
├── middlewares/
│   ├── requestLogger.js            # İstek metodu, path ve süre loglayıcı
│   ├── bodyValidator.js            # Jenerik req.body doğrulama ara yazılımı
│   ├── notFoundHandler.js          # Geçersiz rotaları yakalayan 404 yöneticisi
│   └── errorHandler.js             # Merkezi hata yakalayıcı (Central Error Handler)
├── utils/
│   ├── errors.js                   # Custom HTTP Error sınıfları (NotFoundError, DuplicateError vb.)
│   └── fileLogger.js               # logs/error.logs dosyasına zaman damgalı yazıcı
├── app.js                          # Express pipeline sıralama yapılandırması
└── server.js                       # Sunucu başlatıcı ve veritabanı bağlantısı
`

---

### 3. Kullanım Örnekleri

#### A. Body Validation Middleware Kullanımı:
`javascript
const validate = require('./middlewares/bodyValidator');

// Zorunlu alanlar eksikse controller'a girmeden anında 400 döner
router.post('/api/users', validate({
  name: { required: true, type: 'string', min: 2 },
  email: { required: true, type: 'string' },
  role: { required: true, enum: ['student', 'alumni', 'admin'] }
}), userController.createUser);
`

#### B. Özel Hata Fırlatma (Central Error Handler):
`javascript
const { NotFoundError, DuplicateError } = require('./utils/errors');

if (!user) {
  return next(new NotFoundError('Kullanıcı bulunamadı.'));
}
if (emailExists) {
  return next(new DuplicateError('Bu e-posta adresi zaten kullanımda.'));
}
`

#### C. logs/error.logs Dosyasına Kaydedilen Örnek Format:
`	ext
--------------------------------------------------------------------------------
TIMESTAMP  : [2026-11-12T03:49:10.123Z]
STATUS     : 404
METHOD/URL : GET /api/bilinmeyen-rota
CLIENT IP  : 127.0.0.1
MESSAGE    : İstenen 'GET /api/bilinmeyen-rota' uç noktası veya kaynağı bu sunucuda tanımlı değildir.
STACKTRACE : NotFoundError: İstenen 'GET /api/bilinmeyen-rota' uç noktası...
--------------------------------------------------------------------------------
`


<div align="center">

<img src="https://img.shields.io/badge/Made_with-Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Powered_by-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/Docs-Swagger_UI-85EA2D?style=flat-square&logo=swagger&logoColor=black" />
<img src="https://img.shields.io/badge/Deploy-Docker-2496ED?style=flat-square&logo=docker&logoColor=white" />

<br/><br/>

**✦ Alumni Tracking System** — *Keeping the bond between campus and career alive.*

<br/>

⭐ Star this repository if you find it useful!

**Repository:** https://github.com/beyzaanacoglu/Alumni.git
<br/>
A Laravel implementation of the same domain lives in [`AlumniLaravel`](../AlumniLaravel/).

</div>