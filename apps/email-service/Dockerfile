FROM demo-base:latest AS builder

WORKDIR /app

COPY apps/email-service/project.json apps/email-service/
COPY apps/email-service/ ./apps/email-service/

RUN mkdir -p dist/email-templates && \
    yarn mjml apps/email-service/src/app/templates/*.mjml -o dist/email-templates && \
    cp apps/email-service/src/app/templates/*.txt dist/email-templates/

RUN yarn nx build email-service --configuration=production

FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache curl

ENV NODE_ENV=production

COPY --from=builder /app/dist/apps/email-service ./dist
COPY --from=builder /app/dist/email-templates ./dist/email-templates
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8085

CMD ["node", "dist/main.js"]
