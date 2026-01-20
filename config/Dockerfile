### Builder stage: build Angular app
FROM node:20-alpine AS builder
ARG DEPLOY_ENV
ENV DEPLOY_ENV=${DEPLOY_ENV}
WORKDIR /app
COPY src/ ./src/
COPY src/package.json ./src/package.json
WORKDIR /app/src
RUN npm install
RUN npm run build-${DEPLOY_ENV}

# Install server dependencies in builder
WORKDIR /app/server
COPY server/package.json ./
RUN npm install --omit=dev

### Final stage: distroless runtime
FROM gcr.io/distroless/nodejs20 AS runtime
WORKDIR /app/server
# Copy server files and built Angular dist
COPY --from=builder /app/src/dist ./dist
COPY server/ ./
# Copy node_modules from builder
COPY --from=builder /app/server/node_modules ./node_modules
EXPOSE 8080
CMD ["server.js"]