FROM node:24-bookworm-slim AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV BAIL_RECKONER_DB=/data/bail-reckoner.sqlite

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && mkdir -p /data
COPY backend/ ./backend/
COPY database/migrations/ ./database/migrations/
COPY --from=build /app/frontend/dist/ ./frontend/dist/

EXPOSE 3001
CMD ["node", "backend/src/index.js"]
