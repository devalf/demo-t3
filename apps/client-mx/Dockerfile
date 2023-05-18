FROM demo-t2-base:nx-base AS builder

ARG NODE_ENV
ARG BUILD_FLAG
ARG PORT_CLIENT_MX
ARG PORT_API_SERVER

WORKDIR /app/builder

COPY . .

RUN npx nx build client-mx ${BUILD_FLAG}

FROM nginx:alpine as production-stage

WORKDIR /usr/share/nginx/html

COPY --from=builder /app/builder/dist/apps/client-mx ./
COPY --from=builder /app/builder/apps/client-mx/nginx/nginx.conf /etc/nginx/nginx.conf
