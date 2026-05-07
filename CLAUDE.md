# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run start:dev` — Run with hot-reload (`NODE_ENV=development`).
- `npm run build` — Compile via Nest CLI **and** copy `src/mail/templates` into `dist/mail/`. The `copy-templates` step is required because mailer templates are loaded from disk; running `nest build` alone produces a broken production bundle.
- `npm run start:prod` — Run compiled `dist/main`.
- `npm run lint` — ESLint with `--fix`. `npm run format` — Prettier on `src/**` and `test/**`.

### Unit tests (Jest, `rootDir: src`, regex `*.spec.ts`)
- `npm run test` — All unit tests with `NODE_ENV=test`.
- `npm run test:watch` / `npm run test:cov` / `npm run test:verbose`.
- Single file: `npm run test -- src/workouts/workouts.service.spec.ts`.
- Single test name: `npm run test -- -t "creates a workout"`.

### E2E tests (separate Jest config at `test/jest-e2e.json`, `*.e2e-spec.ts`, `maxWorkers: 1`)
E2E uses a **separate database** configured via `.env.test` (loaded with `dotenv-cli`). Order matters:
1. `npm run test:e2e:setup` — apply migrations to the test DB (`prisma migrate deploy`).
2. `npm run test:e2e:reset` — drop & re-create the test DB when schema or seed data drift.
3. `npm run test:e2e:seed` — seed via `prisma db seed`.
4. `npm run test:e2e` — run the suite.
- Single e2e file: `npm run test:e2e -- test/workouts/workouts.e2e-spec.ts`.

### Prisma
- After editing `prisma/schema.prisma`: `npx prisma migrate dev --name <change>` (dev DB) and re-run the e2e setup commands above for the test DB. The Prisma client is regenerated automatically by `migrate dev`.

## Architecture

### Domain model (Prisma → `prisma/schema.prisma`)
`User` 1—N `Workout` 1—N `Exercise` 1—N `Set`. `Exercise` 1—1 `Upload` (S3 image). All child relations cascade on delete. IDs are UUIDs; `order` fields drive sort order on exercises and sets.

### Module wiring
`AppModule` composes feature modules: `Auth`, `Users`, `Workouts`, `Exercises`, `Sets`, `Uploads`, `Ai`, plus cross-cutting `Casl`, `Database`, `Logger`, `Pagination`, `Config`, `Mail`. `ThrottlerGuard` is registered globally as `APP_GUARD` (100 req/60s). `DatabaseService` extends `PrismaClient` and is a singleton injected wherever DB access is needed — do **not** instantiate `PrismaClient` directly.

`CaslModule` uses `forwardRef` for `Workouts`/`Exercises`/`Sets`/`Users` because `OwnershipGuard` injects those services to fetch the resource being checked, and they in turn reference CASL types. Keep new resource modules behind `forwardRef` if they participate in ownership checks.

### Bootstrap pipeline (`src/app.create.ts`)
`createApp(app)` is shared by `main.ts` and the e2e setup helper, so both prod and tests get identical middleware. It configures: Swagger at `/api`, `cookie-parser`, a strict global `ValidationPipe` (`whitelist: true, forbidNonWhitelisted: true, transform: true, enableImplicitConversion: true`), the global `AllExceptionsFilter`, and the global `DataResponseInterceptor`. New DTO fields without `class-validator` decorators are silently stripped — always decorate.

### Response & error envelope
- All successful responses are wrapped by `DataResponseInterceptor` as `{ apiVersion: process.env.APP_VERSION, data: <controller return> }`. Tests and clients should expect this shape; never return the envelope manually.
- `AllExceptionsFilter` maps Prisma errors: `PrismaClientValidationError` → 422, `PrismaClientKnownRequestError` → 400, `PrismaClientUnknownRequestError` → 500. `HttpException`s pass through. In `NODE_ENV=test`, expected (<500) errors are logged at `warn` level to keep test output clean.

### Authentication (cookie-based JWT)
`AuthService` issues two `httpOnly` cookies on login/signup/refresh: `Authentication` (access) and `Refresh`. The hashed refresh token is stored on `User.refreshToken`. Strategies extract the JWT from cookies (not `Authorization` headers):
- `JwtStrategy` reads `request.cookies.Authentication` → guarded by `JwtAuthGuard`.
- `JwtRefreshStrategy` (`'jwt-refresh'`) reads `request.cookies.Refresh` and verifies via `AuthService.verifyUserRefreshToken` → guarded by `JwtRefreshAuthGuard` on `/auth/refresh` and `/auth/logout`.
- `LocalStrategy` validates email+password on `/auth/login`.
- `cookie.secure` is only true in production. Welcome emails are sent only in production (failures throw `RequestTimeoutException`).

