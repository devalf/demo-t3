FROM demo-base:latest AS builder

WORKDIR /app

COPY apps/client-mx/project.json apps/client-mx/
COPY apps/client-mx/ ./apps/client-mx/

RUN yarn nx build client-mx --configuration=production

FROM nginx:alpine

RUN apk add --no-cache curl

COPY --from=builder /app/dist/apps/client-mx /usr/share/nginx/html

COPY apps/client-mx/nginx/includes /etc/nginx/includes
COPY apps/client-mx/nginx/nginx.http.conf /etc/nginx/nginx.conf
COPY apps/client-mx/nginx/nginx.https.conf /etc/nginx/nginx.https.conf

EXPOSE 80


CMD ["nginx", "-g", "daemon off;"]
