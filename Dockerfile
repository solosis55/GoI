# syntax=docker/dockerfile:1
# Una sola imagen: frontend Vite compilado en /app/dist y API Express en server/dist.

FROM node:22-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json index.html ./
COPY src ./src
COPY public ./public
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev
COPY server/ ./
COPY --from=frontend /app/dist /app/dist
RUN npm run build
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/server.js"]
