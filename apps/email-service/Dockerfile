FROM demo-base:latest AS builder

WORKDIR /app

COPY apps/email-service/project.json apps/email-service/
COPY apps/email-service/ ./apps/email-service/

RUN yarn nx build email-service --configuration=production

FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache curl

ENV NODE_ENV=production

COPY --from=builder /app/dist/apps/email-service ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8085

CMD ["node", "dist/main.js"]
