# Getting Started with the Every.io Engineering Challenge

Thanks for taking the time to complete the Every.io code challenge. Don't worry, it's not too hard, and please do not spend more than 3-4 hours. We know you have lots of these to do, and it can be very time consuming.

## What We're Evaluating

We're looking for senior engineers who can write production-ready code. While we want you to demonstrate your skills, please be mindful of the time constraint (3-4 hours). Here's what we'll be assessing:

### Key Areas
- **Code Quality & Readability**: Clean, maintainable code that's easy for other engineers to understand
- **Architecture & Design**: Well-organized structure with appropriate separation of concerns
- **Technical Implementation**: Solid error handling, validation, and consideration of edge cases
- **Security**: Proper authentication, authorization, and protection against common vulnerabilities
- **Testing**: Automated tests that cover critical functionality
- **Documentation**: Clear setup instructions and explanation of your approach

### What "Good" Looks Like
We value pragmatic engineering decisions over perfect solutions. Consider:
- Tradeoffs between simplicity and sophistication given the time constraint
- Production-readiness aspects (even if simplified for this challenge)
- Self-awareness about limitations and what you'd improve with more time

**Feel free to go beyond the requirements in ways that showcase your expertise!** We appreciate thoughtful extras that demonstrate senior-level thinking.

## Requirements

You will be creating an API for a task application.

1. This application will have tasks with four different states:
   - To do
   - In Progress
   - Done
   - Archived
2. Each task should contain: Title, Description, and what the current status is.
3. A task can be archived and moved between columns, or statuses.
4. Tasks belong to specific users, and your API should enforce that users can only view and modify their own tasks.

### Note on Authentication vs Authorization
To keep this challenge time-boxed, **you do not need to implement full authentication** (signup/login/password management/JWT tokens).

Instead, your API should accept a user identifier (e.g., via header, query parameter, or path parameter) and implement proper **authorization** - ensuring that users can only access and modify their own tasks. Feel free to use mock users or a simple user lookup approach.

We want to see that you understand authorization principles and data modeling, without spending time on authentication boilerplate.

## Ideal

- Typescript
- Tests
- Dockerized Application

## Extra credit

- Logging

## Technical Guidance

You have flexibility in your implementation choices:

- **Framework**: Use any Node.js framework you're comfortable with (Express, Fastify, NestJS, etc.)
- **Database**: Choose any database that fits your approach (PostgreSQL, SQLite, in-memory, etc.)
- **ORM/Query Builder**: Use your preferred data access layer (Prisma, TypeORM, Sequelize, ...we love Prisma)
- **API Design**: RESTful API with JSON responses expected

## Expected Deliverables

Please ensure your submission includes:

1. **Working API** with all core functionality
2. **Clear setup instructions** in your README (how to install dependencies, set up database, run the application)
3. **Automated tests** covering critical functionality
4. **Docker setup** (Dockerfile at minimum, docker-compose optional)

## Submission Instructions

Please submit your completed challenge via GitHub:

1. **Public Repository**: Push your solution to a public GitHub repository and share the link with us

2. **Private Repository**: If you prefer to keep your solution private, create a private GitHub repository and add the following collaborators:
   - @barrypeterson
   - @jmatusevich
   - @falecci
   - @danfsd

Please include clear setup and running instructions in your README.


# Implementation

## Stack

- **Framework**: Express.js with TypeScript (strict mode)
- **Database**: PostgreSQL 15 with Prisma v5
- **Validation**: Zod schemas for runtime type safety
- **Testing**: Jest
- **Containerization**: Docker + docker-compose
- **Logging**: Structured logging (info, warn, error, debug levels)

## Architecture

**Layered Pattern (Separation of Concerns)**:
1. **Controller** - HTTP request/response handling + Zod validation
2. **Service** - Business logic + authorization checks
3. **Repository** - Data access abstraction
4. **Database** - Prisma schema + migrations
5. **Middleware** - Auth (X-User-Id header) + logging

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 22+ (for local development)

### Setup & Run

```bash
# Clone and setup
git clone <this_repo_url>
cd engineering-interivew-be
cp .env-example .env # I left env-example with sensitive data for testing purposes

# Option 1: Docker (recommended)
npm run docker:up

# Option 2: Local development
npm install
npm run db:migrate
npm start
```

API runs on `http://localhost:3000`

## API Endpoints

```bash
# List tasks
GET /api/v1/tasks
Header: X-User-Id: user-1

# Create task
POST /api/v1/tasks
Header: X-User-Id: user-1
Body: { title, description, status? } # Status is optional because if it's not provided we'll set as TODO

# Get task
GET /api/v1/tasks/:id
Header: X-User-Id: user-1

# Update task (PATCH - partial)
PATCH /api/v1/tasks/:id
Header: X-User-Id: user-1
Body: { title?, description?, status? }

# Delete task (soft delete)
DELETE /api/v1/tasks/:id
Header: X-User-Id: user-1
```

## Testing

```bash
npm test                          # Run all tests
```

## TODOs

- Pagination for task listings, currently returning all tasks which is unbearable for production. The only reason it wasn't implemented was the time constraint.
- Filters for tasks listings as well, such as status and sort
- Restore functionality, i.e. a recovery for an archived task
- Bulk operations, the user should be able to move/delete multiple tasks
- Rate limiting specially for write operations
- Request ID for tracing
- Idempotency key to avoid duplications
- Add more tests to fulfill coverage, and also add integration tests.
- Use caching (e.g. Redis) for frequent accessed tasks or even token revocation.

## Tradeoffs

- No JWT auth, it was requested auth without JSON Web Token so we added simple X-User-Id for MVP and mocked users as a constant
- No Users table, made things easier to implement since it's an MVP
- No Bulk operations or separated endpoints (one for archiving and another for changing status in general).
- deletedAt vs ARCHIVED status. This was a concept for future versions of this MVP, we could have a cron to delete +30D archived tasks if wanted.
- Minimal test coverage, it doesn't coverage everything but it guarantees the happy path and a few error scenarios are covered.
- Used Prisma + PostgreSQL so MVP could prove task's app usage on a production-level scenario, the time allowed to do it but if we decided to use a User table, for example, it would be indirectly better to also create user endpoints, making the implementation time longer than pre-arrenged.
