# Multi-stage Dockerfile for Node.js Fullstack (Vite + Express)

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies for build
RUN npm ci

# Copy project files
COPY . .

# Build frontend and backend
RUN npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy manifests and install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built dist files
COPY --from=builder /app/dist ./dist

# Copy assets and metadata
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/metadata.json ./metadata.json

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