### Authorization (CASL + `OwnershipGuard`)
Authorization is two-step:
1. Mark the route with `@UseGuards(JwtAuthGuard, OwnershipGuard)` and `@ResourceType(Resource.WORKOUT | EXERCISE | SET | USER)`.
2. `OwnershipGuard` resolves the corresponding service via `ModuleRef`, loads the resource by `request.params.id`, wraps it in the matching `*Entity` class (CASL matches on the *class*, not the plain object), and asks the ability built by `CaslAbilityFactory.defineAbility(user)` whether `Action.Manage` is permitted.
3. The ability is built from the eagerly-loaded `user.workouts → exercises` graph (see `UsersService.findOneById`) so `JwtStrategy.validate` must return a user with that depth — changing the include shape there will silently break ownership checks for nested resources.

When adding a new owned resource: add to `Resource` enum, extend `entityMap` and `getService` in `OwnershipGuard`, register a CASL rule in `CaslAbilityFactory.defineAbility`, and ensure the entity class has matching field names for CASL's prisma-style conditions.

### Pagination
Two collaborating pieces in `src/common/pagination/`:
- `paginator()` factory wraps any Prisma model with `count + findMany` and returns `{data, meta}`.
- `PaginationProvider.generatePaginationLinks` builds HATEOAS-style `links` from the current `Request`.
List endpoints return `PaginatedResult<T> = {data, meta, links}` (see `WorkoutsService.findAll`). The `Request` must be passed through from the controller because link generation needs `protocol`/`host`/`path`/`query`.

### Bulk creation
`UsersService.addWorkoutBulk` creates a workout with nested exercises and sets inside `databaseService.$transaction(async (tx) => …)` — always use the `tx` client for inner writes so a failure rolls back the entire tree. The final `findUnique` re-reads through `tx` to return the assembled graph ordered by `order`.

### AI workout generation
`AiController POST /ai/generate-workout` is a three-stage pipeline in `AiService.generateWorkout`: `OpenRouterProvider` (HTTP call to OpenRouter) → `AiResponseParserService` (validates raw response) → `AiResponseTransformerService` (maps to `CreateWorkoutBulkDto[]`). The endpoint **does not persist** plans; clients then POST a chosen plan to `/users/:id/workouts/bulk`. Errors are re-thrown with the original goal interpolated for log correlation. Required env: `OPEN_ROUTER_API_KEY`, `OPEN_ROUTER_API_URL`.

### Logger
`LoggerService` extends Nest's `ConsoleLogger` and **also** appends entries to `logs/log-DD-MM-YYYY.log` (Europe/Warsaw timezone). Controllers/services inject it and pass `ClassName.name` as context. `LOG_LEVEL` env (`error|warn|log|debug|verbose`) controls console output; file output is unconditional.

### Configuration
Wrap all env access through the custom `ConfigService` in `src/config/` (not `@nestjs/config` directly). It exposes typed getters: `getAppConfig()`, `getAuthConfig()`, `getMailConfig()`, `getAwsConfig()`. Add new typed groups here rather than reading `process.env` ad hoc.

### Uploads
`UploadsModule` exports `UploadsService`, which delegates to `UploadToAwsProvider` for S3 puts and persists an `Upload` row linked to the exercise. AWS config (region, keys, bucket, optional CloudFront URL) flows through `ConfigService.getAwsConfig()`.

## Conventions worth preserving
- **Controllers stay thin**: validate via DTO + `class-validator`, log entry, delegate to service. Mirror the existing Swagger decorators (`@ApiOperation`, `@ApiBody`, `@ApiOkResponse`/`ApiCreatedResponse`/`ApiNoContentResponse`, `@ApiParam`) — Swagger is the published contract.
- **Entity classes** in `src/<feature>/entities/*.entity.ts` are the CASL subjects; keep them in sync with Prisma model fields used in ability conditions.
- **DTO directory layout** per feature: `dto/create-*.dto.ts`, `dto/update-*.dto.ts` (use `@nestjs/mapped-types` `PartialType`), `dto/*-response.dto.ts`. The `workouts/dto/bulk/` folder holds the nested bulk DTOs reused by `users` and `ai`.
- **E2E helpers** in `test/helpers/` (`setupE2ETest`, `teardownE2ETest`, resource creators, auth scenarios, DB cleaner) are the canonical way to bootstrap a test app — they call the same `createApp` so middleware matches production. New e2e specs should reuse these rather than rebuilding the testing module.
