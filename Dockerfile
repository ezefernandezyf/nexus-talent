FROM node:22-alpine AS builder
WORKDIR /app
COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY shared/ ./shared/
COPY server/ ./server/
RUN corepack enable && pnpm install --frozen-lockfile
ARG DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
RUN cd server && npx prisma generate
RUN pnpm --filter @nexus-talent/server build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/server/dist/server/src ./dist
COPY --from=builder /app/server/dist/shared/src ./dist/shared
COPY --from=builder /app/.npmrc /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/shared/ ./shared/
COPY --from=builder /app/server/package.json ./server/
RUN corepack enable && pnpm install --frozen-lockfile --prod --filter @nexus-talent/server
EXPOSE 3001
CMD ["node", "dist/index.js"]
