FROM node:24-bookworm-slim AS build

WORKDIR /app

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate && SKIP_TYPECHECK=1 BETTER_AUTH_SECRET="$(openssl rand -base64 32)" BETTER_AUTH_URL=http://localhost:3000 npm run build

# standalone output has no Prisma CLI; install it on its own so the runtime can apply migrations on start
RUN mkdir /migrate && cp -r prisma prisma.config.ts /migrate/ && cd /migrate && echo '{"type":"module"}' > package.json \
    && npm install --no-audit --no-fund "prisma@$(node -p "require('/app/node_modules/prisma/package.json').version")" \
       "dotenv@$(node -p "require('/app/node_modules/dotenv/package.json').version")"

FROM build AS migrate

CMD ["npx", "prisma", "migrate", "deploy"]

FROM node:24-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /migrate /migrate

USER node
EXPOSE 3000

# Dokploy runs only this stage, so pending migrations are applied here before the server starts
CMD ["sh", "-c", "cd /migrate && node node_modules/prisma/build/index.js migrate deploy && cd /app && exec node server.js"]
