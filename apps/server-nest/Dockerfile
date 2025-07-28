FROM demo-base:latest AS builder

WORKDIR /app

COPY apps/server-nest/project.json apps/server-nest/
COPY apps/server-nest/ ./apps/server-nest/

RUN yarn nx build server-nest --configuration=production

FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache curl

ENV NODE_ENV=production

COPY --from=builder /app/dist/apps/server-nest ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8083

CMD ["node", "dist/main.js"]
