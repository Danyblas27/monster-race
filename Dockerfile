# ==========================================
# Multi-stage Dockerfile for Monster Race
# ==========================================

# Stage 1: Build React + Vite Client
FROM node:22-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm install

COPY client/ ./
RUN npm run build

# Stage 2: Production Server
FROM node:22-alpine AS runner
WORKDIR /app

# Configure Mexico City (CDMX) Timezone
RUN apk add --no-cache tzdata
ENV TZ=America/Mexico_City

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV DATA_DIR=/app/data

# Copy root server package definitions and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy server code and default data
COPY server/ ./server/

# Copy built frontend assets from stage 1
COPY --from=client-builder /app/client/dist ./client/dist

# Ensure data directory exists with appropriate permissions
RUN mkdir -p /app/data

# Volume mount point for data persistence (monsters.json)
VOLUME ["/app/data"]

EXPOSE 3001

CMD ["node", "server/index.js"]
