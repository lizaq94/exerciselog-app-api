# ExerciseLog API

[![NestJS](https://img.shields.io/badge/NestJS-^11.0-red?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-^6.4-blueviolet?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
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
*   **Email Notifications**: Automatic sending of a welcome email to newly registered users via `Nodemailer`.
*   **AI Workout Generation**: Generate personalized workout plans using AI through **OpenRouter API** integration.
*   **Database**: Integration with PostgreSQL through **Prisma ORM**, including a migration system for managing the database schema.
*   **API Documentation**: Automatically generated **Swagger (OpenAPI)** documentation, available after running the application.
*   **Validation & Error Handling**: Input data validation using `class-validator` and a global exception filter for consistent error handling.
*   **Pagination**: Paginated results for resource lists, such as user workouts.
*   **Security**: Built-in rate-limiting mechanism to protect against brute-force attacks.
*   **Configuration**: Flexible application configuration management for different environments (`.env`).
*   **Logging**: Advanced system for logging application events to files.

## 🛠️ Tech Stack

*   **Framework**: [NestJS](https://nestjs.com/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Database**: [PostgreSQL](https://www.postgresql.org/)
*   **ORM**: [Prisma](https://www.prisma.io/)
*   **Authentication**: [Passport.js](http://www.passportjs.org/) (JWT & Local strategies)
*   **Authorization**: [CASL](https://casl.js.org/)
*   **API Documentation**: [Swagger](https://swagger.io/)
*   **File Uploads**: [AWS SDK for S3](https://aws.amazon.com/sdk-for-javascript/) (S3-compatible storage — [Cloudflare R2](https://developers.cloudflare.com/r2/))
*   **Emailing**: [Nodemailer](https://nodemailer.com/)
*   **AI Integration**: [OpenRouter API](https://openrouter.ai/)
*   **Validation**: `class-validator`, `class-transformer`
*   **Testing**: [Jest](https://jestjs.io/)
*   **Linting/Formatting**: ESLint, Prettier

## 🚀 Getting Started

To run this project locally, follow the steps below.

### Prerequisites

*   [Node.js](https://nodejs.org/) (version >= 24)
*   [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
*   [Docker](https://www.docker.com/) (recommended for running the PostgreSQL database)
*   An S3-compatible object storage account, e.g. [Cloudflare R2](https://developers.cloudflare.com/r2/) (optional, for the file upload feature)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd lizaq94-exerciselog-app-api
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
    *   Fill in the `.env` file with your configuration details (database, JWT keys, AWS, and mailer settings). A detailed description is provided below.

4.  **Run the database (Docker example):**
    ```bash
    docker run --name exerciselog-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=exerciselog -p 5432:5432 -d postgres
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

## 🧪 Testing

*   **Run unit tests:**
    ```bash
    npm run test
    ```

*   **Run end-to-end (E2E) tests:**
    ```bash
    npm run test:e2e
    ```

*   **Check test coverage:**
    ```bash
    npm run test:cov
    ```

## 📄 API Documentation

API documentation is generated using Swagger and is available after running the application at:

**`http://localhost:3000/api`**

You will find detailed information about all available endpoints, required parameters, and DTO schemas there.

## ⚙️ Environment Variables

Below is a description of the environment variables from the `.env.example` file:

```ini
# Basic application configuration
NODE_ENV=development # Environment (development, production)
PORT=3000            # Port the server runs on
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/exerciselog # Pooled connection URL to the PostgreSQL database
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/exerciselog # Direct connection URL (used by Prisma for migrations)
APP_VERSION=1.0.0    # API version

# JWT Configuration
JWT_ACCESS_TOKEN_SECRET=supersecretkey           # Secret for the access token
JWT_ACCESS_TOKEN_EXPIRATION_MS=900000            # Access token expiration time (in ms, default: 15 min)
JWT_REFRESH_TOKEN_SECRET=supersecretrefreshkey   # Secret for the refresh token
JWT_REFRESH_TOKEN_EXPIRATION_MS=604800000        # Refresh token expiration time (in ms, default: 7 days)

# Mail Configuration
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

## 📜 License

This project is licensed under the UNLICENSED License.