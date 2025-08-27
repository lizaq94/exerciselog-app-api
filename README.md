Of course, here is a professional README.md file based on your repository, written in English. It includes all the essential sections to help others understand and use your project.

ExerciseLog API

![alt text](https://img.shields.io/badge/NestJS-^11.0-red?style=for-the-badge&logo=nestjs)


![alt text](https://img.shields.io/badge/Prisma-^6.4-blueviolet?style=for-the-badge&logo=prisma)


![alt text](https://img.shields.io/badge/PostgreSQL-blue?style=for-the-badge&logo=postgresql)


![alt text](https://img.shields.io/badge/TypeScript-^5.8-blue?style=for-the-badge&logo=typescript)


![alt text](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=jsonwebtokens)

📖 Description

ExerciseLog API is a backend application built with the NestJS framework, designed for managing a workout journal. It allows users to create, read, update, and delete training sessions, exercises, and sets. The application features secure authentication using JWT (JSON Web Tokens) with a refresh token mechanism, and rule-based authorization with CASL to ensure users can only access their own data.

✨ Key Features

Authentication: Secure user registration and login using passport.js, with JWT access and refresh tokens stored in httpOnly cookies.

Authorization: A permission system based on the CASL library, guaranteeing that users can only manage their own resources (workouts, exercises, sets).

Data Management (CRUD): Full support for operations on Users, Workouts, Exercises, and Sets entities.

File Uploads: Ability to upload exercise images to AWS S3.

Email Notifications: Automatic sending of a welcome email to newly registered users via Nodemailer.

Database: Integration with PostgreSQL through Prisma ORM, including a migration system for managing the database schema.

API Documentation: Automatically generated Swagger (OpenAPI) documentation, available after running the application.

Validation & Error Handling: Input data validation using class-validator and a global exception filter for consistent error handling.

Pagination: Paginated results for resource lists, such as user workouts.

Security: Built-in rate-limiting mechanism to protect against brute-force attacks.

Configuration: Flexible application configuration management for different environments (.env).

Logging: Advanced system for logging application events to files.

🛠️ Tech Stack

Framework: NestJS

Language: TypeScript

Database: PostgreSQL

ORM: Prisma

Authentication: Passport.js (JWT & Local strategies)

Authorization: CASL

API Documentation: Swagger

File Uploads: AWS SDK for S3

Emailing: Nodemailer

Validation: class-validator, class-transformer

Testing: Jest

Linting/Formatting: ESLint, Prettier

🚀 Getting Started

To run this project locally, follow the steps below.

Prerequisites

Node.js (version >= 20)

npm or Yarn

Docker (recommended for running the PostgreSQL database)

An AWS account with S3 permissions (optional, for the file upload feature)

Installation

Clone the repository:

code
Bash
download
content_copy
expand_less

git clone <your-repository-url>
cd lizaq94-exerciselog-app-api

Install dependencies:

code
Bash
download
content_copy
expand_less
IGNORE_WHEN_COPYING_START
IGNORE_WHEN_COPYING_END
npm install

Set up environment variables:

Copy the .env.example file and rename it to .env.

code
Bash
download
content_copy
expand_less
IGNORE_WHEN_COPYING_START
IGNORE_WHEN_COPYING_END
cp .env.example .env

Fill in the .env file with your configuration details (database, JWT keys, AWS, and mailer settings). A detailed description is provided below.

Run the database (Docker example):

code
Bash
download
content_copy
expand_less
IGNORE_WHEN_COPYING_START
IGNORE_WHEN_COPYING_END
docker run --name exerciselog-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=exerciselog -p 5432:5432 -d postgres

Ensure that the credentials in your .env file match those in the Docker command.

Run Prisma migrations to create the database schema:

code
Bash
download
content_copy
expand_less
IGNORE_WHEN_COPYING_START
IGNORE_WHEN_COPYING_END
npx prisma migrate dev
Running the App

Development mode (with hot-reloading):

code
Bash
download
content_copy
expand_less
IGNORE_WHEN_COPYING_START
IGNORE_WHEN_COPYING_END
npm run start:dev

Production mode:

code
Bash
download
content_copy
expand_less
IGNORE_WHEN_COPYING_START
IGNORE_WHEN_COPYING_END
npm run build
npm run start:prod

The application will be available at http://localhost:3000.

🧪 Testing

Run unit tests:

code
Bash
download
content_copy
expand_less
IGNORE_WHEN_COPYING_START
IGNORE_WHEN_COPYING_END
npm run test

Run end-to-end (E2E) tests:

code
Bash
download
content_copy
expand_less
IGNORE_WHEN_COPYING_START
IGNORE_WHEN_COPYING_END
npm run test:e2e

Check test coverage:

code
Bash
download
content_copy
expand_less
IGNORE_WHEN_COPYING_START
IGNORE_WHEN_COPYING_END
npm run test:cov
📄 API Documentation

API documentation is generated using Swagger and is available after running the application at:

http://localhost:3000/api

You will find detailed information about all available endpoints, required parameters, and DTO schemas there.

⚙️ Environment Variables

Below is a description of the environment variables from the .env.example file:

code
Ini
download
content_copy
expand_less
IGNORE_WHEN_COPYING_START
IGNORE_WHEN_COPYING_END
# Application Basic Configuration
NODE_ENV=development # Environment (development, production)
PORT=3000            # Port the server runs on
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/exerciselog # URL to the PostgreSQL database
APP_VERSION=1.0.0    # API version

# JWT Configuration
JWT_ACCESS_TOKEN_SECRET=supersecretkey           # Secret for the access token
JWT_ACCESS_TOKEN_EXPIRATION_MS=86400000          # Access token expiration time (in ms, default: 24h)
JWT_REFRESH_TOKEN_SECRET=supersecretrefreshkey   # Secret for the refresh token
JWT_REFRESH_TOKEN_EXPIRATION_MS=604800000        # Refresh token expiration time (in ms, default: 7 days)

# Mail Configuration
MAIL_HOST=smtp.example.com         # SMTP server host
SMTP_USERNAME=user@example.com     # SMTP username
SMTP_PASSWORD=password             # SMTP password
MAIL_FROM=no-reply@exerciselog.com # Sender's email address

# AWS Configuration
AWS_REGION=eu-central-1               # AWS region
AWS_ACCESS_KEY_ID=your_access_key_id  # AWS access key
AWS_SECRET_ACCESS_KEY=your_secret_access_key # AWS secret access key
AWS_PUBLIC_BUCKET_NAME=your_bucket_name # S3 bucket name
AWS_CLOUDFRONT_URL=https://your-distribution.cloudfront.net # Optional: CloudFront distribution URL
📜 License

This project is licensed under the UNLICENSED License.