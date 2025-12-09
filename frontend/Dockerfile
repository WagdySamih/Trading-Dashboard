# Build stage
FROM node:20-slim AS builder

# Set working directory to root of monorepo
WORKDIR /monorepo

# Copy root package files
COPY package*.json ./

# Copy TypeScript config from root
COPY tsconfig.base.json ./

# Copy all workspace package.json files and configs
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
COPY frontend/tsconfig.json ./frontend/
COPY frontend/next.config.* ./frontend/
COPY shared/package.json ./shared/

# Install all dependencies (workspace aware)
RUN npm ci --workspaces --include-workspace-root

# Copy shared source
COPY shared/ ./shared/

# Copy frontend source
COPY frontend/ ./frontend/

# Build Next.js app
WORKDIR /monorepo/frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /monorepo

# Create non-root user
RUN groupadd -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs nodejs

# Copy root package files
COPY --chown=nodejs:nodejs package*.json ./

# Copy workspace package files
COPY --chown=nodejs:nodejs frontend/package*.json ./frontend/
COPY --chown=nodejs:nodejs shared/package.json ./shared/

# Install production dependencies only
RUN npm ci --workspace=frontend --omit=dev --ignore-scripts

# Copy Next.js build artifacts
COPY --from=builder --chown=nodejs:nodejs /monorepo/frontend/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /monorepo/frontend/.next/static ./frontend/.next/static
COPY --from=builder --chown=nodejs:nodejs /monorepo/frontend/public ./frontend/public

# Copy shared types for runtime
COPY --from=builder --chown=nodejs:nodejs /monorepo/shared ./shared

# Switch to non-root user
USER nodejs

# Set working directory
WORKDIR /monorepo

# Expose port
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Start Next.js
CMD ["node", "frontend/server.js"]