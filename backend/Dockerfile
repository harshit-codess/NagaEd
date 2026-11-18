# ---- Stage 1: install production dependencies ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json ./
# `npm install` (not `npm ci`) so the project works without a committed lockfile.
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

# ---- Stage 2: minimal runtime image ----
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src
# Run as the unprivileged "node" user that ships with the base image.
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]
