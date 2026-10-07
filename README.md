# Alumni Tracking System

**Alumni Tracking System** is an **Alumni Tracking System** developed as part of the **Web Programming** course in the **Management Information Systems (MIS)** department.

The main purpose of the project is to **securely store and manage alumni contact information and career status in a centralized database**.

## Developer

**Beyza Anaçoğlu**

## Project

**GitHub Repository:**
https://github.com/beyzaanacoglu/Alumni.git

## Technologies

| Layer         | Technology                               |
| ------------- | ---------------------------------------- |
| Backend       | Node.js (HTTP / REST API), PHP           |
| Data / Store  | JSON Persistence (`data/users.json`), MySQL |
| Architecture  | MVC (Model-View-Controller) + Repository |
| Frontend/View | HTML5, CSS3, JavaScript, Swagger UI      |
| Documentation | OpenAPI 3.0 (Swagger)                    |

## MVC Architecture

The application follows the **Model-View-Controller (MVC)** architectural pattern combined with the **Repository Pattern** to ensure separation of concerns, maintainability, and clean code organization.

```text
Alumni/
├── controllers/              # Controller Layer: Request handling & responses
│   ├── apiUserController.js  # Controller: API JSON endpoints
│   └── userController.js     # Controller: View & HTML rendering
├── data/
│   └── users.json            # Data Layer: Persistent JSON data store
├── docs/
│   └── openapi.json          # Documentation: OpenAPI 3.0 specification
├── models/                   # Model Layer: Domain entity & business logic
│   └── userModel.js          # Model: User entity & CRUD coordination
├── public/                   # View Layer: Client-facing templates & UI
│   ├── about.html            # View: Temporary About page
│   ├── index.html            # View: Single Page Application & Test Console
│   └── swagger.html          # View: Interactive Swagger UI
├── repositories/             # Repository / Data Access Layer
│   └── userRepository.js     # User data operations & password hashing
├── routes/                   # Route Layer: Endpoint matching & dispatching
│   ├── apiUserRoutes.js      # Routes: /api/users mapping
│   └── userRoutes.js         # Routes: /users view mapping
├── index.php                 # PHP entry point
├── server.js                 # Server entry point & primary router
└── README.md                 # Project documentation
```

### Layer Responsibilities & File Mapping

1. **Model Layer (`models/`) & Repository Layer (`repositories/`, `data/`)**:
   - **`models/userModel.js`**: User Domain Model coordinating CRUD operations without containing HTTP-specific logic.
   - **`repositories/userRepository.js`**: Data Access Layer handling file persistence, query logic, and PBKDF2 password hashing.
   - **`data/users.json`**: Physical persistence storage for user records.

2. **Controller Layer (`controllers/`)**:
   - **`controllers/userController.js`**: Handles view requests, calls `UserModel`, and returns/renders HTML.
   - **`controllers/apiUserController.js`**: Handles API requests, validates inputs, calls `UserModel`, and returns JSON responses.

3. **Routing Layer (`routes/`, `server.js`)**:
   - **`routes/userRoutes.js`**: Matches `/users` view routes and dispatches to `UserController`.
   - **`routes/apiUserRoutes.js`**: Matches `/api/users` REST endpoints and dispatches to `ApiUserController`.
   - **`server.js`**: Core HTTP server delegating to route modules.

4. **View Layer (`public/`)**:
   - **`public/index.html`**: Single-Page Application (SPA) view with interactive live API console.
   - **`public/about.html`**: Informational view presenting project metadata.
   - **`public/swagger.html`**: Interactive documentation view utilizing Swagger UI.

5. **Configuration & Documentation Layer (`docs/`)**:
   - **`docs/openapi.json`**: Standard OpenAPI 3.0 schema describing all available endpoints.

---

### Request Lifecycle & Flow

The application processes requests through two primary flow lifecycles:

