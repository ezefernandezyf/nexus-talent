FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY shared/ ./shared/
COPY server/ ./server/
RUN corepack enable && pnpm install --frozen-lockfile
# Generate Prisma client types (needs a valid-looking DATABASE_URL
# so Prisma 7 knows which adapter to use; doesn't connect at build time)
ARG DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
RUN cd server && npx prisma generate
RUN pnpm --filter @nexus-talent/server build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3001
CMD ["node", "dist/index.js"]
