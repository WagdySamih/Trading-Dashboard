# Single stage - simple and works
FROM node:20-slim

WORKDIR /monorepo

# Create non-root user
RUN groupadd -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs nodejs

# Copy root package files
COPY --chown=nodejs:nodejs package*.json ./

# Copy workspace package files
COPY --chown=nodejs:nodejs backend/package*.json ./backend/
COPY --chown=nodejs:nodejs shared/package.json ./shared/

# Install dependencies (skip prepare scripts like husky)
RUN npm ci --workspace=backend --workspace=shared --ignore-scripts

# Copy backend source
COPY --chown=nodejs:nodejs backend/ ./backend/

# Copy shared source
COPY --chown=nodejs:nodejs shared/ ./shared/

# Switch to non-root user
USER nodejs

WORKDIR /monorepo/backend

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use tsx to run TypeScript directly
CMD ["npx", "tsx", "src/server.ts"]