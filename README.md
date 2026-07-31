# ExerciseLog API

[![NestJS](https://img.shields.io/badge/NestJS-^11.0-red?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-^7.9-blueviolet?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-^5.8-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=jsonwebtokens)](https://jwt.io/)

## 📖 Description

**ExerciseLog API** is a backend application built with the **NestJS** framework, designed for managing a workout journal. It allows users to create, read, update, and delete training sessions, exercises, and sets. The application features secure authentication using **JWT** (JSON Web Tokens) with a refresh token mechanism, and rule-based authorization with **CASL** to ensure users can only access their own data.

## ✨ Key Features

*   **Authentication**: Secure user registration and login using `passport.js`, with JWT access and refresh tokens stored in `httpOnly` cookies.
*   **Authorization**: A permission system based on the **CASL** library, guaranteeing that users can only manage their own resources (workouts, exercises, sets).
*   **Data Management (CRUD)**: Full support for operations on `Users`, `Workouts`, `Exercises`, and `Sets` entities.
*   **File Uploads**: Ability to upload exercise images to **S3-compatible object storage** (Cloudflare R2).
*   **Email Notifications**: Sending of a welcome email to newly registered users via `Nodemailer`, controlled by the `MAIL_ENABLED` flag.
*   **AI Workout Generation**: Generate personalized workout plans using AI through **OpenRouter API** integration.
*   **Database**: Integration with PostgreSQL through **Prisma ORM**, including a migration system for managing the database schema.
*   **API Documentation**: Automatically generated **Swagger (OpenAPI)** documentation, available after running the application in non-production environments.
*   **Validation & Error Handling**: Input data validation using `class-validator` and a global exception filter for consistent error handling.
*   **Pagination**: Paginated results for resource lists, such as user workouts.
*   **Security**: Built-in rate-limiting mechanism to protect against brute-force attacks.
*   **Configuration**: Flexible application configuration management for different environments (`.env`).
*   **Logging**: Structured JSON logs written to `stdout`/`stderr` in production, with human-readable console output in development.

## 🛠️ Tech Stack

*   **Framework**: [NestJS](https://nestjs.com/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Database**: [PostgreSQL](https://www.postgresql.org/)
*   **ORM**: [Prisma](https://www.prisma.io/)
*   **Authentication**: [Passport.js](https://www.passportjs.org/) (JWT & Local strategies)
*   **Authorization**: [CASL](https://casl.js.org/)
*   **API Documentation**: [Swagger](https://swagger.io/)
*   **File Uploads**: [AWS SDK for S3](https://aws.amazon.com/sdk-for-javascript/) (S3-compatible storage — [Cloudflare R2](https://developers.cloudflare.com/r2/))
*   **Emailing**: [Nodemailer](https://nodemailer.com/)
*   **AI Integration**: [OpenRouter API](https://openrouter.ai/)
*   **Validation**: `class-validator`, `class-transformer`
*   **Configuration Validation**: [Joi](https://joi.dev/)
*   **Health Checks**: [Terminus](https://docs.nestjs.com/recipes/terminus)
*   **Templating**: [Handlebars](https://handlebarsjs.com/) (AI prompts), [EJS](https://ejs.co/) (email templates)
*   **Testing**: [Jest](https://jestjs.io/)
*   **Linting/Formatting**: ESLint, Prettier
*   **Infrastructure**: [Docker](https://www.docker.com/), [GitHub Actions](https://github.com/features/actions), [Caddy](https://caddyserver.com/)

## 🚀 Getting Started

To run this project locally, follow the steps below.

### Prerequisites

*   [Node.js](https://nodejs.org/) (version 24.x — the project requires `>=24 <25`, see `.nvmrc`)
*   [npm](https://www.npmjs.com/)
*   [Docker](https://www.docker.com/) (recommended for running the PostgreSQL database)
*   An S3-compatible object storage account, e.g. [Cloudflare R2](https://developers.cloudflare.com/r2/) (optional, for the file upload feature)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd exerciselog-app-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    *   Copy the `.env.example` file and rename it to `.env`.
        ```bash
        cp .env.example .env
        ```
    *   Fill in the `.env` file with your configuration details (database, JWT keys, object storage, and mailer settings). A detailed description is provided below.

4.  **Run the database (Docker example):**
    ```bash
    docker run --name exerciselog-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=exerciselog -p 5432:5432 -d postgres:17
    ```
    _Ensure that the credentials in your `.env` file match those in the Docker command._

5.  **Run Prisma migrations to create the database schema:**
    ```bash
    npx prisma migrate dev
    ```

### Running the App

*   **Development mode (with hot-reloading):**
    ```bash
    npm run start:dev
    ```

*   **Production mode:**
    ```bash
    npm run build
    npm run start:prod
    ```

The application will be available at `http://localhost:3000`.

## 🐳 Running with Docker

The repository ships with a `docker-compose.yml` that starts the entire local stack — PostgreSQL, a one-off migration job, and the application itself:

```bash
docker compose up --build
```

The API is exposed at `http://localhost:3000` and the database at `localhost:5432` (user, password, and database name match the values in `.env.example`). The `app` service uses placeholder credentials for external services, so the file upload and AI features are not functional in this setup.

To run only the database in Docker and the application locally:

```bash
docker compose up -d db
npm run start:dev
```

## 🧪 Testing

*   **Run unit tests:**
    ```bash
    npm run test
    ```

*   **Run end-to-end (E2E) tests:**

    E2E tests require a **separate database** configured in a `.env.test` file (copy `.env.example` and point `DATABASE_URL` / `DIRECT_URL` to a different database than your development one).

    ```bash
    npm run test:e2e:setup  # apply migrations to the test database
    npm run test:e2e
    ```
    _Without a `.env.test` file the tests fall back to `.env` and will delete all data from your development database. Use `npm run test:e2e:reset` to drop and re-create the test database after schema changes._

*   **Check test coverage:**
    ```bash
    npm run test:cov
    ```

## 📄 API Documentation

API documentation is generated using Swagger and is available after running the application (in non-production environments) at:

**`http://localhost:3000/api`**

You will find detailed information about all available endpoints, required parameters, and DTO schemas there.

## ❤️ Health Checks

*   **`GET /health`** — full health check based on `@nestjs/terminus`, including a database connectivity probe.
*   **`GET /health/live`** — lightweight liveness probe that returns `{ "status": "ok" }` without touching the database. It is used by the container `HEALTHCHECK` defined in the `Dockerfile`.

## 📁 Project Structure

```
src/
├── ai/          # AI workout generation (OpenRouter provider, response parser, transformer)
├── auth/        # Authentication: Passport strategies, guards, cookie-based JWT
├── casl/        # Authorization: ability factory and OwnershipGuard
├── common/      # Cross-cutting concerns: filters, interceptors, middleware, hashing, pagination
├── config/      # Typed configuration service and env validation schema
├── database/    # DatabaseService (PrismaClient singleton)
├── exercises/   # Exercises module
├── health/      # Health check endpoints
├── logger/      # Custom LoggerService
├── mail/        # Mailer configuration and email templates
├── sets/        # Sets module
├── uploads/     # File uploads to S3-compatible storage
├── users/       # Users module
└── workouts/    # Workouts module

prisma/          # Prisma schema and migrations
test/            # E2E tests and shared test helpers
deploy/          # Deployment assets (Caddy, compose files, backup scripts)
.github/         # CI and deployment workflows
```

## 🧰 Available Scripts

| Script | Description |
| --- | --- |
| `npm run start:dev` | Runs the application in watch mode (`NODE_ENV=development`). |
| `npm run build` | Compiles the application and copies the mailer templates into `dist/`. |
| `npm run start:prod` | Runs the compiled application from `dist/main`. |
| `npm run lint` | Runs ESLint with `--fix`. |
| `npm run lint:ci` | Runs ESLint without fixes and fails on any warning. |
| `npm run format` | Formats `src/` and `test/` with Prettier. |
| `npm run test` | Runs unit tests. |
| `npm run test:watch` / `npm run test:verbose` | Unit tests in watch / verbose mode. |
| `npm run test:cov` | Unit tests with a coverage report. Coverage thresholds are enforced (60% branches and functions, 70% lines and statements). |
| `npm run test:e2e:setup` | Applies migrations to the test database. |
| `npm run test:e2e:reset` | Drops and re-creates the test database. |
| `npm run test:e2e` | Runs the E2E test suite. |

## ⚙️ Environment Variables

Below is a description of the environment variables from the `.env.example` file:

```ini
# Basic application configuration
NODE_ENV=development # Environment (development, production)
PORT=3000            # Port the server runs on
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/exerciselog # Pooled connection URL to the PostgreSQL database
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/exerciselog # Direct connection URL (used by Prisma for migrations)
APP_VERSION=1.0.0    # API version
CORS_ORIGIN=http://localhost:3000 # Allowed CORS origin (enforced only in production)

# JWT Configuration
JWT_ACCESS_TOKEN_SECRET=supersecretkey           # Secret for the access token
JWT_ACCESS_TOKEN_EXPIRATION_MS=900000            # Access token expiration time (in ms, default: 15 min)
JWT_REFRESH_TOKEN_SECRET=supersecretrefreshkey   # Secret for the refresh token
JWT_REFRESH_TOKEN_EXPIRATION_MS=604800000        # Refresh token expiration time (in ms, default: 7 days)

# Mail Configuration
MAIL_ENABLED=false                 # Enables sending welcome emails (disabled by default)
MAIL_HOST=smtp.example.com         # SMTP server host
SMTP_USERNAME=user@example.com     # SMTP username
SMTP_PASSWORD=password             # SMTP password
MAIL_FROM=no-reply@exerciselog.com # Sender's email address

# Object storage configuration (S3-compatible — Cloudflare R2)
S3_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com # S3-compatible endpoint (e.g. Cloudflare R2)
S3_REGION=auto                            # Storage region ("auto" for R2)
S3_ACCESS_KEY_ID=your_r2_access_key_id    # Access key ID
S3_SECRET_ACCESS_KEY=your_r2_secret_access_key # Secret access key
S3_BUCKET_NAME=exerciselog                # Bucket name
S3_PUBLIC_URL=https://img.your-domain.com # Public URL of the bucket (custom domain)

# OpenRouter Configuration
OPEN_ROUTER_API_KEY=your_api_key      # OpenRouter API key for AI workout generation
OPEN_ROUTER_API_URL=https://openrouter.ai/api/v1 # OpenRouter API base URL
```

## 🚢 CI/CD & Deployment

*   **CI** (`.github/workflows/ci.yml`) — runs on every pull request and on pushes to `main`: secret scanning with **Gitleaks**, a dependency audit with **audit-ci**, linting, build, unit tests with coverage, and E2E tests against a PostgreSQL service container.
*   **Image build** — on `main`, the Docker image is built, scanned with **Trivy** (failing on HIGH/CRITICAL OS vulnerabilities), and pushed to **GHCR** as `ghcr.io/lizaq94/exerciselog-app-api`.
*   **Staging** — every successful build on `main` is deployed automatically to the staging environment over SSH.
*   **Production** (`.github/workflows/deploy-prod.yml`) — triggered by pushing a `v*` tag. The image is published under its semver tag and released using a **blue-green** strategy: migrations run first, and the new container must report `healthy` before the previous one is stopped.
*   **Deployment assets** (`deploy/`) — Caddy reverse proxy configuration, `docker-compose` files for staging and production, and database/uploads backup scripts together with their crontab.

## 📜 License

This is a private project — all rights reserved. No license is granted for use, modification, or distribution.