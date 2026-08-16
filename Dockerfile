# ── Base: install dependencies ────────────────────────────────────────────────
FROM node:24-bookworm-slim AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Development: Vite dev server (host: true already set in vite.config.ts) ───
FROM base AS development
COPY . .
EXPOSE 4050
CMD ["npm", "run", "dev"]

# ── Builder: static production build ─────────────────────────────────────────
FROM base AS builder
COPY . .
RUN npm run build

# ── Production: serve static files via nginx ─────────────────────────────────
FROM nginx:stable-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/dist/index.html /usr/share/nginx/html/index.html

# SPA routing: fall back to index.html for all routes
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' \
    > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
