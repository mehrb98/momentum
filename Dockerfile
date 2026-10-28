FROM node:24-bookworm-slim AS build

WORKDIR /app

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate && SKIP_TYPECHECK=1 BETTER_AUTH_SECRET="$(openssl rand -base64 32)" BETTER_AUTH_URL=http://localhost:3000 npm run build

FROM build AS migrate

CMD ["npx", "prisma", "migrate", "deploy"]

FROM node:24-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000

CMD ["node", "server.js"]
