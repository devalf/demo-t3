## Description

This demo project showcases a monorepo architecture built with NX, containing multiple applications and shared libraries. The repository includes:

**client-mx** - A React-based client application

**server-nest** - A NestJS server application

**auth-service** - A dedicated NestJS microservice handling user authentication and authorization

**email-service** - An event-driven NestJS microservice for email delivery, utilizing RabbitMQ message queue for asynchronous communication

### Live Demo / Production URL

The production deployment is available at: https://d-t3.mooo.com/

Note: Availability may change in the future; the link above is confirmed to be relevant and maintained during Autumn 2025. 

## Infrastructure & Services

This project utilizes a robust infrastructure layer:

**PostgreSQL Database** - Primary relational database for the auth-service, handling user authentication data, session management, and authorization records with full ACID compliance.

**Redis Cache** - In-memory data store running in a separate container, providing shared caching capabilities across all applications in the monorepo. Used for session management, temporary data storage, and performance optimization.

**RabbitMQ Message Broker** - Event-driven messaging system enabling asynchronous communication between microservices. The email-service consumes messages from queues to handle email delivery operations independently, ensuring reliable and scalable inter-service communication with proper message persistence and retry mechanisms.

All infrastructure services are containerized and orchestrated through Docker Compose, ensuring consistent development and production environments with proper service dependencies and health checks.

## Technical Stack

**Server API** is built using NestJS, RXDB, Jest, Swagger, class-validator, and class-transformer. Currently implements basic READ operations due to time constraints - additional CRUD examples are available in my other repositories.

**Auth Service** utilizes NestJS, PostgreSQL, Prisma, Jest, Swagger, class-validator, and class-transformer to provide a fully functional authentication system with comprehensive coverage of all authentication and authorization scenarios. Unlike the basic operations in server-nest, this service implements complete CRUD functionality and handles edge cases thoroughly. The service publishes events to RabbitMQ message queues to trigger asynchronous operations in other microservices, such as email notifications.

**Email Service** is built with NestJS and leverages RabbitMQ for event-driven architecture. It consumes messages from message queues to process email delivery requests asynchronously, decoupling email operations from the main application flow. The service uses MJML templates for responsive email design and includes comprehensive error handling with retry logic.

**Client Application** leverages React, React Router, MobX, React Query, Material-UI, Inversify, Jest, and React Testing Library for a comprehensive frontend experience.

The architecture includes Redis and RabbitMQ running in separate containers, making them accessible and shareable across all applications in the monorepo for session management, caching, and asynchronous messaging.

All applications are developed in TypeScript and include exemplary test coverage with representative unit tests, integration tests, and end-to-end tests.
The server APIs are fully documented and accessible through Swagger documentation. Navigate to the `/docs` path for each service, for example: http://localhost:8084/docs

This project includes production-grade monitoring with Prometheus for metrics collection and Grafana for dashboards and visualization.

## Installation

Prerequisites:

```
- Node.js v22 (newer versions may also work)
- Copy `.env.example` file to the `.env`, and customize the values as needed
```

```bash

yarn install
```

## Running the Applications

Start the infrastructure services with Docker:

```bash

docker compose up
```

Database Setup: On initial launch, you'll need to execute additional commands for database migration and seeding. Refer to the final section for details.

Start all applications in development mode:

```bash
# Run all applications together

yarn start:demo

# Or run services individually
yarn nx serve client-mx      # Client application
yarn nx serve server-nest    # Main server
yarn nx serve auth-service   # Authentication service
yarn nx serve email-service  # Email service
```

## Testing

Ensure all applications are running locally before executing end-to-end tests.

```bash

# Run unit tests across all projects
yarn test:all

# Run end-to-end tests for all applications
yarn nx run-many --all --target=e2e --parallel
```

When starting the applications, open http://localhost:8082/ in your browser 
to view the client application.


**Most Useful Commands:**

_Note_: Execute all commands from the root directory - no need to navigate to specific folders.

- `yarn install` to setup all dependencies
- `yarn start [application-name]` to run dev server for specific platform locally
- `yarn build [application-name|library-name]` build an app/library
- `yarn test [application-name|library-name]` to run test for a specific application|package
- `yarn lint [application-name|library-name]` to run eslint for a specific application|package
- `yarn nx lint client-mx --fix` 
- `yarn format [application-name|library-name]` to run prettier for a specific application|package
- `yarn nx e2e [application-name] --ui` to run e2e tests for client application in UI mode (with Browser) (
  e.g. `client-mx-e2e`)
- `yarn nx run client-mx-e2e:e2e -g '<title>'` to run e2e for specific test by title
- ` cd apps/client-mx-e2e && yarn playwright test src/e2e/login-flow.spec.ts --ui` to run tests in UI mode

### Auth Service Setup and DB managing (section under construction)

Generate Prisma client:

```shell

yarn prisma:generate
```

Generate and run DB migrations:

```shell

yarn prisma:migrate:dev
```

Seed the database with initial data:

```shell

yarn seed
```

#### Database Migration Steps
Adding Custom SQL Changes -> Adjusting Prisma Scheme

Create empty migration
```shell

yarn prisma:migrate:dev -- --create-only --name your_migration_name
```

Edit the generated migration file
`apps/auth-service/src/prisma-setup/migrations/[timestamp]_your_migration_name/migration.sql`

Apply migration
```shell

yarn prisma:migrate:deploy
```

Verify status
```shell

yarn prisma migrate status --schema=./apps/auth-service/src/prisma-setup/schema.prisma
```


##### Fixing Failed Migrations

Mark failed migration as rolled back
```shell

yarn prisma migrate resolve --rolled-back "migration_name" --schema=./apps/auth-service/src/prisma-setup/schema.prisma
```
