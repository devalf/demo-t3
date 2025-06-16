## Description

This is a demo project, which consists of a list of applications and libraries,
that are built with `NX` (monorepo). You can find here the next application:
`client-mx` - client application, which is built with React.
`server-nest` - server application, which is built with NestJS.

```
During the development of the server API, the following technologies
were used: NestJS, RXDB, Jest, Swagger, class-validator, class-transformer.
Due to the time-consuming implementation there are only very basic READ
operations in the API. More samples of the API with CRUD operations can be 
found in my other repositories.

The client application is built with React, React-Router, Mobx, ReactQuery,
Material-UI, Inversify, Jest, React Testing Library.

All code is written in TypeScript. In the repository, you can find the samples of
Unit tests, Integration tests, E2E tests.
```

## Installation

Make sure you are using Node.js v22 (it might be fine with a newer version)

Copy `.env.example` file to the `.env`

```bash
$ yarn install
```

## Running the apps

Run docker compose

```bash
$ docker compose up
```

On initial launch you have to execute some additional commands to manage DB and seed it. You can find necessary info in the very
last section (REMINDER - it is still under construction)

```bash
# run all apps: locally in development mode
$ yarn start:demo

# to run client and server separately
$ npx nx serve client-mx
$ npx nx serve server-nest
$ npx nx serve auth-service
```

## Test

Ensure that both apps are running locally when executing the E2E test

```bash
# unit tests
$ yarn test:all

# e2e tests
$ npx nx run-many --all --target=e2e --parallel
```

When starting necessary apps please open in the browser
http://localhost:8082/ link and check the result.

**The most usable commands:**

_Note:_ Run all commands from root folder, no need to enter any directory.

- `yarn install` to setup all dependencies
- `yarn start [application-name]` to run dev server for specific platform locally
- `yarn build [application-name|library-name]` build an app/library
- `yarn test [application-name|library-name]` to run test for a specific application|package
- `yarn lint [application-name|library-name]` to run eslint for a specific application|package
- `yarn format [application-name|library-name]` to run prettier for a specific application|package
- `npx nx e2e [application-name] --ui` to run e2e tests for client application in UI mode (with Browser) (
  e.g. `client-mx-e2e`)
- `npx nx run client-mx-e2e:e2e -g '<title>'` to run e2e for specific test by title

### Section related to the new `auth-service`, is under construction yet

generate migration

```shell

yarn prisma:generate
```

run migration

```shell

yarn prisma:migrate:dev
```

seed the DB

```shell

yarn seed
```
