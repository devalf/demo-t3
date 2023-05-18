FROM node:20.1.0-alpine as build-stage

ARG NODE_ENV
ARG BUILD_FLAG

WORKDIR /app/builder

COPY . .

RUN npm i
