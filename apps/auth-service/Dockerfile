FROM demo-base:latest AS builder

WORKDIR /app

COPY apps/auth-service/project.json apps/auth-service/
COPY apps/auth-service/ ./apps/auth-service/

RUN yarn prisma:generate

RUN yarn nx build auth-service --configuration=production

FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV PRISMA_SCHEMA_PATH=/app/src/prisma-setup/schema.prisma

COPY --from=builder /app/dist/apps/auth-service ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

COPY --from=builder /app/apps/auth-service/src/prisma-setup ./src/prisma-setup
COPY --from=builder /app/apps/auth-service/src/prisma-setup ./apps/auth-service/src/prisma-setup

EXPOSE 8084

CMD ["sh", "-c", "\
yarn prisma:migrate:deploy --schema=/app/src/prisma-setup/schema.prisma && \
yarn prisma db seed --schema=/app/src/prisma-setup/schema.prisma && \
node dist/main.js"]
