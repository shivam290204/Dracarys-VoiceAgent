# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app
COPY vibhum-ui/package*.json ./
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY vibhum-ui/ ./
ENV NEXT_TELEMETRY_DISABLED="1"
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build && rm -rf /tmp/* /root/.npm /root/.next/cache

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3010
CMD sh -c "PORT=3010 node server.js"
