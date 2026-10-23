# ---- Tahap 1: membangun front-end (React + Vite + Tailwind) ----
FROM node:22-bookworm-slim AS client-build
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---- Tahap 2: runtime (Express + SQLite) yang juga menyajikan hasil build front-end ----
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production \
    PORT=3001 \
    DB_FILE=/data/planner.db \
    CLIENT_DIST=/app/client/dist
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev
COPY server/src ./src
COPY --from=client-build /app/client/dist /app/client/dist
RUN mkdir -p /data && chown -R node:node /data /app
USER node
VOLUME /data
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "fetch('http://localhost:'+process.env.PORT+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/index.js"]
