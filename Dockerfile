# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Accept build arguments for Vite environment variables
ARG VITE_BETTER_AUTH_URL
ARG VITE_SERVER_BASE_URL
ARG VITE_FRONTEND_URL

# Set environment variables for the build process
ENV VITE_BETTER_AUTH_URL=$VITE_BETTER_AUTH_URL
ENV VITE_SERVER_BASE_URL=$VITE_SERVER_BASE_URL
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL

# Build the application
RUN pnpm run build

# Production Stage
FROM nginx:alpine AS production

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