#### 1. API Data Flow (Client ↔ Model/Repository)
```text
Client (Postman / Browser / Fetch)
   │
   ▼
[ server.js ] ── Router (Matches HTTP Method & URL path)
   │
   ▼
[ server.js ] ── Controller (Validates inputs & orchestrates logic)
   │
   ▼
[ userRepository.js ] ── Repository / Model (Applies hashing & query logic)
   │
   ▼
[ data/users.json ] ── Data Persistence Layer
   │
   ▼
Response sent back to Client (JSON + HTTP Status Code: 200, 201, 204, 400, 404, 409)
```

#### 2. View Rendering Flow (Client ↔ View)
```text
Client (Browser)
   │
   ▼
[ server.js ] ── Router (Identifies request for UI routes: `/`, `/about`, `/docs`)
   │
   ▼
[ server.js ] ── Controller (Loads requested HTML file from `public/`)
   │
   ▼
[ public/*.html ] ── View Layer (Returns HTML/CSS/JS representation)
   │
   ▼
Client renders web page in browser
```

---

### User Resource Operations in MVC Architecture

All User CRUD operations strictly adhere to the MVC separation:

| Operation | HTTP & Route | Controller Responsibility (`server.js`) | Model/Repository Responsibility (`userRepository.js`) |
| :--- | :--- | :--- | :--- |
| **List Users** | `GET /api/users` | Receives request, calls repository, returns sanitized user array. | `findAll()`: Reads `users.json`, strips sensitive fields (password hashes). |
| **Create User** | `POST /api/users` | Validates required fields & email format; returns `201 Created` or `400`/`409`. | `findByEmail()`, `create()`: Hashes password with PBKDF2 salt and appends to `users.json`. |
| **Full Update** | `PUT /api/users/{id}` | Validates user existence, verifies full payload & email conflicts; returns `200 OK`. | `findById()`, `update()`: Updates `name`, `email`, re-hashes `password`, updates `updatedAt`. |
| **Partial Update** | `PATCH /api/users/{id}` | Validates user existence and supplied subset of fields; returns `200 OK`. | `findById()`, `update()`: Modifies only provided fields, recalculates hashes if password changed. |
| **Delete User** | `DELETE /api/users/{id}` | Checks user existence; returns `204 No Content` on success or `404 Not Found`. | `findById()`, `delete()`: Removes the user record from `users.json`. |

---

## Installation

Follow the steps below in order to run the project in a local development environment.

### 1. Clone the Repository

Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/beyzaanacoglu/Alumni.git
cd Alumni
```

### 2. Install Dependencies

Install the PHP dependencies using Composer:

```bash
composer install
```

Install the frontend dependencies:

```bash
npm install
```

Build the frontend assets:

```bash
npm run build
```

### 3. Create the `.env` File

Create the `.env` file from the provided `.env.example` file:

```bash
cp .env.example .env
```

### 4. Configure the MySQL Database Connection

Create a MySQL database named `alumni`.

Then, configure the database settings in the `.env` file as follows:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=alumni
DB_USERNAME=root
DB_PASSWORD=
```

Enter your local MySQL `root` user's password in the `DB_PASSWORD` field. If no password is configured for the `root` user, leave the field empty.

### 5. Generate the Application Key

Generate the Laravel application key:

```bash
php artisan key:generate
```

### 6. Run Database Migrations

Run the Laravel migrations to create the required database tables:

```bash
php artisan migrate
```

### 7. Start the Development Server

Start the Laravel development server:

```bash
php artisan serve
```

The application will be available at:

```text
http://localhost:8000
```

## Database Structure

The project uses **MySQL** to store and manage information about system users and alumni.

### `users`

Stores information about **authorized users who can log into the system**, including their roles.

### `alumni`

Stores **alumni personal details, contact information, and professional status**.

## Project Purpose

The Alumni Tracking System is designed to manage alumni information through a centralized system. It enables the organized storage and management of alumni contact and career information by authorized users.

## License

This project was developed for **educational purposes** as part of the **Management Information Systems (MIS) Web Programming course**.
