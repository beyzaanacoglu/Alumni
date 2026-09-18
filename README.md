# Alumni Tracking System

**Alumni Tracking System** is an **Alumni Tracking System** developed as part of the **Web Programming** course in the **Management Information Systems (MIS)** department.

The main purpose of the project is to **securely store and manage alumni contact information and career status in a centralized database**.

## Developer

**Beyza Anaçoğlu**

## Project

**GitHub Repository:**
https://github.com/beyzaanacoglu/Alumni.git

## Technologies

| Layer    | Technology                         |
| -------- | ---------------------------------- |
| Backend  | PHP, Laravel                       |
| Database | MySQL                              |
| Frontend | Laravel Blade Templates, HTML, CSS |

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
