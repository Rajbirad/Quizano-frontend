# Multi-stage production-ready Dockerfile

# Stage 1: Build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies for node-gyp
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY . .

# Build application
ENV NODE_ENV=production
RUN npm run build:prod

# Stage 2: Production
FROM nginx:alpine

# Install security updates
RUN apk update && \
    apk upgrade && \
    apk add --no-cache ca-certificates && \
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built assets from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create required directories
RUN mkdir -p /var/cache/nginx && \
    chown -R nodejs:nodejs /var/cache/nginx && \
    chown -R nodejs:nodejs /var/log/nginx && \
    chown -R nodejs:nodejs /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nodejs:nodejs /var/run/nginx.pid

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
