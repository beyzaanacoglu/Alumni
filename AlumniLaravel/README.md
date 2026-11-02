<div align="center">

# 🎓 Alumni Tracking System (Laravel)

**A Laravel web application for an alumni network:** announcements published by alumni, a social feed, work experience with map coordinates, profiles and direct messages.

<br/>

<img src="https://img.shields.io/badge/Framework-Laravel_13-FF2D20?style=flat-square&logo=laravel&logoColor=white" />
<img src="https://img.shields.io/badge/Language-PHP_8.3-777BB4?style=flat-square&logo=php&logoColor=white" />
<img src="https://img.shields.io/badge/Database-MySQL_8-4479A1?style=flat-square&logo=mysql&logoColor=white" />
<img src="https://img.shields.io/badge/Frontend-Blade_%2B_Vite-FF2D20?style=flat-square&logo=laravel&logoColor=white" />
<img src="https://img.shields.io/badge/Deploy-Docker-2496ED?style=flat-square&logo=docker&logoColor=white" />

<br/><br/>

Built for the *Web Programming* course, Management Information Systems (MIS).

</div>

<br/>

---

<br/>

## ✨ Features

| Module | Web routes | Notes |
|--------|-----------|-------|
| Announcements | `/announcements` (resource) | Only users with role `alumni` may be the author |
| Feed posts | `/feed-posts` (resource) | Text body and optional image URL |
| Work experiences | `/work-experiences` (resource) | Company, position, validated latitude/longitude |
| Job postings | `/job-postings` (resource) | External link or internal applications (`/apply`) |

`/` redirects to the announcements list. All modules provide full CRUD with Blade views and server-side validation. Profiles and messages exist as models, migrations, factories and seed data but have no web routes yet. There is no authentication layer.

<br/>

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Laravel 13 (PHP 8.3+) |
| Database | MySQL 8 |
| Frontend | Blade templates, Vite |
| Testing | PHPUnit (`tests/Feature/CrudTest.php`) |
| Deployment | Docker, Docker Compose |

<br/>

## 📊 Data Model

| Table | Purpose |
|-------|---------|
| `users` | Accounts with `role` (`student`, `alumni`, `admin`) |
| `profiles` | One per user: graduation year, department, bio |
| `announcements` | Authored by alumni: title, content, optional company |
| `feed_posts` | User posts: body, optional image path |
| `work_experiences` | Company, position, latitude/longitude |
| `messages` | Sender, receiver, content, `read_at` |
| `job_postings` | Authored by alumni: title, description, company, type, mode, external link, deadline |
| `job_applications` | Candidate applications when external link is null |

Details: [`../Alumni/docs/ddd.md`](../Alumni/docs/ddd.md).

<br/>

## 🚀 Getting Started

### Option A — Docker

```bash
cp .env.example .env
# fill in DB_USERNAME, DB_PASSWORD and the MYSQL_* values (they must match)
docker compose up --build -d
docker compose exec app composer install
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
```

> [!IMPORTANT]
> `docker-compose.yml` currently defines its own DB credentials in the `environment` blocks; keep them consistent with your `.env`.

> **App:** http://localhost:8000 · **MySQL:** `localhost:3306`

### Option B — Local

Requires PHP 8.3+, Composer, Node.js and a running MySQL server.

```bash
composer install
npm install && npm run build
cp .env.example .env
php artisan key:generate
# create database `alumni` and set DB_USERNAME / DB_PASSWORD in .env
php artisan migrate --seed
php artisan serve
```

<br/>

## 🌱 Seed Data

`php artisan db:seed` creates 50 users (1 admin `admin@alumni.test`, at least 10 alumni), a profile and 1–3 work experiences per user, 1–3 announcements per alumni, 0–4 feed posts per user and 120 messages. Faker locale is `tr_TR`.

<br/>

## 🧪 Testing

```bash
php artisan test --filter=CrudTest
```

The tests run against the configured MySQL database and roll back every change.

<br/>

## ⚙️ Configuration

See [`.env.example`](.env.example). Key variables: `APP_KEY` (generate with `php artisan key:generate`), `DB_*`, `MYSQL_*`, `SESSION_DRIVER=file`, `CACHE_STORE=file`, `QUEUE_CONNECTION=sync`.

<br/>

## 📄 License

Educational project for the MIS Web Programming course. Built on the Laravel framework (MIT).

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

<div align="center">

<img src="https://img.shields.io/badge/Made_with-Laravel_13-FF2D20?style=flat-square&logo=laravel&logoColor=white" />
<img src="https://img.shields.io/badge/Powered_by-MySQL_8-4479A1?style=flat-square&logo=mysql&logoColor=white" />
<img src="https://img.shields.io/badge/Built_with-Blade_%2B_Vite-FF2D20?style=flat-square&logo=laravel&logoColor=white" />
<img src="https://img.shields.io/badge/Written_in-PHP-777BB4?style=flat-square&logo=php&logoColor=white" />

<br/><br/>

**✦ Alumni Tracking System** — *Keeping the bond between campus and career alive.*

<br/>

⭐ Star this repository if you find it useful!

A Node.js implementation of the same domain lives in [`Alumni`](../Alumni/).

</div>