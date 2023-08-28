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

```bash
$ npm install
```

## Running the apps

```bash
# run all apps: locally in development mode
$ npm run start:demo

# to run client and server separately
$ npx nx serve client-mx
$ npx nx serve server-nest
```

## Test

```bash
# unit tests
$ npm run test:all

# e2e tests
$ npx nx run-many --all --target=e2e --parallel
```

When starting necessary apps please open in the browser
http://localhost:8082/ link and check the result.

**The most usable commands:**

_Note:_ Run all commands from root folder, no need to enter any directory.

- `npm install` to setup all dependencies
- `npm start [application-name]` to run dev server for specific platform locally
- `npm run build [application-name|library-name]` build an app/library
- `npm run test [application-name|library-name]` to run test for a specific application|package
- `npm run lint [application-name|library-name]` to run eslint for a specific application|package
- `npm run format [application-name|library-name]` to run prettier for a specific application|package
